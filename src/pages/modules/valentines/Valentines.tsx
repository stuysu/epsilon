import AsyncButton from "../../../comps/ui/AsyncButton";
import { useState } from "react";
import { supabase } from "../../../supabaseClient";
import { enqueueSnackbar } from "notistack";

interface Valentine {
    id: number;
    sender: number;
    receiver: number;
    show_sender: boolean;

    message: string;
    background: string;
}
const Valentines = () => {
    const [valentines, setValentines] = useState([]);

    return (
        <>
            <h1>Valentines Testing</h1>
            <AsyncButton
                onClick={async () => {
                    const { data, error } = await supabase
                        .from("valentinesmessages")
                        .select(
                            "id,sender,receiver,show_sender,message,background",
                        );
                    if (error) {
                        enqueueSnackbar("Failed to load Valentines", {
                            variant: "error",
                        });
                        return;
                    }
                    console.log(data);
                }}
            >
                fetch all visible valentines
            </AsyncButton>
            <h2>fetched valentines ({valentines.length})</h2>
            {valentines.map((valentine) => (
                <p>{valentine}</p>
            ))}
        </>
    );
};

export default Valentines;
