import { useState } from "react";
import { Box, TextField } from "@mui/material";

const OrgEditor = (
    { organization, organizationEdit } : 
    { 
        organization: Partial<Organization>,
        organizationEdit: OrganizationEdit
    }
) => {
    let orgEdit = useState(organizationEdit)

    return (
        <div>
            <h1>Organization Data</h1>
            <Box>
                {
                    Object.keys(organizationEdit).map((field, i) => {
                        type orgKey = keyof OrganizationEdit & keyof Organization;
                        let key : orgKey = (field as orgKey);

                        // @ts-ignore - this is definitely a key in orgEdit
                        let current = orgEdit[key] || organization[key] || ""

                        return (
                            <Box key={i} bgcolor="background.default" color="primary.contrastText">
                                <TextField
                                variant="filled"
                                label={field}
                                value={current}
                                />
                            </Box>
                        )
                    })
                }
            </Box>

            <pre>{JSON.stringify(organization, undefined, 4)}</pre>
            <h1>Organization Edits</h1>
            <pre>{JSON.stringify(organizationEdit || "NONE", undefined, 4)}</pre>
        </div>
    )
}

export default OrgEditor;