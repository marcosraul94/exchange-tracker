import { randomUUID } from "node:crypto";
import { DynamoClient } from "./client";
import { BankRepository } from "./repositories/bank";
import { BankExchangeRateRepository } from "./repositories/exchange-rate";

export class TestHelper {
  readonly tableName: string;
  readonly bankRepo: BankRepository;
  readonly bankExchangeRateRepo: BankExchangeRateRepository;

  private readonly client: DynamoClient;

  constructor() {
    this.tableName = `test-${randomUUID()}`;
    this.client = new DynamoClient();

    this.bankRepo = new BankRepository(this.tableName, this.client.docClient);
    this.bankExchangeRateRepo = new BankExchangeRateRepository(
      this.tableName,
      this.client.docClient,
    );
  }

  async setup() {
    await this.client.createTable(this.tableName);
  }

  async cleanup() {
    await this.client.deleteTable(this.tableName);
  }
}
