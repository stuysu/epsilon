import RouteTabs from "../../../../components/ui/navigation/RouteTabs";
import { Link } from "../index";

const AdminNav = ({ links }: { links: Link[] }) => {
    return (
        <div
            className="sm:pl-4 w-screen mt-4 bg-blurDark backdrop-blur-xl border-y-divider border-y z-40"
        >
            <RouteTabs tabs={links} />
            <p className={"important px-4 sm:px-8 pb-4"}>The admin panel is undergoing maintenance.</p>
        </div>
    );
};

export default AdminNav;
