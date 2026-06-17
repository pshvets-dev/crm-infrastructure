import { Kafka, Producer, logLevel } from "kafkajs";

import { logger } from "./logger";

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? "localhost:9092").split(",");
const KAFKA_TOPIC_ORDERS = process.env.KAFKA_TOPIC_ORDERS ?? "order.events";
const KAFKA_ENABLED = process.env.KAFKA_ENABLED !== "false";

const kafka = new Kafka({
    clientId: "order-service",
    brokers: KAFKA_BROKERS,
    logLevel: logLevel.ERROR,
});

let producer: Producer | null = null;
let topicReady = false;

async function ensureTopic(): Promise<void> {
    if (topicReady) {
        return;
    }

    const admin = kafka.admin();

    await admin.connect();

    try {
        const existingTopics = await admin.listTopics();

        if (!existingTopics.includes(KAFKA_TOPIC_ORDERS)) {
            await admin.createTopics({
                topics: [
                    {
                        topic: KAFKA_TOPIC_ORDERS,
                        numPartitions: 1,
                        replicationFactor: 1,
                    },
                ],
            });
        }

        topicReady = true;
    } finally {
        await admin.disconnect();
    }
}

export async function connectKafkaProducer(): Promise<void> {
    if (!KAFKA_ENABLED) {
        logger.info("Kafka producer disabled");
        return;
    }

    await ensureTopic();

    producer = kafka.producer();
    await producer.connect();

    logger.info(
        { brokers: KAFKA_BROKERS, topic: KAFKA_TOPIC_ORDERS },
        "Kafka producer connected",
    );
}

export async function disconnectKafkaProducer(): Promise<void> {
    if (!producer) {
        return;
    }

    await producer.disconnect();
    producer = null;
}

export async function publishToOrdersTopic(
    key: string,
    value: object,
): Promise<void> {
    if (!KAFKA_ENABLED) {
        logger.info({ key, value }, "Kafka disabled, event skipped");
        return;
    }

    if (!producer) {
        await connectKafkaProducer();
    }

    await producer!.send({
        topic: KAFKA_TOPIC_ORDERS,
        messages: [
            {
                key,
                value: JSON.stringify(value),
            },
        ],
    });
}
