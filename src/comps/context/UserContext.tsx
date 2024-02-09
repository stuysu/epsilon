import React from "react";

interface UserContextType extends User {
    signed_in: boolean,
    memberships: Membership[]
}

const UserContext = React.createContext<UserContextType>({
    signed_in: false,
    id: -1,
    first_name: "",
    last_name: "",
    email: "",
    picture: "",
    grade: -1,
    memberships: []
})

export default UserContext