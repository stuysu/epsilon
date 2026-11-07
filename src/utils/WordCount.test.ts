import { describe, expect, it } from "vitest";
import { limitWords, wordCount } from "./WordCount";

/* the server's check in epsilon-functions _shared/charter.ts */
const serverCount = (value: string) => {
    const cleaned = value.replace(/[ \t]+$/gm, "").trim();
    return cleaned ? cleaned.split(/\s+/).length : 0;
};

describe("wordCount", () => {
    it.each([
        "",
        "   ",
        "one",
        "one two",
        "one  two   three",
        "  leading and trailing  ",
        "line one\nline two\n\nline three",
        "tabs\tbetween\twords",
        "trailing spaces   \nnext line",
    ])("matches the server for %j", (text) => {
        expect(wordCount(text)).toBe(serverCount(text));
    });
});

describe("limitWords", () => {
    it("keeps short text as is", () => {
        expect(limitWords("a  b\nc", 5)).toBe("a  b\nc");
    });

    it("cuts after the last allowed word and keeps line breaks", () => {
        const cut = limitWords("a  b\nc d e", 3);
        expect(cut).toBe("a  b\nc");
        expect(wordCount(cut)).toBe(3);
    });
});
