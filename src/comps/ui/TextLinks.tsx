import React from "react";
import { Typography } from "@mui/material"; // Assuming you're using MUI for styling

interface TextLinksProps {
    content: string;
}

const TextLinks: React.FC<TextLinksProps> = ({ content }) => {
    const formatTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return (
            <>
                {parts.map((part, index) => {
                    if (urlRegex.test(part)) {
                        return (
                            <a
                                href={part}
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {part}
                            </a>
                        );
                    } else {
                        return <span key={index}>{part}</span>;
                    }
                })}
            </>
        );
    };

    return (
        <Typography
            variant="body1"
            sx={{
                width: "100%",
                whiteSpace: "pre-line",
            }}
        >
            {formatTextWithLinks(content)}
        </Typography>
    );
};

export default TextLinks;
