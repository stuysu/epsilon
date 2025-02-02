import { Valentine } from "../ValentineType";
import { Box, Card, TextField, Typography } from "@mui/material";
import AsyncButton from "../../../../comps/ui/AsyncButton";
import { supabase } from "../../../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";

interface ValentineInput {
    valentine: Valentine;
    admin?: boolean;
    refresh?: Function;
}
interface ValentineAdmin extends ValentineInput {
    mini?: boolean;
}

const ValentineCard = ({ valentine, admin, refresh }: ValentineInput) => {
    const [sender, setSender] = useState<string>("");
    useEffect(() => {
        const f = async () => {
            if (valentine.show_sender) {
                const { data, error } = await supabase
                    .from("users")
                    .select("first_name,last_name,email")
                    .eq("id", valentine.sender)
                    .single();
                if (error)
                    enqueueSnackbar("Failed to fetch sender info.", {
                        variant: "error",
                    });
                else
                    setSender(
                        `\n\n-------\n${data.first_name} ${data.last_name}\n${data.email}`,
                    );
            }
        };
        f();
    }, [valentine.show_sender]);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            {/* backup background */}
            <Box sx={{ backgroundColor: "white" }}>
                <Box
                    sx={{
                        color: "black",
                        backgroundColor: valentine.background,
                        width: "20em",
                        height: "30em",
                        padding: "1rem",
                        overflowY: "scroll",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    <p>{valentine.message + sender}</p>
                </Box>
            </Box>
            {admin && <AdminButtons valentine={valentine} refresh={refresh} />}
        </Box>
    );
};

const ValentineList = ({ valentine }: ValentineInput) => {
    return (
        <Card>
            <Typography
                sx={{
                    textOverflow: "ellipsis",
                }}
            >
                {valentine.message}
            </Typography>
        </Card>
    );
};

const AdminButton = ({
    valentine,
    mode,
    reason,
    refresh,
}: {
    valentine: Valentine;
    mode: "approve" | "reject";
    reason?: string;
    refresh?: Function;
}) => (
    <AsyncButton
        onClick={async () => {
            const { error } = await supabase.functions.invoke(
                `valentines_${mode}`,
                { body: { message_id: valentine.id, reason } },
            );
            if (error) {
                const errorMessage = await error.context.text();
                enqueueSnackbar(`${errorMessage}`, { variant: "error" });
                return;
            }
            // add an `e` to reject(e)d
            enqueueSnackbar(`Valentine ${mode.padEnd(7, "e")}d!`, {
                variant: "success",
            });
            if (refresh) refresh();
        }}
    >
        {mode[0].toUpperCase() + mode.slice(1)}
    </AsyncButton>
);

const AdminButtons = ({ valentine, mini, refresh }: ValentineAdmin) => {
    const [reason, setReason] = useState<string>("");
    return (
        <Box
            sx={{
                display: "flex",
                paddingTop: mini ? 0 : "2rem",
                paddingBottom: mini ? 0 : "2rem",
                width: mini ? undefined : "50vw",
                justifyContent: "space-between",
            }}
        >
            {mini ? (
                <></>
            ) : (
                <TextField
                    label="Rejection Reason (optional)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />
            )}
            <AdminButton
                valentine={valentine}
                refresh={refresh}
                mode="approve"
            />
            <AdminButton
                valentine={valentine}
                refresh={refresh}
                mode="reject"
                reason={reason}
            />
        </Box>
    );
};

const ValentineDisplay = ({
    valentine,
    admin,
    mini,
    refresh,
}: ValentineAdmin) => {
    if (mini)
        return (
            <ValentineList
                valentine={valentine}
                admin={admin}
                refresh={refresh}
            />
        );
    return (
        <ValentineCard valentine={valentine} refresh={refresh} admin={admin} />
    );
};

export default ValentineDisplay;
