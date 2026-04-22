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

// Render the logo contained (no crop) at the target inner size, then composite
// onto a transparent canvas so the full logo is visible with a small margin.
async function buildIcon({ canvas, inner, background, outPath }) {
  const logoBuffer = await sharp(svgPath)
    .resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background
    }
  })
    .composite([{ input: logoBuffer, gravity: 'center' }])
    .png()
    .toFile(outPath);

  console.log(`Created ${outPath.split('/').pop()}`);
}

const transparent = { r: 0, g: 0, b: 0, alpha: 0 };
const brandPrimary = { r: 30, g: 58, b: 95, alpha: 1 }; // #1e3a5f

// Standard icons: transparent background, logo at ~85% to leave breathing room.
await buildIcon({
  canvas: 192,
  inner: Math.round(192 * 0.85),
  background: transparent,
  outPath: join(iconsDir, 'icon-192.png')
});

await buildIcon({
  canvas: 512,
  inner: Math.round(512 * 0.85),
  background: transparent,
  outPath: join(iconsDir, 'icon-512.png')
});

// Maskable icon: brand blue background, logo at ~70% so it stays inside the
// platform-imposed safe zone (inner 80%) across Android shape masks.
await buildIcon({
  canvas: 512,
  inner: Math.round(512 * 0.7),
  background: brandPrimary,
  outPath: join(iconsDir, 'icon-maskable-512.png')
});

console.log('\nPWA icons generated successfully in static/icons/');
