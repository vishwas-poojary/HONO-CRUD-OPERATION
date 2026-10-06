import { MiddlewareHandler } from "hono";
import { AppVariables } from "../utils/v1/customTypes.js";
import { generateTransactionId } from "../utils/v1/helper.js";
import { config } from "../config/v1/config.js";
import { logger } from "../utils/v1/logger.js";

export const entryPoint: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  const startTime = Date.now();
  const incomingTxnId = c.req.header("x-transaction-id") || c.req.header("x-correlation-id");
  const txnId = incomingTxnId || generateTransactionId();
  const environment = config.ENVIRONMENT;

  const reqLogger = logger.child({
    transactionId: txnId,
    method: c.req.method,
    url: c.req.url,
  });

  c.set("startTime", startTime);
  c.set("txnId", txnId);
  c.set("environment", environment);
  c.set("log", reqLogger);

  await next();
};
