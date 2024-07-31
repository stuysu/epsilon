import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button } from "@mui/material";

const FlavorText = [
    "The page is a lie",
    "I'm sorry Dave, I'm afraid I can't do that.",
    ":(",
    "PC LOAD LETTER",
    "Keyboard not found. Press any key to continue...",
    "Abort, Retry, Fail?",
    "Success",
    "Have you tried turning it off and on again?",
    "Thank you! But our page is in another castle!",
    "This is fine. 🔥",
    "Imagine spamming refresh to see all the 404 easter eggs and stumbling upon this one first…",
    "Nate, what did you break this time?"
    "Bruh."
    "How did you even get here?"
];

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            p={3}
        >
            <Typography variant="h1" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" gutterBottom>
                {FlavorText[Math.floor(Math.random() * FlavorText.length)]}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                onClick={handleGoHome}
                sx={{ mt: 3, padding: "10px 20px", fontSize: "16px" }}
            >
                Go to Home
            </Button>
        </Box>
    );
};

export default NotFound;
