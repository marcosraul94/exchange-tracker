import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { BankId } from "../enums";
import { TestHelper } from "../test-helper";

describe("BankRepository", () => {
  const helper = new TestHelper();

  before(async () => {
    await helper.setup();
  });

  after(async () => {
    await helper.cleanup();
  });

  beforeEach(async () => {
    await helper.bankRepo.deleteAll();
  });

  describe("save", () => {
    it("saves a bank", async () => {
      const now = new Date();

      await helper.bankRepo.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      const bank = await helper.bankRepo.get({ id: BankId.POPULAR });

      assert.ok(bank);
      assert.equal(bank.id, BankId.POPULAR);
      assert.equal(bank.name, "Banco Popular");
      assert.equal(bank.url, "https://www.popularenlinea.com");
      assert.equal(bank.createdAt.toISOString(), now.toISOString());
    });

    it("overwrites existing bank with same id", async () => {
      const now = new Date();

      await helper.bankRepo.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://old-url.com",
        createdAt: now,
      });

      await helper.bankRepo.save({
        id: BankId.POPULAR,
        name: "Banco Popular Dominicano",
        url: "https://new-url.com",
        createdAt: now,
      });

      const banks = await helper.bankRepo.getAll();
      assert.equal(banks.length, 1);
      assert.equal(banks[0].name, "Banco Popular Dominicano");
      assert.equal(banks[0].url, "https://new-url.com");
    });
  });

  describe("get", () => {
    it("returns undefined for non-existent bank", async () => {
      const bank = await helper.bankRepo.get({ id: BankId.POPULAR });

      assert.equal(bank, undefined);
    });
  });

  describe("getAll", () => {
    it("returns empty array when no banks exist", async () => {
      const banks = await helper.bankRepo.getAll();

      assert.equal(banks.length, 0);
    });

    it("returns all saved banks", async () => {
      const now = new Date();

      await helper.bankRepo.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      const banks = await helper.bankRepo.getAll();

      assert.equal(banks.length, 1);
      assert.equal(banks[0].id, BankId.POPULAR);
    });
  });

  describe("delete", () => {
    it("removes a bank by id", async () => {
      const now = new Date();

      await helper.bankRepo.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      await helper.bankRepo.delete({ id: BankId.POPULAR });

      const bank = await helper.bankRepo.get({ id: BankId.POPULAR });
      assert.equal(bank, undefined);
    });
  });
});
