import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AsyncButton from "../../../../comps/ui/AsyncButton";

const MeetingAttendanceCard = ({
    title,
    id,
    startDate,
}: {
    title: string;
    id: number;
    startDate: string;
}) => {
    const navigate = useNavigate();
    const formattedDate = new Date(startDate).toLocaleString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});

    return (
        <Card sx={{ width: "300px", margin: "10px", height: "170px", paddingLeft: "10px", paddingRight: "10px", position: "relative" }}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="subtitle1">{formattedDate}</Typography>
            <AsyncButton
                variant="outlined"
                onClick={() => navigate(`meeting-admin/${id}`)}
                sx={{ position: "absolute", bottom: "10px", left: "10px" }}
            >
                View
            </AsyncButton>
        </Card>
    );
};

export default MeetingAttendanceCard;
