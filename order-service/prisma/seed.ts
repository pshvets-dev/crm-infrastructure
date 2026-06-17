import "dotenv/config";

import { prisma } from "../src/lib/prisma";
import { logger } from "../src/lib/logger";

const orderStatuses = [
    { code: "CREATED", name: "Created" },
    { code: "PENDING", name: "Pending" },
    { code: "PAID", name: "Paid" },
    { code: "SHIPPED", name: "Shipped" },
    { code: "CANCELLED", name: "Cancelled" },
];

async function main() {
    for (const status of orderStatuses) {
        await prisma.orderStatus.upsert({
            where: { code: status.code },
            update: { name: status.name },
            create: status,
        });
    }

    logger.info(
        {
            count: orderStatuses.length,
            codes: orderStatuses.map((status) => status.code),
        },
        "Order statuses seeded",
    );
}

main()
    .catch((error) => {
        logger.error({ err: error }, "Seed failed");
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
