import type { SupabaseClient } from "@supabase/supabase-js";
import { Opportunity, OpportunityEligibility, OpportunityTag } from "./types";

// shared by the Opportunities pages and the scheduled bulletin import
export const OPPORTUNITY_COLUMNS = `
    id,
    title,
    title_key,
    description,
    date_text,
    location,
    cost_text,
    cost_min,
    cost_max,
    deadline,
    deadline_text,
    eligibility_text,
    links,
    bulletin_label,
    archived,
    edited_fields,
    edited_at,
    updated_at,
    created_at,
    categories:opportunity_categories (id, name, parent_id, position),
    eligibility_links:opportunity_eligibility_links (
        preferred,
        eligibility:opportunity_eligibilities (id, name, grade, position)
    )
`;

export type OpportunityRow = Omit<Opportunity, "eligibilities"> & {
    eligibility_links: {
        preferred: boolean;
        eligibility: OpportunityEligibility;
    }[];
};

export const toOpportunity = ({
    eligibility_links,
    ...row
}: OpportunityRow): Opportunity => ({
    ...row,
    eligibilities: eligibility_links
        .map(
            ({ preferred, eligibility }): OpportunityTag => ({
                ...eligibility,
                preferred,
            }),
        )
        .sort((a, b) => a.position - b.position),
});

// the server can cap rows per request, so the catalog is read in pages
const PAGE_SIZE = 1000;

export const fetchAllOpportunities = async (client: SupabaseClient) => {
    const rows: Opportunity[] = [];
    let lastId = 0;
    for (;;) {
        const { data, error } = await client
            .from("opportunities")
            .select(OPPORTUNITY_COLUMNS)
            .gt("id", lastId)
            .order("id")
            .limit(PAGE_SIZE);
        if (error) return { data: null, error };
        // stop on an empty page or one with nothing new
        const page = (data as unknown as OpportunityRow[])
            .filter((row) => row.id > lastId)
            .map(toOpportunity);
        if (!page.length) return { data: rows, error: null };
        rows.push(...page);
        lastId = Math.max(...page.map((row) => row.id));
    }
};
