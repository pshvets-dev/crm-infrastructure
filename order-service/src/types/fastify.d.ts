import type { OrderWithStatus } from "../dtos/order.response";
import type { AuthUser } from "./auth";

declare module "fastify" {
    interface FastifyRequest {
        user?: AuthUser;
        order?: OrderWithStatus;
    }
}
