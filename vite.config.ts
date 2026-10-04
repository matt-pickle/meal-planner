// vitest/config's defineConfig is Vite's, plus the types for the `test` block
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { securityHeaders } from './security-headers';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), securityHeaders()],
  test: {
    environment: 'jsdom',
    // Pin the timezone so date-boundary tests are deterministic and actually
    // exercise daylight-saving transitions.
    env: { TZ: 'America/New_York' },
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      reporter: ['text'],
    },
  },
});
