import { MiddlewareHandler, Context } from "hono";
import { ContentfulStatusCode } from "hono/utils/http-status";
import { AppVariables, ApiStatus, ResponseObject } from "../utils/v1/customTypes.js";

/**
 * exitPoint middleware: runs after downstream handlers to set tracking headers
 * and log execution time.
 */
export const exitPoint: MiddlewareHandler<{ Variables: AppVariables }> = async (c, next) => {
  await next();

  const startTime = c.get("startTime") || Date.now();
  const duration = `${Date.now() - startTime}ms`;
  const txnId = c.get("txnId") || "";
  const environment = c.get("environment") || "";
  const log = c.get("log");

  c.header("X-Transaction-Id", txnId);
  c.header("X-Response-Time", duration);
  c.header("X-Environment", environment);

  if (log) {
    log.info(
      {
        transactionId: txnId,
        url: c.req.url,
        method: c.req.method,
        status: c.res.status,
        timeTaken: duration,
      },
      "API Request completed",
    );
  }
};

/**
 * Standard response helper to format uniform API responses matching reference architecture:
 * { status, message, data, toastMessage }
 */
export function sendResponse(c: Context<{ Variables: AppVariables }>, apiStatus: ApiStatus): Response {
  c.set("apiStatus", apiStatus);

  const startTime = c.get("startTime") || Date.now();
  const duration = `${Date.now() - startTime}ms`;
  const txnId = c.get("txnId") || "";
  const environment = c.get("environment") || "";

  c.header("X-Transaction-Id", txnId);
  c.header("X-Response-Time", duration);
  c.header("X-Environment", environment);

  const responseObj: ResponseObject = {
    status: apiStatus.status,
    message: apiStatus.message || (apiStatus.isSuccess ? "success" : "error"),
    data: apiStatus.data ?? null,
    toastMessage: apiStatus.toastMessage ?? (apiStatus.isSuccess ? "Operation successful" : null),
  };

  return c.json(responseObj, apiStatus.status as ContentfulStatusCode);
}
