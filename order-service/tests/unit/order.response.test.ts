import { describe, expect, it } from "vitest";

import {
    toOrderResponse,
    type OrderWithStatus,
} from "../../src/dtos/order.response";

function createMockOrder(
    overrides: Partial<OrderWithStatus> = {},
): OrderWithStatus {
    return {
        id: "5e05dfab-083d-46b0-acd8-1869015307f6",
        customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        total: "99.99" as unknown as OrderWithStatus["total"],
        statusId: 1,
        productId: 1,
        version: 0,
        createdAt: new Date("2026-06-17T12:00:00.000Z"),
        updatedAt: new Date("2026-06-17T12:05:00.000Z"),
        createUser: "system",
        updateUser: "system",
        status: {
            id: 1,
            code: "CREATED",
            name: "Created",
        },
        ...overrides,
    };
}

describe("toOrderResponse", () => {
    it("maps prisma order to api response with status code", () => {
        const response = toOrderResponse(createMockOrder());

        expect(response).toEqual({
            id: "5e05dfab-083d-46b0-acd8-1869015307f6",
            customerId: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            total: "99.99",
            status: "CREATED",
            productId: 1,
            createdAt: "2026-06-17T12:00:00.000Z",
            updatedAt: "2026-06-17T12:05:00.000Z",
            createUser: "system",
            updateUser: "system",
        });
    });
});
