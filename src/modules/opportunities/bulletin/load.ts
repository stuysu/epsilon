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

    const doc = await pdfjs.getDocument({
        data: new Uint8Array(await file.arrayBuffer()),
    }).promise;
    try {
        return parseBulletin(await extractBulletinLines(doc, onProgress));
    } finally {
        await doc.destroy();
    }
};
