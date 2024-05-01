import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const AdminNav = () => {
    return (
        <Box>
            <Link to="/admin/approve-pending">Pending Orgs</Link>
            <br />
            <Link to="/admin/approve-edit">Approve Edits</Link>
            <br />
            <Link to="/admin/strikes">Strikes</Link>
            <br />
            <Link to="/admin/send-email">Send Email</Link>
        </Box>
    );
};

export default AdminNav;
