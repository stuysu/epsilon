import { describe, expect, it, vi } from "vitest";
import {
    CLUB_PICTURE_SIDE,
    clubPicturePath,
    clubPictureUploadOptions,
    prepareClubPicture,
} from "./clubPicture";

describe("club pictures", () => {
    it("go in the club's folder, which the storage policy checks", () => {
        vi.spyOn(Date, "now").mockReturnValue(1700000000000);
        expect(clubPicturePath(12, "test-club", "webp")).toBe(
            "org-pictures/12/1700000000000-test-club-profile.webp",
        );
        vi.restoreAllMocks();
    });

    it("are cached for a year with their type", () => {
        expect(clubPictureUploadOptions("image/webp")).toEqual({
            contentType: "image/webp",
            cacheControl: "31536000",
        });
        expect(CLUB_PICTURE_SIDE).toBe(512);
    });

    it("keep GIFs as they are", async () => {
        const gif = new File(["GIF89a"], "Logo.GIF", { type: "image/gif" });
        const result = await prepareClubPicture(gif);
        expect(result).toEqual({ blob: gif, ext: "gif", type: "image/gif" });
    });

    it("upload the original when the browser can't redraw it", async () => {
        const png = new File(["not really a png"], "logo.png", {
            type: "image/png",
        });
        const result = await prepareClubPicture(png);
        expect(result.blob).toBe(png);
        expect(result.ext).toBe("png");
    });
});
