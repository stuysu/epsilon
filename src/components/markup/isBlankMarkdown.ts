// The editor can produce "content" with no visible text, such as "&#x20;",
// "-" for an empty bullet or "#" for an empty heading.
const isBlankMarkdown = (markdown: string) =>
    markdown
        .replace(/&(#x?[0-9a-f]+|nbsp);/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\[[ xX]?\]/g, "")
        .replace(/^\s*\d+[.)]/gm, "")
        .replace(/[\s*#>\-_=~`|\\]/g, "").length === 0;

export default isBlankMarkdown;
