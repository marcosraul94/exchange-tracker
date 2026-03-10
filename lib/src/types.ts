import { Currency, BankId } from "./enums";

export type ExchangeRate = {
  buy: number;
  sell: number;
};

export type Bank = {
  id: BankId;
  name: string;
  url: string;
  createdAt: Date;
};

export type BankExchangeRate = {
  bank_id: BankId;
  currency: Currency;
  rate: ExchangeRate;
  createdAt: Date;
};
