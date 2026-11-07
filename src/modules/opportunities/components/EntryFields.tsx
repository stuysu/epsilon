import { useState } from "react";
import CheckboxField from "../../../components/ui/input/CheckboxField";
import TextField from "../../../components/ui/input/TextField";
import { getSafeLinks } from "../bulletin/normalize";
import { ParsedEntry } from "../bulletin/parse";
import { EntryPatch } from "../bulletin/sync";
import { OpportunityCategory, OpportunityEligibility } from "../types";
import { toggleValue } from "../utils";

const readLinks = (text: string) =>
    getSafeLinks(text.split("\n").map((link) => link.trim()));

type EntryFieldsProps = {
    entry: ParsedEntry & { deadlineChosenByHand?: boolean };
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
    onChange: (patch: EntryPatch) => void;
};

const EntryFields = ({
    entry,
    categories,
    eligibilities,
    onChange,
}: EntryFieldsProps) => {
    // keep half-typed addresses in the box and only store the valid ones
    const [linkText, setLinkText] = useState(entry.links.join("\n"));
    // links changed elsewhere, like linking a rename, replace the box
    const [seenLinks, setSeenLinks] = useState(entry.links);
    if (seenLinks !== entry.links) {
        setSeenLinks(entry.links);
        if (readLinks(linkText).join("\n") !== entry.links.join("\n")) {
            setLinkText(entry.links.join("\n"));
        }
    }
    const skippedLinks = linkText
        .split("\n")
        .map((link) => link.trim())
        .filter((link) => link && !entry.links.includes(link));

    // a tag is either required or preferred, never both
    const toggleTag = (
        name: string,
        field: "eligibilityTags" | "preferredTags",
    ) => {
        const other =
            field === "eligibilityTags" ? "preferredTags" : "eligibilityTags";
        onChange({
            [field]: toggleValue(entry[field], name),
            [other]: entry[other].filter((tag) => tag !== name),
        });
    };

    const tagFieldset = (
        legend: string,
        field: "eligibilityTags" | "preferredTags",
    ) => (
        <fieldset>
            <legend className="mb-1 text-sm text-typography-2">{legend}</legend>
            <div className="flex flex-wrap">
                {eligibilities.map((eligibility) => (
                    <CheckboxField
                        key={eligibility.id}
                        label={eligibility.name}
                        ariaLabel={`${legend}: ${eligibility.name}`}
                        checked={entry[field].includes(eligibility.name)}
                        onChange={() => toggleTag(eligibility.name, field)}
                    />
                ))}
            </div>
        </fieldset>
    );

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
        <>
            <TextField
                label="Title"
                fullWidth
                value={entry.title}
                onChange={(event) => onChange({ title: event.target.value })}
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
                    helperText={
                        entry.deadlineChosenByHand
                            ? "Decides when this is archived."
                            : "Decides when this is archived. Filled in from the wording when it has a date."
                    }
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
                error={skippedLinks.length > 0}
                helperText={
                    skippedLinks.length > 0 &&
                    `Not saved, links need http:// or https://: ${skippedLinks.join(", ")}`
                }
                onChange={(event) => {
                    setLinkText(event.target.value);
                    onChange({ links: readLinks(event.target.value) });
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
                            checked={entry.categories.includes(category.name)}
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
            {tagFieldset(
                "Who can apply (leave empty if open to everyone)",
                "eligibilityTags",
            )}
            {tagFieldset("Especially for", "preferredTags")}
        </>
    );
};

export default EntryFields;
