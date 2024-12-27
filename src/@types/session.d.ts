interface UserContextType extends User {
    signed_in: boolean;
    admin: boolean;
    memberships: Partial<Membership>[] | undefined;
}

interface OrgContextType extends Organization {
    meetings: Partial<Meeting>[];
    memberships: Partial<Membership>[];
    posts: Partial<Posts>[];
    setOrg?: (data: any) => void;
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
    };
    organizations: {
        id: number;
        name: string;
        picture: string;
    };
};

type SearchParams = {
    name: string;
    meetingDays: string[];
    commitmentLevels: string[];
    tags: string[];
};
