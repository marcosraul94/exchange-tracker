import { BankId } from "@repo/lib";
import { SQSClient } from "@aws-sdk/client-sqs";
import { Scheduler } from "./scheduler";
import { ScrapeBankEvent } from "./types";

export const handler = async () => {
  const sqs = new SQSClient();
  const queueUrl = process.env.SQS_QUEUE_URL!;
  const scheduler = new Scheduler(sqs, queueUrl);

  const scrapeBankEvents: ScrapeBankEvent[] = [];

  for (const bankId of Object.values(BankId)) {
    const scrapeBankEvent: ScrapeBankEvent = {
      id: crypto.randomUUID(),
      bankId,
    };

    await scheduler.sendMessage(scrapeBankEvent);
    scrapeBankEvents.push(scrapeBankEvent);
  }

  return scrapeBankEvents;
};
