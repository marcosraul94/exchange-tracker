import { chromium, devices } from "playwright";

const run = async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext(devices["iPhone 11"]);
  const page = await context.newPage();

  await page.goto("https://www.scrapethissite.com/pages/simple/");

  const title = await page.title();
  console.log(`Page title: ${title}`);

  await context.close();
  await browser.close();
};

run();
