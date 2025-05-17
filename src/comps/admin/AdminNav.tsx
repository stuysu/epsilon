import RouteTabs from "../ui/RouteTabs";
import { Box } from "@mui/material";
import { Link } from "../../pages/admin";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <div className="flex justify-center sticky -top-0.5 mb-10 mt-4
        bg-neutral-900 bg-opacity-75 backdrop-blur-xl border-y-neutral-50 border-opacity-10 border-y z-50">
            <RouteTabs tabs={links} />
        </div>
    );
};

export default AdminNav;