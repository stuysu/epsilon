import { Box } from "@mui/material";
import OrgChat from "../../../admin/components/OrgChat";
import { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";

const Messages = () => {
    const organization = useContext(OrgContext);

    return (
        <Box>
            <OrgChat organization_id={organization.id} />
        </Box>
    );
};

export default Messages;
