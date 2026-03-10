import { Page } from "playwright";
import { ExchangeRate, BankId, Currency } from "@repo/lib";
import { Agent } from "./base";

export class PopularAgent extends Agent {
  protected readonly bankId = BankId.POPULAR;
  protected readonly currencies = [Currency.USD, Currency.EUR];

  async scrapeUSD(page: Page): Promise<ExchangeRate | undefined> {
    return { buy: 1, sell: 1 };
  }

  async scrapeEUR(page: Page): Promise<ExchangeRate | undefined> {
    return { buy: 1, sell: 1 };
  }
}
