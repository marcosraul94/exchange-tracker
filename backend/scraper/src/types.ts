import { Currency, Bank } from "./enums";

export type ExchangeRate = {
  buy: number;
  sell: number;
};

export type BankExchangeRate = {
  bank_id: Bank;
  currency: Currency;
  rate: ExchangeRate;
  createdAt: Date;
};

export type ScrapeResult = {
  [Currency.USD]?: ExchangeRate;
  [Currency.EUR]?: ExchangeRate;
};

export type Event = {
  id: string;
  bank: Bank;
};
