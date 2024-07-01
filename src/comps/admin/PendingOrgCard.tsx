import { Card, Button, Avatar, Box, Typography } from "@mui/material";

const PendingOrgCard = (
    {
        name,
        picture,
        onView
    } :
    {
        name?: string,
        picture?: string,
        onView: () => void
    }
) => {
    return (
        <Card
            sx={{
                width: "100%",
                height: "420px",
                padding: "20px",
                maxWidth: "600px"
            }}
        >
            <Box sx={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <Avatar src={picture} alt={name} sx={{ width: "225px", height: "225px", boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px", fontSize: "70px" }}>
                    {name ? name[0] : ""}
                </Avatar>
            </Box>
            <Box sx={{ width: "100%", padding: "20px" }}>
                <Typography variant="h3" align="center">
                    {name}
                </Typography>
            </Box>
            <Box sx={{ width: "100%", paddingLeft: "40px", paddingRight: "40px"}}>
                <Button
                    variant="contained"
                    onClick={onView}
                    sx={{
                        width: "100%"
                    }}
                >
                    View
                </Button>
            </Box>
        </Card>
    );
}

export default PendingOrgCard;