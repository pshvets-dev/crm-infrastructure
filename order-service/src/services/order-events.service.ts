import { logger } from "../lib/logger";
import { publishToOrdersTopic } from "../lib/kafka";

export type OrderEventType =
    | "ORDER_CREATED"
    | "ORDER_TOTAL_UPDATED"
    | "ORDER_STATUS_UPDATED";

export interface OrderEvent {
    event: OrderEventType;
    orderId: string;
    occurredAt: string;
    payload?: Record<string, unknown>;
}

export async function publishOrderEvent(event: OrderEvent): Promise<void> {
    try {
        await publishToOrdersTopic(event.orderId, event);

        logger.info(
            { orderId: event.orderId, event: event.event },
            "Order event published to Kafka",
        );
    } catch (error) {
        logger.error(
            { err: error, orderId: event.orderId, event: event.event },
            "Failed to publish order event to Kafka",
        );
    }
}
