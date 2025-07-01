import { Button } from "@mui/material";
import { supabase } from "../../supabaseClient";

const Debug = () => {
    return (
        <Button
            onClick={async () => {
                console.log(
                    await supabase.functions.invoke("clean-images"),
                    // .from("public-files")
                    // .list("org-pictures/323"),
                    "wa",
                );
            }}
        >
            RUN
        </Button>
    );
};

export default Debug;
