import Fastify from "fastify";

import { registerErrorHandler } from "./errors/error-handler";
import { orderRoutes } from "./routes/orders";

export async function buildApp() {
    const app = Fastify({
        logger: true,
    });

    registerErrorHandler(app);
    await app.register(orderRoutes);

    return app;
}
