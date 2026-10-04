import { type Plugin } from 'vite';

// The security headers the app is served with. There is no server to send them,
// so the build writes them to a _headers file, which Netlify (and Cloudflare
// Pages) apply to every response. They are Helmet's defaults, which the old
// Express server sent, plus what this app needs on top. The file also sets how
// long browsers cache the bundles.
//
// Firebase runs sign-in through an iframe on the auth domain, so the CSP must
// allow that exact host. It is often a custom domain or *.web.app rather than
// the default *.firebaseapp.com, which is only the fallback.
export function buildHeadersFile(authDomain: string | undefined): string {
  const authFrameSource = authDomain ? `https://${authDomain}` : 'https://*.firebaseapp.com';

  const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "font-src 'self' https: data:",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "script-src-attr 'none'",
    // emoji-picker-react and the Dropdown set inline styles
    "style-src 'self' https: 'unsafe-inline'",
    // Firestore reads/writes and the auth token endpoints
    "connect-src 'self' https://*.googleapis.com",
    // The Google sign-in popup and Firebase's auth handler
    `frame-src 'self' ${authFrameSource} https://accounts.google.com`,
    "script-src 'self' https://apis.google.com",
    // Google account avatars, plus the emoji set emoji-picker-react loads
    "img-src 'self' data: https://*.googleusercontent.com https://cdn.jsdelivr.net",
    'upgrade-insecure-requests',
  ].join('; ');

  const headers = {
    'Content-Security-Policy': contentSecurityPolicy,
    // Firebase's signInWithPopup polls popup.closed on the window it opens. The
    // stricter 'same-origin' severs that reference and sign-in hangs.
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'X-Content-Type-Options': 'nosniff',
    'X-DNS-Prefetch-Control': 'off',
    'X-Download-Options': 'noopen',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Permitted-Cross-Domain-Policies': 'none',
    // Turns off the XSS filter in older browsers, which could itself be abused
    'X-XSS-Protection': '0',
  };

  const lines = Object.entries(headers).map(([name, value]) => `  ${name}: ${value}`);
  return [
    '/*',
    ...lines,
    '',
    // Vite names each bundle after a hash of its contents, so a file under
    // /assets/ never changes and browsers can keep it rather than recheck it
    // on every visit. A new build ships new filenames. Netlify adds these to
    // the headers above.
    '/assets/*',
    '  Cache-Control: public, max-age=31536000, immutable',
    '',
  ].join('\n');
}

// Writes _headers into the build, using the auth domain the client is built
// with, so the CSP always matches it
export function securityHeaders(): Plugin {
  let authDomain: string | undefined;

  return {
    name: 'security-headers',
    apply: 'build',
    configResolved(config) {
      authDomain = config.env.VITE_AUTH_DOMAIN?.trim() || undefined;
    },
    generateBundle() {
      if (!authDomain) {
        this.warn(
          'VITE_AUTH_DOMAIN is not set; the CSP allows https://*.firebaseapp.com for sign-in. ' +
            'Sign-in will fail if the app uses a different auth domain.',
        );
      }
      this.emitFile({ type: 'asset', fileName: '_headers', source: buildHeadersFile(authDomain) });
    },
  };
}
