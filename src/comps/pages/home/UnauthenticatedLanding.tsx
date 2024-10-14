import { Box } from "@mui/material";
import { PUBLIC_URL } from "../../../constants";

import LoginButton from "../../ui/LoginButton";

const UnauthenticatedLanding = () => {
    return (
        <Box>
            <Box
                sx={{
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                    backgroundImage: `url(${PUBLIC_URL}/textures/login.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.3,
                    filter: "blur(50px)",
                    mixBlendMode: "color-dodge",
                    pointerEvents: "none",
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    width: "100%",
                    height: "90vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                }}
            >
                <img
                    src={`${PUBLIC_URL}/wordmark.svg`}
                    alt="Epsilon"
                    style={{
                        marginBottom: "40px",
                        maxWidth: "300px",
                        height: "auto",
                        mixBlendMode: "color-dodge",
                        position: "relative",
                        zIndex: 1,
                    }}
                />
                <LoginButton />
            </Box>
        </Box>
    );
};

export default UnauthenticatedLanding;
