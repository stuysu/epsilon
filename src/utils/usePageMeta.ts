import { useEffect } from "react";

// what index.html starts with, restored when no page sets its own
const DEFAULT_TITLE = "Epsilon";
const DEFAULT_DESCRIPTION =
    "Epsilon is the everything app for Stuyvesant High School. Find and join Activities, browse the calendar, discover new opportunities, and more.";

type Meta = { title?: string; description?: string };
const mounted: Meta[] = [];

const apply = () => {
    const latest = <K extends keyof Meta>(key: K) =>
        [...mounted].reverse().find((m) => m[key] !== undefined)?.[key];
    document.title = latest("title") ?? DEFAULT_TITLE;
    document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", latest("description") ?? DEFAULT_DESCRIPTION);
};

/* sets the tab title and description while the page is shown */
export default function usePageMeta(title?: string, description?: string) {
    useEffect(() => {
        const meta = { title, description };
        mounted.push(meta);
        apply();
        return () => {
            mounted.splice(mounted.indexOf(meta), 1);
            apply();
        };
    }, [title, description]);
}
