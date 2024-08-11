import { Box, Typography, Card, Avatar } from "@mui/material";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../../context/ThemeProvider";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    return (
        <Card
            sx={{
                borderRadius: "7px",
                cursor: "pointer",
                transition: "0.2s background ease-out",
                "&:hover": {
                    background: theme.colorMode
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(100, 100, 100, 0.2)",
                    transition: "0.2s background ease-out",
                },
            }}
            onClick={() => {
                navigate(`/${organization.url}`);
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    paddingTop: "20px",
                }}
            >
                <Avatar
                    src={organization.picture || ""}
                    sx={{
                        width: "170px",
                        height: "170px",
                        borderRadius: "100%",
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                        fontSize: "60px",
                        objectFit: "cover",
                    }}
                    alt={`${organization.name}`}
                >
                    {organization.name?.charAt(0).toUpperCase()}
                </Avatar>
            </Box>
            <Box sx={{ width: "100%", padding: "20px" }}>
                <Typography variant="h3" align="center">
                    {organization.name}
                </Typography>
                <Typography variant="body1" align="center">
                    {organization.purpose}
                </Typography>
            </Box>
        </Card>
    );
};

export default OrgCard;
