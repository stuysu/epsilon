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
                justifyContent: "space-between",
                "&:hover": {
                    background: theme.colorMode
                        ? "rgba(255, 255, 255, 0.2)"
                        : "rgba(100, 100, 100, 0.2)",
                    transition: "0.2s background ease-out",
                },
                height: "570px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                padding: "20px",
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
                    flexDirection: "column",
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
                <Typography
                    variant="h3"
                    align="center"
                    sx={{
                        marginTop: "30px",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                    }}
                >
                    {organization.name}
                </Typography>
            </Box>
            <Box
                sx={{
                    width: "100%",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                }}
            >
                <Typography
                    variant="body1"
                    align="center"
                    fontSize={20}
                    sx={{
                        textAlign: "center",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "normal",
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 9,
                    }}
                >
                    {organization.purpose}
                </Typography>
            </Box>
        </Card>
    );
};

export default OrgCard;
