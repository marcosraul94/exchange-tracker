import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { TestHelper } from "../test-helper";

describe("MigrationRepository", () => {
  const helper = new TestHelper();

  before(async () => {
    await helper.setup();
  });

  after(async () => {
    await helper.cleanup();
  });

  beforeEach(async () => {
    await helper.migrationRepo.deleteAll();
  });

  describe("save", () => {
    it("saves a migration", async () => {
      const now = new Date();

      await helper.migrationRepo.save({
        id: 1,
        path: "0001-create-banks.ts",
        createdAt: now,
      });

      const migration = await helper.migrationRepo.get({ id: 1 });

      assert.ok(migration);
      assert.equal(migration.id, 1);
      assert.equal(migration.path, "0001-create-banks.ts");
      assert.equal(migration.createdAt.toISOString(), now.toISOString());
    });

    it("overwrites existing migration with same id", async () => {
      const now = new Date();

      await helper.migrationRepo.save({
        id: 1,
        path: "0001-old-name.ts",
        createdAt: now,
      });

      await helper.migrationRepo.save({
        id: 1,
        path: "0001-new-name.ts",
        createdAt: now,
      });

      const migrations = await helper.migrationRepo.getAll();
      assert.equal(migrations.length, 1);
      assert.equal(migrations[0].path, "0001-new-name.ts");
    });
  });

  describe("get", () => {
    it("returns undefined for non-existent migration", async () => {
      const migration = await helper.migrationRepo.get({ id: 999 });

      assert.equal(migration, undefined);
    });
  });

  describe("getAll", () => {
    it("returns empty array when no migrations exist", async () => {
      const migrations = await helper.migrationRepo.getAll();

      assert.equal(migrations.length, 0);
    });

    it("returns all saved migrations sorted by id ascending", async () => {
      const now = new Date();

      await helper.migrationRepo.save({
        id: 3,
        path: "0003-add-currencies.ts",
        createdAt: now,
      });

      await helper.migrationRepo.save({
        id: 1,
        path: "0001-create-banks.ts",
        createdAt: now,
      });

      await helper.migrationRepo.save({
        id: 2,
        path: "0002-seed-data.ts",
        createdAt: now,
      });

      const migrations = await helper.migrationRepo.getAll();

      assert.equal(migrations.length, 3);
      assert.equal(migrations[0].id, 1);
      assert.equal(migrations[1].id, 2);
      assert.equal(migrations[2].id, 3);
    });
  });

  describe("delete", () => {
    it("removes a migration by id", async () => {
      const now = new Date();

      await helper.migrationRepo.save({
        id: 1,
        path: "0001-create-banks.ts",
        createdAt: now,
      });

      await helper.migrationRepo.delete({ id: 1 });

      const migration = await helper.migrationRepo.get({ id: 1 });
      assert.equal(migration, undefined);
    });
  });
});
