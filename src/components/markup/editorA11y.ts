import { RefObject, useEffect } from "react";

// The editor library's toolbar marks each format button as a radio in its own
// one-item group, and its link dialog leaves the URL field and the dialog
// unnamed. These fix the names and roles screen readers announce.

const fixToolbar = (root: Element) => {
    root.querySelectorAll('[role="toolbar"]:not([aria-label])').forEach((bar) =>
        bar.setAttribute("aria-label", "Formatting"),
    );
    root.querySelectorAll('[role="toolbar"] [role="radiogroup"]').forEach(
        (group) => group.setAttribute("role", "presentation"),
    );
    root.querySelectorAll('[role="toolbar"] [role="radio"]').forEach(
        (button) => {
            button.setAttribute("role", "button");
            syncPressed(button);
        },
    );
};

// toggles report on/off as pressed; undo and redo are plain buttons
const syncPressed = (button: Element) => {
    const checked = button.getAttribute("aria-checked");
    if (checked === null) return;
    button.removeAttribute("aria-checked");
    const label = button.getAttribute("aria-label") ?? "";
    if (!/^(Undo|Redo)\b/.test(label))
        button.setAttribute("aria-pressed", checked);
};

const fixLinkDialog = () => {
    const input = document.querySelector(
        '.mdxeditor-popup-container input[name="url"]:not([id])',
    );
    if (!input) return;
    input.id = "link-url";
    const dialog = input.closest('[role="dialog"]');
    if (dialog && !dialog.hasAttribute("aria-label"))
        dialog.setAttribute("aria-label", "Edit link");
};

export const useEditorA11y = (ref: RefObject<HTMLElement | null>) => {
    useEffect(() => {
        const root = ref.current;
        if (!root) return;
        const toolbar = new MutationObserver((records) => {
            for (const record of records) {
                if (
                    record.type === "attributes" &&
                    record.target instanceof Element &&
                    record.target.getAttribute("role") === "button"
                )
                    syncPressed(record.target);
            }
            fixToolbar(root);
        });
        toolbar.observe(root, {
            subtree: true,
            childList: true,
            attributes: true,
            attributeFilter: ["aria-checked"],
        });
        fixToolbar(root);

        const dialogs = new MutationObserver(fixLinkDialog);
        dialogs.observe(document.body, { subtree: true, childList: true });
        return () => {
            toolbar.disconnect();
            dialogs.disconnect();
        };
    }, [ref]);
};
