import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";

type ToggleChipProps = {
    title: React.ReactNode;
    selectable?: boolean;
    defaultSelected?: boolean;
    onChange?: (selected: boolean) => void;
    onClick?: () => void;
    className?: string;
    variant?: "rectangle" | "pill";
};

const ToggleChip: React.FC<ToggleChipProps> = ({
    title,
    selectable = true,
    defaultSelected = false,
    onChange,
    onClick,
    className = "",
    variant = "rectangle",
}) => {
    const variantClasses =
        variant === "pill"
            ? "rounded-full bg-layer-3 px-3 py-1.5 shadow-none"
            : "rounded-lg bg-layer-2 px-3 pt-1.5 pb-[0.35rem] shadow-control";

    return (
        <Toggle.Root
            defaultPressed={defaultSelected}
            onPressedChange={(state) => onChange?.(state)}
            onClick={onClick}
            {...(onClick ? { pressed: false } : {})}
            disabled={!selectable}
            className={`text-nowrap transition-colors ${variantClasses}
        ${selectable ? "hover:bg-layer-3 cursor-pointer" : "cursor-default"}
        data-[state=on]:bg-accent data-[state=on]:text-white important ${className}`}
        >
            <p className={"important text-typography-1"}>{title}</p>
        </Toggle.Root>
    );
};

export default ToggleChip;
