import type { OrderStatus } from "../generated/prisma/client";
import { UnprocessableEntityError } from "../errors/app-error";
import {
    ORDER_STATUS_CODES,
    STATUS_TRANSITIONS,
    type OrderStatusCode,
} from "../lib/order-status";
import { prisma } from "../lib/prisma";

export function validateStatusTransition(
    currentCode: string,
    nextCode: string,
): void {
    if (currentCode === nextCode) {
        throw new UnprocessableEntityError(
            `Order is already in status "${nextCode}"`,
        );
    }

    if (!isOrderStatusCode(currentCode)) {
        throw new UnprocessableEntityError(
            `Unknown current order status "${currentCode}"`,
        );
    }

    if (!isOrderStatusCode(nextCode)) {
        throw new UnprocessableEntityError(
            `Unknown target order status "${nextCode}"`,
        );
    }

    const allowedTransitions = STATUS_TRANSITIONS[currentCode];

    if (!allowedTransitions.includes(nextCode)) {
        throw new UnprocessableEntityError(
            `Transition from "${currentCode}" to "${nextCode}" is not allowed`,
        );
    }
}

export async function getOrderStatusByCode(
    code: string,
): Promise<OrderStatus> {
    const status = await prisma.orderStatus.findUnique({
        where: { code },
    });

    if (!status) {
        throw new UnprocessableEntityError(
            `Order status "${code}" not found in reference table`,
        );
    }

    return status;
}

export async function getOrderStatusById(
    statusId: number,
): Promise<OrderStatus> {
    const status = await prisma.orderStatus.findUnique({
        where: { id: statusId },
    });

    if (!status) {
        throw new UnprocessableEntityError(
            `Order status with id "${statusId}" not found in reference table`,
        );
    }

    return status;
}

function isOrderStatusCode(code: string): code is OrderStatusCode {
    return ORDER_STATUS_CODES.includes(code as OrderStatusCode);
}
