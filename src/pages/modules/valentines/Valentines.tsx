import AsyncButton from "../../../comps/ui/AsyncButton";
import { useContext, useState } from "react";
import { supabase } from "../../../supabaseClient";
import { enqueueSnackbar } from "notistack";
import { Input, InputBase } from "@mui/material";
import UserContext from "../../../comps/context/UserContext";
import { Valentine } from "./ValentineType";
import ValentineDisplay from "./comps/ValentineDisplay";

const RejectionMenu = ({ valentine }: { valentine: Valentine }) => {
    const [reason, setReason] = useState<string>("");
    return (
        <>
            <InputBase
                placeholder="reject reason"
                value={reason}
                onChange={(e) => {
                    setReason(e.target.value);
                }}
            />
            <AsyncButton
                onClick={async () => {
                    const { error } = await supabase.functions.invoke(
                        "valentines_reject",
                        { body: { message_id: valentine.id, reason } },
                    );
                    if (error) {
                        const errorMessage = await error.context.text();
                        enqueueSnackbar(`${errorMessage}`, {
                            variant: "error",
                        });
                        return;
                    }
                    enqueueSnackbar("Rejected Valentine! Please refetch...", {
                        variant: "success",
                    });
                }}
            >
                reject
            </AsyncButton>
        </>
    );
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
            <AsyncButton
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
            </AsyncButton>
            <AsyncButton
                onClick={async () => {
                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .select(
                            "id,sender,receiver,show_sender,message,background",
                        )
                        .is("verified_by", null)
                        .is("verified_at", null)
                        // don't spoil surprises!
                        .neq("receiver", user.id)
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
                fetch all valentines in moderation queue (need to be admin user
                or else will only see your own drafts)
            </AsyncButton>

            <h2>fetched valentines ({valentines.length})</h2>
            {valentines.map((valentine) => (
                <>
                    <ValentineDisplay valentine={valentine} admin />
                    <AsyncButton
                        onClick={async () => {
                            const { error } = await supabase.functions.invoke(
                                "valentines_approve",
                                { body: { message_id: valentine.id } },
                            );
                            if (error) {
                                const errorMessage = await error.context.text();
                                enqueueSnackbar(
                                    `Failed to approve Valentine! ${errorMessage}`,
                                    { variant: "error" },
                                );
                                return;
                            }
                            enqueueSnackbar(
                                "Approved Valentine! Please refetch...",
                                { variant: "success" },
                            );
                        }}
                    >
                        approve??
                    </AsyncButton>
                    <RejectionMenu valentine={valentine} />
                </>
            ))}
        </>
    );
};

export default Valentines;
