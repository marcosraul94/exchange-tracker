import { AgentFactory } from "../factory";
import { Bank } from "../enums";
import { logger as baseLogger } from "../logger";

const bank = process.argv[2] as Bank;
if (!bank) {
  console.error(`Usage: npm run scrape -- <bank>`);
  process.exit(1);
}

const logger = baseLogger.child({ bank, mode: "script" });
const agent = AgentFactory.create(bank, logger);

agent.scrape();
