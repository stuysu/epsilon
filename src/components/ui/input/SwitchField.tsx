import { CSSProperties, ReactNode } from "react";
import { Switch } from "radix-ui";

type SwitchFieldProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: ReactNode;
    disabled?: boolean;
    className?: string;
    style?: CSSProperties;
};

const SwitchField = ({
    checked,
    onChange,
    label,
    disabled,
    className = "",
    style,
}: SwitchFieldProps) => (
    <label
        className={`mr-4 inline-flex items-center gap-2 align-middle ${disabled ? "cursor-default opacity-60" : "cursor-pointer"} ${className}`}
        style={style}
    >
        <Switch.Root
            checked={checked}
            onCheckedChange={onChange}
            disabled={disabled}
            className="relative h-6 w-11 shrink-0 rounded-full bg-layer-3 transition-colors data-[state=checked]:bg-blue"
        >
            <Switch.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white/90 shadow transition-transform ease-in-out data-[state=checked]:translate-x-[22px]" />
        </Switch.Root>
        {label && <span className="text-typography-1">{label}</span>}
    </label>
);

export default SwitchField;
