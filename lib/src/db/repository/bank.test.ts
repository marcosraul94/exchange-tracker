import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { BankRepository } from "./bank";
import { BankId } from "../../enums";

describe("BankRepository", () => {
  const repository = new BankRepository();

  beforeEach(async () => {
    await repository.deleteAll();
  });

  describe("save", () => {
    it("saves a bank", async () => {
      const now = new Date();

      await repository.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      const bank = await repository.get({ id: BankId.POPULAR });

      assert.ok(bank);
      assert.equal(bank.id, BankId.POPULAR);
      assert.equal(bank.name, "Banco Popular");
      assert.equal(bank.url, "https://www.popularenlinea.com");
      assert.equal(bank.createdAt.toISOString(), now.toISOString());
    });

    it("overwrites existing bank with same id", async () => {
      const now = new Date();

      await repository.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://old-url.com",
        createdAt: now,
      });

      await repository.save({
        id: BankId.POPULAR,
        name: "Banco Popular Dominicano",
        url: "https://new-url.com",
        createdAt: now,
      });

      const banks = await repository.getAll();
      assert.equal(banks.length, 1);
      assert.equal(banks[0].name, "Banco Popular Dominicano");
      assert.equal(banks[0].url, "https://new-url.com");
    });
  });

  describe("get", () => {
    it("returns undefined for non-existent bank", async () => {
      const bank = await repository.get({ id: BankId.POPULAR });

      assert.equal(bank, undefined);
    });
  });

  describe("getAll", () => {
    it("returns empty array when no banks exist", async () => {
      const banks = await repository.getAll();

      assert.equal(banks.length, 0);
    });

    it("returns all saved banks", async () => {
      const now = new Date();

      await repository.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      const banks = await repository.getAll();

      assert.equal(banks.length, 1);
      assert.equal(banks[0].id, BankId.POPULAR);
    });
  });

  describe("delete", () => {
    it("removes a bank by id", async () => {
      const now = new Date();

      await repository.save({
        id: BankId.POPULAR,
        name: "Banco Popular",
        url: "https://www.popularenlinea.com",
        createdAt: now,
      });

      await repository.delete({ id: BankId.POPULAR });

      const bank = await repository.get({ id: BankId.POPULAR });
      assert.equal(bank, undefined);
    });
  });
});
