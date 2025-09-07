import { chromium, devices } from "playwright";

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(devices["iPhone 11"]);
  const page = await context.newPage();

  await page.goto("https://www.scrapethissite.com/pages/simple/");

  await page.screenshot({ path: "screenshot.png" });

  await context.close();
  await browser.close();
};

run();
