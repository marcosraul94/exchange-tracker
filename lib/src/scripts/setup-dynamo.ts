import { dynamoClient } from "../client";

dynamoClient.createTable().then(() => console.log("Table ready"));
