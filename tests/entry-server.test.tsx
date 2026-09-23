import { describe, test, expect, vi } from 'vitest';
import { Writable } from 'node:stream';
import { render } from '../src/entry-server';

// Renders a URL the way server.js does and resolves once the shell is ready,
// which is when server.js reads the status and sends the headers
function renderShell(url: string) {
  const setStatus = vi.fn();
  return new Promise<typeof setStatus>((resolve, reject) => {
    const { pipe } = render(
      url,
      {
        onShellReady() {
          // drain the stream so the render can finish
          pipe(new Writable({ write: (_chunk, _encoding, callback) => callback() }));
          resolve(setStatus);
        },
        onShellError: reject,
      },
      setStatus,
    );
  });
}

// Issue 11: an unknown URL was answered with a 200 and an empty page
describe('server render status', () => {
  test('reports a 404 for an unknown URL', async () => {
    const setStatus = await renderShell('/grocery');

    expect(setStatus).toHaveBeenCalledWith(404);
  });

  test('reports nothing for a real page, leaving the 200', async () => {
    const setStatus = await renderShell('/login');

    expect(setStatus).not.toHaveBeenCalled();
  });
});
