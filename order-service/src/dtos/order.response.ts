import type { Order, OrderStatus } from "../generated/prisma/client";

export type OrderWithStatus = Order & {
    status: OrderStatus;
};

export interface OrderResponseDTO {
    id: string;
    customerId: string;
    total: string;
    status: string;
    productId: number;
    createdAt: string;
    updatedAt: string;
    createUser: string;
    updateUser: string;
}

export function toOrderResponse(order: OrderWithStatus): OrderResponseDTO {
    return {
        id: order.id,
        customerId: order.customerId,
        total: order.total.toString(),
        status: order.status.code,
        productId: order.productId,
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString(),
        createUser: order.createUser,
        updateUser: order.updateUser,
    };
}
