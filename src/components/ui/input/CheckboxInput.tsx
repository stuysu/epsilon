import { Checkbox } from "radix-ui";

type CheckboxInputProps = {
    checked: boolean | "indeterminate";
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
    small?: boolean;
};

const CheckboxInput = ({
    checked,
    onChange,
    label,
    disabled,
    small,
}: CheckboxInputProps) => {
    return (
        <Checkbox.Root
            checked={checked}
            onCheckedChange={(value) => onChange(value === true)}
            disabled={disabled}
            aria-label={label}
            className={
                "relative flex shrink-0 items-center justify-center bg-layer-3 shadow-control transition-colors " +
                // invisible padding widens the tap target without changing the look
                (small
                    ? "h-4 w-4 rounded before:absolute before:-inset-[8px] before:content-[''] "
                    : "h-6 w-6 rounded-md before:absolute before:-inset-[10px] before:content-[''] ") +
                "data-[state=checked]:bg-blue data-[state=indeterminate]:bg-blue " +
                // keeps an empty box visible on dark rows
                "data-[state=unchecked]:ring-1 data-[state=unchecked]:ring-inset data-[state=unchecked]:ring-typography-2 " +
                (disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")
            }
        >
            {/* the tick is dark on the light blue of the high contrast theme */}
            <Checkbox.Indicator className="text-white [[data-theme=dark-hc]_&]:text-black flex items-center justify-center">
                <i
                    className={`bx ${
                        checked === "indeterminate" ? "bx-minus" : "bx-check"
                    } ${small ? "text-sm" : "bx-sm"}`}
                />
            </Checkbox.Indicator>
        </Checkbox.Root>
    );
};

export default CheckboxInput;
