import { ChangeEvent, ReactNode } from "react";

type SearchInputProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    icon?: string;
    trailing?: ReactNode;
    containerClassName?: string;
    inputClassName?: string;
    id?: string;
    // the placeholder disappears once someone types, so it is only a fallback name
    "aria-label"?: string;
};

export default function SearchInput({
    placeholder = "Search...",
    value,
    onChange,
    icon = "bx bx-search bx-sm",
    trailing,
    containerClassName = "",
    inputClassName = "",
    id,
    "aria-label": ariaLabel,
}: SearchInputProps) {
    return (
        <div
            className={`relative w-full h-12 mb-5 flex justify-center ${containerClassName}`}
        >
            <i
                className={`absolute ${icon} z-10 top-[0.8rem] left-3 text-typography-2`}
                aria-hidden="true"
            />
            <input
                type="text"
                id={id}
                aria-label={ariaLabel ?? placeholder}
                placeholder={placeholder}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                className={` w-full rounded-xl px-12 transition-colors
                text-typography-1
                important
              placeholder:text-typography-2
              [[data-theme=orange]_&]:placeholder:text-typography-1
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
