interface UserContextType extends User {
  signed_in: boolean;
  admin: boolean;
  memberships: Partial<Membership>[] | undefined;
}

interface OrgContextType extends Organization {
  meetings: Partial<Meeting>[];
  setOrg?: (data : any) => void;
}
