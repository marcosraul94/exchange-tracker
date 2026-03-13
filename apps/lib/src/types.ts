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
  bankId: BankId;
  currency: Currency;
  rate: ExchangeRate;
  createdAt: Date;
};

export type Migration = {
  id: number;
  path: string;
  createdAt: Date;
};

export type Item = {
  createdAt: Date;
};

export type CompositeKey = {
  PK: string;
  SK: string;
};

export type SerializedItem = CompositeKey & {
  created_at: string;
};
