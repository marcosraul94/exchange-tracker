import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { dynamoClient as defaultDynamoClient } from "../client";
import { CompositeKey, Item, SerializedItem } from "../types";
import { Table } from "../enums";

export type BaseCompositeItem<T extends Item> = Partial<T>;

export abstract class BaseRepository<T extends Item, K extends SerializedItem> {
  protected abstract getCompositeKey(item: BaseCompositeItem<T>): CompositeKey;
  protected abstract deserialize(item: K): T;
  protected abstract serialize(item: T): K;

  constructor(
    protected tableName: string = Table.EXCHANGE_TRACKER,
    protected docClient: DynamoDBDocumentClient = defaultDynamoClient.docClient,
  ) {
    this.docClient = docClient;
    this.tableName = tableName;
  }

  async save(item: T) {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: this.serialize(item),
      }),
    );
  }

  abstract delete(item: BaseCompositeItem<T>): Promise<void>;

  abstract get(item: BaseCompositeItem<T>): Promise<T | undefined>;

  abstract getAll(): Promise<T[]>;

  async deleteAll(): Promise<void> {
    const items = await this.getAll();

    const MAX_BATCH_SIZE = 25;
    for (let i = 0; i < items.length; i += MAX_BATCH_SIZE) {
      await this.docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            [this.tableName]: items
              .slice(i, i + MAX_BATCH_SIZE)
              .map((item) => ({
                DeleteRequest: { Key: this.getCompositeKey(item) },
              })),
          },
        }),
      );
    }
  }
}
