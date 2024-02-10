interface Organization {
    id: number;
    name: string;
    url: string;
    state: "PENDING" | "LOCKED" | "UNLOCKED" | "ADMIN";
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
    user?: Partial<User>;
    organization?: Partial<Organization>;
    id: number;
    role: "MEMBER" | "ADVISOR" | "ADMIN" | "CREATOR";
    role_name?: string;
}