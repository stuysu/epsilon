import RouteTabs from "../ui/RouteTabs";
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditIcon from '@mui/icons-material/Edit';
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EmailIcon from "@mui/icons-material/Email";

const AdminNav = () => {
    let navLinks = [
        {
            to: "/admin/approve-pending",
            label: "Pending Orgs",
            icon: <PendingActionsIcon />
        },
        {
            to: "/admin/approve-edit",
            label: "Approve Edits",
            icon: <EditIcon />
        },
        {
            to: "/admin/strikes",
            label: "Strikes",
            icon: <ReportProblemIcon />
        },
        {
            to: "/admin/send-message",
            label: "Send Message",
            icon: <EmailIcon />
        },
    ];

    return (
        <RouteTabs tabs={navLinks} />
    );
};

export default AdminNav;
