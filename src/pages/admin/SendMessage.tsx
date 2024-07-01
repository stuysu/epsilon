import { Box, Typography } from "@mui/material";

import { useState } from "react";
import OrgChat from "../../comps/admin/OrgChat";
import OrgSelector from "../../comps/admin/OrgSelector";

const SendMessage = () => {
    const [orgId, setOrgId] = useState<number>();

    return (
        <Box>
            <Typography variant="h1" align="center">Approve Edits</Typography>
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <OrgSelector 
                    onSelect={(oid) => setOrgId(oid)}
                />
            </Box>
            <Box sx={{ marginTop: "20px", width: "100%", display: "flex", justifyContent: "center", padding: "20px" }}>
                {
                    orgId &&
                    (
                        <OrgChat 
                            organization_id={orgId}
                        />
                    )
                }
            </Box>
        </Box>
    )
}

export default SendMessage;