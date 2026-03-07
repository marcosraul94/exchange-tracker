import { Bank } from "./enums";
import { Agent } from "./agents/base";
import { PopularAgent } from "./agents/popular";
import { Logger } from "pino";

export class AgentFactory {
  static create(bank: Bank, logger: Logger): Agent {
    if (bank === Bank.POPULAR) {
      return new PopularAgent(logger);
    }

    throw new Error(`Agent for bank ${bank} not found`);
  }
}
