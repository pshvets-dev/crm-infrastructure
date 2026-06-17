import { FastifyReply, FastifyRequest } from "fastify";

import { UnauthorizedError } from "../errors/app-error";
import { parseAuthUserFromToken } from "../lib/auth-token";

export async function authenticate(
    request: FastifyRequest,
    _reply: FastifyReply,
) {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw new UnauthorizedError("Unauthorized: Missing Bearer token");
    }

    const token = authHeader.slice("Bearer ".length).trim();

    if (!token) {
        throw new UnauthorizedError("Unauthorized: Empty Bearer token");
    }

    const user = parseAuthUserFromToken(token);

    if (!user) {
        throw new UnauthorizedError("Unauthorized: Invalid token");
    }

    request.user = user;
}
