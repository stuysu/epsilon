import React, { useState } from "react";
import { ButtonProps } from "@mui/material/Button";
import { ButtonBase, SxProps, Theme } from "@mui/material";

interface AsyncButtonProps extends ButtonProps {
    onClick?: () => void | Promise<any>;
    sx?: SxProps<Theme>;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
    onClick,
    children,
    sx = {},
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
                borderRadius: "12px",
                backgroundColor: "var(--layer-secondary)",
                color: "var(--text-primary)",
                padding: "11px 20px 13px 20px",
                fontSize: "14px",
                opacity: isLoading || props.disabled ? 0.7 : 1,
                boxShadow:
                    "0px 0px 1.5px 0px rgba(255, 255, 255, 0.25) inset, 0px 0px 10px 0px rgba(255, 255, 255, 0.10) inset, 0px 4px 17.1px 0px rgba(0, 0, 0, 0.25)",
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
