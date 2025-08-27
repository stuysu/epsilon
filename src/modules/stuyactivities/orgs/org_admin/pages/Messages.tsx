import { Box } from "@mui/material";
import OrgChat from "../../../admin/components/OrgChat";
import { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";

const Messages = () => {
    const organization = useContext(OrgContext);

    return (
        <div className="mt-2 mb-16">
            <OrgChat organization_id={organization.id} />
        </div>
    );
};

export default Messages;
