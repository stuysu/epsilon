import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";

type InteractiveChipProps = {
    title?: string;
    children?: React.ReactNode;
    selectable?: boolean;
    defaultSelected?: boolean;
    onChange?: (selected: boolean) => void;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    flat?: boolean;
    disabled?: boolean;
    className?: string;
    icon?: string; // NEW
};

const InteractiveChip: React.FC<InteractiveChipProps> = ({
    title,
    children,
    selectable = true,
    defaultSelected = false,
    onChange,
    onClick,
    flat = false,
    disabled = false,
    className = "",
    icon, // NEW
}) => {
    const baseClasses =
        "text-nowrap px-3 pt-1 pb-[0.35rem] text-sm transition-colors bg-layer-2 inline-flex items-center gap-1.5";
    const shapeClasses = flat
        ? "text-typography-1 rounded-full bg-layer-3"
        : "text-typography-2 rounded-lg shadow-control";
    const hoverClass = onClick
        ? "hover:brightness-200"
        : selectable
          ? "hover:bg-layer-3"
          : "";
    const cursorClass = disabled
        ? "cursor-default"
        : selectable || onClick
          ? "cursor-pointer"
          : "";
    const stateClasses =
        "data-[state=on]:bg-accent data-[state=on]:text-white important";

    const sharedClasses = [
        baseClasses,
        shapeClasses,
        hoverClass,
        cursorClass,
        className,
        stateClasses,
    ]
        .filter(Boolean)
        .join(" ");

    const content = (
        <>
            {icon && <i className={`relative bx-xs top-px right-0.5 bx bx-${icon}`} />}
            {children ?? title}
        </>
    );

    if (onClick) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={sharedClasses}
            >
                {content}
            </button>
        );
    }

    if (selectable) {
        return (
            <Toggle.Root
                defaultPressed={defaultSelected}
                onPressedChange={(state) => onChange?.(state)}
                disabled={disabled}
                className={sharedClasses}
            >
                {content}
            </Toggle.Root>
        );
    }

    return <div className={sharedClasses}>{content}</div>;
};

export default InteractiveChip;
