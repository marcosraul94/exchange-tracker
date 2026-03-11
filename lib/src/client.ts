import {
  CreateTableCommand,
  DeleteTableCommand,
  DynamoDBClient,
  ResourceInUseException,
  ResourceNotFoundException,
  ListTablesCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { Table } from "./enums";

export class DynamoClient {
  private readonly client: DynamoDBClient;
  private readonly tableName: string;
  public readonly docClient: DynamoDBDocumentClient;

  constructor(tableName: string = Table.EXCHANGE_TRACKER) {
    this.client = new DynamoDBClient({
      region: process.env.AWS_REGION || "us-east-1",
      ...(process.env.DYNAMODB_ENDPOINT && {
        endpoint: process.env.DYNAMODB_ENDPOINT,
      }),
    });
    this.docClient = DynamoDBDocumentClient.from(this.client);
    this.tableName = tableName;
  }

  async createTable(tableName: string | undefined = undefined) {
    try {
      await this.client.send(
        new CreateTableCommand({
          TableName: tableName || this.tableName,
          KeySchema: [
            { AttributeName: "PK", KeyType: "HASH" },
            { AttributeName: "SK", KeyType: "RANGE" },
          ],
          AttributeDefinitions: [
            { AttributeName: "PK", AttributeType: "S" },
            { AttributeName: "SK", AttributeType: "S" },
          ],
          BillingMode: "PAY_PER_REQUEST",
        }),
      );
    } catch (error) {
      if (error instanceof ResourceInUseException) return;
      throw error;
    }
  }

  async listTables() {
    const result = await this.client.send(new ListTablesCommand({}));

    return result.TableNames || [];
  }

  async deleteTable(tableName: string | undefined = undefined) {
    try {
      await this.client.send(
        new DeleteTableCommand({ TableName: tableName || this.tableName }),
      );
    } catch (error) {
      if (error instanceof ResourceNotFoundException) return;
      throw error;
    }
  }
}

export const dynamoClient = new DynamoClient();
