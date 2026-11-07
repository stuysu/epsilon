import {
    ChangeEvent,
    CSSProperties,
    FocusEvent,
    InputHTMLAttributes,
    ReactNode,
    Ref,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import OutlinedField from "./OutlinedField";

export type TextFieldProps = Omit<
    InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>,
    "onChange" | "value" | "defaultValue" | "style"
> & {
    label?: ReactNode;
    value?: string | number | null;
    defaultValue?: string | number;
    onChange?: (event: ChangeEvent<any>) => void;
    error?: boolean;
    helperText?: ReactNode;
    multiline?: boolean;
    rows?: number;
    fullWidth?: boolean;
    startAdornment?: ReactNode;
    inputRef?: Ref<any>;
    sx?: CSSProperties;
    style?: CSSProperties;
};

const inputClass =
    "w-full min-w-0 bg-transparent py-[16.5px] text-base leading-[1.4375em] text-typography-1 outline-none disabled:cursor-default";

const TextField = ({
    label,
    required,
    error,
    disabled,
    helperText,
    multiline,
    rows,
    fullWidth,
    startAdornment,
    inputRef,
    sx,
    style,
    className,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    ...props
}: TextFieldProps) => {
    const [focused, setFocused] = useState(false);
    const [typed, setTyped] = useState(Boolean(defaultValue));
    const helperId = useId();
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    /* a multiline field without a set number of rows grows with its text */
    const autoGrow = multiline && rows === undefined;
    const fitToText = useCallback(() => {
        const textarea = textareaRef.current;
        if (!autoGrow || !textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${textarea.scrollHeight}px`;
    }, [autoGrow]);
    useLayoutEffect(fitToText, [fitToText, value]);

    const setTextareaRef = (element: HTMLTextAreaElement | null) => {
        textareaRef.current = element;
        if (typeof inputRef === "function") inputRef(element);
        else if (inputRef) {
            (inputRef as { current: unknown }).current = element;
        }
    };

    const filled =
        value === undefined ? typed : value !== null && String(value) !== "";

    const sharedProps = {
        "aria-label": typeof label === "string" ? label : undefined,
        ...props,
        // screen readers read the hint along with the field
        "aria-describedby": helperText
            ? [props["aria-describedby"], helperId].filter(Boolean).join(" ")
            : props["aria-describedby"],
        ref: inputRef,
        required,
        disabled,
        value: value === null ? "" : value,
        defaultValue,
        placeholder: focused ? props.placeholder : undefined,
        onChange: (event: ChangeEvent<any>) => {
            setTyped(Boolean(event.target.value));
            onChange?.(event);
            fitToText();
        },
        onFocus: (event: FocusEvent<any>) => {
            setFocused(true);
            onFocus?.(event);
        },
        onBlur: (event: FocusEvent<any>) => {
            setFocused(false);
            onBlur?.(event);
        },
    };

    return (
        <OutlinedField
            label={label}
            required={required}
            error={error}
            disabled={disabled}
            focused={focused}
            shrink={focused || filled || Boolean(startAdornment)}
            helperText={helperText && <span id={helperId}>{helperText}</span>}
            fullWidth={fullWidth}
            className={className}
            style={{ ...sx, ...style }}
        >
            <div className="flex w-full items-center px-3.5">
                {startAdornment && (
                    <span className="shrink-0 whitespace-nowrap text-base text-black/60 scheme-dark:text-white/70">
                        {startAdornment}
                    </span>
                )}
                {multiline ? (
                    <textarea
                        {...sharedProps}
                        ref={setTextareaRef}
                        rows={rows ?? 1}
                        className={`${inputClass} resize-none ${autoGrow ? "overflow-hidden" : ""}`}
                    />
                ) : (
                    <input {...sharedProps} className={inputClass} />
                )}
            </div>
        </OutlinedField>
    );
};

export default TextField;
