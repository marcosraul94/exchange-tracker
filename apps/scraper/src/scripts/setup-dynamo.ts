import { dynamoClient } from "@repo/lib";

dynamoClient.createTable().then(() => console.log("Table ready"));
