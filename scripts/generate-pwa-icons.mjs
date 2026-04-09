/**
 * Generates PWA icons from the JAX logo SVG.
 * Run once with: node scripts/generate-pwa-icons.mjs
 */

import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const iconsDir = join(root, 'static', 'icons');
const svgPath = join(root, 'static', 'JAX-Profile-Final-1.svg');

await mkdir(iconsDir, { recursive: true });

// Standard icon (transparent background)
await sharp(svgPath)
  .resize(192, 192)
  .png()
  .toFile(join(iconsDir, 'icon-192.png'));
console.log('Created icon-192.png');

await sharp(svgPath)
  .resize(512, 512)
  .png()
  .toFile(join(iconsDir, 'icon-512.png'));
console.log('Created icon-512.png');

// Maskable icon (needs padding so the logo isn't clipped by the safe zone)
// Safe zone is the inner 80% of the icon
await sharp({
  create: {
    width: 512,
    height: 512,
    channels: 4,
    background: { r: 30, g: 58, b: 95, alpha: 1 } // --color-brand-primary #1e3a5f
  }
})
  .composite([
    {
      input: await sharp(svgPath).resize(360, 360).png().toBuffer(),
      gravity: 'center'
    }
  ])
  .png()
  .toFile(join(iconsDir, 'icon-maskable-512.png'));
console.log('Created icon-maskable-512.png');

console.log('\nPWA icons generated successfully in static/icons/');
