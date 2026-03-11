import { chromium, devices, Page } from "playwright";
import {
  ExchangeRate,
  Currency,
  BankExchangeRateRepository,
  BankRepository,
  BankId,
} from "@repo/lib";
import { ScrapeResult } from "../types";
import { Logger } from "pino";

export abstract class Agent {
  private readonly device: string = "iPhone 14";
  protected abstract readonly bankId: BankId;
  protected abstract readonly currencies: Currency[];

  constructor(
    protected logger: Logger,
    protected exchangeRateRepo: BankExchangeRateRepository,
    protected bankRepo: BankRepository,
  ) {}

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

    const bank = await this.bankRepo.get({ id: this.bankId });
    if (!bank) {
      throw new Error(`Bank ${this.bankId} not found in database`);
    }

    this.logger.info("Opening page");
    const { page, browser, context } = await this.openPage();

    try {
      this.logger.info("Navigating to URL");
      await page.goto(bank.url);

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

  async save(result: ScrapeResult) {
    if (result[Currency.USD]) {
      this.logger.info("Saving USD");
      await this.exchangeRateRepo.save({
        bankId: this.bankId,
        currency: Currency.USD,
        rate: result[Currency.USD],
        createdAt: new Date(),
      });
    }

    if (result[Currency.EUR]) {
      this.logger.info("Saving EUR");
      await this.exchangeRateRepo.save({
        bankId: this.bankId,
        currency: Currency.EUR,
        rate: result[Currency.EUR],
        createdAt: new Date(),
      });
    }
  }
}
