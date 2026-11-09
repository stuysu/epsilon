import { describe, expect, it } from "vitest";
import {
    linkDetail,
    linkOrder,
    linkProblems,
    linkTitle,
    normalizeLinkUrl,
    parseLinks,
    serializeLinks,
} from "./SocialLinks";

describe("SocialLinks", () => {
    it("reads old space-separated links and guesses their type", () => {
        const links = parseLinks("instagram.com/club https://club.org");
        expect(links.map((l) => l.type)).toEqual(["instagram", "website"]);
        expect(linkTitle(links[0])).toBe("Instagram");
        expect(linkDetail(links[0])).toBe("@club");
        expect(linkDetail(links[1])).toBe("club.org");
    });

    it("round-trips typed links with custom names", () => {
        const saved = serializeLinks([
            { type: "instagram", url: "@club", name: "" },
            { type: "other", url: "example.com/sheet", name: "Dues Sheet" },
        ]);
        const links = parseLinks(saved);
        expect(links[0].url).toBe("https://www.instagram.com/club");
        expect(linkTitle(links[1])).toBe("Dues Sheet");
        expect(linkProblems(saved)).toEqual([]);
    });

    it("rejects links that don't match their type", () => {
        const saved = serializeLinks([
            { type: "tiktok", url: "instagram.com/club" },
            { type: "other", url: "example.com" },
        ]);
        expect(linkProblems(saved)).toEqual([
            "This isn't a TikTok link.",
            "Give this link a name.",
        ]);
    });

    it("turns handles into profile links", () => {
        expect(normalizeLinkUrl("tiktok", "@club")).toBe(
            "https://www.tiktok.com/@club",
        );
        expect(normalizeLinkUrl("website", "club.org")).toBe(
            "https://club.org",
        );
    });

    it("finds reorder-only changes, including old space-separated links", () => {
        const old = "instagram.com/club https://club.org";
        const swapped = serializeLinks([...parseLinks(old)].reverse());
        expect(linkOrder(old, swapped)).toEqual([2, 1]);
        expect(linkOrder(old, serializeLinks(parseLinks(old)))).toEqual([1, 2]);
        const renamed = parseLinks(old).map((l) => ({ ...l, name: "Ours" }));
        expect(linkOrder(old, serializeLinks(renamed))).toBeNull();
        expect(
            linkOrder(old, serializeLinks(parseLinks(old).slice(1))),
        ).toBeNull();
        expect(linkOrder("", "")).toBeNull();
    });
});
