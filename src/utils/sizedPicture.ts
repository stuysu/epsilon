const ORIGINAL = "/storage/v1/object/public/";
const RESIZED = "/storage/v1/render/image/public/";

/* a club picture from storage, resized by the server to fit `cssPx` on high-density
   screens instead of downloading the full upload; other links pass through */
export const sizedPicture = (url: string | null | undefined, cssPx: number) => {
    if (!url) return undefined;
    if (!url.includes(ORIGINAL)) return url;
    const px = Math.min(Math.ceil(cssPx * 2), 1024);
    const [path, query] = url.split("?");
    return `${path.replace(ORIGINAL, RESIZED)}?width=${px}&height=${px}&resize=cover${
        query ? `&${query}` : ""
    }`;
};
