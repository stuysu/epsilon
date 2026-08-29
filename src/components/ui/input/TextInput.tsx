import { ChangeEvent, InputHTMLAttributes } from "react";

type TextInputProps = Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange"
> & {
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
};

export default function TextInput({
    placeholder = "Send a message...",
    value,
    onChange,
    className = "",
    type = "text",
    ...props
}: TextInputProps) {
    return (
        <input
            {...props}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                onChange(e.target.value)
            }
            className={`w-full rounded-xl px-4 h-11 transition-colors
                text-typography-1
                important
              bg-layer-2
              sm:hover:bg-layer-3
              focus:outline-1
              shadow-inner
              ${className}`}
        />
    );
}
