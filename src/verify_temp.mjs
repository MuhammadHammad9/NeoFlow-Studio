import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Use 5174 since 5173 was taken
  console.log('Navigating...');
  await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded', timeout: 60000 });

  console.log('Waiting for content...');
  // Wait for content to load
  await page.waitForSelector('text=Dashboard', { timeout: 60000 });

  console.log('Taking dashboard screenshot...');
  // Take screenshot of Dashboard
  await page.screenshot({ path: '/home/jules/verification/dashboard.png', fullPage: true });

  console.log('Navigating to Notes...');
  // Navigate to Notes
  await page.click('text=Smart Notes');
  await page.waitForTimeout(2000); // Wait for transition and lazy load

  console.log('Taking notes screenshot...');
  await page.screenshot({ path: '/home/jules/verification/notes.png', fullPage: true });

  await browser.close();
  console.log('Done.');
})();
