interface Organization {
    id: number;
    name: string;
    picture?: string;
    mission?: string;
    purpose?: string;
    benefit?: string;
    appointment_procedures?: string;
    uniqueness?: string;
    meeting_schedule?: string;
    meeting_days?: string[];
    commitment_level?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    url: string;
    state: "PENDING" | "LOCKED" | "UNLOCKED" | "ADMIN";
    joinable?: boolean;
    join_instructions?: string;
    memberships?: Partial<Membership>[];
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    picture?: string;
    grade: number;
    is_faculty: boolean;
    active: boolean;
    memberships?: Partial<Membership>[];
}

interface Membership {
    users?: Partial<User>;
    organization?: Partial<Organization>;
    id: number;
    role: "MEMBER" | "ADVISOR" | "ADMIN" | "CREATOR";
    role_name?: string;
    active: boolean;
}

interface Room {
    id: number;
    name: string;
    floor?: number;
    approval_required: boolean;
    available_days: ("MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY")[];
    comments?: string;
}

interface Permission {
    id: number;
    users?: Partial<User>;
    permission: 'ADMIN'; // union type of permission enum
}

interface Meeting {
    id: number;
    organization?: Partial<Organization>;
    rooms?: Partial<Room>;
    is_public: boolean;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}