import { Select } from "radix-ui";

type FilterSelectProps<T extends string> = {
    value: T;
    onChange: (value: T) => void;
    options: { value: T; label: string }[];
    label: string;
};

export default function FilterSelect<T extends string>({
    value,
    onChange,
    options,
    label,
}: FilterSelectProps<T>) {
    const active = value !== options[0]?.value;

    return (
        <Select.Root
            value={value}
            onValueChange={(next) => onChange(next as T)}
        >
            <Select.Trigger
                aria-label={label}
                className={`relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg outline-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 ${
                    active
                        ? "text-accent"
                        : "text-typography-2 hover:text-typography-1"
                }`}
            >
                <i
                    className={`bx ${active ? "bxs-filter-alt" : "bx-filter-alt"} bx-sm`}
                    aria-hidden="true"
                />
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    position="popper"
                    align="end"
                    sideOffset={6}
                    className="z-50 min-w-48 overflow-hidden rounded-xl border border-divider bg-bg shadow-2xl"
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
    );
}
