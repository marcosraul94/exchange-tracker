import { BankId, Currency, ExchangeRate } from "@repo/lib";

export type ScrapeBankEvent = {
  id: string;
  bankId: BankId;
};

export type ScrapeResult = {
  [Currency.USD]?: ExchangeRate;
  [Currency.EUR]?: ExchangeRate;
};
