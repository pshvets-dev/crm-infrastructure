import { FastifyReply, FastifyRequest } from "fastify";

import { UpdateOrderRequestDTO } from "../controllers/order.schema";
import { AppError, NotFoundError } from "../errors/app-error";
import {
    getOrderStatusByCode,
    validateStatusTransition,
} from "../services/order-status.service";
import { getOrderById } from "../services/order.service";

export async function loadOrder(
    request: FastifyRequest,
    _reply: FastifyReply,
) {
    const { id } = request.params as { id: string };

    const order = await getOrderById(id);

    if (!order) {
        throw new NotFoundError(`Order "${id}" not found`);
    }

    request.order = order;
}

export async function validateOrderStatusUpdate(
    request: FastifyRequest,
    _reply: FastifyReply,
) {
    const body = request.body as UpdateOrderRequestDTO | undefined;

    if (!body?.status) {
        return;
    }

    const order = request.order;

    if (!order) {
        throw new AppError(
            500,
            "Order must be loaded before status validation",
        );
    }

    const nextStatus = await getOrderStatusByCode(body.status);

    validateStatusTransition(order.status.code, nextStatus.code);
}
