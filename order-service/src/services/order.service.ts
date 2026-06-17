import type { Order, Prisma } from "../generated/prisma/client";
import { ConflictError } from "../errors/app-error";
import type { OrderWithStatus } from "../dtos/order.response";
import { DEFAULT_ORDER_STATUS_CODE } from "../lib/order-status";
import { prisma } from "../lib/prisma";
import { publishOrderEvent } from "./order-events.service";
import { getOrderStatusByCode } from "./order-status.service";

const orderWithStatusInclude = {
    status: true,
} as const;

export interface CreateOrderInput {
    customerId: string;
    total: number;
    productId: number;
    userId?: string;
}

export interface UpdateOrderInput {
    orderId: string;
    version: number;
    userId?: string;
    total?: number;
    status?: string;
}

export interface OrdersListResult {
    orders: OrderWithStatus[];
}

export async function getOrderById(
    orderId: string,
): Promise<OrderWithStatus | null> {
    return prisma.order.findUnique({
        where: { id: orderId },
        include: orderWithStatusInclude,
    });
}

export async function getOrdersPaginated(
    offset: number,
    limit: number,
): Promise<OrdersListResult> {
    const orders = await prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        skip: offset,
        take: limit,
        include: orderWithStatusInclude,
    });

    return { orders };
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
    const status = await getOrderStatusByCode(DEFAULT_ORDER_STATUS_CODE);

    const order = await prisma.order.create({
        data: {
            customerId: input.customerId,
            total: input.total,
            productId: input.productId,
            statusId: status.id,
            createUser: input.userId ?? "system",
            updateUser: input.userId ?? "system",
        },
    });

    await publishOrderEvent({
        event: "ORDER_CREATED",
        orderId: order.id,
        occurredAt: new Date().toISOString(),
        payload: {
            customerId: order.customerId,
            total: order.total.toString(),
            productId: order.productId,
            status: status.code,
        },
    });

    return order;
}

export async function updateOrder(input: UpdateOrderInput): Promise<Order> {
    const data: Prisma.OrderUncheckedUpdateManyInput = {
        updateUser: input.userId ?? "system",
        version: { increment: 1 },
    };

    if (input.total !== undefined) {
        data.total = input.total;
    }

    if (input.status !== undefined) {
        const nextStatus = await getOrderStatusByCode(input.status);
        data.statusId = nextStatus.id;
    }

    const result = await prisma.order.updateMany({
        where: {
            id: input.orderId,
            version: input.version,
        },
        data,
    });

    if (result.count === 0) {
        throw new ConflictError(
            `Order "${input.orderId}" was modified by another request. Retry with the latest data.`,
        );
    }

    const order = await prisma.order.findUniqueOrThrow({
        where: { id: input.orderId },
    });

    if (input.total !== undefined) {
        await publishOrderEvent({
            event: "ORDER_TOTAL_UPDATED",
            orderId: order.id,
            occurredAt: new Date().toISOString(),
            payload: {
                total: order.total.toString(),
            },
        });
    }

    if (input.status !== undefined) {
        await publishOrderEvent({
            event: "ORDER_STATUS_UPDATED",
            orderId: order.id,
            occurredAt: new Date().toISOString(),
            payload: {
                status: input.status,
            },
        });
    }

    return order;
}
