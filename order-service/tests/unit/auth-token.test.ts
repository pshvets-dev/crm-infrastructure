import { describe, expect, it } from "vitest";

import { parseAuthUserFromToken } from "../../src/lib/auth-token";

describe("parseAuthUserFromToken", () => {
    it("parses dev token from environment", () => {
        process.env.DEV_AUTH_TOKEN = "dev-token";
        process.env.DEV_AUTH_USER_ID =
            "550e8400-e29b-41d4-a716-446655440000";
        process.env.DEV_AUTH_USER_EMAIL = "dev@local.test";
        process.env.DEV_AUTH_USER_ROLE = "manager";

        const user = parseAuthUserFromToken("dev-token");

        expect(user).toEqual({
            id: "550e8400-e29b-41d4-a716-446655440000",
            email: "dev@local.test",
            role: "manager",
        });
    });

    it("parses base64 encoded user payload", () => {
        const payload = Buffer.from(
            JSON.stringify({
                id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                email: "test@dev.com",
                role: "user",
            }),
        ).toString("base64");

        const user = parseAuthUserFromToken(payload);

        expect(user).toEqual({
            id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            email: "test@dev.com",
            role: "user",
        });
    });

    it("returns null for invalid token", () => {
        expect(parseAuthUserFromToken("invalid-token")).toBeNull();
    });
});
