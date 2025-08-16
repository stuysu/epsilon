import React from "react";

type ContentUnavailableProps = {
    icon?: string;
    iconColor?: string;
    title: string;
    description: string;
};

const ContentUnavailable: React.FC<ContentUnavailableProps> = ({
    icon = "bx-circle",
    iconColor = "text-gray-500",
    title,
    description,
}) => {
    return (
        <div className="flex flex-col justify-center items-center h-[65vh] px-8">
            <i className={`bx ${icon} bx-lg ${iconColor} mb-5`}></i>
            <h1 className={"text-center mb-5"}>{title}</h1>
            <p className="text-center max-w-lg">{description}</p>
        </div>
    );
};

export default ContentUnavailable;
