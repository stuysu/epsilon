import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "../../../../utils/csv";
import {
    attendanceCsvName,
    attendanceCsvRows,
    meetingCsvName,
    meetingCsvRows,
} from "./attendanceCsv";
import { AttendanceMeeting } from "./useOrgAttendance";

const meeting = (
    id: number,
    start: string,
    attendance: AttendanceMeeting["attendance"] = [],
): AttendanceMeeting => ({
    id,
    title: `Meeting ${id}`,
    description: "",
    start_time: start,
    end_time: new Date(new Date(start).getTime() + 3600_000).toISOString(),
    attendance,
});

const NOW = Date.parse("2026-11-20T12:00:00Z");

describe("attendanceCsvRows", () => {
    const meetings = [
        meeting(3, "2026-11-25T20:00:00Z"), // not started
        meeting(2, "2026-11-10T20:00:00Z", [
            { user_id: 1, late: true, left_early: true },
        ]),
        meeting(1, "2026-11-03T20:00:00Z", [
            { user_id: 1, late: false, left_early: false },
        ]),
    ];
    const rows = attendanceCsvRows(
        meetings,
        [
            {
                id: 1,
                first_name: "Al",
                last_name: "Zed",
                email: "al@x.org",
                role: "CREATOR",
            },
            // joined after the first meeting, so it isn't counted
            {
                id: 2,
                first_name: "=Bo",
                last_name: "Young",
                role: "MEMBER",
                joined_at: "2026-11-05T00:00:00Z",
            },
        ],
        NOW,
    );

    it("has a column per meeting that started, oldest first, New York time", () => {
        expect(rows[0]).toEqual([
            "First name",
            "Last name",
            "Email",
            "Role",
            "Meetings attended",
            "Meetings counted",
            "Attendance rate",
            "2026-11-03 3:00 PM Meeting 1",
            "2026-11-10 3:00 PM Meeting 2",
        ]);
    });

    it("marks present, late, left early and absent", () => {
        expect(rows[1]).toEqual([
            "Al",
            "Zed",
            "al@x.org",
            "Creator",
            2,
            2,
            "100%",
            "Present",
            "Late, left early",
        ]);
        expect(rows[2]).toEqual([
            "=Bo",
            "Young",
            "",
            "Member",
            0,
            1,
            "0%",
            "",
            "Absent",
        ]);
    });

    it("survives a round trip through CSV with formulas neutralized", () => {
        const parsed = parseCsv(toCsv(rows));
        expect(parsed[2][0]).toBe("'=Bo");
        expect(parsed[1][8]).toBe("Late, left early");
    });

    it("names the file after the club and day", () => {
        expect(
            attendanceCsvName("test-club", new Date("2026-11-21T03:00:00Z")),
        ).toBe("test-club-attendance-2026-11-20.csv");
    });
});

describe("meetingCsvRows", () => {
    const meeting = {
        title: "Fall Kickoff: Room 101!",
        start_time: "2026-11-10T20:00:00Z",
        end_time: "2026-11-10T21:00:00Z",
    };
    const rows = meetingCsvRows(
        meeting,
        [
            {
                user_id: 1,
                late: true,
                left_early: true,
                recorded_at: "2026-11-10T20:20:00Z",
                source: "SELF",
            },
            { user_id: 2, late: false, left_early: false, source: "ADMIN" },
        ],
        [
            { id: 1, first_name: "Al", last_name: "Zed", role: "CREATOR" },
            { id: 2, first_name: "Bo", last_name: "Young", role: "MEMBER" },
            { id: 3, first_name: "Cy", last_name: "Xu", role: "MEMBER" },
            // joined after the meeting ended
            {
                id: 4,
                first_name: "Di",
                last_name: "Wu",
                role: "MEMBER",
                joined_at: "2026-11-12T00:00:00Z",
            },
        ],
    );

    it("marks each member's status, check-in time and who marked it", () => {
        expect(rows[0]).toEqual([
            "First name",
            "Last name",
            "Email",
            "Role",
            "Status",
            "Left early",
            "Checked in",
            "Marked by",
        ]);
        expect(rows[1]).toEqual([
            "Al",
            "Zed",
            "",
            "Creator",
            "Late",
            "Yes",
            "3:20 PM",
            "Self check-in",
        ]);
        expect(rows[2].slice(4)).toEqual(["Present", "", "", "Leader"]);
        expect(rows[3].slice(4)).toEqual(["Absent", "", "", ""]);
        expect(rows[4].slice(4)).toEqual(["", "", "", ""]);
    });

    it("names the file after the club, meeting and day", () => {
        expect(meetingCsvName("test-club", meeting)).toBe(
            "test-club-fall-kickoff-room-101-2026-11-10.csv",
        );
    });
});
