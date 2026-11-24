/* RFC 4180 CSV: quoted fields may hold commas, newlines and "" for a quote.
   Each record keeps the file line it starts on; blank lines are dropped. */
export const parseCsvLines = (
    text: string,
): { cells: string[]; line: number }[] => {
    const rows: { cells: string[]; line: number }[] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    let line = 1;
    let start = 1;
    const src = text.replace(/^\uFEFF/, "");

    for (let i = 0; i < src.length; i++) {
        const c = src[i];
        if (quoted) {
            if (c === '"' && src[i + 1] === '"') {
                field += '"';
                i++;
            } else if (c === '"') {
                quoted = false;
            } else {
                if (c === "\n" || (c === "\r" && src[i + 1] !== "\n")) line++;
                field += c;
            }
        } else if (c === '"' && field === "") {
            quoted = true;
        } else if (c === ",") {
            row.push(field);
            field = "";
        } else if (c === "\n" || c === "\r") {
            if (c === "\r" && src[i + 1] === "\n") i++;
            row.push(field);
            rows.push({ cells: row, line: start });
            row = [];
            field = "";
            start = ++line;
        } else {
            field += c;
        }
    }
    if (field !== "" || row.length) {
        row.push(field);
        rows.push({ cells: row, line: start });
    }
    // blank lines carry no data
    return rows.filter((r) => r.cells.some((cell) => cell.trim() !== ""));
};

export const parseCsv = (text: string): string[][] =>
    parseCsvLines(text).map((r) => r.cells);

const quote = (value: string) =>
    /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

/* text a spreadsheet would run as a formula gets a leading apostrophe */
const neutralize = (value: unknown) =>
    typeof value === "string" && /^[=+\-@\t\r]/.test(value)
        ? `'${value}`
        : String(value ?? "");

export const toCsv = (rows: (string | number | boolean | null)[][]) =>
    rows.map((r) => r.map((v) => quote(neutralize(v))).join(",")).join("\n");

/* saves rows as a .csv the browser downloads; the BOM keeps Excel on UTF-8 */
export const downloadCsv = (
    filename: string,
    rows: (string | number | boolean | null)[][],
) => {
    const blob = new Blob(["\uFEFF" + toCsv(rows) + "\n"], {
        type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};
