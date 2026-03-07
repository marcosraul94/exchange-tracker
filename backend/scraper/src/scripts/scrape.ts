import { AgentFactory } from "../factory";
import { Bank } from "../enums";

const bank = process.argv[2] as Bank;
if (!bank) {
  console.error(`Usage: npm run scrape -- <bank>`);
  process.exit(1);
}

const agent = AgentFactory.create(bank);
agent.scrape().then(console.log).catch(console.error);
