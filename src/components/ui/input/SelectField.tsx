import { CSSProperties, ReactNode, useState } from "react";
import { Select } from "radix-ui";
import OutlinedField from "./OutlinedField";

export type SelectOption = {
    value: string;
    label: ReactNode;
};

type SelectFieldProps = {
    label?: ReactNode;
    value?: string;
    onChange?: (value: string) => void;
    options: SelectOption[];
    required?: boolean;
    disabled?: boolean;
    helperText?: ReactNode;
    fullWidth?: boolean;
    sx?: CSSProperties;
};

const SelectField = ({
    label,
    value,
    onChange,
    options,
    required,
    disabled,
    helperText,
    fullWidth,
    sx,
}: SelectFieldProps) => {
    const [open, setOpen] = useState(false);

    return (
        <OutlinedField
            label={label}
            required={required}
            disabled={disabled}
            focused={open}
            shrink={open || Boolean(value)}
            helperText={helperText}
            fullWidth={fullWidth}
            style={sx}
        >
            <Select.Root
                value={value || undefined}
                onValueChange={onChange}
                open={open}
                onOpenChange={setOpen}
                disabled={disabled}
            >
                <Select.Trigger
                    aria-label={typeof label === "string" ? label : undefined}
                    className="flex min-h-14 w-full items-center justify-between gap-2 rounded px-3.5 py-[16.5px] text-left text-base leading-[1.4375em] text-typography-1 outline-none"
                >
                    <span className="min-w-0 truncate">
                        <Select.Value />
                    </span>
                    <Select.Icon asChild>
                        <i className="bx bx-chevron-down shrink-0 text-[20px] text-typography-2" />
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Content
                        position="popper"
                        sideOffset={6}
                        className="z-[1400] max-h-72 w-[var(--radix-select-trigger-width)] min-w-40 overflow-hidden rounded-xl border border-divider bg-bg shadow-2xl"
                    >
                        <Select.Viewport className="p-1">
                            {options.map((option) => (
                                <Select.Item
                                    key={option.value}
                                    value={option.value}
                                    className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-typography-1 outline-0 data-[highlighted]:bg-layer-3"
                                >
                                    <Select.ItemText>
                                        {option.label}
                                    </Select.ItemText>
                                    <Select.ItemIndicator>
                                        <i className="bx bx-check" />
                                    </Select.ItemIndicator>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>
        </OutlinedField>
    );
};

export default SelectField;
