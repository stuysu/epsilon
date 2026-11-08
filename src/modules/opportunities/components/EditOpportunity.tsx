import { useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import CheckboxField from "../../../components/ui/input/CheckboxField";
import { supabase } from "../../../lib/supabaseClient";
import { getEntryWarnings, ParsedEntry } from "../bulletin/parse";
import {
    applyEntryPatch,
    EntryPatch,
    findPublishProblems,
    toImportEntries,
} from "../bulletin/sync";
import useLeaveWarning from "../../../utils/useLeaveWarning";
import { useOpportunities } from "../OpportunitiesContext";
import { Opportunity } from "../types";
import { getTodayEastern } from "../utils";
import EntryFields from "./EntryFields";

// errors the database raises on purpose, written for admins
const EDIT_ERROR_CODE = "P0001";

type Draft = ParsedEntry & {
    tagsChosenByHand: boolean;
    deadlineChosenByHand: boolean;
};

const toDraft = (o: Opportunity): Draft => {
    const draft = {
        titleKey: o.title_key,
        title: o.title,
        description: o.description,
        dateText: o.date_text,
        location: o.location,
        costText: o.cost_text,
        costMin: o.cost_min,
        costMax: o.cost_max,
        deadline: o.deadline,
        deadlineText: o.deadline_text,
        eligibilityText: o.eligibility_text,
        eligibilityTags: o.eligibilities
            .filter((e) => !e.preferred)
            .map((e) => e.name),
        preferredTags: o.eligibilities
            .filter((e) => e.preferred)
            .map((e) => e.name),
        eligibilityUnclear: false,
        links: o.links,
        label: o.bulletin_label,
        categories: o.categories.map((c) => c.name),
        page: 0,
        include: true,
        tagsChosenByHand: o.edited_fields.includes("eligibilities"),
        // re-reading would date it from today, not its bulletin
        deadlineChosenByHand: true,
    };
    return { ...draft, warnings: getEntryWarnings(draft) };
};

type EditOpportunityProps = {
    opportunity: Opportunity;
    onDone: () => void;
};

const EditOpportunity = ({ opportunity, onDone }: EditOpportunityProps) => {
    const { enqueueSnackbar } = useSnackbar();
    const { categories, eligibilities, opportunities, refreshOpportunity } =
        useOpportunities();
    const [draft, setDraft] = useState(() => toDraft(opportunity));
    // the version the draft started from, so a newer one isn't overwritten
    const [loadedAt] = useState(opportunity.updated_at);
    const [changed, setChanged] = useState(false);
    useLeaveWarning(changed);
    const [archived, setArchived] = useState(opportunity.archived);
    const headingRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => headingRef.current?.focus(), []);

    const onChange = (patch: EntryPatch) => {
        setChanged(true);
        setDraft((current) =>
            applyEntryPatch(current, patch, getTodayEastern()),
        );
    };

    const save = async () => {
        // the same checks a bulletin publish runs
        const [problem] = findPublishProblems(
            [{ ...draft, existingId: opportunity.id }],
            categories,
            opportunities,
        );
        if (problem) {
            enqueueSnackbar(`Not saved. ${problem}`, { variant: "error" });
            return;
        }
        const [entry] = toImportEntries([draft], categories, eligibilities);
        const { error } = await supabase.rpc("update_opportunity", {
            opportunity_id: opportunity.id,
            fields: {
                title: entry.title,
                description: entry.description,
                date_text: entry.date_text,
                location: entry.location,
                cost_text: entry.cost_text,
                cost_min: entry.cost_min,
                cost_max: entry.cost_max,
                deadline: entry.deadline,
                deadline_text: entry.deadline_text,
                eligibility_text: entry.eligibility_text,
                links: entry.links,
                archived,
                updated_at: loadedAt,
            },
            category_ids: entry.category_ids,
            eligibility_ids: entry.eligibility_ids,
            preferred_eligibility_ids: entry.preferred_eligibility_ids,
        });

        if (error) {
            enqueueSnackbar(
                error.code === EDIT_ERROR_CODE
                    ? `Not saved. ${error.message}`
                    : "Error saving opportunity. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        if (!(await refreshOpportunity(opportunity.id))) {
            enqueueSnackbar(
                "Saved, but the page couldn't update. Refresh to see the changes.",
                { variant: "warning" },
            );
        } else {
            enqueueSnackbar("Opportunity saved.", { variant: "success" });
        }
        onDone();
    };

    return (
        <section className="flex flex-col gap-4 rounded-2xl bg-layer-1 p-6 shadow-control max-sm:p-4">
            <h2 ref={headingRef} tabIndex={-1} className="outline-none">
                Edit Opportunity
            </h2>
            {draft.warnings.length > 0 && (
                <p className="flex gap-1.5 text-sm text-yellow [overflow-wrap:anywhere]">
                    <i
                        className="bx bx-error-circle pt-0.5"
                        aria-hidden="true"
                    />
                    <span className="min-w-0">
                        {draft.warnings.join(" · ")}
                    </span>
                </p>
            )}
            <EntryFields
                entry={draft}
                categories={categories}
                eligibilities={eligibilities}
                onChange={onChange}
            />
            <CheckboxField
                small
                label="Archived"
                checked={archived}
                onChange={(value) => {
                    setChanged(true);
                    setArchived(value);
                }}
            />
            <div className="flex flex-wrap justify-end gap-3">
                <AsyncButton onClick={onDone}>Cancel</AsyncButton>
                <AsyncButton isPrimary onClick={save}>
                    Save Changes
                </AsyncButton>
            </div>
        </section>
    );
};

export default EditOpportunity;
