import { AgentFactory } from "../factory";
import { BankId } from "@repo/lib";
import { logger as baseLogger } from "../logger";

const main = async () => {
  const bank = process.argv[2] as BankId;
  if (!bank) {
    console.error(`Usage: npm run scrape -- <bank>`);
    process.exit(1);
  }

  const logger = baseLogger.child({ bank, mode: "script" });
  const agent = AgentFactory.create(bank, logger);

  const result = await agent.scrape();
  console.log(result);
};

main().catch((err) => {
  console.error("Failed to scrape:", err);
  process.exit(1);
});
