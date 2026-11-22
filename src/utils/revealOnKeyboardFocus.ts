import { FocusEvent } from "react";

/*
brings an item focused from the keyboard clear of its scroller's faded edge;
a mouse press focuses it too, and scrolling then would move it out from under
the pointer and lose the click, so that case is left alone
*/
const revealOnKeyboardFocus = (event: FocusEvent<HTMLElement>) => {
    try {
        if (!event.currentTarget.matches(":focus-visible")) return;
    } catch {
        // browsers without :focus-visible (Safari before 15.4) skip the reveal
        return;
    }
    event.currentTarget.scrollIntoView({ block: "nearest", inline: "nearest" });
};

export default revealOnKeyboardFocus;
