import { DeleteCommand, GetCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Bank, CompositeKey, SerializedItem } from "../types";
import { BaseRepository } from "./base";

export type SerializedBank = SerializedItem & Pick<Bank, "id" | "name" | "url">;

export type CompositeItem = Pick<Bank, "id">;

export class BankRepository extends BaseRepository<Bank, SerializedBank> {
  protected getCompositeKey(bank: CompositeItem): CompositeKey {
    return { PK: "BANK#", SK: `BANK#${bank.id}` };
  }

  protected deserialize(item: SerializedBank): Bank {
    return {
      id: item.id,
      name: item.name,
      url: item.url,
      createdAt: new Date(item.created_at),
    };
  }

  protected serialize(bank: Bank): SerializedBank {
    return {
      ...this.getCompositeKey(bank),
      id: bank.id,
      name: bank.name,
      url: bank.url,
      created_at: bank.createdAt.toISOString(),
    };
  }

  async getAll(): Promise<Bank[]> {
    const result = await this.docClient.send(
      new ScanCommand({
        TableName: this.tableName,
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: { ":pk": "BANK#" },
      }),
    );

    return (result.Items || []).map((item) =>
      this.deserialize(item as SerializedBank),
    );
  }

  async get(bank: CompositeItem): Promise<Bank | undefined> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: this.getCompositeKey(bank),
      }),
    );
    const item = result.Item as SerializedBank | undefined;

    return item ? this.deserialize(item) : undefined;
  }

  async delete(bank: CompositeItem): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: this.getCompositeKey(bank),
      }),
    );
  }
}
