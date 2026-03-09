import { AgentFactory } from "./factory";
import { Event } from "@repo/lib";
import { logger as baseLogger } from "./logger";

export const handler = async (event: Event) => {
  const { bank, id } = event;
  const logger = baseLogger.child({ bank, eventId: id});

  const agent = AgentFactory.create(bank, logger);
  const result = await agent.scrape();
  
  return result;
};
