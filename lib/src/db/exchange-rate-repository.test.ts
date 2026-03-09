import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { BankExchangeRateRepository } from "./exchange-rate-repository";
import { Bank, Currency } from "../enums";

describe("BankExchangeRateRepository", () => {
  const repository = new BankExchangeRateRepository();

  beforeEach(async () => {
    await repository.deleteAll();
  });

  describe("save", () => {
    it("saves a bank exchange rate", async () => {
      const now = new Date();

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      const items = await repository.getAll();

      assert.equal(items.length, 1);
      assert.equal(items[0].bank_id, Bank.POPULAR);
      assert.equal(items[0].currency, Currency.USD);
      assert.equal(items[0].rate.buy, 58.5);
      assert.equal(items[0].rate.sell, 59.0);
      assert.equal(items[0].createdAt.toISOString(), now.toISOString());
    });

    it("overwrites rate for the same bank and currency on the same day", async () => {
      const now = new Date();

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.0, sell: 63.5 },
        createdAt: now,
      });

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.5, sell: 64.0 },
        createdAt: now,
      });

      const items = await repository.getAll();

      assert.equal(items.length, 1);
      assert.equal(items[0].rate.buy, 62.5);
      assert.equal(items[0].rate.sell, 64.0);
    });
  });

  describe("getAll", () => {
    it("returns empty array when no rates exist", async () => {
      const items = await repository.getAll();

      assert.equal(items.length, 0);
    });

    it("returns all saved rates", async () => {
      const now = new Date();

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.0, sell: 63.5 },
        createdAt: now,
      });

      const items = await repository.getAll();

      assert.equal(items.length, 2);
    });

    it("returns items typed as BankExchangeRate", async () => {
      const now = new Date();

      await repository.save({
        bank_id: Bank.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      const items = await repository.getAll();
      const item = items[0];

      assert.equal(item.bank_id, Bank.POPULAR);
      assert.equal(item.currency, Currency.USD);
      assert.deepEqual(item.rate, { buy: 58.5, sell: 59.0 });
      assert.ok(item.createdAt instanceof Date);
    });
  });
});
