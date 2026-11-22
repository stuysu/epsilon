import { KeyboardEvent } from "react";

/*
Gives a clickable div or paragraph the role, focus and keys of the control it
stands for. Hidden menus pass focusable = false so the Tab key skips their
items. Keys pressed on a control inside the element are left to that control.
*/
const pressable = (
    onPress: () => void,
    { role = "button", focusable = true } = {},
) => ({
    role,
    tabIndex: focusable ? 0 : -1,
    onClick: onPress,
    onKeyDown: (event: KeyboardEvent) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === "Enter" || (role === "button" && event.key === " ")) {
            event.preventDefault();
            onPress();
        }
    },
});

export default pressable;
