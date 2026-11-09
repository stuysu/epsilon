import * as React from "react";
import * as Toggle from "@radix-ui/react-toggle";
import { PILL_CLASS, pillColors } from "./FilterControls";

type ToggleChipProps = {
    title: string;
    selectable?: boolean;
    defaultSelected?: boolean;
    // pass selected to control the chip from its parent
    selected?: boolean;
    onChange?: (selected: boolean) => void;
};

const ToggleChip: React.FC<ToggleChipProps> = ({
    title,
    selectable = true,
    defaultSelected = false,
    selected,
    onChange,
}) => {
    return (
        <Toggle.Root
            defaultPressed={defaultSelected}
            pressed={selected}
            onPressedChange={(state) => onChange?.(state)}
            disabled={!selectable}
            className={`${PILL_CLASS} ${
                selectable
                    ? `${pillColors(false)} data-[state=on]:bg-accent data-[state=on]:text-white sm:data-[state=on]:hover:bg-accent sm:data-[state=on]:hover:text-white`
                    : "cursor-default bg-layer-2 text-typography-2 data-[state=on]:bg-accent data-[state=on]:text-white"
            }`}
        >
            {title}
        </Toggle.Root>
    );
};

export default ToggleChip;
