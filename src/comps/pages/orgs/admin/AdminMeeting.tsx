import { Box, Button } from "@mui/material";

const AdminMeeting = ({
    title,
    description,
    start,
    end,
    room,
    isPublic,
    onEdit,
    onDelete,
}: {
    title: string;
    description: string;
    start: string;
    end: string;
    room: string | undefined;
    isPublic: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    return (
        <Box bgcolor="gray">
            <h1>{title}</h1>
            <p>{description}</p>
            <p>{start}</p>
            <p>{end}</p>
            <p>{room ? `Room ${room}` : "Virtual Meeting"}</p>
            <p>is public: {String(isPublic)}</p>
            <Button onClick={onEdit}>Edit</Button>
            <Button onClick={onDelete}>Delete</Button>
        </Box>
    );
};

export default AdminMeeting;
