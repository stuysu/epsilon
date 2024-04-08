interface UserContextType extends User {
  signed_in: boolean;
  admin: boolean;
  memberships: Partial<Membership>[] | undefined;
  setMessage: (message: string) => void;
}

interface OrgContextType extends Organization {
  meetings: Partial<Meeting>[];
}
