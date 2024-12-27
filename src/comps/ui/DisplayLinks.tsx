import React from "react";
import { Typography } from "@mui/material"; // Assuming you're using MUI for styling
import Link from "@mui/material/Link";

interface DisplayLinksProps {
    text: string;
}

const DisplayLinks: React.FC<DisplayLinksProps> = ({ text }) => {
    const formatTextWithLinks = (text: string) => {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const parts = text.split(urlRegex);

        return (
            <>
                {parts.map((part, index) => {
                    if (urlRegex.test(part)) {
                        return (
                            <Link
                                href={part}
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {part}
                            </Link>
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
            {formatTextWithLinks(text)}
        </Typography>
    );
};

export default DisplayLinks;
