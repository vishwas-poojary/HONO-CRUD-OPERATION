import { Hono } from "hono";
import { AppVariables } from "../../utils/v1/customTypes.js";
import { itemRoutes } from "./itemRoutes.js";
import { genericRoutes } from "./genericRoutes.js";

export function registerRoutes(app: Hono<{ Variables: AppVariables }>): void {
  // Mount V1 routes
  app.route("/v1/items", itemRoutes);
  app.route("/v1/generic", genericRoutes);
}
