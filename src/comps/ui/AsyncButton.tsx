import React, { useState } from "react";
import Button, { ButtonProps } from "@mui/material/Button";

interface AsyncButtonProps extends ButtonProps {
    onClick?: () => void | Promise<any>;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({
    onClick,
    children,
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
        <Button
            onClick={handleClick}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading ? "Loading..." : children}
        </Button>
    );
};

export default AsyncButton;
