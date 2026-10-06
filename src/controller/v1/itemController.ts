import { Context } from "hono";
import { AppVariables, CreateItemDTO, UpdateItemDTO, QueryItemsParams } from "../../utils/v1/customTypes.js";
import { ItemService } from "../../services/v1/itemService.js";
import { sendResponse } from "../../middleware/exitPoint.js";
import { HTTP_STATUS } from "../../utils/v1/constants.js";

export class ItemController {
  /**
   * POST /v1/items
   * Create a new item
   */
  public static async create(c: Context<{ Variables: AppVariables }>): Promise<Response> {
    const log = c.get("log");
    const body = (c.get("validated_json") || (await c.req.json())) as CreateItemDTO;

    log.info({ name: body.name, category: body.category }, "Creating new item");

    const item = await ItemService.create(body);

    log.info({ itemId: item.id }, "Item created successfully");

    return sendResponse(c, {
      isSuccess: true,
      status: HTTP_STATUS.CREATED,
      message: "Item created successfully",
      data: item,
      toastMessage: `Item "${item.name}" has been created successfully`,
    });
  }

  /**
   * GET /v1/items
   * Get all items with filtering, search, pagination, and sorting
   */
  public static async getAll(c: Context<{ Variables: AppVariables }>): Promise<Response> {
    const log = c.get("log");
    const query = (c.get("validated_query") || c.req.query()) as QueryItemsParams;

    log.info({ query }, "Fetching items list");

    const result = await ItemService.getAll(query);

    log.info({ count: result.items.length, total: result.totalCount }, "Items fetched successfully");

    return sendResponse(c, {
      isSuccess: true,
      status: HTTP_STATUS.OK,
      message: "Items fetched successfully",
      data: result,
      toastMessage: `Successfully retrieved ${result.items.length} items`,
    });
  }

  /**
   * GET /v1/items/:id
   * Get single item by ID
   */
  public static async getById(c: Context<{ Variables: AppVariables }>): Promise<Response> {
    const log = c.get("log");
    const id = c.req.param("id") as string;

    log.info({ itemId: id }, "Fetching item by ID");

    const item = await ItemService.getById(id);

    if (!item) {
      log.warn({ itemId: id }, "Item not found");
      return sendResponse(c, {
        isSuccess: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "Item not found",
        toastMessage: `Item with ID "${id}" was not found`,
      });
    }

    log.info({ itemId: id }, "Item retrieved successfully");

    return sendResponse(c, {
      isSuccess: true,
      status: HTTP_STATUS.OK,
      message: "Item retrieved successfully",
      data: item,
      toastMessage: "Item retrieved successfully",
    });
  }

  /**
   * PUT /v1/items/:id
   * Update item by ID
   */
  public static async update(c: Context<{ Variables: AppVariables }>): Promise<Response> {
    const log = c.get("log");
    const id = c.req.param("id") as string;
    const body = (c.get("validated_json") || (await c.req.json())) as UpdateItemDTO;

    log.info({ itemId: id, updates: body }, "Updating item");

    const updated = await ItemService.update(id, body);

    if (!updated) {
      log.warn({ itemId: id }, "Item not found for update");
      return sendResponse(c, {
        isSuccess: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "Item not found",
        toastMessage: `Cannot update: Item with ID "${id}" was not found`,
      });
    }

    log.info({ itemId: id }, "Item updated successfully");

    return sendResponse(c, {
      isSuccess: true,
      status: HTTP_STATUS.OK,
      message: "Item updated successfully",
      data: updated,
      toastMessage: `Item "${updated.name}" updated successfully`,
    });
  }

  /**
   * DELETE /v1/items/:id
   * Soft-delete item by ID
   */
  public static async delete(c: Context<{ Variables: AppVariables }>): Promise<Response> {
    const log = c.get("log");
    const id = c.req.param("id") as string;

    log.info({ itemId: id }, "Deleting item");

    const deleted = await ItemService.delete(id, true);

    if (!deleted) {
      log.warn({ itemId: id }, "Item not found for deletion");
      return sendResponse(c, {
        isSuccess: false,
        status: HTTP_STATUS.NOT_FOUND,
        message: "Item not found",
        toastMessage: `Cannot delete: Item with ID "${id}" was not found`,
      });
    }

    log.info({ itemId: id }, "Item deleted successfully");

    return sendResponse(c, {
      isSuccess: true,
      status: HTTP_STATUS.OK,
      message: "Item deleted successfully",
      data: { id, deleted: true },
      toastMessage: "Item deleted successfully",
    });
  }
}
