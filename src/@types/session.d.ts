interface UserContextType extends User {
    signed_in: boolean,
    admin: boolean,
    memberships: Membership[]
}