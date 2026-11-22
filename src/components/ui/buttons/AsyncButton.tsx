import React, { CSSProperties, useState } from "react";

// shared with links that should look like buttons
export const BUTTON_CLASS = [
    "relative inline-flex select-none items-center justify-center rounded-[11px] px-5 pb-[13px] pt-[11px] align-middle text-[14px] outline-none transition-[filter,transform] [font-family:inter-variable] [font-variation-settings:'wght'_700]",
    // an outline, since the inline box-shadow would hide a ring; the label
    // variant wraps a hidden file input, so it shows the input's focus
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-typography-1",
].join(" ");
export const BUTTON_SHADOW =
    "0 4px 20px 0 var(--shadow-base), 0 4px 3px 0 var(--shadow-base), 0 0 3px 0 var(--shadow-antithesis) inset, 0 -7px 20px 0 var(--shadow-fume) inset";

/* the colors are CSS variables in app.css, so they follow the light or dark scheme */
const SEMANTIC_COLORS = [
    "primary",
    "secondary",
    "error",
    "info",
    "success",
    "warning",
];

type AsyncButtonProps = Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "color" | "onClick"
> & {
    onClick?: (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => void | Promise<any>;
    sx?: CSSProperties;
    isPrimary?: boolean;
    component?: "button" | "label";
    color?: string;
};

const AsyncButton: React.FC<AsyncButtonProps> = ({
    onClick,
    children,
    sx = {},
    isPrimary = false,
    component = "button",
    disabled = false,
    className = "",
    style,
    type,
    color,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = isLoading || disabled;
    // focus moves to the page body when a focused button becomes disabled,
    // so a busy button only reports itself as disabled
    const busyProps = isLoading
        ? { "aria-disabled": true, "aria-busy": true }
        : {};
    const semanticColor =
        color && SEMANTIC_COLORS.includes(color)
            ? {
                  background: `var(--semantic-${color})`,
                  text: `var(--semantic-${color}-text)`,
              }
            : undefined;

    const handleClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
        // a busy submit button must not submit its form a second time
        if (isLoading) {
            e.preventDefault();
            return;
        }
        setIsLoading(true);
        try {
            if (onClick) {
                const result = onClick(e);
                if (result instanceof Promise) {
                    await result;
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    const buttonClassName = [
        BUTTON_CLASS,
        isDisabled
            ? "pointer-events-none cursor-default opacity-60"
            : "cursor-pointer hover:brightness-125 active:scale-[98%]",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const buttonStyle: CSSProperties = {
        backgroundColor: isPrimary
            ? "var(--accent)"
            : semanticColor?.background ?? "var(--layer-secondary)",
        color: isPrimary
            ? "white"
            : semanticColor?.text ?? "var(--text-primary)",
        boxShadow: disabled
            ? "0 3px 3px 0 var(--shadow-base) inset, 0 0 2px 0 var(--shadow-antithesis) inset, 0 1px 1px 0 var(--shadow-decoration) inset, 0 -5px 20px 0 var(--shadow-fume) inset"
            : BUTTON_SHADOW,
        ...sx,
        ...style,
    };

    const content = isLoading ? "Loading..." : children;

    if (component === "label") {
        const labelProps =
            props as unknown as React.LabelHTMLAttributes<HTMLLabelElement>;

        return (
            <label
                {...labelProps}
                className={buttonClassName}
                style={buttonStyle}
                aria-disabled={isDisabled}
                aria-busy={isLoading || labelProps["aria-busy"] || undefined}
            >
                {content}
            </label>
        );
    }

    return (
        <button
            {...props}
            type={type || "button"}
            className={buttonClassName}
            style={buttonStyle}
            disabled={disabled}
            {...busyProps}
            onClick={(event) => void handleClick(event)}
        >
            {content}
        </button>
    );
};

export default AsyncButton;
