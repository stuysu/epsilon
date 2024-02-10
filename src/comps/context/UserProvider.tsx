import React, { useEffect } from "react"
import { supabase } from "../../supabaseClient"
import UserContext from "./UserContext";

const UserProvider = ({ children } : { children: React.ReactNode }) => {
    const [value, setValue] = React.useState<UserContextType>({
        signed_in: false,
        admin: false,
        id: -1,
        first_name: "",
        last_name: "",
        email: "",
        picture: "",
        grade: -1,
        memberships: []
    });

    useEffect(() => {
        const getUser = async () => {
            const authData = await supabase.auth.getUser()
            console.log(authData)
            if (authData.data?.user) {
                /* fetch user profile */
                const supabaseUser = authData.data.user; // user stored in auth.user table
                const { data, error } = await supabase.from('users').select().eq('email', supabaseUser.email)
                
                console.log(data)
            }
        }

        getUser()
    }, [])

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export default UserProvider