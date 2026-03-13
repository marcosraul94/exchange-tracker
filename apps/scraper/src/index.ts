import { BankId } from "@repo/lib";
import { AgentFactory } from "./factory";
import { logger as baseLogger } from "./logger";

export const handler = async ({ bankId: bank, id: eventId }: { id: string; bankId: BankId }) => {
  const logger = baseLogger.child({ bank, eventId });

  const agent = AgentFactory.create(bank, logger);
  const result = await agent.scrape();
  
  return result;
};
