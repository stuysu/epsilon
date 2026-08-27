import React, { CSSProperties, useState } from "react";

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
    variant?: string;
};

const AsyncButton: React.FC<AsyncButtonProps> = ({
    onClick,
    children,
    sx = {},
    isPrimary = false,
    component = "button",
    disabled = false,
    className,
    style,
    type,
    color: _color,
    variant: _variant,
    ...props
}) => {
    void _color;
    void _variant;

    const [isLoading, setIsLoading] = useState(false);
    const isDisabled = isLoading || disabled;

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
        "important relative inline-flex items-center justify-center",
        "px-5 pb-[10px] pt-[9px] align-middle text-[14px] no-underline outline-none",
        "rounded-xl active:scale-[98%]",
        isPrimary ? "bg-accent text-white" : "bg-layer-2 text-typography-1",
        disabled ? "" : "shadow-control",
        isDisabled
            ? "pointer-events-none cursor-default opacity-50"
            : "cursor-pointer hover:brightness-125",
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const buttonStyle: CSSProperties = { ...sx, ...style };

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
                onClick={(event) => {
                    if (isDisabled) {
                        event.preventDefault();
                        return;
                    }

                    void handleClick(
                        event as unknown as React.MouseEvent<
                            HTMLButtonElement,
                            MouseEvent
                        >,
                    );
                }}
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
