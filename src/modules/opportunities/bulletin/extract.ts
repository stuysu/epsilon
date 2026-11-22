import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { BulletinLine } from "./parse";

// text within this many points vertically shares a line
const LINE_BUCKET = 3;
const LINK_MARGIN = 3;
// a link box sits a little above the text baseline it covers
const LINK_ABOVE_BASELINE = 6;
const LINK_BELOW_BASELINE = 2;
const DEFAULT_FONT_SIZE = 12;
// a gap wider than this share of the font size is a space between words
const WORD_GAP = 0.15;

const getFontName = (page: { commonObjs: any }, id: string) => {
    try {
        // embedded names look like "BCDHEE+Arial-BoldMT"
        return String(page.commonObjs.get(id)?.name ?? id).replace(
            /^[A-Z]{6}\+/,
            "",
        );
    } catch {
        return id;
    }
};

const joinItems = (items: TextItem[]) => {
    let text = "";
    let end: number | null = null;

    items.forEach((item) => {
        const x = item.transform[4];
        const size = Math.abs(item.transform[0]) || DEFAULT_FONT_SIZE;
        // pdf.js splits words at font runs, so only add a space for a real gap
        const hasGap = end !== null && x - end > size * WORD_GAP;
        if (hasGap && !/\s$/.test(text) && !/^\s/.test(item.str)) text += " ";
        text += item.str;
        end = x + item.width;
    });
    return text.replace(/\s+/g, " ").trim();
};

export const extractBulletinLines = async (
    doc: PDFDocumentProxy,
    onProgress?: (done: number, total: number) => void,
) => {
    const lines: BulletinLine[] = [];

    for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
        const page = await doc.getPage(pageNumber);
        // font objects are only available once the page's operators have loaded
        await page.getOperatorList();
        const content = await page.getTextContent();
        const annotations = (await page.getAnnotations()).filter(
            (annotation) => annotation.url,
        );

        const rows = new Map<number, TextItem[]>();
        content.items.forEach((raw) => {
            const item = raw as TextItem;
            if (!item.str?.trim()) return;
            const y = Math.round(item.transform[5] / LINE_BUCKET) * LINE_BUCKET;
            rows.set(y, [...(rows.get(y) ?? []), item]);
        });

        [...rows.entries()]
            .sort((a, b) => b[0] - a[0])
            .forEach(([y, items]) => {
                const ordered = [...items].sort(
                    (a, b) => a.transform[4] - b.transform[4],
                );
                const fontLengths = new Map<string, number>();
                ordered.forEach((item) => {
                    fontLengths.set(
                        item.fontName,
                        (fontLengths.get(item.fontName) ?? 0) + item.str.length,
                    );
                });
                const fontId = [...fontLengths.entries()].sort(
                    (a, b) => b[1] - a[1],
                )[0][0];

                lines.push({
                    page: pageNumber,
                    text: joinItems(ordered),
                    font: getFontName(page, fontId),
                    size: Math.round(
                        Math.max(
                            ...ordered.map((item) =>
                                Math.abs(item.transform[0]),
                            ),
                        ),
                    ),
                    links: annotations
                        .filter(
                            (annotation) =>
                                annotation.rect[1] - LINK_MARGIN <=
                                    y + LINK_ABOVE_BASELINE &&
                                annotation.rect[3] + LINK_MARGIN >=
                                    y - LINK_BELOW_BASELINE,
                        )
                        .map((annotation) => annotation.url as string),
                });
            });

        page.cleanup();
        onProgress?.(pageNumber, doc.numPages);
    }
    return lines;
};
