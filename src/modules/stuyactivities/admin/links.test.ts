import { describe, expect, it } from "vitest";
import { ALL_LINKS, canOpen, getLinks } from "./links";

describe("admin links", () => {
    it("gives ADMIN every page", () => {
        expect(getLinks({ permissions: ["ADMIN"] })).toEqual(ALL_LINKS);
    });
    it("gives other permissions only their own pages", () => {
        expect(getLinks({ permissions: [] })).toEqual([]);
        expect(getLinks({ permissions: ["APPLICATIONS"] })).toEqual([]);
        expect(canOpen({ permissions: ["VALENTINES"] }, "VALENTINES")).toBe(
            true,
        );
        expect(canOpen({ permissions: ["VALENTINES"] }, "ADMIN")).toBe(false);
    });
});
