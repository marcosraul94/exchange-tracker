import { Page } from "playwright";
import { ExchangeRate } from "../types";
import { Agent } from "./base";
import { BankUrl } from "../enums";

export class PopularAgent extends Agent {
  constructor(url: string = BankUrl.POPULAR) {
    super(url);
  }

  async scrapeUSD(page: Page): Promise<ExchangeRate | undefined> {
    const title = await page.title();
    console.log(`Page title: ${title}`);

    return { buy: 1, sell: 1 };
  }

  async scrapeEUR(page: Page): Promise<ExchangeRate | undefined> {
    return { buy: 1, sell: 1 };
  }
}
