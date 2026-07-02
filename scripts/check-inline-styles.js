#!/usr/bin/env node
/**
 * Guards against new inline `style="..."` attributes that hard-code raw values
 * and bypass the design system (see issue #64).
 *
 * A `style="..."` attribute is only allowed when everything left over after
 * removing `var(--token)` references and `{...}` dynamic expressions is free of
 * raw values — i.e. it contains no hex colour and no raw px/rem/em length.
 * That permits token-only inline styles (`color: var(--color-text-secondary)`)
 * and dynamic custom-property bindings (`--progress: {pct}%`), while flagging
 * hard-coded values like `font-size: 0.9rem` or `color: #1e40af`.
 *
 * Usage: node scripts/check-inline-styles.js
 * Exits non-zero (and lists offenders) when a violation is found.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOTS = ['src/routes', 'src/lib'];

const files = execSync(
  `find ${ROOTS.join(' ')} -name '*.svelte' -type f`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(Boolean);

// Matches both style="..." and style='...' attributes.
const STYLE_ATTR = /style=(?:"([^"]*)"|'([^']*)')/g;
const RAW_HEX = /#[0-9a-fA-F]{3,8}\b/;
const RAW_LENGTH = /(?<![\w-])\d*\.?\d+(px|rem|em)\b/;

const offenders = [];

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, idx) => {
    for (const match of line.matchAll(STYLE_ATTR)) {
      const value = match[1] ?? match[2] ?? '';
      // Drop tokens and dynamic expressions; only raw literals should remain.
      const stripped = value
        .replace(/var\(\s*--[^)]*\)/g, '')
        .replace(/\{[^}]*\}/g, '');
      if (RAW_HEX.test(stripped) || RAW_LENGTH.test(stripped)) {
        offenders.push({ file, line: idx + 1, value });
      }
    }
  });
}

if (offenders.length > 0) {
  console.error(
    `✗ Found ${offenders.length} inline style attribute(s) with hard-coded values.\n` +
      `  Move these into a scoped class or design-system token (see issue #64).\n`
  );
  for (const o of offenders) {
    console.error(`  ${o.file}:${o.line}  style="${o.value}"`);
  }
  process.exit(1);
}

console.log('✓ No inline styles with hard-coded values found.');
