import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
    isoToWallClock,
    newYorkZoneName,
    toNewYork,
    wallClockToISO,
} from "./NewYorkTime";

describe("New York time", () => {
    it("shows instants in New York, winter and summer", () => {
        expect(
            toNewYork("2026-11-04T03:30:00Z").format("YYYY-MM-DD HH:mm"),
        ).toBe("2026-11-03 22:30");
        expect(toNewYork("2026-07-01T16:00:00Z").format("HH:mm")).toBe("12:00");
    });

    it("reads picker values as New York wall time", () => {
        expect(wallClockToISO(dayjs("2026-11-03T15:30:00"))).toBe(
            "2026-11-03T20:30:00.000Z",
        );
        expect(wallClockToISO(dayjs("2026-07-01T12:00:00"))).toBe(
            "2026-07-01T16:00:00.000Z",
        );
    });

    it("round-trips through the pickers", () => {
        const iso = "2026-03-09T13:15:00.000Z";
        expect(wallClockToISO(isoToWallClock(iso))).toBe(iso);
    });

    it("names the zone New York is on", () => {
        expect(newYorkZoneName("2026-07-01T16:00:00Z")).toBe("EDT");
        expect(newYorkZoneName("2026-11-23T16:00:00Z")).toBe("EST");
        // the switches: 2am local on 8 March and 1 November 2026
        expect(newYorkZoneName("2026-03-08T06:59:00Z")).toBe("EST");
        expect(newYorkZoneName("2026-03-08T07:00:00Z")).toBe("EDT");
        expect(newYorkZoneName("2026-11-01T05:59:00Z")).toBe("EDT");
        expect(newYorkZoneName("2026-11-01T06:00:00Z")).toBe("EST");
    });
});
