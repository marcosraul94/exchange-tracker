import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { BankId, Currency } from "../enums";
import { TestHelper } from "../test-helper";

describe("BankExchangeRateRepository", () => {
  const helper = new TestHelper();

  before(async () => {
    await helper.setup();
  });

  after(async () => {
    await helper.cleanup();
  });

  beforeEach(async () => {
    await helper.bankExchangeRateRepo.deleteAll();
  });

  describe("save", () => {
    it("saves a bank exchange rate", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      const items = await helper.bankExchangeRateRepo.getAll();

      assert.equal(items.length, 1);
      assert.equal(items[0].bankId, BankId.POPULAR);
      assert.equal(items[0].currency, Currency.USD);
      assert.equal(items[0].rate.buy, 58.5);
      assert.equal(items[0].rate.sell, 59.0);
      assert.equal(items[0].createdAt.toISOString(), now.toISOString());
    });

    it("overwrites rate for the same bank and currency on the same day", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.0, sell: 63.5 },
        createdAt: now,
      });

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.5, sell: 64.0 },
        createdAt: now,
      });

      const items = await helper.bankExchangeRateRepo.getAll();

      assert.equal(items.length, 1);
      assert.equal(items[0].rate.buy, 62.5);
      assert.equal(items[0].rate.sell, 64.0);
    });
  });

  describe("getAll", () => {
    it("returns empty array when no rates exist", async () => {
      const items = await helper.bankExchangeRateRepo.getAll();

      assert.equal(items.length, 0);
    });

    it("returns all saved rates", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.EUR,
        rate: { buy: 62.0, sell: 63.5 },
        createdAt: now,
      });

      const items = await helper.bankExchangeRateRepo.getAll();

      assert.equal(items.length, 2);
    });

    it("returns items typed as BankExchangeRate", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      const items = await helper.bankExchangeRateRepo.getAll();
      const item = items[0];

      assert.equal(item.bankId, BankId.POPULAR);
      assert.equal(item.currency, Currency.USD);
      assert.deepEqual(item.rate, { buy: 58.5, sell: 59.0 });
      assert.ok(item.createdAt instanceof Date);
    });
  });

  describe("get", () => {
    it("returns a specific rate by currency, bankId, and createdAt", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      const item = await helper.bankExchangeRateRepo.get({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        createdAt: now,
      });

      assert.ok(item);
      assert.equal(item.bankId, BankId.POPULAR);
      assert.equal(item.currency, Currency.USD);
      assert.equal(item.rate.buy, 58.5);
      assert.equal(item.rate.sell, 59.0);
    });

    it("returns undefined for non-existent rate", async () => {
      const item = await helper.bankExchangeRateRepo.get({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        createdAt: new Date(),
      });

      assert.equal(item, undefined);
    });
  });

  describe("delete", () => {
    it("removes a rate", async () => {
      const now = new Date();

      await helper.bankExchangeRateRepo.save({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        rate: { buy: 58.5, sell: 59.0 },
        createdAt: now,
      });

      await helper.bankExchangeRateRepo.delete({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        createdAt: now,
      });

      const item = await helper.bankExchangeRateRepo.get({
        bankId: BankId.POPULAR,
        currency: Currency.USD,
        createdAt: now,
      });

      assert.equal(item, undefined);
    });
  });
});
