import { KeyboardEvent, useState } from "react";
import { EntryPatch, ReviewEntry } from "../bulletin/sync";
import { OpportunityCategory, OpportunityEligibility } from "../types";
import ReviewRow from "./ReviewRow";

type ReviewView = "attention" | "new" | "changed" | "notIncluded" | "all";

const VIEW_LABELS: Record<ReviewView, string> = {
    attention: "Needs Attention",
    new: "New",
    changed: "Changed",
    notIncluded: "Not Included",
    all: "All",
};
const VIEWS = Object.keys(VIEW_LABELS) as ReviewView[];

const matchesView = (entry: ReviewEntry, view: ReviewView) => {
    if (view === "attention") return entry.include && entry.warnings.length > 0;
    if (view === "new") return entry.change === "new";
    if (view === "changed") return entry.change === "changed";
    if (view === "notIncluded") return !entry.include;
    return true;
};

type ReviewEntriesProps = {
    entries: ReviewEntry[];
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    onChange: (index: number, patch: EntryPatch) => void;
};

const ReviewEntries = ({
    entries,
    categories,
    eligibilities,
    onChange,
}: ReviewEntriesProps) => {
    const [view, setView] = useState<ReviewView>("attention");
    // A row being edited stays put, even once its fix takes it out of this view.
    const [editedIndexes, setEditedIndexes] = useState<number[]>([]);

    const changeView = (next: ReviewView) => {
        setView(next);
        setEditedIndexes([]);
    };

    const editEntry = (index: number, patch: EntryPatch) => {
        setEditedIndexes((current) =>
            current.includes(index) ? current : [...current, index],
        );
        onChange(index, patch);
    };

    // arrow keys move between views, as in any radio group
    const onViewKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
        const step = {
            ArrowRight: 1,
            ArrowDown: 1,
            ArrowLeft: -1,
            ArrowUp: -1,
        }[event.key];
        if (!step) return;
        event.preventDefault();
        const next =
            VIEWS[(VIEWS.indexOf(view) + step + VIEWS.length) % VIEWS.length];
        changeView(next);
        document.getElementById(`review-view-${next}`)?.focus();
    };

    const countFor = (key: ReviewView) =>
        entries.filter((entry) => matchesView(entry, key)).length;

    return (
        <>
            {/* one view at a time, so these behave as a radio group */}
            <div
                role="radiogroup"
                aria-label="Show entries"
                className="flex flex-wrap gap-2"
            >
                {VIEWS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        id={`review-view-${key}`}
                        role="radio"
                        aria-checked={view === key}
                        tabIndex={view === key ? 0 : -1}
                        onClick={() => changeView(key)}
                        onKeyDown={onViewKeyDown}
                        className="cursor-pointer text-nowrap rounded-lg bg-layer-2 px-3 pb-[0.35rem] pt-1 text-sm text-typography-2 shadow-control transition-colors hover:bg-layer-3 aria-checked:bg-accent aria-checked:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                    >
                        {`${VIEW_LABELS[key]} (${countFor(key)})`}
                    </button>
                ))}
            </div>

            <ul className="flex flex-col gap-2">
                {entries.map((entry, index) =>
                    matchesView(entry, view) ||
                    editedIndexes.includes(index) ? (
                        <ReviewRow
                            // the index stays stable while the title is edited
                            key={index}
                            entry={entry}
                            categories={categories}
                            eligibilities={eligibilities}
                            onChange={(patch) => editEntry(index, patch)}
                        />
                    ) : null,
                )}
            </ul>
            <p role="status" className="text-center text-typography-2">
                {countFor(view) === 0 && !editedIndexes.length
                    ? "Nothing here."
                    : ""}
            </p>
        </>
    );
};

export default ReviewEntries;
