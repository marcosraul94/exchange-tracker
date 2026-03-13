import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { BankId } from "@repo/lib";

mock.module("./scheduler", {
  namedExports: {
    Scheduler: class {
      sendMessage = () => Promise.resolve();
    },
  },
});

describe("handler", () => {
  it("returns one ScrapeBankEvent per bank", async () => {
    const { handler } = await import("./index");

    const result = await handler();
    const banks = Object.values(BankId);

    assert.equal(result.length, banks.length);
    result.forEach((event, i) => {
      assert.equal(event.bankId, banks[i]);
      assert.ok(event.id.length > 0);
    });
  });
});
