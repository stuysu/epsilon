// pictures are shown at 240px at most, so 512px covers high-density screens
export const CLUB_PICTURE_SIDE = 512;

const decode = async (
    file: Blob,
): Promise<CanvasImageSource & { width: number; height: number }> => {
    if (typeof createImageBitmap === "function") return createImageBitmap(file);
    const url = URL.createObjectURL(file);
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        return image;
    } finally {
        URL.revokeObjectURL(url);
    }
};

const encode = (canvas: HTMLCanvasElement, type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.9));

/* shrinks an uploaded club picture once, so visitors never download the full photo;
   anything the browser can't redraw is uploaded as it was */
export const prepareClubPicture = async (
    file: File,
): Promise<{ blob: Blob; ext: string; type: string }> => {
    const original = {
        blob: file,
        ext: (file.name.split(".").pop() || "png").toLowerCase(),
        type: file.type || "image/png",
    };
    // animation would be lost
    if (file.type === "image/gif") return original;
    try {
        const image = await decode(file);
        const scale = Math.min(
            1,
            CLUB_PICTURE_SIDE / Math.max(image.width, image.height),
        );
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) return original;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        // older Safari can't write WebP and falls back to PNG
        const blob =
            (await encode(canvas, "image/webp")) ??
            (await encode(canvas, "image/png"));
        if (!blob) return original;
        if (scale === 1 && blob.size >= file.size) return original;
        const type = blob.type || "image/png";
        return { blob, type, ext: type === "image/webp" ? "webp" : "png" };
    } catch {
        return original;
    }
};

export const clubPicturePath = (
    orgId: number | undefined,
    url: string | undefined,
    ext: string,
) => `org-pictures/${orgId}/${Date.now()}-${url}-profile.${ext}`;

// every upload gets a new name, so browsers can keep it for a year
export const clubPictureUploadOptions = (type: string) => ({
    contentType: type,
    cacheControl: "31536000",
});
