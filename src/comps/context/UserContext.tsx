import React from "react";

const UserContext = React.createContext<UserContextType>({
    signed_in: false,
    admin: false,
    id: -1,
    first_name: "",
    last_name: "",
    email: "",
    picture: "",
    grade: -1,
    memberships: []
})

export default UserContext