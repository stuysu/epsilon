import { Avatar, Box, Card, Stack, Typography } from "@mui/material";
import { PUBLIC_URL } from "../../../constants";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../../context/ThemeProvider";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    return (
        <Box
            sx={{
                position: "relative",
                transition: "transform 0.4s cubic-bezier(0.3, 0.9, 0.3, 1)",
                "&:hover": {
                    transform: "translateY(-5px)",
                },
            }}
        >
            <div className="mt-10"></div>
            <div className="relative rounded-2xl overflow-visible">
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        opacity: 0.15,
                        height: "100%",
                        backgroundImage: `url(${PUBLIC_URL}/textures/orgcard_background.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        zIndex: 0,
                        filter: "blur(50px)",
                    }}
                />
                <Card
                    sx={{
                        position: "relative",
                        borderRadius: "20px",
                        boxShadow:
                            "inset 0 0 1px 1px rgba(255, 255, 255, 0.075)",
                        cursor: "pointer",
                        transition:
                            "0.2s background ease-in-out, box-shadow 0.2s ease-in-out",
                        "&:hover": {
                            background: theme.colorMode
                                ? "rgba(255, 255, 255, 0.05)"
                                : "rgba(66,66,66,0.2)",
                            boxShadow:
                                "inset 0 0 1px 1px rgba(255, 255, 255, 0.075), 0px 5px 15px rgba(0, 0, 0, 0.3)",
                        },
                        height: "450px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "visible",
                        padding: "30px",
                        background: theme.colorMode
                            ? "rgba(31, 31, 31, 0.5)"
                            : "rgba(100, 100, 100, 0.2)",
                        justifyContent: "flex-start",
                        zIndex: 1,
                    }}
                    onClick={() => {
                        navigate(`/${organization.url}`);
                    }}
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "150px",
                            height: "1px",
                            position: "absolute",
                            bottom: "0px",
                            right: "65px",
                            opacity: 0.25,
                        }}
                    ></div>

                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "300px",
                            height: "1px",
                            position: "absolute",
                            top: "0px",
                            opacity: 0.5,
                        }}
                    ></div>

                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexDirection: "column",
                        }}
                    >
                        <Box
                            sx={{
                                position: "relative",
                                top: -50,
                                marginBottom: "-20px",
                            }}
                        >
                            <Box
                                sx={{
                                    width: "130px",
                                    height: "130px",
                                    borderRadius: "20px",
                                    position: "absolute",
                                    boxShadow:
                                        "inset 0 0 1px 1px rgba(255, 255, 255, 0.15)",
                                    zIndex: 10,
                                }}
                            ></Box>

                            <Avatar
                                src={organization.picture || ""}
                                sx={{
                                    width: "130px",
                                    height: "130px",
                                    borderRadius: "20px",
                                    position: "absolute",
                                    opacity: 0.2,
                                    objectFit: "cover",
                                    filter: "blur(20px)",
                                }}
                            ></Avatar>

                            <Box
                                sx={{
                                    width: "130px",
                                    height: "130px",
                                    backgroundColor: "rgb(23,23,23)",
                                    borderRadius: "20px",
                                    position: "absolute",
                                }}
                            ></Box>

                            <Avatar
                                src={organization.picture || ""}
                                sx={{
                                    width: "130px",
                                    height: "130px",
                                    borderRadius: "20px",
                                    fontSize: "60px",
                                    objectFit: "cover",
                                }}
                                alt={`${organization.name}`}
                            >
                                <h1>
                                    {organization.name?.charAt(0).toUpperCase()}
                                </h1>
                            </Avatar>
                        </Box>

                        <Typography
                            variant="h3"
                            sx={{
                                maxWidth: "100%",
                                height: "3rem",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {organization.name}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            marginTop: "20px",
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                fontVariationSettings: `'wght' 700`,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal",
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 1,
                            }}
                        >
                            {organization.tags?.join(" • ")}
                        </Typography>
                    </Box>

                    <Box
                        sx={{
                            width: "100%",
                            marginTop: "20px",
                        }}
                    >
                        <Typography
                            variant="body1"
                            sx={{
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "normal",
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                WebkitLineClamp: 4,
                            }}
                        >
                            {organization.purpose}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={0}
                            sx={{
                                boxShadow:
                                    "inset 0 0 1px 1px rgba(255, 255, 255, 0.1)",
                                borderRadius: "10px",
                                padding: "15px",
                                background: "#36363680",
                                marginTop: "20px",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                textTransform: "capitalize",
                            }}
                        >
                            <Typography
                                noWrap
                                sx={{ fontVariationSettings: "'wght' 500" }}
                            >
                                Commitment Level
                            </Typography>
                            <Typography
                                noWrap
                                sx={{ fontVariationSettings: "'wght' 700" }}
                            >
                                {organization.commitment_level?.toLowerCase()}
                            </Typography>
                        </Stack>
                    </Box>
                </Card>
            </div>
        </Box>
    );
};

export default OrgCard;
