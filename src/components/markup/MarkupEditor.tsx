import { KeyboardEvent, Suspense, lazy, useId, useRef } from "react";

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
};

// The editor is large, so it loads only on pages that use it.
const MarkupEditorImpl = lazy(() => import("./MarkupEditorImpl"));

// Initial content comes from `markdown`; change the component's `key` to reset it.
const MarkupEditor = (props: MarkupEditorProps) => {
    const { label, placeholder, compact, tall, onSubmit } = props;
    const labelId = useId();
    const submitting = useRef(false);

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

        // Tab moves between table cells; elsewhere it leaves the editor
        // instead of typing a tab character.
        if (e.key === "Tab" && !e.ctrlKey && !e.metaKey && !e.altKey) {
            const anchor = window.getSelection()?.anchorNode;
            const element =
                anchor instanceof Element ? anchor : anchor?.parentElement;
            if (!element?.closest("td, th")) e.stopPropagation();
        }
    };

    const fallbackHeight = tall
        ? "h-[204px]"
        : compact
          ? "h-[83px]"
          : "h-[120px]";

    return (
        <div
            role="group"
            aria-labelledby={label ? labelId : undefined}
            aria-label={label ? undefined : props.ariaLabel ?? placeholder}
            className={`markup-editor w-full min-w-0 ${tall ? "markup-editor-tall" : ""}`}
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
                    ariaLabel={props.ariaLabel ?? label}
                />
            </Suspense>
        </div>
    );
};

export default MarkupEditor;
