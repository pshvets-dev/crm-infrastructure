import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/redis", () => ({
    redis: {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
        keys: vi.fn(),
    },
}));

import { redis } from "../../src/lib/redis";
import {
    buildOrdersCacheKey,
    getCachedOrderList,
    invalidateOrdersCache,
    setCachedOrderList,
} from "../../src/services/order-cache.service";

describe("order-cache.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("builds cache key from offset and limit", () => {
        expect(buildOrdersCacheKey(20, 10)).toBe(
            "orders:list:offset:20:limit:10",
        );
    });

    it("returns cached order list", async () => {
        const cachedOrders = [
            {
                id: "order-id",
                customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                total: "10.00",
                status: "CREATED",
                productId: 1,
                createdAt: "2026-06-17T12:00:00.000Z",
                updatedAt: "2026-06-17T12:00:00.000Z",
                createUser: "system",
                updateUser: "system",
            },
        ];

        vi.mocked(redis.get).mockResolvedValue(JSON.stringify(cachedOrders));

        await expect(getCachedOrderList(0, 10)).resolves.toEqual(cachedOrders);
    });

    it("stores order list in redis", async () => {
        const orders = [
            {
                id: "order-id",
                customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                total: "10.00",
                status: "CREATED",
                productId: 1,
                createdAt: "2026-06-17T12:00:00.000Z",
                updatedAt: "2026-06-17T12:00:00.000Z",
                createUser: "system",
                updateUser: "system",
            },
        ];

        await setCachedOrderList(0, 10, orders);

        expect(redis.set).toHaveBeenCalledWith(
            "orders:list:offset:0:limit:10",
            JSON.stringify(orders),
            "EX",
            300,
        );
    });

    it("invalidates all list cache keys", async () => {
        vi.mocked(redis.keys).mockResolvedValue([
            "orders:list:offset:0:limit:10",
            "orders:list:offset:10:limit:10",
        ]);

        await invalidateOrdersCache();

        expect(redis.del).toHaveBeenCalledWith(
            "orders:list:offset:0:limit:10",
            "orders:list:offset:10:limit:10",
        );
    });
});
