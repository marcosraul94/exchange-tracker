import { chromium, devices, Page } from "playwright";
import { ExchangeRate, ScrapeResult } from "../types";
import { Currency } from "../enums";

export abstract class Agent {
  private readonly device: string = "iPhone 14";
  private url: string;

  constructor(url: string) {
    this.url = url;
  }

  protected async openPage() {
    const browser = await chromium.launch();
    const context = await browser.newContext(devices[this.device]);
    const page = await context.newPage();

    return { browser, context, page };
  }

  protected abstract scrapeUSD(page: Page): Promise<ExchangeRate | undefined>;
  protected abstract scrapeEUR(page: Page): Promise<ExchangeRate | undefined>;

  async scrape(): Promise<ScrapeResult> {
    const { page, browser, context } = await this.openPage();

    try {
      await page.goto(this.url);

      const result: ScrapeResult = {};
      const usd = await this.scrapeUSD(page);
      if (usd) result[Currency.USD] = usd;

      const eur = await this.scrapeEUR(page);
      if (eur) result[Currency.EUR] = eur;

      return result;
    } finally {
      await page.close();
      await context.close();
      await browser.close();
    }
  }
}
