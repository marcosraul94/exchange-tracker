import { randomUUID } from "node:crypto";
import { DynamoClient } from "./client";
import { BankRepository } from "./repositories/bank";
import { BankExchangeRateRepository } from "./repositories/exchange-rate";
import { MigrationRepository } from "./repositories/migration";

export class TestHelper {
  readonly bankRepo: BankRepository;
  readonly bankExchangeRateRepo: BankExchangeRateRepository;
  readonly migrationRepo: MigrationRepository;

  private readonly client: DynamoClient;

  constructor() {
    const tableName = `test-${randomUUID()}`;
    this.client = new DynamoClient(tableName);

    this.bankRepo = new BankRepository(tableName, this.client.docClient);
    this.bankExchangeRateRepo = new BankExchangeRateRepository(
      tableName,
      this.client.docClient,
    );
    this.migrationRepo = new MigrationRepository(
      tableName,
      this.client.docClient,
    );
  }

  async setup() {
    await this.client.createTable();
  }

  async cleanup() {
    await this.client.deleteTable();
  }
}
