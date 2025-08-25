import React from "react";

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
                            <a
                                href={part}
                                className={"underline text-accent"}
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
        <p className={"w-full whitespace-pre-line"}>
            {formatTextWithLinks(text)}
        </p>
    );
};

export default DisplayLinks;
