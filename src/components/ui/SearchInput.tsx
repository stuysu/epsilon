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
            <i className={`absolute ${icon} z-10 top-[0.8rem] left-3`} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                className=" w-full rounded-xl px-12 pt-1 transition-colors
              bg-[#1F1F1F80]
              focus:bg-[#3A3A3A80]
              outline-0
              hover:bg-[#2A2A2A80]
              [box-shadow:inset_0_0_2px_rgba(255,255,255,0.3)]
        "
                style={{
                    fontVariationSettings: "'wght' 700",
                }}
            />
        </div>
    );
}
