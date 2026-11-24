import { describe, expect, it } from "vitest";
import isBlankMarkdown from "./isBlankMarkdown";

describe("isBlankMarkdown", () => {
    it("treats editor leftovers as blank", () => {
        for (const blank of [
            "",
            "   ",
            "&#x20;",
            "-",
            "#",
            "> ",
            "- [ ]",
            "1.",
            "<u></u>",
            "**",
            "---",
        ]) {
            expect(isBlankMarkdown(blank), JSON.stringify(blank)).toBe(true);
        }
    });
    it("sees real text", () => {
        for (const text of [
            "a",
            "# Title",
            "- [x] done",
            "1. first",
            "<u>u</u>",
            "&amp;",
        ]) {
            expect(isBlankMarkdown(text), JSON.stringify(text)).toBe(false);
        }
    });
});
