import { chromium, devices, Page } from "playwright";
import { ExchangeRate, ScrapeResult } from "../types";
import { Currency } from "../enums";
import { Logger } from "pino";

export abstract class Agent {
  private readonly device: string = "iPhone 14";
  protected abstract readonly url: string;
  protected abstract readonly currencies: Currency[];

  constructor(protected logger: Logger) {
    this.logger = logger;
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
    if (this.currencies.length === 0) {
      throw new Error("No currencies to scrape");
    }

    this.logger.info("Opening page");
    const { page, browser, context } = await this.openPage();

    try {
      this.logger.info("Navigating to URL");
      await page.goto(this.url);

      const result: ScrapeResult = {};

      if (this.currencies.includes(Currency.USD)) {
        this.logger.info("Scraping USD");
        result[Currency.USD] = await this.scrapeUSD(page);

      }

      if (this.currencies.includes(Currency.EUR)) {
        this.logger.info("Scraping EUR");
        result[Currency.EUR] = await this.scrapeEUR(page);
      }

      this.logger.info({ msg: "Scraping completed", result });
      
      return result;
    } finally {
      this.logger.info("Closing browser");
      
      await page.close();
      await context.close();
      await browser.close();
    }
  }
}
