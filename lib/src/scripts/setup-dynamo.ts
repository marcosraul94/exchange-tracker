import { dynamoClient } from "../db/client";

dynamoClient.createTable().then(() => console.log("Table ready"));
