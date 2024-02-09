interface UserContextType extends User {
    signed_in: boolean,
    memberships: Membership[]
}