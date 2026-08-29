import { ChangeEvent, ReactNode } from "react";

type SearchInputProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    icon?: string;
    trailing?: ReactNode;
    containerClassName?: string;
    inputClassName?: string;
};

export default function SearchInput({
    placeholder = "Search...",
    value,
    onChange,
    icon = "bx bx-search bx-sm",
    trailing,
    containerClassName = "",
    inputClassName = "",
}: SearchInputProps) {
    return (
        <div
            className={`relative w-full h-11 mb-5 flex justify-center ${containerClassName}`}
        >
            <i
                className={`pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-typography-2 ${icon}`}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                className={`w-full rounded-xl px-12 transition-colors
                text-typography-1
                important
              bg-layer-1
              hover:bg-layer-2
              focus:bg-layer-3
              outline-0
              shadow-control
              ${trailing ? "pr-12" : ""}
              ${inputClassName}`}
            />
            {trailing}
        </div>
    );
}
