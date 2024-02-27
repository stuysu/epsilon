import { Box } from "@mui/material";
import { Link } from "react-router-dom";

const AdminNav = () => {
    return (
        <Box>
            <Link to="/admin/approve-pending">Pending Orgs</Link>
            <br />
            <Link to="/admin/approve-edit">Approve Edits</Link>
        </Box>
    )
}

export default AdminNav;