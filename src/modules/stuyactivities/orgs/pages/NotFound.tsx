import React, { useState } from "react";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import usePageMeta from "../../../../utils/usePageMeta";

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
    usePageMeta("Page Not Found - Epsilon");
    const [text] = useState(
        () => FlavorText[Math.floor(Math.random() * FlavorText.length)],
    );
    return <ContentUnavailable title={"Page Not Found"} description={text} />;
};

export default NotFound;
