import { describe, expect, it } from "vitest";
import { relatedActivities, tokenize } from "./relatedActivities";

const org = (
    id: number,
    name: string,
    extra: Partial<Organization> = {},
): Organization =>
    ({
        id,
        name,
        state: "UNLOCKED",
        commitment_level: "LOW",
        tags: [],
        ...extra,
    }) as Organization;

const robotics = org(1, "Robot Builders", {
    purpose: "We design, build and program robots for competitions.",
    tags: ["STEM"],
    meeting_days: ["MONDAY"],
});
const pool = [
    robotics,
    org(2, "Small Robot Coders", {
        purpose: "Students program small robots and learn electronics.",
        tags: ["STEM"],
    }),
    org(3, "Opening Theory Hour", {
        purpose: "Play chess and prepare for tournaments.",
        tags: ["Hobby & Special Interest"],
    }),
    org(4, "Proof Writers Guild", {
        purpose: "Prepare for math competitions.",
        tags: ["STEM", "Academic & Professional"],
    }),
    org(5, "Baking Society", {
        purpose: "Bake cookies and bread together.",
        tags: ["Hobby & Special Interest"],
    }),
    org(6, "Pending Robots", {
        purpose: "Build robots.",
        tags: ["STEM"],
        state: "PENDING",
    }),
];

describe("relatedActivities", () => {
    it("ranks the closest match first", () => {
        const result = relatedActivities(robotics, pool);
        expect(result[0].org.id).toBe(2);
        expect(result.map((r) => r.org.id)).toContain(4);
    });

    it("leaves out unrelated, pending and the activity itself", () => {
        const ids = relatedActivities(robotics, pool).map((r) => r.org.id);
        expect(ids).not.toContain(1);
        expect(ids).not.toContain(3);
        expect(ids).not.toContain(5);
        expect(ids).not.toContain(6);
    });

    it("does not match on commitment level alone", () => {
        const blank = [org(10, "Alpha"), org(11, "Beta Group")];
        expect(relatedActivities(blank[0], blank)).toEqual([]);
    });

    it("explains a tag-only match with the shared tag", () => {
        const result = relatedActivities(robotics, pool);
        expect(result.find((r) => r.org.id === 4)?.reason).toBe("Also STEM");
    });

    it("handles activities with empty fields", () => {
        const empty = org(20, "Robots", {
            tags: null,
            meeting_days: null,
        } as never);
        expect(() => relatedActivities(empty, [...pool, empty])).not.toThrow();
        expect(() =>
            relatedActivities(robotics, [...pool, empty]),
        ).not.toThrow();
    });

    it("drops filler words and stems plurals", () => {
        expect(tokenize("The Stuyvesant Robots Club")).toEqual(["robot"]);
    });
});
