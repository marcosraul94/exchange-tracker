import { Bank } from "./enums";
import { Agent } from "./agents/base";
import { PopularAgent } from "./agents/popular";

export class AgentFactory {
  static create(bank: Bank): Agent {
    if (bank === Bank.POPULAR) {
      return new PopularAgent();
    }

    throw new Error(`Agent for bank ${bank} not found`);
  }
}
