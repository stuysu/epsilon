import { describe, expect, it } from "vitest";
import { parseCsv, parseCsvLines, toCsv } from "./csv";

describe("parseCsv", () => {
    it("reads quoted commas, newlines and quotes", () => {
        expect(parseCsv('a,"b,c","say ""hi"""\r\n1,"two\nlines",3')).toEqual([
            ["a", "b,c", 'say "hi"'],
            ["1", "two\nlines", "3"],
        ]);
    });

    it("drops a BOM and blank lines", () => {
        expect(parseCsv("﻿name\n\n , \nAlex\n")).toEqual([["name"], ["Alex"]]);
    });

    it("keeps each record's starting line", () => {
        const text = 'name\r\n\n"two\nlines"\n\nAlex\n';
        expect(parseCsvLines(text).map((r) => r.line)).toEqual([1, 3, 6]);
    });
});

describe("toCsv", () => {
    it("quotes only when needed and round-trips", () => {
        const rows = [
            ["plain", "has,comma", 'has "quote"', "two\nlines"],
            ["x", "", "", ""],
        ];
        const csv = toCsv(rows);
        expect(csv.split("\n")[0]).toBe(
            'plain,"has,comma","has ""quote""","two',
        );
        expect(parseCsv(csv)).toEqual(rows);
    });

    it("writes numbers, booleans and null", () => {
        expect(toCsv([[1, -2, true, null]])).toBe("1,-2,true,");
    });

    it("keeps spreadsheets from running text as formulas", () => {
        expect(toCsv([["=SUM(A1)", "+1", "-x", "@cmd", "a=b"]])).toBe(
            "'=SUM(A1),'+1,'-x,'@cmd,a=b",
        );
    });
});
