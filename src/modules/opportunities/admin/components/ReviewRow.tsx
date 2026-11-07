import { useId, useState } from "react";
import CheckboxField from "../../../../components/ui/input/CheckboxField";
import EntryFields from "../../components/EntryFields";
import { ReviewEntry, ReviewPatch } from "../../bulletin/sync";
import { OpportunityCategory, OpportunityEligibility } from "../../types";

type ReviewRowProps = {
    entry: ReviewEntry;
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    onChange: (patch: ReviewPatch) => void;
};

const CHANGE_LABELS = { new: "New", changed: "Changed", unchanged: null };
const RENAME_BUTTON =
    "cursor-pointer rounded-lg bg-layer-2 px-2 text-typography-1 shadow-control hover:bg-layer-3";

const ReviewRow = ({
    entry,
    categories,
    eligibilities,
    onChange,
}: ReviewRowProps) => {
    const [open, setOpen] = useState(false);
    const editorId = useId();
    const changeLabel = CHANGE_LABELS[entry.change];
    const rename = entry.renameCandidate;
    const linked = rename !== null && entry.existingId === rename.id;

    return (
        <li
            // dashed rather than faded, so its text stays readable
            className={`rounded-xl bg-layer-1 shadow-control ${entry.include ? "" : "border border-dashed border-typography-3"}`}
        >
            <div className="flex items-start gap-3 p-4 max-sm:flex-col max-sm:gap-2">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="min-w-0 font-semibold text-typography-1 [overflow-wrap:anywhere]">
                            {entry.title || "Untitled"}
                        </span>
                        {changeLabel && (
                            <span className="rounded bg-layer-2 px-1.5 text-sm text-typography-2">
                                {changeLabel}
                            </span>
                        )}
                        {!entry.include && (
                            <span className="rounded bg-layer-2 px-1.5 text-sm text-typography-1">
                                Not included
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-typography-2">
                        Page {entry.page} · {entry.categories.join(" · ")}
                    </p>
                    {entry.changedFields.length > 0 && (
                        <p className="text-sm text-typography-2">
                            Updated: {entry.changedFields.join(", ")}
                        </p>
                    )}
                    {entry.keptEdits.length > 0 && (
                        <p className="text-sm text-typography-2">
                            Keeping admin edits to: {entry.keptEdits.join(", ")}
                        </p>
                    )}
                    {rename && (
                        <div
                            className={`flex flex-wrap items-center gap-2 pt-1 text-sm ${
                                entry.renameSettled
                                    ? "text-typography-2"
                                    : "text-yellow"
                            }`}
                        >
                            <span className="flex min-w-0 gap-1.5 [overflow-wrap:anywhere]">
                                <i
                                    className="bx bx-git-compare pt-0.5"
                                    aria-hidden="true"
                                />
                                {entry.renameSettled
                                    ? linked
                                        ? `Renamed from "${rename.title}"`
                                        : `Not a rename of "${rename.title}"`
                                    : linked
                                      ? `Linked as a rename of "${rename.title}"`
                                      : `May be a rename of "${rename.title}"`}
                            </span>
                            {(!entry.renameSettled || !linked) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            existingId: rename.id,
                                            renameSettled: true,
                                        })
                                    }
                                    className={RENAME_BUTTON}
                                >
                                    {linked
                                        ? "Keep Linked"
                                        : "Same Opportunity"}
                                </button>
                            )}
                            {(!entry.renameSettled || linked) && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange({
                                            existingId: null,
                                            renameSettled: true,
                                        })
                                    }
                                    className={RENAME_BUTTON}
                                >
                                    {linked && entry.renameSettled
                                        ? "Unlink"
                                        : "Not the Same"}
                                </button>
                            )}
                        </div>
                    )}
                    {entry.warnings.length > 0 && (
                        <p className="flex gap-1.5 pt-1 text-sm text-yellow [overflow-wrap:anywhere]">
                            <i
                                className="bx bx-error-circle pt-0.5"
                                aria-hidden="true"
                            />
                            <span className="min-w-0">
                                {entry.warnings.join(" · ")}
                            </span>
                        </p>
                    )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <CheckboxField
                        checked={entry.include}
                        onChange={(include) => onChange({ include })}
                        label="Include"
                        ariaLabel={`Include ${entry.title || "untitled entry"}`}
                    />
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={editorId}
                        aria-label={`${open ? "Close" : "Edit"} ${entry.title || "untitled entry"}`}
                        onClick={() => setOpen(!open)}
                        className="cursor-pointer rounded-lg bg-layer-2 px-3 py-1 text-sm text-typography-1 shadow-control hover:bg-layer-3"
                    >
                        {open ? "Close" : "Edit"}
                    </button>
                </div>
            </div>

            {open && (
                <div
                    id={editorId}
                    className="flex flex-col gap-4 border-t border-divider p-4"
                >
                    <EntryFields
                        entry={entry}
                        categories={categories}
                        eligibilities={eligibilities}
                        onChange={onChange}
                    />
                </div>
            )}
        </li>
    );
};

export default ReviewRow;
