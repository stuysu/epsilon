import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AsyncButton from "../../../../comps/ui/AsyncButton";

const MeetingAttendanceCard = ({
    title,
    id,
    startTime,
}: {
    title: string;
    id: number;
    startTime: string;
}) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ width: "300px", margin: "10px", padding: "10px" }}>
            <Typography variant="h5">{title}</Typography>
            <Typography variant="body1" sx={{ marginBottom: "1em" }}>
                {new Date(startTime).toLocaleString()}
            </Typography>
            <AsyncButton
                variant="outlined"
                onClick={() => navigate(`meeting-admin/${id}`)}
            >
                View
            </AsyncButton>
        </Card>
    );
};

export default MeetingAttendanceCard;
