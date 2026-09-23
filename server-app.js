// @ts-check
import express from 'express';
import helmet from 'helmet';
import path from 'node:path';
import { Transform } from 'node:stream';

// A render still streaming after this long is cut off
const ABORT_DELAY = 10000;

/**
 * @typedef {typeof import('./src/entry-server.tsx').render} Render
 *
 * @typedef {object} AppOptions
 * @property {boolean} isProduction
 * @property {string} authFrameSource The origin Firebase's sign-in iframe loads from
 * @property {Array<import('express').RequestHandler>} assetHandlers Serve files
 *   before any page is rendered: Vite's middleware in development, the built
 *   client bundle in production
 * @property {(url: string) => Promise<{ template: string, render: Render }>} loadPage
 *   The HTML shell and the app's server renderer for a request
 * @property {(error: Error) => void} [fixStacktrace] Maps a render error's stack
 *   back to the source, in development
 */

// Everything a request passes through, kept apart from starting the server so
// tests can drive it with a fake page and no Vite or build
/** @param {AppOptions} options */
export function createApp({
  isProduction,
  authFrameSource,
  assetHandlers,
  loadPage,
  fixStacktrace,
}) {
  const app = express();

  // Security headers, before any route so they cover SSR HTML and static assets alike
  app.use(
    helmet({
      // Firebase's signInWithPopup polls popup.closed on the window it opens.
      // Helmet's default 'same-origin' severs that reference and sign-in hangs.
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      // Vite's dev middleware serves inline scripts and an HMR websocket that a
      // production-grade policy blocks, so the CSP is only enforced in production.
      // Everything not listed here keeps Helmet's default (default-src 'self').
      contentSecurityPolicy: isProduction
        ? {
            directives: {
              // Firestore reads/writes and the auth token endpoints
              'connect-src': ["'self'", 'https://*.googleapis.com'],
              // The Google sign-in popup and Firebase's auth handler
              'frame-src': ["'self'", authFrameSource, 'https://accounts.google.com'],
              'script-src': ["'self'", 'https://apis.google.com'],
              // Google account avatars, plus the emoji set emoji-picker-react loads
              'img-src': [
                "'self'",
                'data:',
                'https://*.googleusercontent.com',
                'https://cdn.jsdelivr.net',
              ],
            },
          }
        : false,
    }),
  );

  for (const handler of assetHandlers) app.use(handler);

  // No app route has a file extension, so a path with one is a file that isn't
  // there (a stale /assets/ hash after a deploy, say). Answering with the app's
  // HTML would hand a script or image tag a page it can't use.
  app.use((req, res, next) => {
    if (path.extname(req.path)) {
      res.status(404).end('Not Found');
      return;
    }
    next();
  });

  // Serve HTML
  app.use('*all', async (req, res) => {
    try {
      const url = req.originalUrl;
      const { template, render } = await loadPage(url);

      let didError = false;
      // Set by a page during the shell render; the Not Found page sets 404
      let status = 200;

      const { pipe, abort } = render(
        url,
        {
          onShellError() {
            res.status(500);
            res.set({ 'Content-Type': 'text/html' });
            res.send('<h1>Something went wrong</h1>');
          },
          onShellReady() {
            res.status(didError ? 500 : status);
            res.set({ 'Content-Type': 'text/html' });

            const transformStream = new Transform({
              transform(chunk, encoding, callback) {
                res.write(chunk, encoding);
                callback();
              },
            });

            const [htmlStart, htmlEnd] = template.split(`<!--app-html-->`);

            res.write(htmlStart);

            transformStream.on('finish', () => {
              res.end(htmlEnd);
            });

            pipe(transformStream);
          },
          onError(error) {
            didError = true;
            console.error(error);
          },
        },
        code => {
          status = code;
        },
      );

      // Only a render that is still going needs cutting off
      const abortTimer = setTimeout(() => {
        abort();
      }, ABORT_DELAY);
      res.on('close', () => clearTimeout(abortTimer));
    } catch (e) {
      const error = /** @type {Error} */ (e);
      fixStacktrace?.(error);
      console.error(error);
      // Detailed stacks stay server-side in production so we don't disclose
      // filesystem paths, dependency versions, or internal module structure.
      res.status(500).end(isProduction ? 'Internal Server Error' : error.stack);
    }
  });

  // Anything thrown outside the SSR handler's own try/catch ends up here, so an
  // unexpected failure returns a response instead of leaving the request hanging.
  /** @type {import('express').ErrorRequestHandler} */
  const handleError = (err, _req, res, _next) => {
    console.error(err);
    if (res.headersSent) {
      res.end();
      return;
    }
    res.status(500).end(isProduction ? 'Internal Server Error' : err.stack);
  };
  app.use(handleError);

  return app;
}
