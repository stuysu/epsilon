import AsyncButton from "../../components/ui/buttons/AsyncButton";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import {
    Box,
    Checkbox,
    Divider,
    FormControlLabel,
    TextField,
    Typography,
} from "@mui/material";
import UserContext from "../../contexts/UserContext";
import ValentineDisplay from "./components/ValentineDisplay";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/Loading";

// from https://catppuccin.com/palette
const colors = [
    "#ffffff",
    "#f4b8e4",
    "#e78284",
    "#f5a97f",
    "#e5c890",
    "#a6d189",
    "#99d1db",
    "#7dc4e4",
    "#ca9ee6",
];

const Create = () => {
    const user = useContext(UserContext);
    const [loading, setLoading] = useState(false);
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [receiver, setReceiver] = useState(0);
    const [receiverEmail, setReceiverEmail] = useState("");
    const [lastChecked, setLastChecked] = useState("");
    const [message, setMessage] = useState("");
    const [background, setBackground] = useState("#ffffff");
    const [showSender, setShowSender] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const f = async () => {
            const { data, error } = await supabase
                .from("settings")
                .select("setting_value")
                .eq("name", "valentines_deadline")
                .single();
            if (error || !data) {
                enqueueSnackbar("Failed to fetch Valentines date.", {
                    variant: "error",
                });
                return;
            }
            const deadline = new Date(data.setting_value * 1000);
            if (deadline < new Date())
                enqueueSnackbar("Valentines submissions are past due.", {
                    variant: "error",
                });
            setDeadline(new Date(data.setting_value * 1000));
        };
        f();
    }, []);
    if (!deadline) {
        return <Loading />;
    }

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    width: "80%",
                    justifyContent: "center",
                }}
            >
                <TextField
                    content={receiverEmail}
                    onChange={(e) => setReceiverEmail(e.target.value)}
                    sx={{
                        marginRight: "2rem",
                    }}
                    label="Recipient Email"
                />
                <AsyncButton
                    onClick={() => {
                        setLoading(true);
                        const f = async () => {
                            const { data, error } = await supabase
                                .from("users")
                                .select("id")
                                .eq("email", receiverEmail.trim().toLowerCase())
                                .maybeSingle();
                            setLoading(false);
                            if (error || !data) {
                                enqueueSnackbar("User not found.", {
                                    variant: "error",
                                });
                                return;
                            }
                            setLastChecked(receiverEmail);
                            setReceiver(data.id);
                            enqueueSnackbar("Found user!", {
                                variant: "success",
                            });
                        };
                        f();
                    }}
                    disabled={
                        loading ||
                        !receiverEmail ||
                        receiverEmail.indexOf("@") === -1
                    }
                >
                    Select Recipient
                </AsyncButton>
            </Box>
            <TextField
                content={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                    width: "80%",
                    marginTop: "1rem",
                    marginBottom: ".5rem",
                }}
                fullWidth
                autoFocus
                multiline
                label="Message"
            />
            <Typography variant="body2">
                All messages are monitored for abuse. User identities may be
                disclosed.
            </Typography>
            <Box
                sx={{
                    width: "70%",
                    display: "flex",
                    marginTop: "1rem",
                    justifyContent: "center",
                }}
            >
                {colors.map((color) => (
                    <Box
                        key={color}
                        sx={{
                            width: "2em",
                            height: "2em",
                            margin: ".5em",
                            borderRadius: "2em",
                            cursor: "pointer",
                            backgroundColor: color,
                            color: "black",
                            alignContent: "center",
                            borderColor: "#ffffff",
                            borderWidth: background === color ? "4px" : 0,
                        }}
                        onClick={() => setBackground(color)}
                    />
                ))}
            </Box>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={showSender}
                        onChange={(e) => {
                            setShowSender(e.target.checked);
                        }}
                    />
                }
                label="Signature at Bottom"
            />
            <Box sx={{ margin: "1rem 0", width: "80vw" }}>
                <Divider />
            </Box>
            <Typography variant="h5" sx={{ marginBottom: "1rem" }}>
                Preview
            </Typography>
            <ValentineDisplay
                valentine={{
                    id: 0,
                    sender: user.id,
                    receiver,
                    show_sender: showSender,
                    message,
                    background,
                }}
            />
            <Box sx={{ margin: "1rem 0", width: "80vw" }}>
                <Divider />
            </Box>
            <AsyncButton
                onClick={async () => {
                    setLoading(true);
                    const f = async () => {
                        const { error } = await supabase
                            .from("valentinesmessages")
                            .insert({
                                // might be funny to let people send messages to themselves
                                sender: user.id,
                                receiver,
                                message,
                                background,
                                show_sender: showSender,
                            });
                        setLoading(false);
                        if (error) {
                            enqueueSnackbar(
                                `Failed to upload! Error: \`${error.message}\``,
                                {
                                    variant: "error",
                                },
                            );
                            return;
                        }
                        enqueueSnackbar("Sent Valentine!", {
                            variant: "success",
                        });
                        navigate("..");
                    };
                    await f();
                }}
                disabled={
                    loading ||
                    !receiver ||
                    !message ||
                    !deadline ||
                    deadline < new Date()
                }
            >
                Send to {lastChecked || "Unknown"}
            </AsyncButton>
        </>
    );
};

export default Create;
