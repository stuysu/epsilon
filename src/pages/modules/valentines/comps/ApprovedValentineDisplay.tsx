import { Valentine } from "../ValentineType";
import { Box, Card, Divider, TextField, Typography } from "@mui/material";
import AsyncButton from "../../../../comps/ui/AsyncButton";
import { supabase } from "../../../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import UserContext from "../../../../comps/context/UserContext";

interface ValentineInput {
    valentine: Valentine;
    admin?: boolean;
    refresh?: Function;
    mini?: boolean;
}

interface ValentineDisplayInput extends ValentineInput {
    toggle?: Function;
}

const ApprovedValentineList = ({
    valentine,
    admin,
    toggle,
}: ValentineDisplayInput) => {
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

            <ApproveButtons
                valentine={valentine}
                admin={admin}
                mini
                toggle={toggle}
            />
        </Card>
    );
};

const ApprovedValentineCard = ({
    valentine,
    admin,
    toggle,
}: ValentineDisplayInput) => {
    const user = useContext(UserContext);
    const isSender = valentine.id > 0 && user.id === valentine.sender;
    const [sender, setSender] = useState<string>("");
    const [receiver, setReceiver] = useState<string>("");
    useEffect(() => {
        const f = async () => {
            if (isSender) {
                const { data, error } = await supabase
                    .from("users")
                    .select("email")
                    .eq("id", valentine.receiver)
                    .single();
                if (error || !data.email)
                    enqueueSnackbar("Failed to fetch recipient email.", {
                        variant: "error",
                    });
                else setReceiver(data.email);
            }
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
                        `${data.first_name} ${data.last_name}\n${data.email}`,
                    );
            } else {
                setSender("");
            }
        };
        f();
    }, [isSender, valentine.show_sender, valentine.sender, valentine.receiver]);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            {receiver && (
                <p style={{ paddingBottom: ".5rem" }}> To {receiver} </p>
            )}
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
                    <p>{valentine.message}</p>
                    {sender && (
                        <>
                            <p>{"\n"}</p>
                            <Divider
                                sx={{ color: "black", marginBottom: ".75rem" }}
                            />
                            <p style={{ fontStyle: "italic" }}>{sender}</p>
                        </>
                    )}
                </Box>
            </Box>
            <ApproveButtons
                valentine={valentine}
                admin={admin}
                toggle={toggle}
            />
        </Box>
    );
};

const ApproveButtons = ({
    valentine,
    admin,
    mini,
    toggle,
}: ValentineDisplayInput) => {
    const user = useContext(UserContext);
    const isSender = valentine.id > 0 && user.id === valentine.sender;
    return (
        <Box
            sx={{
                display: "flex",
                paddingTop: mini ? 0 : "1.25rem",
                // paddingRight: mini && admin ? "1rem" : 0,
                // paddingBottom: mini ? 0 : "2rem",
                width: mini ? undefined : isSender ? "42rem" : "35rem",
                justifyContent: admin || isSender ? "space-between" : "center",
            }}
        >
            {toggle && (
                <AsyncButton onClick={() => toggle()}>
                    {mini ? "Open" : "Close"}
                </AsyncButton>
            )}
        </Box>
    );
};

const ApprovedValentineDisplay = ({
    valentine,
    admin,
    mini,
}: ValentineInput) => {
    const [miniState, setMiniState] = useState<boolean>(mini || false);
    if (miniState)
        return (
            <ApprovedValentineList
                valentine={valentine}
                admin={admin}
                toggle={() => setMiniState(false)}
            />
        );
    return (
        <ApprovedValentineCard
            valentine={valentine}
            admin={admin}
            toggle={() => setMiniState(true)}
        />
    );
};

export default ApprovedValentineDisplay;
