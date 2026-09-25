const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const tabletDir = path.join(__dirname, '..', 'tablet_10inch_screenshots');
if (!fs.existsSync(tabletDir)) fs.mkdirSync(tabletDir, { recursive: true });

const publicTabletDir = path.join(__dirname, '..', 'public', 'tablet_10inch_screenshots');
if (!fs.existsSync(publicTabletDir)) fs.mkdirSync(publicTabletDir, { recursive: true });

const screens = [
  { name: '1_welcome_onboarding', src: path.join(__dirname, '..', 'public', 'showcase_assets', 'screen1_welcome.jpg') },
  { name: '2_store_hub_subscription', src: path.join(__dirname, '..', 'public', 'showcase_assets', 'screen2_store_card.jpg') },
  { name: '3_orders_dashboard', src: path.join(__dirname, '..', 'public', 'showcase_assets', 'screen3_orders.jpg') },
  { name: '4_payouts_settlement', src: path.join(__dirname, '..', 'public', 'showcase_assets', 'screen4_payouts.jpg') },
  { name: '5_catalog_inventory', src: path.join(__dirname, '..', 'public', 'showcase_assets', 'screen5_catalog.jpg') }
];

async function generateAllTabletScreens() {
  for (const s of screens) {
    const inputBuf = fs.readFileSync(s.src);
    
    // 1. High-Res 10-inch Tablet (1600 x 2560 px - Native 10 inch Tablet standard)
    const buf1600x2560_png = await sharp(inputBuf)
      .resize(1600, 2560, {
        fit: 'contain',
        background: { r: 250, g: 247, b: 242, alpha: 1 }
      })
      .png({ quality: 100 })
      .toBuffer();

    const buf1600x2560_jpg = await sharp(inputBuf)
      .resize(1600, 2560, {
        fit: 'contain',
        background: { r: 250, g: 247, b: 242, alpha: 1 }
      })
      .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
      .toBuffer();

    // 2. 1080 x 1920 px (Exact 1080 px short side)
    const buf1080x1920_png = await sharp(inputBuf)
      .resize(1080, 1920, {
        fit: 'contain',
        background: { r: 250, g: 247, b: 242, alpha: 1 }
      })
      .png({ quality: 100 })
      .toBuffer();

    const buf1080x1920_jpg = await sharp(inputBuf)
      .resize(1080, 1920, {
        fit: 'contain',
        background: { r: 250, g: 247, b: 242, alpha: 1 }
      })
      .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
      .toBuffer();

    // Write to both folders
    fs.writeFileSync(path.join(tabletDir, `tablet_10in_${s.name}_1600x2560.png`), buf1600x2560_png);
    fs.writeFileSync(path.join(tabletDir, `tablet_10in_${s.name}_1600x2560.jpg`), buf1600x2560_jpg);
    fs.writeFileSync(path.join(tabletDir, `tablet_10in_${s.name}_1080x1920.png`), buf1080x1920_png);
    fs.writeFileSync(path.join(tabletDir, `tablet_10in_${s.name}_1080x1920.jpg`), buf1080x1920_jpg);

    fs.writeFileSync(path.join(publicTabletDir, `tablet_10in_${s.name}_1600x2560.png`), buf1600x2560_png);
    fs.writeFileSync(path.join(publicTabletDir, `tablet_10in_${s.name}_1600x2560.jpg`), buf1600x2560_jpg);
    fs.writeFileSync(path.join(publicTabletDir, `tablet_10in_${s.name}_1080x1920.png`), buf1080x1920_png);
    fs.writeFileSync(path.join(publicTabletDir, `tablet_10in_${s.name}_1080x1920.jpg`), buf1080x1920_jpg);
  }

  // 3. Play Store App Icon 512x512 px (required 512x512)
  const logoPath = path.join(__dirname, '..', 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    const iconBuf = await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 250, g: 247, b: 242, alpha: 1 }
      })
      .png({ quality: 100 })
      .toBuffer();
    fs.writeFileSync(path.join(__dirname, '..', 'app_icon_512x512.png'), iconBuf);
    fs.writeFileSync(path.join(tabletDir, 'app_icon_512x512.png'), iconBuf);
  }

  console.log('Successfully generated all 10-inch tablet screenshots meeting Google Play rules (>= 1,080 px & <= 7,680 px)!');
}

generateAllTabletScreens().catch(console.error);
