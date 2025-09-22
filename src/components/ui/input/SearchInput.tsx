import { ChangeEvent } from "react";

type SearchInputProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
    icon?: string;
};

export default function SearchInput({
    placeholder = "Search...",
    value,
    onChange,
    icon = "bx bx-search bx-sm",
}: SearchInputProps) {
    return (
        <div className="relative w-full h-12 mb-5 flex justify-center">
            <i
                className={`absolute ${icon} z-10 top-[0.8rem] left-3 text-typography-2`}
            />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                className=" w-full rounded-xl px-12 transition-colors
                text-typography-1
                important
              bg-layer-1
              sm:hover:bg-layer-2
              focus:bg-layer-3
              outline-0
              shadow-control
        "
            />
        </div>
    );
}
