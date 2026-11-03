import { useId, useState } from "react";
import CheckboxField from "../../../components/ui/input/CheckboxField";
import TextField from "../../../components/ui/input/TextField";
import { getSafeLinks } from "../bulletin/normalize";
import { EntryPatch, ReviewEntry } from "../bulletin/sync";
import { OpportunityCategory, OpportunityEligibility } from "../types";
import { toggleValue } from "../utils";

type ReviewRowProps = {
    entry: ReviewEntry;
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    onChange: (patch: EntryPatch) => void;
};

const CHANGE_LABELS = { new: "New", changed: "Changed", unchanged: null };

const ReviewRow = ({
    entry,
    categories,
    eligibilities,
    onChange,
}: ReviewRowProps) => {
    const [open, setOpen] = useState(false);
    const editorId = useId();
    // keep half-typed addresses in the box and only store the valid ones
    const [linkText, setLinkText] = useState(entry.links.join("\n"));
    const changeLabel = CHANGE_LABELS[entry.change];

    const textField = (
        label: string,
        field:
            | "dateText"
            | "location"
            | "costText"
            | "deadlineText"
            | "eligibilityText",
    ) => (
        <TextField
            label={label}
            fullWidth
            value={entry[field] ?? ""}
            onChange={(event) =>
                onChange({ [field]: event.target.value || null })
            }
        />
    );

    return (
        <li
            // a dashed outline marks an excluded row, since fading it would make
            // its text and controls too faint to read
            className={`rounded-xl bg-layer-1 shadow-control ${entry.include ? "" : "border border-dashed border-typography-3"}`}
        >
            <div className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-typography-1">
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
                    {entry.warnings.length > 0 && (
                        <p className="flex flex-wrap gap-1.5 pt-1 text-sm text-yellow">
                            <i
                                className="bx bx-error-circle pt-0.5"
                                aria-hidden="true"
                            />
                            {entry.warnings.join(" · ")}
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
                    <TextField
                        label="Title"
                        fullWidth
                        value={entry.title}
                        onChange={(event) =>
                            onChange({ title: event.target.value })
                        }
                    />
                    <TextField
                        label="Description"
                        fullWidth
                        multiline
                        rows={6}
                        value={entry.description}
                        onChange={(event) =>
                            onChange({ description: event.target.value })
                        }
                    />
                    <div className="grid gap-4 sm:grid-cols-2">
                        {textField("Dates", "dateText")}
                        {textField("Location", "location")}
                        {textField("Cost", "costText")}
                        {textField("Eligibility", "eligibilityText")}
                        {textField("Deadline wording", "deadlineText")}
                        <TextField
                            label="Deadline date"
                            type="date"
                            fullWidth
                            value={entry.deadline ?? ""}
                            helperText="Decides when this is archived. Filled in from the wording when it has a date."
                            onChange={(event) =>
                                onChange({
                                    deadline: event.target.value || null,
                                })
                            }
                        />
                    </div>
                    <TextField
                        label="Links, one per line"
                        fullWidth
                        multiline
                        rows={3}
                        value={linkText}
                        onChange={(event) => {
                            setLinkText(event.target.value);
                            onChange({
                                links: getSafeLinks(
                                    event.target.value
                                        .split("\n")
                                        .map((link: string) => link.trim()),
                                ),
                            });
                        }}
                    />
                    <fieldset>
                        <legend className="mb-1 text-sm text-typography-2">
                            Categories
                        </legend>
                        <div className="grid sm:grid-cols-2">
                            {categories.map((category) => (
                                <CheckboxField
                                    key={category.id}
                                    label={category.name}
                                    checked={entry.categories.includes(
                                        category.name,
                                    )}
                                    onChange={() =>
                                        onChange({
                                            categories: toggleValue(
                                                entry.categories,
                                                category.name,
                                            ),
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend className="mb-1 text-sm text-typography-2">
                            Only eligible for (leave empty if open to everyone)
                        </legend>
                        <div className="flex flex-wrap">
                            {eligibilities.map((eligibility) => (
                                <CheckboxField
                                    key={eligibility.id}
                                    label={eligibility.name}
                                    checked={entry.eligibilityTags.includes(
                                        eligibility.name,
                                    )}
                                    onChange={() =>
                                        onChange({
                                            eligibilityTags: toggleValue(
                                                entry.eligibilityTags,
                                                eligibility.name,
                                            ),
                                        })
                                    }
                                />
                            ))}
                        </div>
                    </fieldset>
                </div>
            )}
        </li>
    );
};

export default ReviewRow;
