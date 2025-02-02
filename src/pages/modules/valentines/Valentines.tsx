import { Box, Typography } from "@mui/material";
import ValentineDisplay from "./comps/ValentineDisplay";
import { useContext, useEffect, useState } from "react";
import { Valentine } from "./ValentineType";
import { supabase } from "../../../supabaseClient";
import UserContext from "../../../comps/context/UserContext";
import { enqueueSnackbar } from "notistack";
import AsyncButton from "../../../comps/ui/AsyncButton";
import { useNavigate } from "react-router-dom";

const Valentines = () => {
    const user = useContext(UserContext);
    const [loads, setLoads] = useState(0);
    const [valentines, setValentines] = useState<Valentine[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
        const f = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("id,sender,receiver,show_sender,message,background")
                .eq("sender", user.id)
                .returns<Valentine[]>();
            if (error) {
                enqueueSnackbar("Failed to load Valentines", {
                    variant: "error",
                });
                return;
            }
            setValentines(data);
        };
        f();
    }, [loads]);
    return (
        <>
            <Typography variant="h2">
                {valentines.length} Valentines Queued
            </Typography>
            {valentines.map((valentine) => (
                <Box
                    key={valentine.message}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100vw",
                    }}
                >
                    <ValentineDisplay
                        valentine={valentine}
                        mini
                        refresh={() => setLoads((load) => ++load)}
                    />
                </Box>
            ))}
            <AsyncButton onClick={() => navigate("create")}>New</AsyncButton>
        </>
    );
};

export default Valentines;
