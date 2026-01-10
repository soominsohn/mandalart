import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function generateIcon(page, svgContent, size, outputPath) {
  const scaledSvg = svgContent
    .replace('width="32"', `width="${size}"`)
    .replace('height="32"', `height="${size}"`);

  await page.setViewport({ width: size, height: size });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;width:${size}px;height:${size}px;">
        ${scaledSvg}
      </body>
    </html>
  `);

  const icon = await page.screenshot({
    type: 'png',
    omitBackground: true,
  });

  writeFileSync(outputPath, icon);
  console.log(`Generated ${outputPath} (${size}x${size})`);
}

async function generateOgImage(page, outputPath) {
  const width = 1200;
  const height = 630;

  await page.setViewport({ width, height });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
      </head>
      <body style="margin:0;padding:0;width:${width}px;height:${height}px;background:linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%);font-family:Pretendard,-apple-system,BlinkMacSystemFont,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:24px;">
          <!-- 3x3 Grid Icon -->
          <svg width="120" height="120" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="11.75" y="1" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="22.5" y="1" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="1" y="11.75" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="11.75" y="11.75" width="8.5" height="8.5" rx="1.5" fill="#FCD34D"/>
            <rect x="22.5" y="11.75" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="1" y="22.5" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="11.75" y="22.5" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
            <rect x="22.5" y="22.5" width="8.5" height="8.5" rx="1.5" fill="white" fill-opacity="0.9"/>
          </svg>

          <h1 style="color:white;font-size:72px;font-weight:800;margin:0;letter-spacing:-2px;">만다라트</h1>
          <p style="color:rgba(255,255,255,0.9);font-size:28px;font-weight:500;margin:0;text-align:center;max-width:800px;line-height:1.4;">
            9x9 그리드로 목표를 체계적으로 설정하고<br/>꿈을 실현하세요
          </p>
        </div>
        <div style="position:absolute;bottom:40px;color:rgba(255,255,255,0.7);font-size:18px;">
          mandalart.minlabs.site
        </div>
      </body>
    </html>
  `);

  await new Promise(resolve => setTimeout(resolve, 500));

  const ogImage = await page.screenshot({
    type: 'png',
  });

  writeFileSync(outputPath, ogImage);
  console.log(`Generated OG image (${width}x${height})`);
}

async function main() {
  const svgContent = readFileSync(join(projectRoot, 'src/app/icon.svg'), 'utf-8');

  // Copy icon.svg to public folder
  copyFileSync(
    join(projectRoot, 'src/app/icon.svg'),
    join(projectRoot, 'public/icon.svg')
  );
  console.log('Copied icon.svg to public folder');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Generate apple-icon.png (180x180) in src/app
  await generateIcon(page, svgContent, 180, join(projectRoot, 'src/app/apple-icon.png'));

  // Generate PWA icons in public folder
  await generateIcon(page, svgContent, 192, join(projectRoot, 'public/icon-192.png'));
  await generateIcon(page, svgContent, 512, join(projectRoot, 'public/icon-512.png'));

  // Generate OG image
  await generateOgImage(page, join(projectRoot, 'public/og-image.png'));

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
