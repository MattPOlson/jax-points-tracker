import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

// Standalone unit-test config (#80). Kept separate from vite.config.js so it
// doesn't load the SvelteKit plugin — these are fast, pure-logic unit tests.
// Playwright end-to-end specs live in ./tests and are run by playwright.config.js;
// vitest only picks up co-located src/**/*.test.js files.
export default defineConfig({
  resolve: {
    alias: {
      $lib: fileURLToPath(new URL('./src/lib', import.meta.url))
    }
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
    environment: 'node',
    setupFiles: ['./vitest.setup.js']
  }
});
