import { Box } from "@mui/material";

import { useState } from "react";
import OrgChat from "../../comps/admin/OrgChat";
import OrgSelector from "../../comps/admin/OrgSelector";

const SendMessage = () => {
    const [orgId, setOrgId] = useState<number>();

    return (
        <Box>
            <h1>Send Message</h1>
            <OrgSelector 
                onSelect={(oid) => setOrgId(oid)}
            />
            {
                orgId &&
                (
                    <OrgChat 
                        organization_id={orgId}
                    />
                )
            }
        </Box>
    )
}

export default SendMessage;