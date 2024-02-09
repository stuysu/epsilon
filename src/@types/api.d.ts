enum OrgState {
    Pending = "PENDING",
    Locked = "LOCKED",
    Unlocked = "UNLOCKED",
    Admin = "ADMIN"
}

enum OrgRole {
    Member = "MEMBER",
    Advisor = "ADVISOR",
    Admin = "ADMIN",
    Creator = "CREATOR"
}

interface Organization {
    id: number;
    name: string;
    url: string;
    state: OrgState;
    memberships?: Partial<Membership>[];
}

interface User {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    picture?: string;
    grade: number;
}

interface Membership {
    user?: Partial<User>;
    organization?: Partial<Organization>;
    id: number;
    role: OrgRole;
    role_name?: string;
}