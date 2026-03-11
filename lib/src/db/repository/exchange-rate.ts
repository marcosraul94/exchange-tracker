import { QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { BankExchangeRate, CompositeKey, SerializedItem } from "../../types";
import { BaseRepository } from "./base";

export type SerializedBankExchangeRate = SerializedItem &
  Pick<BankExchangeRate, "bankId" | "currency"> & {
    buy: number;
    sell: number;
  };

export type CompositeItem = Pick<
  BankExchangeRate,
  "currency" | "createdAt" | "bankId"
>;

export class BankExchangeRateRepository extends BaseRepository<
  BankExchangeRate,
  SerializedBankExchangeRate
> {
  protected getCompositeKey(bankExchangeRate: CompositeItem): CompositeKey {
    const createdAtDate = bankExchangeRate.createdAt
      .toISOString()
      .split("T")[0];
    const createdAtRange = `CREATED_AT#${createdAtDate}#`;
    const currencyRange = `CURRENCY#${bankExchangeRate.currency}#`;
    const bankRange = `BANK#${bankExchangeRate.bankId}`;

    return { PK: "RATE#", SK: `${createdAtRange}${currencyRange}${bankRange}` };
  }

  protected deserialize(item: SerializedBankExchangeRate): BankExchangeRate {
    return {
      bankId: item.bankId,
      currency: item.currency,
      rate: { buy: item.buy, sell: item.sell },
      createdAt: new Date(item.created_at),
    };
  }

  protected serialize(
    bankExchangeRate: BankExchangeRate,
  ): SerializedBankExchangeRate {
    return {
      ...this.getCompositeKey(bankExchangeRate),
      bankId: bankExchangeRate.bankId,
      currency: bankExchangeRate.currency,
      buy: bankExchangeRate.rate.buy,
      sell: bankExchangeRate.rate.sell,
      created_at: bankExchangeRate.createdAt.toISOString(),
    };
  }

  async getAll(): Promise<BankExchangeRate[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "RATE#" },
      }),
    );

    return (result.Items || []).map((item) =>
      this.deserialize(item as SerializedBankExchangeRate),
    );
  }

  async get({
    currency,
    createdAt,
    bankId,
  }: CompositeItem): Promise<BankExchangeRate | undefined> {
    const { PK, SK } = this.getCompositeKey({ currency, createdAt, bankId });
    const results = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk AND SK = :sk",
        ExpressionAttributeValues: { ":pk": PK, ":sk": SK },
      }),
    );
    const item = results.Items?.[0] as SerializedBankExchangeRate | undefined;

    return item ? this.deserialize(item) : undefined;
  }

  async delete(partialBankExchangeRates: CompositeItem): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: this.getCompositeKey(partialBankExchangeRates),
      }),
    );
  }
}
