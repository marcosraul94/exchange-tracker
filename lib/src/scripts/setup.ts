import { dynamoClient } from "../client";
import { Table } from "../enums";

async function main() {
  const existingTables = await dynamoClient.listTables();

  if (!existingTables.includes(Table.MIGRATIONS)) {
    console.log("Creating migrations table");
    await dynamoClient.createTable(Table.MIGRATIONS);
    console.log("Migrations table created");
  }

  if (!existingTables.includes(Table.EXCHANGE_TRACKER)) {
    console.log("Creating exchange tracker table");
    await dynamoClient.createTable(Table.EXCHANGE_TRACKER);
    console.log("Exchange tracker table created");
  }
}

main().catch((err) => {
  console.error("Failed to setup tables:", err);
  process.exit(1);
});
