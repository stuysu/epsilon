import { Box } from "@mui/material";

const AdminMeeting = (
    { title, description, start, end, room } :
    { title: string, description: string, start: string, end: string, room: string | undefined }
) => {
    return (
        <Box bgcolor='gray'>
            <h1>{title}</h1>
            <p>{description}</p>
            <p>{start}</p>
            <p>{end}</p>
            <p>{(`Room ${room}`) || 'Virtual'}</p>
        </Box>
    )
}

export default AdminMeeting;