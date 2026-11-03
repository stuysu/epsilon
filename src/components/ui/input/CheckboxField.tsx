import { ReactNode } from "react";
import CheckboxInput from "./CheckboxInput";

type CheckboxFieldProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: ReactNode;
    disabled?: boolean;
};

const CheckboxField = ({
    checked,
    onChange,
    label,
    disabled,
}: CheckboxFieldProps) => (
    <label
        className={`mr-4 inline-flex items-center gap-2.5 py-2 align-middle ${disabled ? "cursor-default opacity-60" : "cursor-pointer"}`}
    >
        <CheckboxInput
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            label={typeof label === "string" ? label : ""}
        />
        <span className="text-typography-1">{label}</span>
    </label>
);

export default CheckboxField;
