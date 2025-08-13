import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";

type ToggleChipProps = {
    title: string;
    selectable?: boolean;
    defaultSelected?: boolean;
    onChange?: (selected: boolean) => void;
};

const ToggleChip: React.FC<ToggleChipProps> = ({
    title,
    selectable = true,
    defaultSelected = false,
    onChange,
}) => {
    return (
        <Toggle.Root
            defaultPressed={defaultSelected}
            onPressedChange={(state) => onChange?.(state)}
            disabled={!selectable}
            className={`px-3 pb-1 pt-1.5 rounded-lg text-sm text-typography-1 transition-colors bg-layer-2 shadow-control
        ${selectable ? "hover:bg-layer-3 cursor-pointer" : "cursor-default"}
        data-[state=on]:bg-accent`}
        >
            {title}
        </Toggle.Root>
    );
};

export default ToggleChip;
