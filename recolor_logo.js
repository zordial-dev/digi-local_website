import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAllLogoAssets() {
  const inputPath = path.resolve('public/logo_original_green.png');

  const image = sharp(inputPath);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  console.log(`Processing logo: ${width}x${height}, channels: ${channels}`);

  // Target brand colors:
  // Deep Burgundy: #541D26 (RGB: 84, 29, 38)
  // Sand Gold: #C8A878 (RGB: 200, 168, 120)

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Transparent background
    if (r > 240 && g > 240 && b > 240) {
      if (channels === 4) {
        data[i + 3] = 0;
      }
      continue;
    }

    // Gold / yellow accent detection
    const isGold = (r > 150 && g > 110 && b < 100) || (r > 180 && g > 140 && b < 120);

    if (isGold) {
      const factor = (r + g) / (255 + 200);
      data[i] = Math.min(255, Math.round(200 * factor + 30));     // R
      data[i + 1] = Math.min(255, Math.round(168 * factor + 20)); // G
      data[i + 2] = Math.min(255, Math.round(120 * factor + 10)); // B
      continue;
    }

    // Green hues -> Deep Burgundy #541D26
    const isGreen = (g > r * 0.95 && g > b * 1.1) || (g > 30 && g > b && r < 100);

    if (isGreen || (r < 80 && g < 100 && b < 80)) {
      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
      const targetR = Math.round(48 + lum * 135);
      const targetG = Math.round(16 + lum * 45);
      const targetB = Math.round(22 + lum * 60);

      data[i] = Math.min(255, Math.max(0, targetR));
      data[i + 1] = Math.min(255, Math.max(0, targetG));
      data[i + 2] = Math.min(255, Math.max(0, targetB));
    }
  }

  // 1. Save standard recolored transparent logo.png
  await sharp(data, {
    raw: { width, height, channels }
  })
  .png()
  .toFile(path.resolve('public/logo.png'));

  // 2. Save cropped square icon version logo_icon.png (512x512 with clean padding)
  await sharp(data, {
    raw: { width, height, channels }
  })
  .trim()
  .resize(460, 460, { fit: 'inside' })
  .extend({
    top: 26,
    bottom: 26,
    left: 26,
    right: 26,
    background: { r: 0, g: 0, b: 0, alpha: 0 }
  })
  .png()
  .toFile(path.resolve('public/logo_icon.png'));

  // 3. Save cream background version for brand guidelines
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 246, g: 240, b: 232, alpha: 1 } // #F6F0E8
    }
  })
  .composite([{ input: path.resolve('public/logo_icon.png') }])
  .png()
  .toFile(path.resolve('public/logo_cream_bg.png'));

  console.log('Successfully created all logo assets: logo.png, logo_icon.png, logo_cream_bg.png');
}

generateAllLogoAssets().catch(console.error);
