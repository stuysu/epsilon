import React, { useEffect } from "react"
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



    useEffect(() => {
        async function getUserData() {
            const { data, error } = await supabase.from("users").select().eq('email', "rsim40@stuy.edu")
        }
    })

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider