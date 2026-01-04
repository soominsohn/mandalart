import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

async function main() {
  const svgContent = readFileSync(join(projectRoot, 'src/app/icon.svg'), 'utf-8');

  // Apple Touch Icon용 SVG (180x180)
  const appleSvg = svgContent
    .replace('width="32"', 'width="180"')
    .replace('height="32"', 'height="180"')
    .replace('viewBox="0 0 32 32"', 'viewBox="0 0 32 32"');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  // Generate apple-icon.png (180x180)
  await page.setViewport({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0;padding:0;display:flex;align-items:center;justify-content:center;width:180px;height:180px;">
        ${appleSvg}
      </body>
    </html>
  `);

  const appleIcon = await page.screenshot({
    type: 'png',
    omitBackground: true,
  });

  writeFileSync(join(projectRoot, 'src/app/apple-icon.png'), appleIcon);
  console.log('Generated apple-icon.png (180x180)');

  await browser.close();
  console.log('Done!');
}

main().catch(console.error);
