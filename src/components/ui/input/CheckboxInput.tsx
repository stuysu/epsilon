import { Checkbox } from "radix-ui";

type CheckboxInputProps = {
    checked: boolean | "indeterminate";
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
};

const CheckboxInput = ({
    checked,
    onChange,
    label,
    disabled,
}: CheckboxInputProps) => {
    return (
        <Checkbox.Root
            checked={checked}
            onCheckedChange={(value) => onChange(value === true)}
            disabled={disabled}
            aria-label={label}
            className={
                "relative flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-layer-3 shadow-control transition-colors " +
                // invisible padding so the tap target is ~44px without changing the look
                "before:absolute before:-inset-[10px] before:content-[''] " +
                "data-[state=checked]:bg-blue data-[state=indeterminate]:bg-blue " +
                (disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")
            }
        >
            <Checkbox.Indicator className="text-white flex items-center justify-center">
                <i
                    className={`bx ${
                        checked === "indeterminate" ? "bx-minus" : "bx-check"
                    } bx-sm`}
                />
            </Checkbox.Indicator>
        </Checkbox.Root>
    );
};

export default CheckboxInput;
