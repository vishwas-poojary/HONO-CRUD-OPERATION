import { Hono } from "hono";
import { AppVariables } from "../../utils/v1/customTypes.js";
import { ItemController } from "../../controller/v1/itemController.js";
import { validate } from "../../middleware/zodValidator.js";
import {
  createItemSchema,
  updateItemSchema,
  itemIdParamSchema,
  queryItemsSchema,
} from "../../schemas/v1/itemSchema.js";

const itemRoutes = new Hono<{ Variables: AppVariables }>();

// Create
itemRoutes.post("/", validate(createItemSchema, "json"), ItemController.create);

// Read All (with filters, pagination, search, sort)
itemRoutes.get("/", validate(queryItemsSchema, "query"), ItemController.getAll);

// Read by ID
itemRoutes.get("/:id", validate(itemIdParamSchema, "param"), ItemController.getById);

// Update by ID
itemRoutes.put(
  "/:id",
  validate(itemIdParamSchema, "param"),
  validate(updateItemSchema, "json"),
  ItemController.update,
);

// Delete by ID
itemRoutes.delete("/:id", validate(itemIdParamSchema, "param"), ItemController.delete);

export { itemRoutes };
