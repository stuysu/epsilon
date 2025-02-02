import RouteTabs from "../ui/RouteTabs";
import { Box } from "@mui/material";
import { Link } from "../../pages/admin";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <Box
            sx={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <RouteTabs tabs={links} />
        </Box>
    );
};

export default AdminNav;
