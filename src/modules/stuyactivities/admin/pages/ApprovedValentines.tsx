import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { Valentine } from "../../../valentines/ValentineType";
import { enqueueSnackbar } from "notistack";
import ValentineDisplay from "../../../valentines/components/ValentineDisplay";
import Loading from "../../../../components/ui/content/Loading";

const ApprovedValentines = () => {
    const [approvedMessages, setApprovedMessages] = useState<Valentine[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("sender,receiver,message,background")
                .not("verified_at", "is", null)
                .not("verified_by", "is", null)
                .returns<Valentine[]>();
            setLoading(false);
            if (error || !data) {
                enqueueSnackbar("Error fetching valentines messages.", {
                    variant: "error",
                });
                return;
            }
            setApprovedMessages(
                data.map((entry) => {
                    return {
                        ...entry,
                        sender: 0,
                        receiver: 0,
                        show_sender: false,
                    };
                }),
            );
        };
        fetchMessages();
    }, []);

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
            {approvedMessages.length > 0 ? (
                approvedMessages.map((v) => (
                    <ValentineDisplay key={v.id} valentine={v} admin mini />
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

export default ApprovedValentines;
