import type { FastifyError, FastifyInstance } from "fastify";

import { AppError } from "./app-error";

export function registerErrorHandler(app: FastifyInstance) {
    app.setErrorHandler(async (error: FastifyError, request, reply) => {
        if (error instanceof AppError) {
            request.log.warn(
                { statusCode: error.statusCode, err: error },
                error.message,
            );

            await reply
                .status(error.statusCode)
                .send({ error: error.message });
            return;
        }

        if (error.validation) {
            request.log.warn(
                { statusCode: 400, validation: error.validation },
                "Request validation failed",
            );

            await reply.status(400).send({ error: error.message });
            return;
        }

        request.log.error({ err: error }, "Unhandled error");

        await reply.status(500).send({ error: "Internal Server Error" });
    });
}
