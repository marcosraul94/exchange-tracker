import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoClient } from "../client";

const TABLE = "exchange-tracker";
const bank = {
  PK: "BANK#",
  SK: "BANK#popular",
  id: "popular",
  name: "Banco Popular",
  url: "https://popularenlinea.com/personas/Paginas/Home.aspx",
  created_at: new Date().toISOString(),
};

export async function up(client: DynamoClient): Promise<void> {
  await client.docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: bank,
    }),
  );
}

export async function down(client: DynamoClient): Promise<void> {
  await client.docClient.send(
    new DeleteCommand({
      TableName: TABLE,
      Key: {
        PK: bank.PK,
        SK: bank.SK,
      },
    }),
  );
}
