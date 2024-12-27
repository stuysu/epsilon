import { Box } from "@mui/material";
import OrgChat from "../../../comps/admin/OrgChat";
import { useContext } from "react";
import OrgContext from "../../../comps/context/OrgContext";

const Messages = () => {
    const organization = useContext(OrgContext);

    return (
        <Box>
            <OrgChat organization_id={organization.id} />
        </Box>
    );
};

export default Messages;
