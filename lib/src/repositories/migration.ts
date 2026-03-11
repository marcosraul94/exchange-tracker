import { QueryCommand, DeleteCommand, GetCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Migration, CompositeKey, SerializedItem } from "../types";
import { BaseRepository } from "./base";
import { Table } from "../enums";
import { dynamoClient as defaultDynamoClient } from "../client";

export type SerializedMigration = SerializedItem &
  Pick<Migration, "id" | "path">;

type CompositeItem = Pick<Migration, "id">;

export class MigrationRepository extends BaseRepository<
  Migration,
  SerializedMigration
> {
  constructor(
    tableName: string = Table.MIGRATIONS, 
    docClient: DynamoDBDocumentClient = defaultDynamoClient.docClient
  ) {
    super(tableName, docClient);
  }

  protected getCompositeKey(migration: CompositeItem): CompositeKey {
    return { PK: "MIGRATION#", SK: `MIGRATION#${migration.id}` };
  }

  protected deserialize(item: SerializedMigration): Migration {
    return {
      ...item,
      createdAt: new Date(item.created_at),
    };
  }

  protected serialize(migration: Migration): SerializedMigration {
    return {
      ...this.getCompositeKey(migration),
      id: migration.id,
      path: migration.path,
      created_at: migration.createdAt.toISOString(),
    };
  }

  async getAll(): Promise<Migration[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: { ":pk": "MIGRATION#" },
      }),
    );

    return (result.Items || [])
      .map((item) => this.deserialize(item as SerializedMigration))
      .sort((a, b) => a.id - b.id);
  }

  async get(migration: CompositeItem): Promise<Migration | undefined> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: this.getCompositeKey(migration),
      }),
    );
    const item = result.Item as SerializedMigration | undefined;

    return item ? this.deserialize(item) : undefined;
  }

  async delete(migration: CompositeItem): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: this.getCompositeKey(migration),
      }),
    );
  }
}
