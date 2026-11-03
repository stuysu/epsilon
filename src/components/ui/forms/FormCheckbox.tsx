import CheckboxField from "../input/CheckboxField";

type Props = {
    field: string;
    label?: string;
    value?: boolean;
    description?: string;
    onChange?: (newValue: boolean) => void;
};

/* no requirements or validation, default value in form should be false. */
const FormCheckbox = ({ label, value, description, onChange }: Props) => {
    return (
        <div className="flex flex-col">
            <CheckboxField
                checked={Boolean(value)}
                onChange={(checked) => onChange?.(checked)}
                label={label ?? ""}
            />
            <p className="mt-[3px] text-[0.75rem] leading-[1.66] text-black/60 scheme-dark:text-white/70">
                {description?.split("\n").map((line, i) => (
                    <span key={i}>
                        {line}
                        <br />
                    </span>
                ))}
            </p>
        </div>
    );
};

export default FormCheckbox;
