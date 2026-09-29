import { describe, test, expect } from 'vitest';
import { buildHeadersFile } from '../security-headers';

// The static host sends these headers now that there is no server; the build
// writes them to dist/_headers
describe('buildHeadersFile', () => {
  function header(file: string, name: string) {
    return file
      .split('\n')
      .find(line => line.trimStart().startsWith(`${name}:`))
      ?.split(': ')
      .slice(1)
      .join(': ');
  }

  test('applies the headers to every path', () => {
    expect(buildHeadersFile('auth.example.com').startsWith('/*\n')).toBe(true);
  });

  test('allows the configured auth domain to frame sign-in', () => {
    const csp = header(buildHeadersFile('auth.example.com'), 'Content-Security-Policy');

    expect(csp).toContain("frame-src 'self' https://auth.example.com https://accounts.google.com");
  });

  test('falls back to the default Firebase auth domains when none is set', () => {
    const csp = header(buildHeadersFile(undefined), 'Content-Security-Policy');

    expect(csp).toContain("frame-src 'self' https://*.firebaseapp.com https://accounts.google.com");
  });

  test('lets the sign-in popup report back to the page that opened it', () => {
    expect(header(buildHeadersFile(undefined), 'Cross-Origin-Opener-Policy')).toBe(
      'same-origin-allow-popups',
    );
  });
});
