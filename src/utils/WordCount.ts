/* counts words the same way the server does when it checks a charter:
   any run of spaces, tabs or new lines separates words */
export const wordCount = (text?: string) =>
    text?.trim() ? text.trim().split(/\s+/).length : 0;

/* cuts text off after `max` words, keeping its spacing and line breaks */
export const limitWords = (text: string, max: number) => {
    let seen = 0;
    for (const match of text.matchAll(/\S+/g)) {
        seen += 1;
        if (seen === max) return text.slice(0, match.index + match[0].length);
    }
    return text;
};
