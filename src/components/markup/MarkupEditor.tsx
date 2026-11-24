import { KeyboardEvent, Suspense, lazy, useId, useRef } from "react";
import { useEditorA11y } from "./editorA11y";

export type MarkupEditorProps = {
    markdown?: string;
    onChange: (markdown: string) => void;
    placeholder?: string;
    // visible label above the editor
    label?: string;
    ariaLabel?: string;
    // fewer toolbar buttons, for short messages
    compact?: boolean;
    tall?: boolean;
    // called on Ctrl/Cmd+Enter
    onSubmit?: () => unknown;
    // shown in the placeholder's shortcut hint, e.g. "send"
    submitVerb?: string;
};

// The shortcut hint only makes sense with a keyboard.
const shortcutHint = (verb: string) => {
    if (window.matchMedia?.("(pointer: coarse)").matches) return "";
    const mac = /Mac|iPhone|iPad/.test(navigator.platform);
    return ` (${mac ? "⌘" : "Ctrl"}+Enter to ${verb})`;
};

// The editor is large, so it loads only on pages that use it.
const MarkupEditorImpl = lazy(() => import("./MarkupEditorImpl"));

// Initial content comes from `markdown`; change the component's `key` to reset it.
const MarkupEditor = (props: MarkupEditorProps) => {
    const { label, compact, tall, onSubmit } = props;
    // compact boxes sit in narrow panels where the hint would be cut off
    const placeholder =
        props.placeholder && onSubmit && !compact
            ? props.placeholder + shortcutHint(props.submitVerb ?? "submit")
            : props.placeholder;
    const labelId = useId();
    const submitting = useRef(false);
    const groupRef = useRef<HTMLDivElement>(null);
    useEditorA11y(groupRef);

    // Runs before the editor sees the key, so stopping it here keeps the
    // editor from handling it.
    const onKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest(".mdxeditor-popup-container")) return;

        if (onSubmit && e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            e.stopPropagation();
            if (submitting.current) return;
            submitting.current = true;
            Promise.resolve(onSubmit()).finally(() => {
                submitting.current = false;
            });
            return;
        }

        // Tab moves between table cells and nests list items (Shift+Tab
        // un-nests); when there's nothing to do it leaves the editor instead
        // of typing a tab character, so keyboard users never get stuck.
        if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const anchor = window.getSelection()?.anchorNode;
            const element =
                anchor instanceof Element ? anchor : anchor?.parentElement;
            const item = element?.closest("li");
            const stays =
                !!element?.closest("td, th") ||
                (!!item &&
                    (e.shiftKey
                        ? !!item.parentElement?.closest("li")
                        : !!item.previousElementSibling));
            if (!stays) e.stopPropagation();
        }
    };

    const fallbackHeight = tall
        ? "h-[204px]"
        : compact
          ? "h-[83px]"
          : "h-[120px]";

    return (
        <div
            ref={groupRef}
            role="group"
            aria-labelledby={label ? labelId : undefined}
            aria-label={
                label ? undefined : (props.ariaLabel ?? props.placeholder)
            }
            className={`markup-editor w-full min-w-0 ${tall ? "markup-editor-tall" : ""} ${compact ? "markup-editor-compact" : ""}`}
            onKeyDownCapture={onKeyDown}
        >
            {label && (
                <p id={labelId} className="mb-1 text-sm">
                    {label}
                </p>
            )}
            <Suspense
                fallback={
                    <div
                        className={`rounded-xl bg-layer-2 ${fallbackHeight}`}
                    />
                }
            >
                <MarkupEditorImpl
                    {...props}
                    placeholder={placeholder}
                    ariaLabel={props.ariaLabel ?? label ?? props.placeholder}
                />
            </Suspense>
        </div>
    );
};

export default MarkupEditor;
