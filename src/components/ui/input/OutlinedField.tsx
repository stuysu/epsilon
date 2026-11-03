import { CSSProperties, ReactNode } from "react";

type OutlinedFieldProps = {
    label?: ReactNode;
    required?: boolean;
    error?: boolean;
    disabled?: boolean;
    focused?: boolean;
    shrink?: boolean;
    helperText?: ReactNode;
    fullWidth?: boolean;
    style?: CSSProperties;
    className?: string;
    children: ReactNode;
};

// the resting border is the only outline a field has, so it reaches 3:1
const borderColor = (error?: boolean, focused?: boolean) => {
    if (error) return "border-[#d32f2f] scheme-dark:border-[#f44336]";
    if (focused) return "border-[#1565c0] scheme-dark:border-[#90caf9]";
    return "border-black/50 group-hover:border-black/90 scheme-dark:border-white/45 scheme-dark:group-hover:border-white";
};

const labelColor = (error?: boolean, focused?: boolean) => {
    if (error) return "text-[#d32f2f] scheme-dark:text-[#f44336]";
    if (focused) return "text-[#1565c0] scheme-dark:text-[#90caf9]";
    return "text-black/60 scheme-dark:text-white/70";
};

/* The outlined frame, floating label and helper text shared by every text-like field. */
const OutlinedField = ({
    label,
    required,
    error,
    disabled,
    focused,
    shrink,
    helperText,
    fullWidth,
    style,
    className = "",
    children,
}: OutlinedFieldProps) => (
    <div
        className={`inline-flex min-w-0 flex-col align-top ${fullWidth ? "w-full" : ""} ${disabled ? "opacity-60" : ""} ${className}`}
        style={style}
    >
        <div className="group relative flex w-full rounded">
            {children}
            <fieldset
                aria-hidden
                className={`pointer-events-none absolute inset-0 -top-[5px] m-0 min-w-0 rounded px-2 text-left ${focused || error ? "border-2" : "border"} ${borderColor(error, focused)}`}
            >
                <legend
                    className={`invisible block h-[11px] w-auto overflow-hidden whitespace-nowrap p-0 text-[0.75rem] ${shrink && label ? "max-w-full" : "max-w-[0.01px]"}`}
                >
                    {label && (
                        <span className="px-[5px]">
                            {label}
                            {required && " *"}
                        </span>
                    )}
                </legend>
            </fieldset>
            {label && (
                <span
                    className={`pointer-events-none absolute left-0 top-0 max-w-[calc(100%-24px)] origin-top-left truncate text-base leading-[1.4375em] transition-transform duration-200 ${labelColor(error, focused)} ${shrink ? "translate-x-[14px] -translate-y-[9px] scale-75" : "translate-x-[14px] translate-y-4"}`}
                >
                    {label}
                    {required && " *"}
                </span>
            )}
        </div>
        {helperText && (
            <div
                className={`mx-3.5 mt-[3px] text-[0.75rem] leading-[1.66] ${error ? "text-[#d32f2f] scheme-dark:text-[#f44336]" : "text-black/60 scheme-dark:text-white/70"}`}
            >
                {helperText}
            </div>
        )}
    </div>
);

export default OutlinedField;
