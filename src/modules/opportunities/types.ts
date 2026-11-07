export type OpportunityCategory = {
    id: number;
    name: string;
    parent_id: number | null;
    position: number;
};

export type OpportunityEligibility = {
    id: number;
    name: string;
    grade: number | null;
    position: number;
};

// preferred tags say who it is especially for, not who can apply
export type OpportunityTag = OpportunityEligibility & { preferred: boolean };

// groups is null until the student fills in About You
export type Student = { grade: number; groups: string[] | null };

export type OpportunityBulletin = {
    id: number;
    issue: string;
    published_on: string;
    entry_count: number;
    imported_at: string;
};

export type Opportunity = {
    id: number;
    title: string;
    title_key: string;
    description: string;
    date_text: string | null;
    location: string | null;
    cost_text: string | null;
    cost_min: number | null;
    cost_max: number | null;
    deadline: string | null;
    deadline_text: string | null;
    eligibility_text: string | null;
    links: string[];
    bulletin_label: string | null;
    archived: boolean;
    // changed by an admin, so the review keeps them over the bulletin's
    edited_fields: string[];
    edited_at: string | null;
    // any change, so an edit can tell it started from old data
    updated_at: string;
    created_at: string;
    categories: OpportunityCategory[];
    eligibilities: OpportunityTag[];
};

export type OpportunityFilters = {
    query: string;
    statuses: ("active" | "archived")[];
    deadlines: ("week" | "rolling")[];
    categoryIds: number[];
    eligibilityIds: number[];
    showIneligible: boolean;
    // null is the full range; unpriced ones always show
    costRange: [number, number] | null;
    sort: "deadline" | "newest";
};

export type OpportunityStatus = {
    label: string;
    icon: string;
    tone: "neutral" | "urgent" | "danger";
    struck: boolean;
};
