// Small logging shim so dev-only diagnostics don't ship to production (#60).
//
// `log`/`debug`/`info` are gated behind Vite's `import.meta.env.DEV`. Because
// that flag is statically replaced with `false` in production builds, those
// calls are dead-code-eliminated from the bundle entirely — no log noise, and
// no leaking of internal data shapes to end-user consoles.
//
// `warn`/`error` always pass through: they're intentional diagnostics that we
// want visible in production. Route future logging through this shim rather
// than calling `console.*` directly so the dev/prod split stays consistent.
const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  debug: (...args) => {
    if (isDev) console.debug(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  },
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args)
};

export default logger;
