import RouteTabs from "../ui/RouteTabs";
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import EditIcon from '@mui/icons-material/Edit';
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import EmailIcon from "@mui/icons-material/Email";
import CampaignIcon from '@mui/icons-material/Campaign';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import { Box } from "@mui/material";

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
        {
            to: "/admin/announcements",
            label: "Announcements",
            icon: <CampaignIcon />
        },
        {
            to: "/admin/rooms",
            label: "Rooms",
            icon: <MeetingRoomIcon />
        }
    ];

    return (
        <Box sx={{ width: "100%", display: "flex", justifyContent: "center"}}>
            <RouteTabs tabs={navLinks} />
        </Box>
    );
};

export default AdminNav;
