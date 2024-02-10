import React, { useEffect } from "react"
import { supabase } from "../../supabaseClient"
import UserContext from "./UserContext";
import { Snackbar } from "@mui/material";

const UserProvider = ({ children } : { children: React.ReactNode }) => {
    let [message, setMessage] = React.useState("")

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

    supabase.auth.onAuthStateChange(event => {
        if (event !== "SIGNED_OUT") {
        } else {
            setMessage("Signed Out!")
            setValue({
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
        }
    })

    useEffect(() => {
        const getUser = async () => {
            var authData = await supabase.auth.getSession();

            if (authData.data?.session?.user) {
                 // fetch user profile
                const supabaseUser = authData.data.session.user; // user stored in auth.user table
                const { data, error } = await supabase.from('users').select().eq('email', supabaseUser.email)
                
                if (Array.isArray(data) && data.length === 0) {
                    // user is not in our public.users table. sign out + notify
                    const { error } = await supabase.auth.signOut();

                    setMessage("Unverified account. Please contact it@stuysu.org for help.")
                    return;
                }

                const user = data; // user in our own user table

                setMessage(`Signed in with ${supabaseUser.email}!`)
            }
        }

        getUser()
    }, [])

    return (
        <UserContext.Provider value={value}>
            {children}
            <Snackbar
                open={message.length > 0}
                autoHideDuration={3000}
                onClose={() => setMessage("")}
                message={message}
            />
        </UserContext.Provider>
    )
}

export default UserProvider