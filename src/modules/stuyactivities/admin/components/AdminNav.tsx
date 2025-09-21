import RouteTabs from "../../../../components/ui/navigation/RouteTabs";
import { Link } from "../index";
import React from "react";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <div className="relative max-sm:mt-[0.7rem] sm:pl-9 max-w-screen overflow-x-scroll mt-4 bg-blurDark backdrop-blur-xl border-y-divider border-y z-40">
            <RouteTabs tabs={links} />
        </div>
    );
};

export default AdminNav;
