import React from "react"
import { Button } from "@mui/material"
import { supabase } from "../../supabaseClient"

const GoogleLogin = () => {
    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        })
    }

    return (
        <Button onClick={handleLogin}>
            Login with Google
        </Button>
    )
}

export default GoogleLogin