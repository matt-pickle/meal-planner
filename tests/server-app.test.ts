// @vitest-environment node
import { describe, test, expect, afterEach, vi } from 'vitest';
import { type AddressInfo } from 'node:net';
import { createServer, type Server } from 'node:http';
import { type RequestHandler } from 'express';
import { createApp, type AppOptions, type Render } from '../server-app.js';
import { render as realRender } from '../src/entry-server';

// Issue 18: server.js was the one untested module. Its request handling now
// lives in server-app.js, which these tests drive over real HTTP with a fake
// page in place of Vite or a build.

const template = '<html><body><div id="root"><!--app-html--></div></body></html>';

// A stand-in for entry-server's render that drives the callbacks it is given
function fakeRender(
  behave: (options: Parameters<Render>[1], setStatus?: (code: number) => void) => void,
): Render {
  return ((_url, options, setStatus) => {
    const result = {
      pipe: (stream: NodeJS.WritableStream) => stream.end('<p>rendered</p>'),
      abort: vi.fn(),
    };
    // after the caller has its pipe and abort, as React calls back asynchronously
    queueMicrotask(() => behave(options, setStatus));
    return result;
  }) as Render;
}

const shellReady = fakeRender(options => options?.onShellReady?.());

let server: Server | undefined;

async function start(overrides: Partial<AppOptions> = {}) {
  const app = createApp({
    isProduction: true,
    authFrameSource: 'https://auth.example.com',
    assetHandlers: [],
    loadPage: async () => ({ template, render: shellReady }),
    ...overrides,
  });
  server = createServer(app);
  await new Promise<void>(resolve => server!.listen(0, '127.0.0.1', resolve));
  const { port } = server.address() as AddressInfo;
  return (path: string) => fetch(`http://127.0.0.1:${port}${path}`);
}

afterEach(async () => {
  if (server) {
    // fetch keeps connections alive, and close() would wait for them
    server.closeAllConnections();
    await new Promise(resolve => server!.close(resolve));
  }
  server = undefined;
  vi.restoreAllMocks();
});

describe('server app pages', () => {
  test('serves a rendered page inside the template with a 200', async () => {
    const get = await start();

    const response = await get('/schedule');

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toMatch(/text\/html/);
    expect(await response.text()).toBe(
      '<html><body><div id="root"><p>rendered</p></div></body></html>',
    );
  });

  test('answers an unknown page with a 404 and the Not Found page', async () => {
    const get = await start({ loadPage: async () => ({ template, render: realRender }) });

    const response = await get('/grocery');

    expect(response.status).toBe(404);
    expect(await response.text()).toContain('Page Not Found');
  });

  test('answers a real page with a 200', async () => {
    const get = await start({ loadPage: async () => ({ template, render: realRender }) });

    expect((await get('/login')).status).toBe(200);
  });

  test('answers a missing file with a plain 404, not the app', async () => {
    const get = await start();

    const response = await get('/assets/index-deadbeef.js');

    expect(response.status).toBe(404);
    expect(await response.text()).toBe('Not Found');
  });

  test('serves files through the asset handlers before any page', async () => {
    const serveFile: RequestHandler = (req, res, next) => {
      if (req.path === '/file.txt') res.end('file contents');
      else next();
    };
    const get = await start({ assetHandlers: [serveFile] });

    const response = await get('/file.txt');

    expect(response.status).toBe(200);
    expect(await response.text()).toBe('file contents');
  });
});

describe('server app security headers', () => {
  test('allows the configured auth domain in the production CSP', async () => {
    const get = await start();

    const csp = (await get('/login')).headers.get('content-security-policy');

    expect(csp).toContain("frame-src 'self' https://auth.example.com https://accounts.google.com");
  });

  test('sends no CSP in development, where Vite needs inline scripts', async () => {
    const get = await start({ isProduction: false });

    expect((await get('/login')).headers.get('content-security-policy')).toBeNull();
  });

  test('lets the sign-in popup report back to the page that opened it', async () => {
    const get = await start();

    expect((await get('/login')).headers.get('cross-origin-opener-policy')).toBe(
      'same-origin-allow-popups',
    );
  });
});

describe('server app errors', () => {
  test('hides the stack in production when a page fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const get = await start({
      loadPage: async () => {
        throw new Error('secret detail');
      },
    });

    const response = await get('/schedule');

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });

  test('shows the stack in development, mapped back to the source', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const fixStacktrace = vi.fn();
    const get = await start({
      isProduction: false,
      loadPage: async () => {
        throw new Error('useful detail');
      },
      fixStacktrace,
    });

    const response = await get('/schedule');

    expect(response.status).toBe(500);
    expect(await response.text()).toContain('useful detail');
    expect(fixStacktrace).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'useful detail' }),
    );
  });

  test('answers a 500 when the page shell fails to render', async () => {
    const get = await start({
      loadPage: async () => ({
        template,
        render: fakeRender(options => options?.onShellError?.(new Error())),
      }),
    });

    const response = await get('/schedule');

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('<h1>Something went wrong</h1>');
  });

  test('answers a 500 when rendering reported an error before the shell was ready', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const render = fakeRender(options => {
      options?.onError?.(new Error('in a component'), { componentStack: '' });
      options?.onShellReady?.();
    });
    const get = await start({ loadPage: async () => ({ template, render }) });

    expect((await get('/schedule')).status).toBe(500);
  });

  test('answers a 500 without the stack when a file handler fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const failingHandler: RequestHandler = (_req, _res, next) => next(new Error('secret detail'));
    const get = await start({ assetHandlers: [failingHandler] });

    const response = await get('/vite.svg');

    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Internal Server Error');
  });

  test('uses the status a page set during the render', async () => {
    const render = fakeRender((options, setStatus) => {
      setStatus?.(404);
      options?.onShellReady?.();
    });
    const get = await start({ loadPage: async () => ({ template, render }) });

    expect((await get('/whatever')).status).toBe(404);
  });
});
