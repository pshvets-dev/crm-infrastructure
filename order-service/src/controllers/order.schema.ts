import { FromSchema } from "json-schema-to-ts";

import { PATCHABLE_ORDER_STATUS_CODES } from "../lib/order-status";

export const createOrderSchema = {
    body: {
        type: "object",
        required: ["customerId", "total", "productId"],
        additionalProperties: false,
        properties: {
            customerId: { type: "string", format: "uuid" },
            total: { type: "number" },
            productId: { type: "integer", exclusiveMinimum: 0 },
        },
    },
} as const;

export type CreateOrderRequestDTO = FromSchema<typeof createOrderSchema.body>;

export const orderIdParamsSchema = {
    params: {
        type: "object",
        required: ["id"],
        additionalProperties: false,
        properties: {
            id: { type: "string", format: "uuid" },
        },
    },
} as const;

export const getOrdersSchema = {
    querystring: {
        type: "object",
        additionalProperties: false,
        properties: {
            offset: { type: "integer", minimum: 0 },
            limit: { type: "integer", minimum: 1, maximum: 100 },
        },
    },
} as const;

export type GetOrdersQueryDTO = FromSchema<typeof getOrdersSchema.querystring>;

export const getOrderByIdSchema = orderIdParamsSchema;

export const updateOrderSchema = {
    ...orderIdParamsSchema,
    body: {
        type: "object",
        additionalProperties: false,
        minProperties: 1,
        properties: {
            total: { type: "number", exclusiveMinimum: 0 },
            status: {
                type: "string",
                enum: [...PATCHABLE_ORDER_STATUS_CODES],
            },
        },
    },
} as const;

export type UpdateOrderParamsDTO = FromSchema<typeof updateOrderSchema.params>;
export type UpdateOrderRequestDTO = FromSchema<typeof updateOrderSchema.body>;
