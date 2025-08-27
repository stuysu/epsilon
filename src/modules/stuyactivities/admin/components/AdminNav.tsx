import RouteTabs from "../../../../components/ui/navigation/RouteTabs";
import { Link } from "../index";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <div
            className="max-sm:top-1 relative sm:pl-9 max-w-screen overflow-scroll mt-4 bg-blurDark backdrop-blur-xl border-y-divider border-y z-40"
        >
            <RouteTabs tabs={links} />
        </div>
    );
};

export default AdminNav;
