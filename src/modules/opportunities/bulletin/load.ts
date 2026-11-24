import { extractBulletinLines } from "./extract";
import { parseBulletin } from "./parse";

// pdf.js is large, so it loads only when needed
export const readBulletinFile = async (
    file: File,
    onProgress?: (done: number, total: number) => void,
) => {
    const [pdfjs, worker] = await Promise.all([
        import("pdfjs-dist"),
        import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

    const task = pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
        // keeps each font's real name, which tells titles from body text
        fontExtraProperties: true,
    });
    try {
        const doc = await task.promise;
        return parseBulletin(await extractBulletinLines(doc, onProgress));
    } finally {
        await task.destroy();
    }
};
