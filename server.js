// @ts-check
import fs from 'node:fs/promises';
import { createServer } from 'node:http';
import { createApp } from './server-app.js';

// Vite reads .env for the client at build time; plain Node doesn't, so load it
// here for the values the server needs too. A variable already set in the
// environment wins over the file, and a deployment may have no file at all.
try {
  process.loadEnvFile();
} catch (error) {
  if (/** @type {NodeJS.ErrnoException} */ (error).code !== 'ENOENT') throw error;
}

// Constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
// The dev server exposes unbundled source, so it only answers this machine
// unless HOST says otherwise. Production keeps listening on every interface.
const host = process.env.HOST || (isProduction ? undefined : 'localhost');

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

// Created before the app so Vite's HMR can share it (see below)
const server = createServer();

/** @typedef {import('./server-app.js').AppOptions} AppOptions */
/** @type {AppOptions['assetHandlers']} */
let assetHandlers;
/** @type {AppOptions['loadPage']} */
let loadPage;
/** @type {AppOptions['fixStacktrace']} */
let fixStacktrace;

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    // HMR shares this server instead of opening its own on port 24678, which
    // would listen on every interface regardless of HOST.
    server: { middlewareMode: true, hmr: { server } },
    appType: 'custom',
  });
  assetHandlers = [vite.middlewares];
  // Always read a fresh template and renderer in development
  loadPage = async url => ({
    template: await vite.transformIndexHtml(url, await fs.readFile('./index.html', 'utf-8')),
    render: (await vite.ssrLoadModule('/src/entry-server.tsx')).render,
  });
  fixStacktrace = error => vite.ssrFixStacktrace(error);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  assetHandlers = [compression(), sirv('./dist/client', { extensions: [] })];

  // Cached production assets. The renderer's path is a variable so the type
  // checker doesn't look for a build that may not exist yet.
  const template = await fs.readFile('./dist/client/index.html', 'utf-8');
  const serverEntry = './dist/server/entry-server.js';
  /** @type {{ render: import('./server-app.js').Render }} */
  const { render } = await import(serverEntry);
  loadPage = async () => ({ template, render });
}

server.on(
  'request',
  createApp({ isProduction, authFrameSource, assetHandlers, loadPage, fixStacktrace }),
);

// Start http server
server.listen(Number(port), host, () => {
  if (isProduction) {
    console.log(`Server running at port ${port}`);
  } else {
    console.log(`Server running in development mode at http://${host}:${port}`);
  }
});
