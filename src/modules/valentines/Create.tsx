import AsyncButton from "../../components/ui/buttons/AsyncButton";
import { useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import UserContext from "../../contexts/UserContext";
import ValentineDisplay from "./components/ValentineDisplay";
import { useNavigate } from "react-router-dom";
import Loading from "../../components/ui/content/Loading";
import CheckboxField from "../../components/ui/input/CheckboxField";
import TextField from "../../components/ui/input/TextField";

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
            <div className="flex w-[80%] justify-center">
                <TextField
                    value={receiverEmail}
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
            </div>
            <TextField
                value={message}
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
            <p className="text-[0.875rem] leading-[1.43]">
                All messages are monitored for abuse. User identities may be
                disclosed.
            </p>
            <div className="w-[70%] flex flex-wrap mt-4 justify-center">
                {colors.map((color) => (
                    <button
                        type="button"
                        key={color}
                        aria-label={`Background ${color}`}
                        aria-pressed={background === color}
                        className="shrink-0 w-[2em] h-[2em] m-[.5em] rounded-[2em] cursor-pointer text-black content-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        style={{
                            backgroundColor: color,
                            borderColor: "#ffffff",
                            borderWidth: background === color ? "4px" : 0,
                        }}
                        onClick={() => setBackground(color)}
                    />
                ))}
            </div>
            <CheckboxField
                checked={showSender}
                onChange={setShowSender}
                label="Signature at Bottom"
            />
            <div className="my-4 w-[80vw]">
                <hr className="border-divider" />
            </div>
            <h4>Preview</h4>
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
            <div className="my-4 w-[80vw]">
                <hr className="border-divider" />
            </div>
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
