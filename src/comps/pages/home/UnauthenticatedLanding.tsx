import { Box } from "@mui/material";
import { PUBLIC_URL } from "../../../constants";

import LoginButton from "../../ui/LoginButton";
import { useContext, useState } from "react";
import { ThemeContext } from "../../context/ThemeProvider";
import CatalogButton from "../../ui/CatalogButton";

const UnauthenticatedLanding = () => {
    const theme = useContext(ThemeContext);

    const [isLoginHovered, setIsLoginHovered] = useState(false);

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
                    opacity: isLoginHovered ? 1 : 0.5,
                    transition: "opacity 0.3s ease",
                    filter: "blur(100px) brightness(0.9)",
                    mixBlendMode: "color-dodge",
                    pointerEvents: "none",
                    zIndex: 2,
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
                        zIndex: 3,
                        filter: theme.colorMode
                            ? ""
                            : "invert(0%)",
                    }}
                />
                <LoginButton
                    onMouseEnter={() => setIsLoginHovered(true)}
                    onMouseLeave={() => setIsLoginHovered(false)}
                />
                <CatalogButton />
            </Box>

            <img
                src="https://lh4.googleusercontent.com/ke5AkzreYMlnGXw_KMKOdRjM9LQM7h2M-K5QL8JEeuXe7XMWCI2vUYqhnsgAoL-B4SfDImggddAiPIY18sHCxXY=w16383"
                alt="Centered Image"
                onClick={() =>
                    window.open(
                        "https://stuysu.org",
                        "_blank",
                    )
                }
                className="cursor-pointer absolute bottom-0 left-1/2 transform -translate-x-1/2 w-14 h-14 object-cover"
            />
        </Box>
    );
};

export default UnauthenticatedLanding;
