import { Box, Typography } from "@mui/material";
import { PUBLIC_URL } from "../../../constants";

import { useNavigate } from "react-router-dom";

import AsyncButton from "../../ui/AsyncButton";
import LoginButton from "../../ui/LoginButton";

const UnauthenticatedLanding = () => {
    const navigate = useNavigate();

    return (
        <Box>
            <Box
                sx={{
                    width: "100%",
                    height: "700px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Box
                    sx={{
                        width: "500px",
                        display: "flex",
                        justifyContent: "center",
                        flexWrap: "wrap",
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                        }}
                    >
                        <img
                            src={`${PUBLIC_URL}/wordmark.svg`}
                            alt="Epsilon"
                            style={{ maxWidth: "100%", height: "auto" }}
                        />
                        <Typography align="center" variant="body1">
                            The all in one platform for Stuyvesant High School's
                            needs.
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            width: "50%",
                            display: "flex",
                            justifyContent: "center",
                            flexWrap: "wrap",
                        }}
                    >
                        <LoginButton />
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginBottom: "15px",
                            }}
                        >
                            <AsyncButton
                                sx={{ height: "40px", width: "50%" }}
                                variant="contained"
                                onClick={() => navigate("/catalog")}
                            >
                                View Catalog
                            </AsyncButton>
                        </Box>
                        <Box
                            sx={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        ></Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default UnauthenticatedLanding;
