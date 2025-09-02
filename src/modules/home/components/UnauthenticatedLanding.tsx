import { Box } from "@mui/material";
import { PUBLIC_URL } from "../../../config/constants";

import LoginButton from "../../../components/ui/buttons/LoginButton";
import { useState } from "react";
import CatalogButton from "../../../components/ui/buttons/CatalogButton";

const UnauthenticatedLanding = () => {
    const [isLoginHovered, setIsLoginHovered] = useState(false);
    const wordmarkSrc = `${PUBLIC_URL}/wordmark.svg`;

    return (
        <div className={"bg-[#111111] h-screen"}>
            <Box
                sx={{
                    position: "fixed",
                    width: "100vw",
                    height: "100vh",
                    backgroundImage: `url(${PUBLIC_URL}/textures/login.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: isLoginHovered ? 0.5 : 0.3,
                    transition: "opacity 0.3s ease",
                    filter: "blur(50px)",
                    mixBlendMode: "color-dodge",
                    pointerEvents: "none",
                    zIndex: 2,
                }}
            />
            <Box
                className={
                    "w-full max-sm:h-[80vh] h-[90vh] flex justify-center items-center flex-col"
                }
            >
                <img
                    src={wordmarkSrc}
                    alt="Epsilon"
                    style={{
                        marginBottom: "50px",
                        maxWidth: "300px",
                        height: "auto",
                        mixBlendMode: "color-dodge",
                        position: "relative",
                        zIndex: 3,
                        opacity: 0,
                        transform: "scale(1.5)",
                        filter: "blur(20px)",
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
                src={`${PUBLIC_URL}/icons/stuysu.png`}
                alt="Stuyvesant Student Union"
                onClick={() => window.open("https://stuysu.org", "_blank")}
                className="cursor-pointer relative bottom-12 left-1/2 transform -translate-x-1/2 w-14 h-14 object-cover"
            />
        </div>
    );
};

export default UnauthenticatedLanding;
