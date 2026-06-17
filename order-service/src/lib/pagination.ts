export const DEFAULT_OFFSET = 0;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export interface PaginationParams {
    offset: number;
    limit: number;
}

export function parsePaginationQuery(query: {
    offset?: number;
    limit?: number;
}): PaginationParams {
    const offset = query.offset ?? DEFAULT_OFFSET;
    const rawLimit = query.limit ?? DEFAULT_LIMIT;

    return {
        offset: Math.max(offset, 0),
        limit: Math.min(Math.max(rawLimit, 1), MAX_LIMIT),
    };
}
