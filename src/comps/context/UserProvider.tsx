import React, { useEffect } from "react"
import { supabase } from "../../supabaseClient"
import UserContext from "./UserContext";

const UserProvider = ({ children } : { children: React.ReactNode }) => {
    supabase.auth.onAuthStateChange(async event => {
        if (event !== "SIGNED_OUT") {
            console.log("Signed In!")
        } else {
            console.log("Signed Out!")
        }
    })

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
        const getUserData = async () => {
            const { data, error } = await supabase.from("users").select()
        }

        getUserData();
    })

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider