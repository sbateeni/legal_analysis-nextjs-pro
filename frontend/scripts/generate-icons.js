const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generateIcons() {
  try {
    // قراءة ملف SVG
    const svgPath = path.join(__dirname, '../public/icon-192x192.svg');
    const svgBuffer = fs.readFileSync(svgPath);
    
    // إنشاء أيقونة 192x192 PNG
    await sharp(svgBuffer)
      .resize(192, 192)
      .png()
      .toFile(path.join(__dirname, '../public/icon-192x192.png'));
    
    // إنشاء أيقونة 512x512 PNG
    await sharp(svgBuffer)
      .resize(512, 512)
      .png()
      .toFile(path.join(__dirname, '../public/icon-512x512.png'));
    
    console.log('✅ تم إنشاء أيقونات PNG بنجاح!');
  } catch (error) {
    console.error('❌ خطأ في إنشاء الأيقونات:', error);
  }
}

generateIcons();
