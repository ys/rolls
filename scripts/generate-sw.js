const { injectManifest } = require('@serwist/build');
const path = require('path');
const fs = require('fs');

async function generateSW() {
  const swSrc = path.join(__dirname, '../public/sw.ts');
  const swDest = path.join(__dirname, '../public/sw.js');

  // Check if source file exists
  if (!fs.existsSync(swSrc)) {
    console.error(`❌ Source file not found: ${swSrc}`);
    process.exit(1);
  }

  try {
    const { count, size, warnings } = await injectManifest({
      swSrc,
      swDest,
      globDirectory: path.join(__dirname, '..'),
      globPatterns: [
        '.next/static/**/*.{js,css}',
        'public/**/*.{png,jpg,jpeg,svg,ico,webp}',
      ],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    });

    console.log(`✓ Service worker generated: ${count} files, ${size} bytes`);
    if (warnings.length > 0) {
      console.warn('⚠ Warnings:', warnings);
    }
  } catch (error) {
    console.error('❌ Error generating service worker:', error);
    process.exit(1);
  }
}

generateSW();
