interface Organization {
    id: number;
    name: string;
    url: string;
    socials?: string;
    picture?: string | null;
    mission?: string;
    purpose?: string;
    goals?: string;
    appointment_procedures?: string;
    uniqueness?: string;
    meeting_description?: string;
    meeting_schedule?: string;
    meeting_days?: string[];
    keywords?: string;
    tags?: string[];
    commitment_level?: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    state: "PENDING" | "LOCKED" | "UNLOCKED" | "ADMIN" | "PUNISHED";
    joinable?: boolean;
    join_instructions?: string;
    is_returning?: boolean;
    returning_info?: string;
    memberships?: Partial<Membership>[];
    fair?: boolean;
    faculty_email?: string;
}
// see also: FormType in `src/pages/Create.tsx`

interface OrganizationEdit {
    id?: number;
    organization_id?: Organization[id];
    name?: Organization["name"];
    url?: Organization["url"];
    socials?: Organization["socials"];
    picture?: Organization["picture"];
    mission?: Organization["mission"];
    purpose?: Organization["purpose"];
    goals?: Organization["goals"];
    appointment_procedures?: Organization["appointment_procedures"];
    uniqueness?: Organization["uniqueness"];
    meeting_description?: Organization["meeting_description"];
    meeting_schedule?: Organization["meeting_schedule"];
    meeting_days?: Organization["meeting_days"];
    keywords?: Organization["keywords"];
    tags?: Organization["tags"];
    commitment_level?: Organization["commitment_level"];
    fair?: Organization["fair"];
    faculty_email?: Organization["faculty_email"];
}

/* FOR ADMIN PANEL (Approving Organization Edit Requests)*/
type EditType = OrganizationEdit & {
    organization_name: string;
    organization_picture: string;
};

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
    organizations?: Partial<Organization>;
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
    available_days: (
        | "MONDAY"
        | "TUESDAY"
        | "WEDNESDAY"
        | "THURSDAY"
        | "FRIDAY"
        | "SATURDAY"
        | "SUNDAY"
    )[];
    comments?: string;
}

interface Permission {
    id: number;
    users?: Partial<User>;
    permission: "ADMIN"; // union type of permission enum
}

interface Post {
    id: number;
    organizations?: Partial<Organization>;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
}

interface Meeting {
    id: number;
    organizations?: Partial<Organization>;
    attendance?: Partial<Attendance>[];
    rooms?: Partial<Room>;
    is_public: boolean;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

interface Strike {
    id: number;
    organization?: Partial<Organization>;
    users?: Partial<User>;
    reason: string;
    created_at: string;
}

interface Announcement {
    id: number;
    content: string;
    created_at: string;
    updated_at: string;
}

interface Attendance {
    id: number;
    organization_id: number;
    meeting_id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
}
