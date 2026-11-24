import { describe, expect, it } from "vitest";
import {
    actorName,
    type AdminActionRow,
    categoryOf,
    shortDate,
    summarize,
} from "./activityLog";

const row = (
    action: string,
    details: Record<string, unknown>,
): AdminActionRow => ({
    id: 1,
    action,
    target_type: null,
    target_id: null,
    details,
    created_at: "2026-11-20T12:00:00Z",
    users: { first_name: "Sam", last_name: "Admin" },
});

const sentence = (r: AdminActionRow) =>
    summarize(r)
        .pieces.map((p) => p.text)
        .join("");

describe("activity log", () => {
    it("groups actions, even unknown ones", () => {
        expect(categoryOf("reject_charter_edit").key).toBe("charters");
        expect(categoryOf("delete_charter").key).toBe("charters");
        expect(categoryOf("grant_room").key).toBe("rooms");
        expect(categoryOf("force_reserve").key).toBe("bookings");
        expect(categoryOf("new_thing").key).toBe("other");
    });

    it("names the admin, or a former one", () => {
        expect(actorName(row("x", {}))).toBe("Sam Admin");
        expect(actorName({ users: null })).toBe("A former admin");
    });

    it("writes one sentence per action", () => {
        const rejected = row("reject_charter", {
            organization: "test-club",
            reason: "Too short",
        });
        expect(sentence(rejected)).toBe("rejected test-club");
        expect(summarize(rejected).quote).toBe("Too short");

        const blocked = row("block_rooms", {
            rooms: ["101", "102", "103"],
            date: "2026-11-30",
            cancelled: 1,
        });
        expect(sentence(blocked)).toBe("blocked 101, 102 and 103 on Nov 30");
        expect(summarize(blocked).tags).toEqual(["1 meeting cancelled"]);

        const forced = row("force_reserve", {
            room: "301",
            organization: "test-club",
            title: "Exam",
            cancelled: 2,
        });
        expect(sentence(forced)).toBe("force reserved 301 for test-club");
        expect(summarize(forced).quote).toBe("Exam");

        const deleted = row("delete_charter", {
            name: "test-club",
            url: "test-club",
            state: "PENDING",
        });
        expect(sentence(deleted)).toBe("deleted the charter of test-club");
        expect(summarize(deleted).tags).toEqual(["pending"]);

        expect(sentence(row("add_users", { count: 40 }))).toBe(
            "added 40 users",
        );
        expect(
            summarize(
                row("approve_charter_edit", {
                    organization: "test-club",
                    fields: ["meeting_days", "picture"],
                }),
            ).tags,
        ).toEqual(["meeting days and picture"]);
        expect(sentence({ ...row("new_thing", {}), details: null })).toBe(
            "new thing",
        );
    });

    it("shortens dates without shifting the day", () => {
        expect(shortDate("2026-12-09")).toBe("Dec 9");
    });
});
