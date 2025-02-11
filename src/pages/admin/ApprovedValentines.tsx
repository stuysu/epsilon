import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { Valentine } from "../modules/valentines/ValentineType";
import { enqueueSnackbar } from "notistack";
import ValentineDisplay from "../modules/valentines/comps/ValentineDisplay";
import ApprovedValentineDisplay from "../modules/valentines/comps/ApprovedValentineDisplay";

const ApprovedValentines = () => {
    const [approvedMessages, setApprovedMessages] = useState<Valentine[]>([]);

    useEffect(() => {
        const fetchMessages = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("sender,receiver,message,background")
                .not("verified_at", "is", null)
                .not("verified_by", "is", null)
                .returns<Valentine[]>();
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
                        id: 0,
                        show_sender: false,
                    };
                }),
            );
        };
        fetchMessages();
    }, []);

    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {approvedMessages.length > 0 ? (
                approvedMessages.map((v) => (
                    <ApprovedValentineDisplay
                        key={v.id}
                        valentine={v}
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

export default ApprovedValentines;
