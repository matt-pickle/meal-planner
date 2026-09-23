import fs from 'node:fs/promises';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'node:http';
import path from 'node:path';
import { Transform } from 'node:stream';

// Vite reads .env for the client at build time; plain Node doesn't, so load it
// here for the values the server needs too. A variable already set in the
// environment wins over the file, and a deployment may have no file at all.
try {
  process.loadEnvFile();
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
// The dev server exposes unbundled source, so it only answers this machine
// unless HOST says otherwise. Production keeps listening on every interface.
const host = process.env.HOST || (isProduction ? undefined : 'localhost');
const ABORT_DELAY = 10000;

// Firebase runs sign-in through an iframe on the auth domain, so the CSP must
// allow that exact host. It is often a custom domain or *.web.app rather than
// the default *.firebaseapp.com, which is only the fallback.
const authDomain = process.env.VITE_AUTH_DOMAIN?.trim();
if (isProduction && !authDomain) {
  console.warn(
    'VITE_AUTH_DOMAIN is not set; allowing https://*.firebaseapp.com for sign-in. ' +
      'Sign-in will fail if the app uses a different auth domain.',
  );
}
const authFrameSource = authDomain ? `https://${authDomain}` : 'https://*.firebaseapp.com';

// Cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

// Create http server
const app = express();
const server = createServer(app);

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

// Add Vite or respective production middlewares
/** @type {import('vite').ViteDevServer | undefined} */
let vite;
if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    // HMR shares this server instead of opening its own on port 24678, which
    // would listen on every interface regardless of HOST.
    server: { middlewareMode: true, hmr: { server } },
    appType: 'custom',
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(sirv('./dist/client', { extensions: [] }));
}

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

    /** @type {string} */
    let template;
    /** @type {import('./src/entry-server.ts').render} */
    let render;
    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite.transformIndexHtml(url, template);
      render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      render = (await import('./dist/server/entry-server.js')).render;
    }

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

    setTimeout(() => {
      abort();
    }, ABORT_DELAY);
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e);
    // Detailed stacks stay server-side in production so we don't disclose
    // filesystem paths, dependency versions, or internal module structure.
    res.status(500).end(isProduction ? 'Internal Server Error' : e.stack);
  }
});

// Anything thrown outside the SSR handler's own try/catch ends up here, so an
// unexpected failure returns a response instead of leaving the request hanging.
app.use((err, _req, res, _next) => {
  console.error(err);
  if (res.headersSent) {
    res.end();
    return;
  }
  res.status(500).end(isProduction ? 'Internal Server Error' : err.stack);
});

// Start http server
server.listen(port, host, () => {
  if (isProduction) {
    console.log(`Server running at port ${port}`);
  } else {
    console.log(`Server running in development mode at http://${host}:${port}`);
  }
});
