import { BankId, BankExchangeRateRepository, BankRepository } from "@repo/lib";
import { Agent } from "./agents/base";
import { PopularAgent } from "./agents/popular";
import { Logger } from "pino";

export class AgentFactory {
  static create(bankId: BankId, logger: Logger): Agent {
    const exchangeRateRepo = new BankExchangeRateRepository();
    const bankRepo = new BankRepository();

    if (bankId === BankId.POPULAR) {
      return new PopularAgent(logger, exchangeRateRepo, bankRepo);
    }

    throw new Error(`Agent for bank ${bankId} not found`);
  }
}
