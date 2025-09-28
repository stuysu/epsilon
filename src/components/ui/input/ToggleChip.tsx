import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";

type ToggleChipProps = {
    title: string;
    selectable?: boolean;
    selected?: boolean;
    defaultSelected?: boolean;
    onChange?: (selected: boolean) => void;
};

const ToggleChip: React.FC<ToggleChipProps> = ({
    title,
    selectable = true,
    selected,
    defaultSelected = false,
    onChange,
}) => {
    return (
        <Toggle.Root
            pressed={selected}
            onPressedChange={(state) => onChange?.(state)}
            disabled={!selectable}
            className={`text-nowrap px-3 pt-1 pb-[0.35rem] rounded-lg text-sm text-typography-2 transition-colors bg-layer-2 shadow-control
        ${selectable ? "hover:bg-layer-3 cursor-pointer" : "cursor-default"}
        data-[state=on]:bg-accent data-[state=on]:text-white  important`}
        >
            {title}
        </Toggle.Root>
    );
};

export default ToggleChip;
