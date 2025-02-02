import { Box } from "@mui/material";
import ValentineDisplay from "./comps/ValentineDisplay";
import { useState } from "react";
import { Valentine } from "./ValentineType";

const Valentines = () => {
    const [loads, setLoads] = useState(0);
    const [valentines, setValentines] = useState<Valentine[]>([]);
    return (
        <>
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
        </>
    );
};

export default Valentines;
