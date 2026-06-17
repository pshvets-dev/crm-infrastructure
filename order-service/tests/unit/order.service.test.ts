import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/prisma", () => ({
    prisma: {
        order: {
            updateMany: vi.fn(),
            findUniqueOrThrow: vi.fn(),
        },
    },
}));

vi.mock("../../src/services/order-status.service", () => ({
    getOrderStatusByCode: vi.fn(),
}));

vi.mock("../../src/services/order-events.service", () => ({
    publishOrderEvent: vi.fn(),
}));

import { ConflictError } from "../../src/errors/app-error";
import { prisma } from "../../src/lib/prisma";
import { getOrderStatusByCode } from "../../src/services/order-status.service";
import { updateOrder } from "../../src/services/order.service";

describe("updateOrder", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("throws ConflictError when optimistic lock fails", async () => {
        vi.mocked(prisma.order.updateMany).mockResolvedValue({ count: 0 });

        await expect(
            updateOrder({
                orderId: "order-id",
                version: 0,
                total: 100,
            }),
        ).rejects.toThrow(ConflictError);

        expect(prisma.order.updateMany).toHaveBeenCalledWith({
            where: { id: "order-id", version: 0 },
            data: {
                total: 100,
                updateUser: "system",
                version: { increment: 1 },
            },
        });
    });

    it("updates order when version matches", async () => {
        vi.mocked(prisma.order.updateMany).mockResolvedValue({ count: 1 });
        vi.mocked(getOrderStatusByCode).mockResolvedValue({
            id: 2,
            code: "PENDING",
            name: "Pending",
        });
        vi.mocked(prisma.order.findUniqueOrThrow).mockResolvedValue({
            id: "order-id",
            customerId: "customer-id",
            total: "100" as never,
            statusId: 2,
            productId: 1,
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
            createUser: "system",
            updateUser: "user-id",
        });

        const order = await updateOrder({
            orderId: "order-id",
            version: 0,
            status: "PENDING",
            userId: "user-id",
        });

        expect(order.id).toBe("order-id");
        expect(prisma.order.updateMany).toHaveBeenCalledWith({
            where: { id: "order-id", version: 0 },
            data: {
                statusId: 2,
                updateUser: "user-id",
                version: { increment: 1 },
            },
        });
    });
});
