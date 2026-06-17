import type { AuthUser } from "../types/auth";

const UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseAuthUserFromToken(token: string): AuthUser | null {
    const devToken = process.env.DEV_AUTH_TOKEN;

    if (devToken && token === devToken) {
        const id = process.env.DEV_AUTH_USER_ID;

        if (!id || !UUID_REGEX.test(id)) {
            return null;
        }

        return {
            id,
            email: process.env.DEV_AUTH_USER_EMAIL ?? "dev@local.test",
            role: process.env.DEV_AUTH_USER_ROLE ?? "manager",
        };
    }

    try {
        const payload = Buffer.from(token, "base64").toString("utf-8");
        const parsed = JSON.parse(payload) as Partial<AuthUser>;

        if (!parsed.id || !UUID_REGEX.test(parsed.id)) {
            return null;
        }

        return {
            id: parsed.id,
            email:
                typeof parsed.email === "string"
                    ? parsed.email
                    : "unknown@local.test",
            role: typeof parsed.role === "string" ? parsed.role : "user",
        };
    } catch {
        return null;
    }
}
