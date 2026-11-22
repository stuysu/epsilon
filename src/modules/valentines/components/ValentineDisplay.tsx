import { Valentine } from "../ValentineType";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import { supabase } from "../../../lib/supabaseClient";
import { enqueueSnackbar } from "notistack";
import { useContext, useEffect, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import TextField from "../../../components/ui/input/TextField";
import { functionErrorText } from "../../../utils/FunctionErrors";

interface ValentineInput {
    valentine: Valentine;
    admin?: boolean;
    refresh?: () => void;
    mini?: boolean;
}

interface ValentineDisplayInput extends ValentineInput {
    toggle?: () => void;
}

const ValentineCard = ({
    valentine,
    admin,
    refresh,
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
        <div className="flex items-center flex-col">
            {receiver && (
                <p style={{ paddingBottom: ".5rem" }}> To {receiver} </p>
            )}
            {/* backup background */}
            <div className="bg-white">
                <div
                    className="text-black rounded-[1rem] m-2 w-[20em] h-[30em] p-4 overflow-y-scroll whitespace-pre-wrap"
                    style={{ backgroundColor: valentine.background }}
                >
                    <p className={"text-black"}>{valentine.message}</p>
                    {sender && (
                        <>
                            <p>{"\n"}</p>
                            <hr className="mb-3 border-divider" />
                            <p style={{ fontStyle: "italic" }}>{sender}</p>
                        </>
                    )}
                </div>
            </div>
            <Buttons
                valentine={valentine}
                refresh={refresh}
                admin={admin}
                toggle={toggle}
            />
        </div>
    );
};

const ValentineList = ({
    valentine,
    admin,
    refresh,
    toggle,
}: ValentineDisplayInput) => {
    return (
        <article className={"bg-layer-1 rounded-lg p-4 mb-3"}>
            <p>{valentine.message}</p>
            <Buttons
                valentine={valentine}
                refresh={refresh}
                admin={admin}
                toggle={toggle}
                mini
            />
        </article>
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
    refresh?: () => void;
}) => (
    <AsyncButton
        onClick={async () => {
            const { error } = await supabase.functions.invoke(
                `valentines_${mode}`,
                { body: { message_id: valentine.id, reason } },
            );
            if (error) {
                const errorMessage =
                    (await functionErrorText(error)) ||
                    `Could not ${mode} valentine.`;
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
}: ValentineDisplayInput) => {
    const [reason, setReason] = useState<string>("");
    const user = useContext(UserContext);
    const isSender = valentine.id > 0 && user.id === valentine.sender;
    return (
        <div
            className="flex"
            style={{
                paddingTop: mini ? 0 : "1.25rem",
                width: mini ? undefined : isSender ? "42rem" : "35rem",
                justifyContent:
                    refresh && (admin || isSender) ? "space-between" : "center",
            }}
        >
            {toggle && (
                <AsyncButton onClick={() => toggle()}>
                    {mini ? "Open" : "Close"}
                </AsyncButton>
            )}
            {refresh && isSender && (
                <>
                    {mini && <div className="ml-[.75rem]" />}
                    <AsyncButton
                        onClick={async () => {
                            const { error } = await supabase
                                .from("valentinesmessages")
                                .delete()
                                .eq("id", valentine.id);
                            if (error)
                                enqueueSnackbar("Error deleting valentine.", {
                                    variant: "error",
                                });
                            else {
                                enqueueSnackbar("Deleted valentine!", {
                                    variant: "success",
                                });
                                if (refresh) refresh();
                            }
                        }}
                    >
                        Delete
                    </AsyncButton>
                </>
            )}
            {refresh && admin && (
                <>
                    {mini ? (
                        <div className="ml-[.75rem]" />
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
                    {mini && <div className="ml-[.75rem]" />}
                    <AdminButton
                        valentine={valentine}
                        refresh={refresh}
                        mode="reject"
                        reason={reason}
                    />
                </>
            )}
        </div>
    );
};

const ValentineDisplay = ({
    valentine,
    admin,
    mini,
    refresh,
}: ValentineInput) => {
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
