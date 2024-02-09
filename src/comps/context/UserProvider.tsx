import React from "react"
import { supabase } from "../../supabaseClient"
import UserContext from "./UserContext";

const UserProvider = ({ children } : { children: React.ReactNode }) => {
    let value : UserContextType = {
        signed_in: false,
        admin: false,
        id: -1,
        first_name: "",
        last_name: "",
        email: "",
        picture: "",
        grade: -1,
        memberships: []
    }

    console.log(value)

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider