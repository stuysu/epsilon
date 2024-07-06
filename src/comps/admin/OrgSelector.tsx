import { useState } from "react";

import { Box, TextField, Button, Card } from "@mui/material";

import { supabase } from "../../supabaseClient";

const OrgSelector = ({
    onSelect,
}: {
    onSelect: (orgId: number, orgName: string) => void;
}) => {
    let [orgName, setOrgName] = useState("");
    let [inputError, setInputError] = useState("");

    const searchOrg = async () => {
        const { data, error } = await supabase
            .from("organizations")
            .select(
                `
                id,
                name
            `,
            )
            .ilike("name", orgName);

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

        onSelect(data[0].id, data[0].name);
    };

    return (
        <Card
            variant="outlined"
            sx={{
                width: "500px",
                height: "250px",
                display: "flex",
                flexWrap: "wrap",
                padding: "20px",
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    height: "80%",
                    alignItems: "center",
                }}
            >
                <TextField
                    onChange={(e) => setOrgName(e.target.value)}
                    label="Search for Organization"
                    value={orgName}
                    error={inputError.length !== 0}
                    helperText={inputError}
                    onFocus={() => setInputError("")}
                    sx={{ width: "100%" }}
                />
            </Box>
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Button
                    onClick={searchOrg}
                    sx={{ height: "40px", width: "50%" }}
                    variant="contained"
                >
                    Submit
                </Button>
            </Box>
        </Card>
    );
};

export default OrgSelector;
