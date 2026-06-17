import { FastifyInstance } from "fastify";
import { JsonSchemaToTsProvider } from "@fastify/type-provider-json-schema-to-ts";

import {
    createOrderSchema,
    getOrderByIdSchema,
    getOrdersSchema,
    updateOrderSchema,
} from "../controllers/order.schema";
import {
    handleCreateOrder,
    handleGetAllOrders,
    handleGetOrderById,
    handleUpdateOrder,
} from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import {
    loadOrder,
    validateOrderStatusUpdate,
} from "../middleware/order.middleware";

export async function orderRoutes(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<JsonSchemaToTsProvider>();

    typedApp.get(
        "/orders",
        {
            schema: getOrdersSchema,
            preHandler: [authenticate],
        },
        handleGetAllOrders,
    );

    typedApp.get(
        "/orders/:id",
        {
            schema: getOrderByIdSchema,
            preHandler: [authenticate, loadOrder],
        },
        handleGetOrderById,
    );

    typedApp.post(
        "/orders",
        {
            schema: createOrderSchema,
            preHandler: [authenticate],
        },
        handleCreateOrder,
    );

    typedApp.patch(
        "/orders/:id",
        {
            schema: updateOrderSchema,
            preHandler: [authenticate, loadOrder, validateOrderStatusUpdate],
        },
        handleUpdateOrder,
    );
}
