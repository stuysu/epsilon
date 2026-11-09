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
    containerClassName = "mb-5",
    inputClassName = "",
    id,
    "aria-label": ariaLabel,
}: SearchInputProps) {
    return (
        <div
            className={`relative w-full h-12 flex justify-center ${containerClassName}`}
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
                className={` w-full rounded-xl pl-12 ${trailing ? "pr-14" : "pr-12"} transition-colors
                text-typography-1
                important
              placeholder:text-typography-2
              [[data-theme=dark-hc]_&]:placeholder:text-typography-3
              [[data-theme=orange]_&]:placeholder:text-[#6a4a3f]
              bg-layer-1
              hover:bg-layer-2
              focus:bg-layer-3
              outline-0
              focus-visible:outline
              focus-visible:outline-2
              focus-visible:outline-offset-2
              focus-visible:outline-typography-1
              shadow-control
              ${inputClassName}`}
            />
            {trailing && (
                <div className="absolute right-2 top-1/2 z-10 -translate-y-1/2">
                    {trailing}
                </div>
            )}
        </div>
    );
}
