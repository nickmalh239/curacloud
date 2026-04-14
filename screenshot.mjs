import puppeteer from 'puppeteer';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];
const dir = join(__dirname, 'temporary screenshots');

if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const files = readdirSync(dir).filter(f => /^screenshot-\d+/.test(f));
const nums = files.map(f => parseInt(f.match(/screenshot-(\d+)/)[1]));
const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = join(dir, filename);

console.log(`Launching browser...`);
const browser = await puppeteer.launch({
  headless: 'new',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
await page.screenshot({ path: outPath, fullPage: true });
await browser.close();
console.log(`Saved: temporary screenshots/${filename}`);
