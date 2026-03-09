import pino from "pino";

export const logger = pino({
  base: null,
  timestamp: pino.stdTimeFunctions.isoTime,
});
