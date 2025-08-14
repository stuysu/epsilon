import { Avatar, Box, Card, Skeleton, Stack, Typography } from "@mui/material";
import { PUBLIC_URL } from "../../../config/constants";
import React, { useContext, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import { useNavigate } from "react-router-dom";

import { ThemeContext } from "../../../contexts/ThemeProvider";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);
    const [imgLoaded, setImgLoaded] = useState(false);

    const user: UserContextType = useContext(UserContext);

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
                        opacity: 0.2,
                        height: "100%",
                        backgroundImage: `url(${PUBLIC_URL}/textures/org_card.png)`,
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
                        height: "445px",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "visible",
                        padding: "25px",
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
                            width: "250px",
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
                                top: -45,
                                marginBottom: "-12px",
                            }}
                        >
                            <Box
                                sx={{
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "20px",
                                    position: "absolute",
                                    boxShadow:
                                        "inset 0 0 5px 1px rgba(255, 255, 255, 0.3)",
                                    zIndex: 10,
                                }}
                            ></Box>

                            {user.signed_in && (
                                <Typography
                                    variant="body1"
                                    sx={{
                                        position: "absolute",
                                        top: 45,
                                        right: 0,
                                        color: "#cdcdcd",
                                        background: "#36363680",
                                        padding: "3px 7px",
                                        borderRadius: "7px",
                                        fontVariationSettings: "'wght' 700",
                                        boxShadow:
                                            "inset 0 0 1px 1px rgba(255, 255, 255, 0.1)",
                                    }}
                                >
                                    <i className="bx bx-group bx-xs relative top-0.5 mr-1"></i>
                                    {organization.memberships?.length ?? 0}
                                </Typography>
                            )}

                            {/* Background avatar with blur effect */}
                            <Avatar
                                src={organization.picture || ""}
                                sx={{
                                    display: imgLoaded ? "block" : "none",
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "20px",
                                    position: "absolute",
                                    opacity: 0.25,
                                    objectFit: "cover",
                                    filter: "blur(20px)",
                                }}
                            ></Avatar>

                            {!imgLoaded && organization.picture && (
                                <Skeleton
                                    variant="rectangular"
                                    width={120}
                                    height={120}
                                    sx={{
                                        borderRadius: "20px",
                                        position: "absolute",
                                        zIndex: 20,
                                    }}
                                />
                            )}

                            {/* Main avatar with text fallback */}
                            <Box
                                sx={{
                                    width: "120px",
                                    height: "120px",
                                    backgroundColor: "rgb(23,23,23)",
                                    borderRadius: "20px",
                                    position: "absolute",
                                }}
                            ></Box>

                            <Avatar
                                onLoad={() => setImgLoaded(true)}
                                src={organization.picture || ""}
                                sx={{
                                    transition: "opacity 0.3s ease",
                                    opacity:
                                        imgLoaded || !organization.picture
                                            ? "100%"
                                            : "0%",
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "20px",
                                    fontSize: "60px",
                                    objectFit: "cover",
                                    backgroundColor: "#232323",
                                    color: "#cdcdcd",
                                }}
                                alt={`${organization.name}`}
                            >
                                <h1>
                                    {organization.name?.charAt(0).toUpperCase()}
                                </h1>
                            </Avatar>
                        </Box>

                        <div className={"flex h-20 items-start"}>
                            <h3
                                style={{
                                    maxWidth: "90%",
                                    height: "3lh",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 3,
                                }}
                            >
                                {organization.name}
                            </h3>
                        </div>
                    </Box>
                    <Box
                        sx={{
                            width: "100%",
                            marginTop: "15px",
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
                            marginTop: "15px",
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
                            direction="column"
                            spacing={0}
                            sx={{
                                boxShadow:
                                    "inset 0 0 1px 1px rgba(255, 255, 255, 0.1)",
                                borderRadius: "10px",
                                paddingY: "10px",
                                paddingX: "15px",
                                background: "#36363680",
                                marginTop: "20px",
                                textTransform: "capitalize",
                            }}
                        >
                            <div className={"flex justify-between"}>
                                <Typography
                                    noWrap
                                    sx={{ fontVariationSettings: "'wght' 500" }}
                                >
                                    Commitment
                                </Typography>
                                <Typography
                                    noWrap
                                    sx={{ fontVariationSettings: "'wght' 700" }}
                                >
                                    {organization.commitment_level?.toLowerCase()}
                                </Typography>
                            </div>
                            <div
                                className={
                                    "flex justify-between relative top-0.5"
                                }
                            >
                                <Typography
                                    noWrap
                                    sx={{ fontVariationSettings: "'wght' 500" }}
                                >
                                    Days
                                </Typography>
                                <Typography
                                    noWrap
                                    sx={{ fontVariationSettings: "'wght' 700" }}
                                >
                                    {organization.meeting_days?.length
                                        ? organization.meeting_days
                                              .map(
                                                  (day: string) =>
                                                      ({
                                                          MONDAY: "M",
                                                          TUESDAY: "T",
                                                          WEDNESDAY: "W",
                                                          THURSDAY: "R",
                                                          FRIDAY: "F",
                                                      })[day],
                                              )
                                              .join(" · ")
                                        : "None"}
                                </Typography>
                            </div>
                        </Stack>
                    </Box>
                </Card>
            </div>
        </Box>
    );
};

export default OrgCard;
