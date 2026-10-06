import { MiddlewareHandler } from "hono";
import { z } from "zod";
import { AppVariables } from "../utils/v1/customTypes.js";
import { sendResponse } from "./exitPoint.js";
import { HTTP_STATUS } from "../utils/v1/constants.js";

type ValidationTarget = "json" | "query" | "param";

export const validate = (
  schema: z.ZodSchema,
  target: ValidationTarget = "json",
): MiddlewareHandler<{ Variables: AppVariables }> => {
  return async (c, next) => {
    try {
      let dataToValidate: unknown;

      if (target === "json") {
        try {
          dataToValidate = await c.req.json();
        } catch {
          return sendResponse(c, {
            isSuccess: false,
            status: HTTP_STATUS.BAD_REQUEST,
            message: "Invalid JSON payload",
            toastMessage: "Invalid JSON format in request body",
          });
        }
      } else if (target === "query") {
        dataToValidate = c.req.query();
      } else if (target === "param") {
        dataToValidate = c.req.param();
      }

      const validated = await schema.parseAsync(dataToValidate);

      // Store validated data in context for handlers to access safely
      if (target === "json") {
        c.set("validated_json", validated);
      } else if (target === "query") {
        c.set("validated_query", validated);
      } else if (target === "param") {
        c.set("validated_param", validated);
      }

      await next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        const field = firstIssue.path.join(".");
        let toastMessage = firstIssue.message;

        if (firstIssue.code === "invalid_type") {
          const typeIssue = firstIssue as z.ZodInvalidTypeIssue;
          if (typeIssue.received === "undefined" || typeIssue.received === "null") {
            toastMessage = `${field || "Field"} is required`;
          } else {
            toastMessage = `Invalid format for ${field || "field"}. Expected ${typeIssue.expected}, but got ${typeIssue.received}`;
          }
        }

        const log = c.get("log");
        if (log) {
          log.warn({ issues: error.issues, path: c.req.url }, "Request validation failed");
        }

        return sendResponse(c, {
          isSuccess: false,
          status: HTTP_STATUS.BAD_REQUEST,
          message: "Validation failed",
          data: {
            issues: error.issues.map(iss => ({
              field: iss.path.join("."),
              message: iss.message,
              code: iss.code,
            })),
          },
          toastMessage,
        });
      }

      throw error;
    }
  };
};
