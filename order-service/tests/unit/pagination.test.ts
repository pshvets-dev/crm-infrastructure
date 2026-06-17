import { describe, expect, it } from "vitest";

import { parsePaginationQuery } from "../../src/lib/pagination";

describe("parsePaginationQuery", () => {
    it("uses defaults when query is empty", () => {
        expect(parsePaginationQuery({})).toEqual({
            offset: 0,
            limit: 10,
        });
    });

    it("caps limit to maximum allowed value", () => {
        expect(parsePaginationQuery({ offset: 20, limit: 500 })).toEqual({
            offset: 20,
            limit: 100,
        });
    });

    it("normalizes negative offset to zero", () => {
        expect(parsePaginationQuery({ offset: -5, limit: 10 })).toEqual({
            offset: 0,
            limit: 10,
        });
    });
});
