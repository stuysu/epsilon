import React from "react";
import { Typography } from "@mui/material";

type ContentUnavailableProps = {
    icon?: string;
    iconColor?: string;
    title: string;
    description: string;
};

const ContentUnavailable: React.FC<ContentUnavailableProps> = ({
    icon = "bx-error-circle",
    iconColor = "text-gray-500",
    title,
    description,
}) => {
    return (
        <div className="flex flex-col justify-center items-center h-[65vh] px-8">
            <i className={`bx ${icon} bx-lg ${iconColor} mb-5`}></i>
            <Typography variant="h1" align="center" marginBottom={3}>
                {title}
            </Typography>
            <Typography variant="body1" align="center" sx={{ maxWidth: 400 }}>
                {description}
            </Typography>
        </div>
    );
};

export default ContentUnavailable;
