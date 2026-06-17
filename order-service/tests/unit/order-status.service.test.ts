import { describe, expect, it } from "vitest";

import { UnprocessableEntityError } from "../../src/errors/app-error";
import { validateStatusTransition } from "../../src/services/order-status.service";

describe("validateStatusTransition", () => {
    it("allows valid transition from CREATED to PENDING", () => {
        expect(() =>
            validateStatusTransition("CREATED", "PENDING"),
        ).not.toThrow();
    });

    it("allows valid transition from CREATED to CANCELLED", () => {
        expect(() =>
            validateStatusTransition("CREATED", "CANCELLED"),
        ).not.toThrow();
    });

    it("rejects invalid transition from CREATED to PAID", () => {
        expect(() => validateStatusTransition("CREATED", "PAID")).toThrow(
            UnprocessableEntityError,
        );
        expect(() => validateStatusTransition("CREATED", "PAID")).toThrow(
            'Transition from "CREATED" to "PAID" is not allowed',
        );
    });

    it("rejects transition to the same status", () => {
        expect(() => validateStatusTransition("PENDING", "PENDING")).toThrow(
            'Order is already in status "PENDING"',
        );
    });

    it("rejects transition from terminal SHIPPED status", () => {
        expect(() => validateStatusTransition("SHIPPED", "CANCELLED")).toThrow(
            'Transition from "SHIPPED" to "CANCELLED" is not allowed',
        );
    });

    it("rejects transition from terminal CANCELLED status", () => {
        expect(() => validateStatusTransition("CANCELLED", "PENDING")).toThrow(
            'Transition from "CANCELLED" to "PENDING" is not allowed',
        );
    });
});
