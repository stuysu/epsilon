import React from "react";

type ContentUnavailableProps = {
    icon?: string;
    iconColor?: string;
    title: string;
    headingLevel?: "h1" | "h2";
    description: string;
};

const ContentUnavailable: React.FC<ContentUnavailableProps> = ({
    icon = "bx-circle",
    iconColor = "text-gray-500",
    title,
    headingLevel: Heading = "h1",
    description,
}) => {
    return (
        <div className="flex flex-col justify-center items-center h-[65vh] px-8">
            <i className={`bx ${icon} bx-lg ${iconColor} mb-5`}></i>
            <Heading className={"as-h1 text-center mb-5"}>{title}</Heading>
            <p className="text-center max-w-lg">{description}</p>
        </div>
    );
};

export default ContentUnavailable;
