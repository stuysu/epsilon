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
    created_at: string;
    categories: OpportunityCategory[];
    eligibilities: OpportunityEligibility[];
};

export type OpportunityFilters = {
    query: string;
    statuses: ("active" | "archived")[];
    deadlines: ("week" | "rolling")[];
    categoryIds: number[];
    eligibilityIds: number[];
    showIneligible: boolean;
    // null means the full range, so unpriced opportunities are never hidden by default
    costRange: [number, number] | null;
    sort: "deadline" | "newest";
};

export type OpportunityStatus = {
    label: string;
    icon: string;
    tone: "neutral" | "urgent" | "danger";
    struck: boolean;
};
