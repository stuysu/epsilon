import { Box, Typography } from "@mui/material";
import React, { useContext, useEffect, useState } from "react";
import UserContext from "../comps/context/UserContext";
import { supabase } from "../supabaseClient";


const Profiles = () => {
    const user = useContext(UserContext);
    const [fourDigitId, setFourDigitId] = useState<Number | null>(null);

    useEffect(() => {
        const fetchID = async () => {
            const { data, error } = await supabase
                .from("fourdigitids")
                .select("value")
                .maybeSingle();
            if (error) console.log(error);
            else if (data) setFourDigitId(data.value as Number);
        };
        fetchID();
    }, [user]);

    return (
        <Box sx={{ padding: "40px" }}>
            <Typography variant={"body1"}>My Epsilon Profile</Typography>

            <Typography variant={"h1"} marginBottom={5}>{user.first_name + " " + user.last_name}</Typography>

            <Typography width="100%">
                Grade: {user.grade + "th" || "No Grade"}
            </Typography>

            <div className={
                "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
            }></div>

            <Typography width="100%">
                {user.email || "No Email"}
            </Typography>

            <div className={
                "bg-neutral-600 w-full h-px mb-1.5 mt-1 opacity-50"
            }></div>

            {fourDigitId && (
                <Typography width="100%" marginBottom={5}>
                    ID:{" "}
                    {String(fourDigitId).padStart(
                        4,
                        "0",
                    )}
                </Typography>
            )}

            <Typography width="100%">
                Stay tuned for a brand new profile!
            </Typography>
        </Box>
    );
};

export default Profiles;
