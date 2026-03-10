import { AgentFactory } from "./factory";
import { ScrapeBankEvent } from "./types";
import { logger as baseLogger } from "./logger";

export const handler = async ({ bankId: bank, id: eventId }: ScrapeBankEvent) => {
  const logger = baseLogger.child({ bank, eventId });

  const agent = AgentFactory.create(bank, logger);
  const result = await agent.scrape();
  
  return result;
};
