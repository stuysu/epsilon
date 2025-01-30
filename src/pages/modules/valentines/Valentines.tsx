import AsyncButton from "../../../comps/ui/AsyncButton";
import { useContext, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import { Input, InputBase } from "@mui/material";
import UserContext from "../../../comps/context/UserContext";

type Valentine = {
    [key: string]: any;
    id: number;
    sender: number;
    receiver: number;
    show_sender: boolean;

    message: string;
    background: string;
};
const Valentines = () => {
    const user = useContext(UserContext);
    const [valentines, setValentines] = useState<Valentine[]>([]);
    const [receiver, setReceiver] = useState(0);
    const [message, setMessage] = useState("");
    const [background, setBackground] = useState("");
    const [showSender, setShowSender] = useState(false);

    return (
        <>
            <h1>Valentines Testing</h1>
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
            <p>
                message
                <InputBase
                    value={message}
                    onChange={(e) => {
                        setMessage(e.target.value);
                    }}
                />
            </p>
            <p>
                background
                <InputBase
                    value={background}
                    onChange={(e) => {
                        setBackground(e.target.value);
                    }}
                />
            </p>
            <p>
                showSender
                <Input
                    type="checkbox"
                    value={showSender}
                    onChange={(_) => {
                        setShowSender(!showSender);
                    }}
                />
            </p>
            <AsyncButton
                onClick={async () => {
                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .insert({
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
            <AsyncButton
                onClick={async () => {
                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .select(
                            "id,sender,receiver,show_sender,message,background",
                        )
                        .returns<Valentine[]>();
                    if (error) {
                        enqueueSnackbar("Failed to load Valentines", {
                            variant: "error",
                        });
                        return;
                    }
                    console.log(data);
                    setValentines(data);
                }}
            >
                fetch all visible valentines
            </AsyncButton>
            <h2>fetched valentines ({valentines.length})</h2>
            {valentines.map((valentine) =>
                [
                    "id",
                    "sender",
                    "receiver",
                    "show_sender",
                    "message",
                    "background",
                ].map((key: string) => (
                    <p>
                        {key}: {valentine[key]}
                    </p>
                )),
            )}
        </>
    );
};

export default Valentines;
