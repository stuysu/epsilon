import React, { useContext, useEffect, useState } from "react";
import { Valentine } from "../../../valentines/ValentineType";
import { supabase } from "../../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import UserContext from "../../../../contexts/UserContext";
import Loading from "../../../../components/ui/content/Loading";
import ValentineDisplay from "../../../valentines/components/ValentineDisplay";
import { Box } from "@mui/material";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";

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
                paddingBottom: "10vh",
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
                <ContentUnavailable
                    icon="bx-heart"
                    iconColor="text-red"
                    title="No New Messages"
                    description="No messages pending approval."
                />
            )}
        </Box>
    );
};
export default Valentines;
