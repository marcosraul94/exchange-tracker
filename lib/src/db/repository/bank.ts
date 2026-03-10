import {
  BatchWriteCommand,
  DeleteCommand,
  GetCommand,
  PutCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../client";
import { Bank } from "../../types";
import { BankId } from "../../enums";

const TABLE_NAME = "exchange-tracker";

export class BankRepository {
  private get_key(bankId: BankId) {
    return { PK: `BANK#${bankId}`, SK: `BANK#${bankId}` };
  }

  async save(bank: Bank) {
    await dynamoClient.docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          ...this.get_key(bank.id),
          bank_id: bank.id,
          name: bank.name,
          url: bank.url,
          created_at: bank.createdAt.toISOString(),
        },
      })
    );
  }

  async getByBankId(bankId: BankId): Promise<Bank | undefined> {
    const result = await dynamoClient.docClient.send(
      new GetCommand({
        TableName: TABLE_NAME,
        Key: this.get_key(bankId),
      })
    );

    if (!result.Item) return undefined;

    return {
      id: result.Item.bank_id as BankId,
      name: result.Item.name as string,
      url: result.Item.url as string,
      createdAt: new Date(result.Item.created_at as string),
    };
  }

  async getAll(): Promise<Bank[]> {
    const result = await dynamoClient.docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: { ":pk": "BANK#" },
      })
    );

    return (result.Items || []).map((item) => ({
      id: item.bank_id as BankId,
      name: item.name as string,
      url: item.url as string,
      createdAt: new Date(item.created_at as string),
    }));
  }

  async delete(bankId: BankId) {
    await dynamoClient.docClient.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: this.get_key(bankId),
      })
    );
  }

  async deleteAll() {
    const result = await dynamoClient.docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: { ":pk": "BANK#" },
        ProjectionExpression: "PK, SK",
      })
    );

    const items = result.Items || [];
    if (items.length === 0) return;

    const MAX_BATCH_SIZE = 25;
    for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
      await dynamoClient.docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [TABLE_NAME]: items.slice(i, i + MAX_BATCH_SIZE).map((item) => ({
              DeleteRequest: { Key: { PK: item.PK, SK: item.SK } },
            })),
          },
        })
      );
    }
  }
}
