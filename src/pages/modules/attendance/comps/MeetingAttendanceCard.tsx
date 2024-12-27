import { Card, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import AsyncButton from "../../../../comps/ui/AsyncButton";

const MeetingAttendanceCard = ({
    title,
    id,
}: {
    title: string;
    id: number;
}) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ width: "300px", margin: "10px", padding: "10px" }}>
            <Typography variant="h5">{title}</Typography>
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
