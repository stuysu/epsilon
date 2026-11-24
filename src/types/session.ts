interface UserContextType extends User {
    signed_in: boolean;
    admin: boolean; // DEPRECATED
    // highest site permission, kept for older checks
    permission: string;
    permissions: string[];
    memberships: Partial<Membership>[] | undefined;
    // re-reads the profile, e.g. after joining or leaving
    refresh?: () => Promise<void>;
}

interface OrgContextType extends Organization {
    meetings: Partial<Meeting>[];
    memberships: Partial<Membership>[];
    posts: Post[];
    // only for viewers who get upcoming meetings alone
    last_meeting?: { start_time: string }[];
    setOrg?: (data: OrgContextType) => void;
}

type CalendarMeeting = {
    id: number;
    title: string;
    description: string;
    is_public: boolean;
    start_time: string;
    end_time: string;
    rooms: {
        id: number;
        name: string;
        floor?: number;
    };
    organizations: {
        id: number;
        url: string;
        name: string;
        picture: string;
    };
    advisor: string;
};

type CatalogSort = "shuffle" | "name" | "members" | "newest";

type SearchParams = {
    name: string;
    meetingDays: string[];
    commitmentLevels: string[];
    tags: string[];
    sort: CatalogSort;
};
