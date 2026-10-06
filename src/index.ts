import { Hono } from "hono";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { config } from "./config/v1/config.js";
import { logger } from "./utils/v1/logger.js";
import { AppVariables } from "./utils/v1/customTypes.js";
import { entryPoint } from "./middleware/entryPoint.js";
import { exitPoint, sendResponse } from "./middleware/exitPoint.js";
import { registerRoutes } from "./routes/v1/index.js";
import { HttpException } from "./exceptions/v1/HttpException.js";
import { HTTP_STATUS } from "./utils/v1/constants.js";

const app = new Hono<{ Variables: AppVariables }>();

// Enable CORS
app.use("*", cors());

// Attach entryPoint (timing, transaction ID, correlation, child logger)
app.use("*", entryPoint);

// Attach exitPoint (headers: X-Transaction-Id, X-Response-Time, X-Environment, logging)
app.use("*", exitPoint);

import { apiReference } from "@scalar/hono-api-reference";
import { openApiSpec } from "./openapi/spec.js";

// Root route
app.get("/", c => {
  return sendResponse(c, {
    isSuccess: true,
    status: HTTP_STATUS.OK,
    message: "Hono CRUD Service is running",
    data: {
      service: config.SERVICE_NAME,
      environment: config.ENVIRONMENT,
      documentation: "/scalar",
      endpoints: "/v1/items",
    },
    toastMessage: "Welcome to Hono CRUD Service",
  });
});

// OpenAPI Spec Endpoint
app.get("/openapi.json", c => c.json(openApiSpec));

// Interactive Scalar API Reference & Testing UI
app.get(
  "/scalar",
  apiReference({
    theme: "purple",
    pageTitle: "Hono API Reference - Scalar",
    spec: {
      content: openApiSpec,
    },
  }),
);

app.get(
  "/reference",
  apiReference({
    theme: "purple",
    pageTitle: "Hono API Reference - Scalar",
    spec: {
      content: openApiSpec,
    },
  }),
);

// Register API Routes
registerRoutes(app);

// 404 Not Found Handler
app.notFound(c => {
  const log = c.get("log");
  if (log) {
    log.warn({ path: c.req.url, method: c.req.method }, "Resource not found");
  }

  return sendResponse(c, {
    isSuccess: false,
    status: HTTP_STATUS.NOT_FOUND,
    message: "Route not found",
    toastMessage: `Cannot ${c.req.method} ${c.req.url}`,
  });
});

// Global Error Handler
app.onError((err, c) => {
  const log = c.get("log") || logger;

  if (err instanceof HttpException) {
    log.warn({ err, status: err.status }, "Handled application exception");
    return sendResponse(c, {
      isSuccess: false,
      status: err.status,
      message: err.message,
      data: err.details,
      toastMessage: err.toastMessage,
    });
  }

  log.error({ err }, "Unhandled server exception");

  return sendResponse(c, {
    isSuccess: false,
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: config.ENVIRONMENT === "production" ? "Internal server error" : err.message,
    data: config.ENVIRONMENT === "production" ? null : { stack: err.stack },
    toastMessage: "An unexpected error occurred. Please try again later.",
  });
});

// Start the server
const port = config.PORT;
logger.info(`Starting ${config.SERVICE_NAME} on port ${port} in ${config.ENVIRONMENT} mode...`);

serve(
  {
    fetch: app.fetch,
    port,
  },
  info => {
    logger.info(`🚀 Server is listening at http://localhost:${info.port}`);
  },
);

export default app;
