import { useContext, useEffect, useState } from "react";
import { Valentine } from "../modules/valentines/ValentineType";
import { supabase } from "../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import UserContext from "../../comps/context/UserContext";
import Loading from "../../comps/ui/Loading";
import ValentineDisplay from "../modules/valentines/comps/ValentineDisplay";
import { Box, Typography } from "@mui/material";

const Valentines = () => {
    const [valentines, setValentines] = useState<Valentine[]>([]);
    const [loading, setLoading] = useState(true);
    const [refresher, setRefresher] = useState(0);
    const user = useContext(UserContext);
    useEffect(() => {
        const f = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("id,message,background")
                .is("verified_by", null)
                .is("verified_at", null)
                // don't spoil surprises!
                .neq("receiver", user.id)
                .returns<Valentine[]>();
            if (error || !data) {
                enqueueSnackbar("Error fetching valentines messages.", {
                    variant: "error",
                });
                setLoading(false);
                return;
            }
            setValentines(
                data.map((entry) => {
                    return {
                        ...entry,
                        sender: 0,
                        receiver: 0,
                        show_sender: false,
                    };
                }),
            );
            setLoading(false);
        };
        f();
    }, [refresher, user.id]);
    if (loading) return <Loading />;
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {valentines.length > 0 ? (
                valentines.map((v) => (
                    <ValentineDisplay
                        key={v.id}
                        valentine={v}
                        refresh={() => setRefresher((prev) => prev + 1)}
                        admin
                        mini
                    />
                ))
            ) : (
                <Typography
                    sx={{
                        marginTop: "2rem",
                    }}
                    variant="h4"
                >
                    No valentines found &lt;3
                </Typography>
            )}
        </Box>
    );
};
export default Valentines;
