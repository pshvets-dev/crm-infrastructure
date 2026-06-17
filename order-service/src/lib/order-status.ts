export const DEFAULT_ORDER_STATUS_CODE = "CREATED";

export const ORDER_STATUS_CODES = [
    "CREATED",
    "PENDING",
    "PAID",
    "SHIPPED",
    "CANCELLED",
] as const;

export type OrderStatusCode = (typeof ORDER_STATUS_CODES)[number];

export const STATUS_TRANSITIONS: Record<
    OrderStatusCode,
    readonly OrderStatusCode[]
> = {
    CREATED: ["PENDING", "CANCELLED"],
    PENDING: ["PAID", "CANCELLED"],
    PAID: ["SHIPPED", "CANCELLED"],
    SHIPPED: [],
    CANCELLED: [],
};

export const PATCHABLE_ORDER_STATUS_CODES = ORDER_STATUS_CODES.filter(
    (code) => code !== DEFAULT_ORDER_STATUS_CODE,
);
