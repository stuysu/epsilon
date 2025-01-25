import { Box } from "@mui/material";
import { PUBLIC_URL } from "../../../constants";

import LoginButton from "../../ui/LoginButton";
import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeProvider";
import CatalogButton from "../../ui/CatalogButton";

const UnauthenticatedLanding = () => {
    const theme = useContext(ThemeContext);
    const wordmarkSrc = theme.colorMode
        ? `${PUBLIC_URL}/wordmark.svg`
        : `${PUBLIC_URL}/wordmark_light.svg`;
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
                    opacity: 0.5,
                    filter: "blur(100px) brightness(0.9)",
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
                    src={wordmarkSrc}
                    alt="Epsilon"
                    style={{
                        marginBottom: "40px",
                        maxWidth: "300px",
                        height: "auto",
                        mixBlendMode: theme.colorMode
                            ? "color-dodge"
                            : "normal",
                        position: "relative",
                        zIndex: 1,
                        filter: theme.colorMode
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(500%) hue-rotate(180deg) brightness(100%) contrast(88%)"
                            : "brightness(0) saturate(100%) invert(0%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(50%) contrast(100%)",
                    }}
                />
                <LoginButton />
                <CatalogButton />
            </Box>
        </Box>
    );
};

export default UnauthenticatedLanding;
