import { ReactNode } from "react";
import CheckboxInput from "./CheckboxInput";

type CheckboxFieldProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
    // a fuller name for screen readers when the visible label is ambiguous
    ariaLabel?: string;
    disabled?: boolean;
    // paragraph-sized, for dense lists
    small?: boolean;
};

const CheckboxField = ({
    checked,
    onChange,
    label,
    ariaLabel,
    disabled,
    small,
}: CheckboxFieldProps) => (
    <label
        className={`mr-4 inline-flex items-center align-middle ${small ? "gap-2 py-1" : "gap-2.5 py-2"} ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
        <CheckboxInput
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            small={small}
            label={ariaLabel ?? (typeof label === "string" ? label : "")}
        />
        <span
            className={`text-typography-1 ${small ? "text-[0.9rem] [font-variation-settings:'wght'_500]" : ""}`}
        >
            {label}
        </span>
    </label>
);

export default CheckboxField;
