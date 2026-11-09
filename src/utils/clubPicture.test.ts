import { describe, expect, it } from "vitest";
import {
    clubPicturePath,
    clubPictureUploadOptions,
    prepareClubPicture,
} from "./clubPicture";

describe("clubPicturePath", () => {
    it("keeps the dot before the extension", () => {
        expect(clubPicturePath(7, "chess", "webp")).toMatch(
            /^org-pictures\/7\/\d+-chess-profile\.webp$/,
        );
    });
});

describe("prepareClubPicture", () => {
    it("uploads the file unchanged when the browser can't redraw it", async () => {
        const file = new File(["not an image"], "logo.PNG", {
            type: "image/png",
        });
        const result = await prepareClubPicture(file);
        expect(result.blob).toBe(file);
        expect(result.ext).toBe("png");
    });
    it("leaves GIFs alone so they keep their animation", async () => {
        const file = new File(["gif"], "logo.gif", { type: "image/gif" });
        expect((await prepareClubPicture(file)).blob).toBe(file);
    });
});

describe("clubPictureUploadOptions", () => {
    it("caches for a year with the right type", () => {
        expect(clubPictureUploadOptions("image/webp")).toEqual({
            contentType: "image/webp",
            cacheControl: "31536000",
        });
    });
});
