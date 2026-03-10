import { BatchWriteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoClient } from "../client";
import { BankExchangeRate } from "../../types";
import { BankId, Currency } from "../../enums";

const TABLE_NAME = "exchange-tracker";

export class BankExchangeRateRepository {
  async save(bankExchangeRate: BankExchangeRate) {
    const createdAtISO = bankExchangeRate.createdAt.toISOString();
    const createdAtDate = createdAtISO.split("T")[0];

    await dynamoClient.docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `RATE#${bankExchangeRate.currency}`,
          SK: `CREATED_AT#${createdAtDate}#BANK#${bankExchangeRate.bank_id}`,
          bank_id: bankExchangeRate.bank_id,
          currency: bankExchangeRate.currency,
          buy: bankExchangeRate.rate.buy,
          sell: bankExchangeRate.rate.sell,
          created_at: createdAtISO,
        },
      })
    );
  }

  async getAll(): Promise<BankExchangeRate[]> {
    const result = await dynamoClient.docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: { ":pk": "RATE#" },
      })
    );

    return (result.Items || []).map((item) => ({
      bank_id: item.bank_id as BankId,
      currency: item.currency as Currency,
      rate: { buy: item.buy as number, sell: item.sell as number },
      createdAt: new Date(item.created_at as string),
    }));
  }

  async deleteAll() {
    const result = await dynamoClient.docClient.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        FilterExpression: "begins_with(PK, :pk)",
        ExpressionAttributeValues: { ":pk": "RATE#" },
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
