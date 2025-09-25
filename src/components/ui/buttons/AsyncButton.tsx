import React, { useState } from "react";
import { ButtonProps } from "@mui/material/Button";
import { ButtonBase, SxProps, Theme } from "@mui/material";

interface AsyncButtonProps extends ButtonProps {
    onClick?: () => void | Promise<any>;
    sx?: SxProps<Theme>;
    isPrimary?: boolean;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
    onClick,
    children,
    sx = {},
    isPrimary = false,
    ...props
}) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        setIsLoading(true);
        try {
            if (onClick) {
                const result = onClick();
                if (result instanceof Promise) {
                    await result;
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ButtonBase
            onClick={handleClick}
            sx={{
                fontFamily: "inter-variable",
                fontVariationSettings: "'wght' 700",
                borderRadius: "11px",
                backgroundColor: isPrimary
                    ? "var(--accent)"
                    : "var(--layer-secondary)",
                color: isPrimary ? "white" : "var(--text-primary)",
                padding: "11px 20px 13px 20px",
                fontSize: "14px",
                opacity: isLoading || props.disabled ? 0.6 : 1,
                boxShadow: props.disabled
                    ? "0 3px 3px 0 var(--shadow-base) inset, 0 0 2px 0 var(--shadow-antithesis) inset, 0 1px 1px 0 var(--shadow-decoration) inset, 0 -5px 20px 0 var(--shadow-fume) inset"
                    : "0 4px 20px 0 var(--shadow-base), 0 4px 3px 0 var(--shadow-base), 0 0 3px 0 var(--shadow-antithesis) inset, 0 -7px 20px 0 var(--shadow-fume) inset",
                ...sx,
            }}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </ButtonBase>
    );
};

export default AsyncButton;
