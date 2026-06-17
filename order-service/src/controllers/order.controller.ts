import { FastifyReply, FastifyRequest } from "fastify";

import {
    createOrder,
    getOrdersPaginated,
    updateOrder,
} from "../services/order.service";
import {
    getCachedOrderList,
    invalidateOrdersCache,
    setCachedOrderList,
} from "../services/order-cache.service";
import {
    CreateOrderRequestDTO,
    GetOrdersQueryDTO,
    UpdateOrderRequestDTO,
} from "./order.schema";
import { toOrderResponse } from "../dtos/order.response";
import { parsePaginationQuery } from "../lib/pagination";

export async function handleCreateOrder(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as CreateOrderRequestDTO;

    const order = await createOrder({
        customerId: body.customerId,
        total: body.total,
        productId: body.productId,
        userId: request.user!.id,
    });

    await invalidateOrdersCache();

    return reply.status(201).send({ id: order.id });
}

export async function handleGetAllOrders(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const { offset, limit } = parsePaginationQuery(
        (request.query ?? {}) as GetOrdersQueryDTO,
    );

    const cachedOrders = await getCachedOrderList(offset, limit);

    if (cachedOrders) {
        return reply.status(200).send(cachedOrders);
    }

    const { orders } = await getOrdersPaginated(offset, limit);
    const response = orders.map((order) => toOrderResponse(order));

    await setCachedOrderList(offset, limit, response);

    return reply.status(200).send(response);
}

export async function handleGetOrderById(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    return reply.status(200).send(toOrderResponse(request.order!));
}

export async function handleUpdateOrder(
    request: FastifyRequest,
    reply: FastifyReply,
) {
    const body = request.body as UpdateOrderRequestDTO;
    const order = request.order!;

    const updatedOrder = await updateOrder({
        orderId: order.id,
        version: order.version,
        total: body.total,
        status: body.status,
        userId: request.user!.id,
    });

    await invalidateOrdersCache();

    return reply.status(200).send({ id: updatedOrder.id });
}
