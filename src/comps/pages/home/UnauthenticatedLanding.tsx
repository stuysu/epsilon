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
            <div className={"max-sm:hidden"}>
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
            </div>
            <Box
                className={
                    "w-full max-sm:h-[80vh] h-[90vh] flex justify-center items-center flex-col"
                }
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
                        opacity: 0,
                        transform: "scale(1.5)",
                        filter: theme.colorMode
                            ? "blur(20px)"
                            : "blur(20px) invert(0%)",
                        animation:
                            "fadeIn 1.5s cubic-bezier(0, 0, 0, 1) forwards",
                        animationDelay: "0.3s",
                    }}
                />
                <style>
                    {`
                        @keyframes fadeIn {
                            to {
                                opacity: 1;
                                transform: scale(1);
                                filter: blur(0);
                            }
                        }
                    `}
                </style>
                <div
                    style={{
                        opacity: 0,
                        animation: "fadeIn 0.5s ease forwards",
                        animationDelay: "0.8s",
                    }}
                >
                    <LoginButton
                        onMouseEnter={() => setIsLoginHovered(true)}
                        onMouseLeave={() => setIsLoginHovered(false)}
                    />
                </div>
                <div
                    style={{
                        opacity: 0,
                        animation: "fadeIn 0.5s ease forwards",
                        animationDelay: "1.3s",
                    }}
                >
                    <CatalogButton />
                </div>
            </Box>
            <img
                src="https://lh4.googleusercontent.com/MocBT-lsE_2edgLBY_5yG1lKB6VA0UysQZnteXEXugKwl7naAFFc-qyUWNQQYT3DhPkDWtUwIvQxCsCmMXVVKTKCQEeDei22SaSno3UxHf_0y4AYi6zKU5BX3uKxQoI-iJkY4BFaSIM=w16383"
                alt="Stuyvesant Student Union"
                onClick={() => window.open("https://stuysu.org", "_blank")}
                className="cursor-pointer relative bottom-12 left-1/2 transform -translate-x-1/2 w-14 h-14 object-cover"
            />
        </Box>
    );
};

export default UnauthenticatedLanding;
