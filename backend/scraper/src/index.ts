import { AgentFactory } from "./factory";
import { Event } from "./types";

export const handler = async (event: Event) => {
  const { bank } = event;
  const agent = AgentFactory.create(bank);
  const result = await agent.scrape();
  return result;
};
