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
    toggle?: Function;
}
interface ValentineAdmin extends ValentineInput {
    mini?: boolean;
}

const ValentineCard = ({
    valentine,
    admin,
    refresh,
    toggle,
}: ValentineInput) => {
    const [sender, setSender] = useState<string>("\n\n-------\nAnonymous");
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
            <Buttons
                valentine={valentine}
                refresh={refresh}
                admin={admin}
                toggle={toggle}
            />
        </Box>
    );
};

const ValentineList = ({
    valentine,
    admin,
    refresh,
    toggle,
}: ValentineInput) => {
    return (
        <Card
            sx={{
                display: "flex",
                width: "90vw",
                height: "4rem",
                margin: "1rem",
                padding: "1rem",
                textOverflow: "ellipsis",
                overflow: "hidden",
                justifyContent: "space-between",
            }}
        >
            <Typography
                sx={{
                    width: "60%",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    alignContent: "center",
                }}
            >
                {valentine.message}
            </Typography>

            <Buttons
                valentine={valentine}
                refresh={refresh}
                admin={admin}
                toggle={toggle}
                mini
            />
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

const Buttons = ({
    valentine,
    admin,
    mini,
    refresh,
    toggle,
}: ValentineAdmin) => {
    const [reason, setReason] = useState<string>("");
    console.log("meow");
    return (
        <Box
            sx={{
                display: "flex",
                paddingTop: mini ? 0 : "1.25rem",
                paddingRight: mini && admin ? "1.5rem" : 0,
                paddingBottom: mini ? 0 : "2rem",
                width: mini ? undefined : "35rem",
                justifyContent: admin ? "space-between" : "center",
            }}
        >
            {toggle && (
                <AsyncButton onClick={() => toggle()}>
                    {mini ? "Open" : "Close"}
                </AsyncButton>
            )}
            {admin && (
                <>
                    {mini ? (
                        <Box sx={{ marginLeft: "5%" }} />
                    ) : (
                        <>
                            <TextField
                                label="Rejection Reason (optional)"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </>
                    )}
                    <AdminButton
                        valentine={valentine}
                        refresh={refresh}
                        mode="approve"
                    />
                    {mini && <Box sx={{ marginLeft: "5%" }} />}
                    <AdminButton
                        valentine={valentine}
                        refresh={refresh}
                        mode="reject"
                        reason={reason}
                    />
                </>
            )}
        </Box>
    );
};

const ValentineDisplay = ({
    valentine,
    admin,
    mini,
    refresh,
}: ValentineAdmin) => {
    const [miniState, setMiniState] = useState<boolean>(mini || false);
    if (miniState)
        return (
            <ValentineList
                valentine={valentine}
                admin={admin}
                refresh={refresh}
                toggle={() => setMiniState(false)}
            />
        );
    return (
        <ValentineCard
            valentine={valentine}
            refresh={refresh}
            admin={admin}
            toggle={() => setMiniState(true)}
        />
    );
};

export default ValentineDisplay;
