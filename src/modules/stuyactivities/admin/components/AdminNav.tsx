import RouteTabs from "../../../../components/ui/RouteTabs";
import { Link } from "../index";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <div
            className="flex justify-center sticky -top-0.5 mb-10 mt-4
        bg-neutral-900 bg-opacity-75 backdrop-blur-xl border-y-neutral-50 border-opacity-10 border-y z-40"
        >
            <RouteTabs tabs={links} />
        </div>
    );
};

export default AdminNav;
