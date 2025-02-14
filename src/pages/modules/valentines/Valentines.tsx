import { Box, Divider, Typography } from "@mui/material";
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
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [sentValentines, setSentValentines] = useState<Valentine[]>([]);
    const [receivedValentines, setReceivedValentines] = useState<Valentine[]>(
        [],
    );
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
    useEffect(() => {
        const f = async () => {
            const { data: settings, error: settingError } = await supabase
                .from("settings")
                .select("setting_value")
                .eq("name", "valentines_deadline")
                .single();
            if (settingError || !settings) {
                enqueueSnackbar("Failed to fetch Valentines times!", {
                    variant: "error",
                });
                return;
            }
            const deadline = new Date(settings.setting_value * 1000);
            const currentDate = new Date();
            setDeadline(deadline);
            if (currentDate < deadline) return;

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
                console.error("Error fetching received messages:", error);
                enqueueSnackbar("Failed to load Valentines", {
                    variant: "error",
                });
                return;
            }
            setReceivedValentines(data);
        };
        f();
    }, []);
    return (
        <>
            {receivedValentines.length > 0 && (
                <>
                    <Typography variant="h2">
                        {`${receivedValentines.length} Valentine${receivedValentines.length === 1 ? "" : "s"} Received`}
                    </Typography>
                    <Box sx={{ marginTop: "1rem" }}>
                        {receivedValentines.map((valentine) => (
                            <ValentineDisplay
                                key={valentine.id}
                                valentine={valentine}
                                mini
                            />
                        ))}
                    </Box>
                    <Box sx={{ margin: "1rem 0", width: "80vw" }}>
                        <Divider />
                    </Box>
                </>
            )}
            <Typography variant="h2">
                {`${sentValentines.length} Valentine${sentValentines.length === 1 ? "" : "s"} Sent`}
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
                        refresh={
                            deadline && deadline > new Date()
                                ? () => setLoads((load) => ++load)
                                : undefined
                        }
                    />
                </Box>
            ))}
            {deadline && deadline > new Date() && (
                <AsyncButton onClick={() => navigate("create")}>
                    New
                </AsyncButton>
            )}
        </>
    );
};

export default Valentines;
