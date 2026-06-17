import type { OrderResponseDTO } from "../dtos/order.response";
import { redis } from "../lib/redis";

export const ORDERS_CACHE_PREFIX = "orders:list:";
const ORDERS_CACHE_TTL_SECONDS = 300;

export function buildOrdersCacheKey(offset: number, limit: number): string {
    return `${ORDERS_CACHE_PREFIX}offset:${offset}:limit:${limit}`;
}

export async function getCachedOrderList(
    offset: number,
    limit: number,
): Promise<OrderResponseDTO[] | null> {
    const cached = await redis.get(buildOrdersCacheKey(offset, limit));

    if (!cached) {
        return null;
    }

    return JSON.parse(cached) as OrderResponseDTO[];
}

export async function setCachedOrderList(
    offset: number,
    limit: number,
    orders: OrderResponseDTO[],
): Promise<void> {
    await redis.set(
        buildOrdersCacheKey(offset, limit),
        JSON.stringify(orders),
        "EX",
        ORDERS_CACHE_TTL_SECONDS,
    );
}

export async function invalidateOrdersCache(): Promise<void> {
    const keys = await redis.keys(`${ORDERS_CACHE_PREFIX}*`);

    if (keys.length > 0) {
        await redis.del(...keys);
    }
}
