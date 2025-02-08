import { Box, Typography, Divider } from "@mui/material";
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
    const [sentValentines, setSentValentines] = useState<Valentine[]>([]);
    const [receivedValentines, setReceivedValentines] = useState<Valentine[]>([]);
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
            setSentValentines(data);
        };
        f();
    }, [loads, user.id]);
    return (
        <>
            <Typography variant="h2">
                {sentValentines.length} Valentines Queued
            </Typography>
            {sentValentines.map((valentine) => (
                <Box
                    key={valentine.id}
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
            <Box sx={{ margin: "1rem 0", width: "80vw" }}>
                <Divider />
            </Box>
           <AsyncButton
                onClick={async () => {
                    const { data: settings, error: settingError } =
                        await supabase
                            .from("settings")
                            .select("setting_value")
                            .eq("name", "valentines_deadline")
                            .maybeSingle();
                    if (settingError || !settings) {
                        enqueueSnackbar("Failed to fetch Valentines times!", {
                            variant: "error",
                        });
                        return;
                    }
                    const testDate = new Date("2025-02-14T00:00:00");
                    if (testDate < new Date(settings.setting_value * 1000)) {
                        enqueueSnackbar("Valentines are not released yet.");
                        return;
                    }
console.log("fetching valentines");
                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .select(
                            "id,sender,receiver,show_sender,message,background,verified_by,verified_at",
                        )
                        .eq("receiver", user.id)
                        .not("verified_by", "is", null)
                        .not("verified_at", "is", null)
                        .returns<Valentine[]>();
                    if (error) {
                        console.error("Error fetching verified messages:", error);
                        enqueueSnackbar("Failed to load Valentines", {
                            variant: "error",
                        });
                        return;
                    }
                    setReceivedValentines(data);
                }}
            >
                Fetch Valentines
            </AsyncButton>

            {receivedValentines.length > 0 && (
  <Box sx={{ marginTop: "1rem" }}>
    {receivedValentines.map((valentine) => (
      <ValentineDisplay 
         key={valentine.id} 
         valentine={valentine} 
         mini 
         refresh={() => setLoads((load) => ++load)} 
      />
    ))}
  </Box>
)}
        </>
    );
};

export default Valentines;
