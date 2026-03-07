import { Currency, Bank } from "./enums";

export type ExchangeRate = {
  buy: number;
  sell: number;
};

export type ScrapeResult = {
  [Currency.USD]?: ExchangeRate;
  [Currency.EUR]?: ExchangeRate;
};

export type Event = {
  bank: Bank;
};
