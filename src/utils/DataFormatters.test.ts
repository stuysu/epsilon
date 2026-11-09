import { describe, expect, it } from "vitest";
import { sortWeekdays } from "./DataFormatters";

describe("sortWeekdays", () => {
    it("puts days in week order", () => {
        expect(
            sortWeekdays([
                "FRIDAY",
                "THURSDAY",
                "WEDNESDAY",
                "TUESDAY",
                "MONDAY",
            ]),
        ).toEqual(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"]);
    });
    it("ignores case and leaves the input alone", () => {
        const days = ["wednesday", "Monday"];
        expect(sortWeekdays(days)).toEqual(["Monday", "wednesday"]);
        expect(days).toEqual(["wednesday", "Monday"]);
    });
});
