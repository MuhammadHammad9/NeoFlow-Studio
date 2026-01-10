import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Navigating to preview...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });

  // Dump page content if needed
  // console.log(await page.content());

  console.log('Taking dashboard screenshot...');
  // Force wait for something visible
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/home/jules/verification/dashboard.png', fullPage: true });

  console.log('Navigating to Notes...');
  // Navigate to Notes
  try {
      await page.click('text=Smart Notes', { timeout: 5000 });
      await page.waitForTimeout(3000); // Wait for transition and lazy load
      await page.screenshot({ path: '/home/jules/verification/notes.png', fullPage: true });
  } catch (e) {
      console.log('Could not click notes or find it');
      await page.screenshot({ path: '/home/jules/verification/error.png' });
  }

  await browser.close();
  console.log('Done.');
})();
