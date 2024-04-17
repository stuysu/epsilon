import { useState } from "react";

import { Box, TextField, Button } from "@mui/material"

import { supabase } from "../../supabaseClient";

const OrgSelector = (
    { onSelect } :
    { onSelect : (orgId : Number, orgName: string) => void }
) => {
    let [orgName, setOrgName] = useState("");
    let [inputError, setInputError] = useState("");

    const searchOrg = async () => {
        const { data, error } = await supabase
            .from("organizations")
            .select(`
                id,
                name
            `)
            .ilike('name', orgName);
        
        setOrgName("");

        if (error) {
            setInputError(error.message);
            return;
        }

        if (!data) {
            setInputError("Failed to fetch data.");
            return;
        }

        if (!data.length) {
            setInputError("Invalid organization name.");
            return;
        }

        onSelect(data[0].id, data[0].name)
    }

    return (
        <Box sx={{ background: "black"}}>
            <TextField 
                onChange={e => setOrgName(e.target.value)}
                label="Search for Organization"
                value={orgName}
                error={inputError.length !== 0}
                helperText={inputError}
                onFocus={() => setInputError("")}
            />
            <Button onClick={searchOrg}>Submit</Button>
        </Box>
    )
}

export default OrgSelector;