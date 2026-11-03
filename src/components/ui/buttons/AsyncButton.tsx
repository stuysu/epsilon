import React, { CSSProperties, useState } from "react";

const semanticColors: Record<string, { background: string; text: string }> = {
    primary: { background: "#90caf9", text: "rgba(0, 0, 0, 0.87)" },
    secondary: { background: "#ce93d8", text: "rgba(0, 0, 0, 0.87)" },
    error: { background: "#f44336", text: "#fff" },
    info: { background: "#29b6f6", text: "rgba(0, 0, 0, 0.87)" },
    success: { background: "#66bb6a", text: "rgba(0, 0, 0, 0.87)" },
    warning: { background: "#ffa726", text: "rgba(0, 0, 0, 0.87)" },
};

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
    const semanticColor = color ? semanticColors[color] : undefined;

    const handleClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    ) => {
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
        "relative inline-flex select-none items-center justify-center rounded-[11px] px-5 pb-[13px] pt-[11px] align-middle text-[14px] outline-none transition-[filter,transform] [font-family:inter-variable] [font-variation-settings:'wght'_700]",
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
            : "0 4px 20px 0 var(--shadow-base), 0 4px 3px 0 var(--shadow-base), 0 0 3px 0 var(--shadow-antithesis) inset, 0 -7px 20px 0 var(--shadow-fume) inset",
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
            disabled={isDisabled}
            onClick={(event) => void handleClick(event)}
        >
            {content}
        </button>
    );
};

export default AsyncButton;
