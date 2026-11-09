import { describe, expect, it } from "vitest";
import { sizedPicture } from "./sizedPicture";

const original =
    "https://base.example.org/storage/v1/object/public/public-files/org-pictures/1.png";

describe("sizedPicture", () => {
    it("asks storage for a copy twice the shown size", () => {
        expect(sizedPicture(original, 40)).toBe(
            "https://base.example.org/storage/v1/render/image/public/public-files/org-pictures/1.png?width=80&height=80&resize=cover",
        );
    });
    it("keeps an existing query", () => {
        expect(sizedPicture(`${original}?t=5`, 40)).toMatch(
            /resize=cover&t=5$/,
        );
    });
    it("caps the size", () => {
        expect(sizedPicture(original, 4000)).toContain("width=1024");
    });
    it("leaves other links and empty values alone", () => {
        expect(sizedPicture("https://lh3.googleusercontent.com/a/x", 40)).toBe(
            "https://lh3.googleusercontent.com/a/x",
        );
        expect(sizedPicture(null, 40)).toBeUndefined();
        expect(sizedPicture("", 40)).toBeUndefined();
    });
});
