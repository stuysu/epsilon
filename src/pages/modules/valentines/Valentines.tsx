import AsyncButton from "../../../comps/ui/AsyncButton";
import { useContext, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import {
    Box,
    Checkbox,
    FormControlLabel,
    InputBase,
    TextField,
    Typography,
} from "@mui/material";
import UserContext from "../../../comps/context/UserContext";
import { Valentine } from "./ValentineType";
import ValentineDisplay from "./comps/ValentineDisplay";

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

const Valentines = () => {
    const user = useContext(UserContext);
    const [valentines, setValentines] = useState<Valentine[]>([]);
    const [receiver, setReceiver] = useState(0);
    const [message, setMessage] = useState("");
    const [background, setBackground] = useState("#ffffff");
    const [showSender, setShowSender] = useState(false);

    return (
        <Box
            sx={{
                marginTop: "2rem",
                width: "100%",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
            }}
        >
            <Typography variant="h2">Valentines</Typography>

            <TextField
                content={message}
                onChange={(e) => setMessage(e.target.value)}
                sx={{
                    width: "80%",
                }}
                fullWidth
                autoFocus
                multiline
                label="Message"
            />
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
            <Typography variant="body2">
                All messages are monitored for abuse. User identities may be
                disclosed.
            </Typography>
            <p>
                receiver
                <InputBase
                    placeholder="receiver"
                    value={receiver}
                    onChange={(e) => {
                        let a = parseInt(e.target.value);
                        if (isNaN(a) || a < 0) {
                            a = 0;
                        }
                        setReceiver(a);
                    }}
                />
            </p>
            <AsyncButton
                onClick={async () => {
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
                    if (error) {
                        enqueueSnackbar(
                            `Failed to upload! Error: \`${error.message}\``,
                            {
                                variant: "error",
                            },
                        );
                        return;
                    }
                    enqueueSnackbar("Uploaded!", { variant: "success" });
                }}
            >
                upload valentine
            </AsyncButton>

            <h2>fetched valentines ({valentines.length})</h2>
            {valentines.map((valentine) => (
                <Box
                    key={valentine.message}
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "100vw",
                    }}
                >
                    <ValentineDisplay valentine={valentine} mini />
                </Box>
            ))}
        </Box>
    );
};

export default Valentines;

/*            <AsyncButton
                onClick={async () => {
                    const { data: settings, error: settingError } =
                        await supabase
                            .from("settings")
                            .select("setting_value")
                            .eq("name", "valentines_deadline")
                            .maybeSingle();
                    if (settingError || !settings) {
                        enqueueSnackbar("Failed to fetch Valentines times!", {
                            variant: "error",
                        });
                        return;
                    }
                    if (new Date() < new Date(settings.setting_value * 1000)) {
                        enqueueSnackbar("Valentines are not released yet.");
                        return;
                    }

                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .select(
                            "id,sender,receiver,show_sender,message,background",
                        )
                        .eq("receiver", user.id)
                        .not("verified_by", "is", null)
                        .not("verified_at", "is", null)
                        .returns<Valentine[]>();
                    if (error) {
                        enqueueSnackbar("Failed to load Valentines", {
                            variant: "error",
                        });
                        return;
                    }
                    setValentines(data);
                }}
            >
                fetch all RX'd valentines (should only work after the set date)
            </AsyncButton>*/
