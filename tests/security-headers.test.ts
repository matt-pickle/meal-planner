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

  test("sends every header in Helmet's defaults", () => {
    // the block for every path ends at the first blank line
    const names = buildHeadersFile('auth.example.com')
      .split('\n\n')[0]
      .split('\n')
      .slice(1)
      .map(line => line.trim().split(':')[0]);

    expect(names.sort()).toEqual([
      'Content-Security-Policy',
      'Cross-Origin-Opener-Policy',
      'Cross-Origin-Resource-Policy',
      'Origin-Agent-Cluster',
      'Referrer-Policy',
      'Strict-Transport-Security',
      'X-Content-Type-Options',
      'X-DNS-Prefetch-Control',
      'X-Download-Options',
      'X-Frame-Options',
      'X-Permitted-Cross-Domain-Policies',
      'X-XSS-Protection',
    ]);
  });

  test('lets browsers cache the hashed bundles for good', () => {
    const file = buildHeadersFile('auth.example.com');

    expect(file).toContain('/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n');
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
