const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto('http://localhost:5177/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  // Skip through to the dashboard chapter (chapter 3 → steps 0..4)
  // Click the stage 6 times to reach chapter 3 step 0
  for (let i = 0; i < 8; i++) {
    await page.click('.stage-frame', { position: { x: 960, y: 540 } });
    await page.waitForTimeout(180);
  }
  // Now advance within chapter 3 (chapter 3 has 5 steps → 0..4)
  for (let step = 0; step <= 4; step++) {
    await page.waitForTimeout(2000);
    const path = `d:/数据大屏/dash-step-${step}.png`;
    await page.screenshot({ path, fullPage: false });
    console.log('Saved', path);
    if (step < 4) {
      await page.click('.stage-frame', { position: { x: 960, y: 540 } });
      await page.waitForTimeout(400);
    }
  }
  await browser.close();
})();
