import { AgentFactory } from "../factory";
import { BankId } from "@repo/lib";
import { logger as baseLogger } from "../logger";

const bank = process.argv[2] as BankId;
if (!bank) {
  console.error(`Usage: npm run scrape -- <bank>`);
  process.exit(1);
}

const logger = baseLogger.child({ bank, mode: "script" });
const agent = AgentFactory.create(bank, logger);

agent.scrape();
