import { Hono } from "hono";
import { AppVariables } from "../../utils/v1/customTypes.js";
import { sendResponse } from "../../middleware/exitPoint.js";
import { HTTP_STATUS, ITEM_CATEGORY, ITEM_STATUS } from "../../utils/v1/constants.js";

const genericRoutes = new Hono<{ Variables: AppVariables }>();

genericRoutes.get("/constants", c => {
  return sendResponse(c, {
    isSuccess: true,
    status: HTTP_STATUS.OK,
    message: "Constants fetched successfully",
    data: {
      ITEM_CATEGORY,
      ITEM_STATUS,
      HTTP_STATUS,
    },
    toastMessage: "Constants loaded",
  });
});

genericRoutes.get("/health", c => {
  return sendResponse(c, {
    isSuccess: true,
    status: HTTP_STATUS.OK,
    message: "Service is healthy",
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
    },
    toastMessage: "System healthy",
  });
});

export { genericRoutes };
