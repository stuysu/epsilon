import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography } from "@mui/material";

const FlavorText = [
    "The page is a lie.",
    "I'm sorry Dave, I'm afraid I can't do that.",
    ":(",
    "PC LOAD LETTER.",
    "Keyboard not found. Press any key to continue...",
    "Abort, Retry, Fail?",
    "Success.",
    "Dorothy was right.",
    "Nobody knows what I see. Nobody knows I'm waiting.",
    "Have you tried turning it off and on again?",
    "Thank you! But our page is in another castle!",
    "This is fine.",
    "Imagine spamming refresh to see all the 404 easter eggs and stumbling upon this one first…",
    "Nate, what did you break this time?",
    "How did you even get here?",
    "You broke me. Congrats.",
];

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <Box
            sx={{
                width: "100vw",
                height: "80vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <i className="bx bx-question-mark bx-lg text-yellow mb-5"></i>
            <Typography variant="h1" marginBottom={3}>
                Page Not Found
            </Typography>
            <Typography variant="body1">
                {FlavorText[Math.floor(Math.random() * FlavorText.length)]}{" "}
                <a className={"underline"} href={"/"}>
                    Take me home.
                </a>
            </Typography>
        </Box>
    );
};

export default NotFound;
