import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/services/order.service", () => ({
    createOrder: vi.fn(),
    getOrderById: vi.fn(),
    getOrdersPaginated: vi.fn(),
    updateOrder: vi.fn(),
}));

vi.mock("../../src/services/order-cache.service", () => ({
    getCachedOrderList: vi.fn(),
    setCachedOrderList: vi.fn(),
    invalidateOrdersCache: vi.fn(),
    buildOrdersCacheKey: vi.fn(),
}));

import { buildApp } from "../../src/app";
import * as orderCacheService from "../../src/services/order-cache.service";
import * as orderService from "../../src/services/order.service";

const AUTH_HEADER = { authorization: "Bearer dev-token" };

describe("GET /orders", () => {
    beforeEach(() => {
        process.env.DEV_AUTH_TOKEN = "dev-token";
        process.env.DEV_AUTH_USER_ID =
            "550e8400-e29b-41d4-a716-446655440000";
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("returns 401 without authorization header", async () => {
        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/orders",
        });

        expect(response.statusCode).toBe(401);
        await app.close();
    });

    it("returns paginated orders from database", async () => {
        vi.mocked(orderCacheService.getCachedOrderList).mockResolvedValue(null);
        vi.mocked(orderService.getOrdersPaginated).mockResolvedValue({
            orders: [
                {
                    id: "5e05dfab-083d-46b0-acd8-1869015307f6",
                    customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                    total: "99.99" as never,
                    statusId: 1,
                    productId: 1,
                    version: 0,
                    createdAt: new Date("2026-06-17T12:00:00.000Z"),
                    updatedAt: new Date("2026-06-17T12:00:00.000Z"),
                    createUser: "system",
                    updateUser: "system",
                    status: {
                        id: 1,
                        code: "CREATED",
                        name: "Created",
                    },
                },
            ],
        });

        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/orders?offset=0&limit=10",
            headers: AUTH_HEADER,
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual([
            {
                id: "5e05dfab-083d-46b0-acd8-1869015307f6",
                customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                total: "99.99",
                status: "CREATED",
                productId: 1,
                createdAt: "2026-06-17T12:00:00.000Z",
                updatedAt: "2026-06-17T12:00:00.000Z",
                createUser: "system",
                updateUser: "system",
            },
        ]);
        expect(orderCacheService.setCachedOrderList).toHaveBeenCalledOnce();

        await app.close();
    });

    it("returns paginated orders from cache", async () => {
        const cachedResponse = [
            {
                id: "cached-order-id",
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

        vi.mocked(orderCacheService.getCachedOrderList).mockResolvedValue(
            cachedResponse,
        );

        const app = await buildApp();

        const response = await app.inject({
            method: "GET",
            url: "/orders?offset=0&limit=10",
            headers: AUTH_HEADER,
        });

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(cachedResponse);
        expect(orderService.getOrdersPaginated).not.toHaveBeenCalled();

        await app.close();
    });
});
