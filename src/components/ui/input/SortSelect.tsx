import { Select } from "radix-ui";
import { MemberSort, memberSortOptions } from "../../../utils/DataFormatters";

type SortSelectProps = {
    value: MemberSort;
    onChange: (value: MemberSort) => void;
};

export default function SortSelect({ value, onChange }: SortSelectProps) {
    return (
        <Select.Root
            value={value}
            onValueChange={(next) => onChange(next as MemberSort)}
        >
            <Select.Trigger
                aria-label="Sort members"
                className="h-12 mb-5 w-full sm:w-64 shrink-0 flex items-center justify-between gap-3 rounded-xl px-4
                text-typography-1 bg-layer-1 hover:bg-layer-2 focus:bg-layer-3 transition-colors outline-0 shadow-control"
            >
                <span className="flex items-center gap-2 min-w-0">
                    <i className="bx bx-sort-alt-2 bx-sm text-typography-2" />
                    <span className="truncate">
                        <Select.Value />
                    </span>
                </span>
                <Select.Icon asChild>
                    <i className="bx bx-chevron-down text-typography-2" />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content
                    position="popper"
                    sideOffset={6}
                    className="z-50 w-[var(--radix-select-trigger-width)] min-w-56 overflow-hidden rounded-xl bg-bg border border-divider shadow-2xl"
                >
                    <Select.Viewport className="p-1">
                        {memberSortOptions.map((option) => (
                            <Select.Item
                                key={option.value}
                                value={option.value}
                                className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 cursor-pointer text-typography-1 outline-0 data-[highlighted]:bg-layer-3"
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
