import "dotenv/config";

import { buildApp } from "./app";
import { disconnectKafkaProducer, connectKafkaProducer } from "./lib/kafka";
import { logger } from "./lib/logger";

const PORT = Number(process.env.PORT ?? 3001);

async function main() {
    await connectKafkaProducer();

    const app = await buildApp();

    const shutdown = async () => {
        await app.close();
        await disconnectKafkaProducer();
        process.exit(0);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);

    await app.listen({ port: PORT, host: "0.0.0.0" });
}

main().catch(async (error) => {
    logger.error({ err: error }, "Failed to start order-service");
    await disconnectKafkaProducer();
    process.exit(1);
});
