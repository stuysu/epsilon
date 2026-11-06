import ValentineDisplay from "./components/ValentineDisplay";
import { useContext, useEffect, useState } from "react";
import { Valentine } from "./ValentineType";
import { supabase } from "../../lib/supabaseClient";
import UserContext from "../../contexts/UserContext";
import { enqueueSnackbar } from "notistack";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import { useNavigate } from "react-router-dom";

const Valentines = () => {
    const user = useContext(UserContext);
    const [loads, setLoads] = useState(0);
    const [deadline, setDeadline] = useState<Date | undefined>();
    const [sentValentines, setSentValentines] = useState<Valentine[]>([]);
    const [receivedValentines, setReceivedValentines] = useState<Valentine[]>(
        [],
    );
    const navigate = useNavigate();
    useEffect(() => {
        const f = async () => {
            const { data, error } = await supabase
                .from("valentinesmessages")
                .select("id,sender,receiver,show_sender,message,background")
                .eq("sender", user.id)
                .returns<Valentine[]>();
            if (error) {
                enqueueSnackbar("Failed to load Valentines", {
                    variant: "error",
                });
                return;
            }
            setSentValentines(data);
        };
        f();
    }, [loads, user.id]);
    useEffect(() => {
        const f = async () => {
            const { data: settings, error: settingError } = await supabase
                .from("settings")
                .select("setting_value")
                .eq("name", "valentines_deadline")
                .single();
            if (settingError || !settings) {
                enqueueSnackbar("Failed to fetch Valentines times!", {
                    variant: "error",
                });
                return;
            }
            const deadline = new Date(settings.setting_value * 1000);
            const currentDate = new Date();
            setDeadline(deadline);
            if (currentDate < deadline) return;

            // Recipients can't read the table directly. This returns only
            // approved messages, and sender is null unless show_sender is true.
            const { data, error } = await supabase.rpc(
                "get_received_valentines",
            );
            if (error) {
                console.error("Error fetching received messages:", error);
                enqueueSnackbar("Failed to load Valentines", {
                    variant: "error",
                });
                return;
            }
            setReceivedValentines((data ?? []) as Valentine[]);
        };
        f();
    }, []);
    return (
        <>
            {deadline && deadline < new Date() && (
                <>
                    <h2 className="m-0 font-sans text-[3.75rem] leading-[1.2] tracking-[-0.00833em] text-[color:inherit] [font-variation-settings:'wght'_300]">
                        {`${receivedValentines.length} Valentine${receivedValentines.length === 1 ? "" : "s"} Received`}
                    </h2>
                    <div className="mt-4">
                        {receivedValentines.map((valentine) => (
                            <ValentineDisplay
                                key={valentine.id}
                                valentine={valentine}
                                mini
                            />
                        ))}
                    </div>
                    <div className="my-4 w-[80vw]">
                        <hr className="border-divider" />
                    </div>
                </>
            )}
            <h2 className="m-0 font-sans text-[3.75rem] leading-[1.2] tracking-[-0.00833em] text-[color:inherit] [font-variation-settings:'wght'_300]">
                {`${sentValentines.length} Valentine${sentValentines.length === 1 ? "" : "s"} Sent`}
            </h2>
            {sentValentines.map((valentine) => (
                <div
                    key={valentine.id}
                    className="flex justify-center w-[100vw]"
                >
                    <ValentineDisplay
                        valentine={valentine}
                        mini
                        refresh={
                            deadline && deadline > new Date()
                                ? () => setLoads((load) => ++load)
                                : undefined
                        }
                    />
                </div>
            ))}
            {deadline && deadline > new Date() && (
                <AsyncButton onClick={() => navigate("create")}>
                    New
                </AsyncButton>
            )}
        </>
    );
};

export default Valentines;
