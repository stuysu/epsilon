import { ChangeEvent } from "react";

type TextInputProps = {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
};

export default function TextInput({
    placeholder = "Send a message...",
    value,
    onChange,
}: TextInputProps) {
    return (
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    onChange(e.target.value)
                }
                className=" w-full rounded-xl px-4 h-11 transition-colors
                text-typography-1
                important
              bg-layer-2
              hover:bg-layer-3
              focus:outline-1
              shadow-inner
        "
            />
    );
}
