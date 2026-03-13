import { Currency, ExchangeRate } from "@repo/lib";

export type ScrapeResult = {
  [Currency.USD]?: ExchangeRate;
  [Currency.EUR]?: ExchangeRate;
};
