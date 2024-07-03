import { Card, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const MeetingAttendanceCard = (
    {
        title,
        id
    } : {
        title: string;
        id: number
    }
) => {
    const navigate = useNavigate();

    return (
        <Card sx={{ width: "300px", margin: "10px", padding: "10px"}}>
            <Typography variant="h5">{title}</Typography>
            <Button variant="outlined" onClick={() => navigate(`meeting/${id}`)}>View</Button>
        </Card>
    )
}

export default MeetingAttendanceCard;