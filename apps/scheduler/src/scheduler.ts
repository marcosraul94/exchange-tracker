import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { ScrapeBankEvent } from "./types";

export class Scheduler {
  constructor(
    private readonly sqs: SQSClient,
    private readonly queueUrl: string,
  ) {
    this.sqs = sqs;
    this.queueUrl = queueUrl;
  }

  async sendMessage(message: ScrapeBankEvent) {
    await this.sqs.send(
      new SendMessageCommand({
        QueueUrl: this.queueUrl,
        MessageBody: JSON.stringify(message),
      }),
    );
  }
}
