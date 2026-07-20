// Pin the timezone so date-formatting assertions are deterministic across
// machines and CI. Node re-reads process.env.TZ for subsequent Date/Intl
// operations, so setting it here (before the tests run) is enough.
process.env.TZ = 'UTC';
