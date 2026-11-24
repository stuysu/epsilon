import { describe, expect, it } from "vitest";
import { capitalizeWords, sortMembersBy, sortWeekdays } from "./DataFormatters";
import { limitWords, wordCount } from "./WordCount";

describe("sortWeekdays", () => {
    it("orders by the school week, any case", () => {
        expect(sortWeekdays(["FRIDAY", "monday", "WEDNESDAY"])).toEqual([
            "monday",
            "WEDNESDAY",
            "FRIDAY",
        ]);
    });
});

describe("sortMembersBy", () => {
    const people = [
        { first: "Bo", last: "Young", joined: "2026-09-01" },
        { first: "Al", last: "Zed", joined: "2026-10-01" },
        { first: "Cy", last: "Adams", joined: "2026-08-01" },
    ];
    const pick = (p: (typeof people)[number]) => ({
        first_name: p.first,
        last_name: p.last,
        joined_at: p.joined,
    });

    it("keeps the default order", () => {
        expect(sortMembersBy(people, "default", pick)).toBe(people);
    });
    it("sorts by last name and by join date", () => {
        expect(
            sortMembersBy(people, "last-name", pick).map((p) => p.last),
        ).toEqual(["Adams", "Young", "Zed"]);
        expect(
            sortMembersBy(people, "joined-newest", pick).map((p) => p.first),
        ).toEqual(["Al", "Bo", "Cy"]);
    });
});

describe("words", () => {
    it("counts like the server", () => {
        expect(wordCount("  one two\n\tthree ")).toBe(3);
        expect(wordCount("")).toBe(0);
        expect(wordCount(undefined)).toBe(0);
    });
    it("cuts after a number of words, keeping spacing", () => {
        expect(limitWords("one  two\nthree four", 3)).toBe("one  two\nthree");
        expect(limitWords("short", 3)).toBe("short");
    });
    it("capitalizes words", () => {
        expect(capitalizeWords("hello world")).toBe("Hello World");
    });
});
