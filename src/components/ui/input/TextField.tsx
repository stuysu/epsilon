import {
    ChangeEvent,
    CSSProperties,
    FocusEvent,
    InputHTMLAttributes,
    ReactNode,
    Ref,
    useCallback,
    useId,
    useImperativeHandle,
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
    "w-full min-w-0 bg-transparent text-base leading-[1.4375em] text-typography-1 outline-hidden disabled:cursor-default";

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

    // a textarea keeps its own ref for resizing and hands the element on
    useImperativeHandle(
        multiline ? inputRef : undefined,
        () => textareaRef.current,
        [],
    );

    const filled =
        value === undefined ? typed : value !== null && String(value) !== "";
    // the browser always shows a format like mm/dd/yyyy in these
    const showsFormat = [
        "date",
        "time",
        "datetime-local",
        "month",
        "week",
    ].includes(props.type ?? "");

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
            shrink={focused || filled || showsFormat || Boolean(startAdornment)}
            helperText={helperText && <span id={helperId}>{helperText}</span>}
            fullWidth={fullWidth}
            className={className}
            style={{ ...sx, ...style }}
        >
            {/* a textarea's own padding scrolls with its text, under the
                floating label, so the wrapper holds the padding instead */}
            <div
                className={`flex w-full items-center px-3.5 ${multiline ? "cursor-text py-[16.5px]" : ""}`}
                onClick={
                    multiline ? () => textareaRef.current?.focus() : undefined
                }
            >
                {startAdornment && (
                    <span className="min-w-0 truncate whitespace-nowrap text-base text-black/60 scheme-dark:text-white/70">
                        {startAdornment}
                    </span>
                )}
                {multiline ? (
                    <textarea
                        {...sharedProps}
                        ref={textareaRef}
                        rows={rows ?? 1}
                        className={`${inputClass} resize-none ${autoGrow ? "overflow-hidden" : ""}`}
                    />
                ) : (
                    <input
                        {...sharedProps}
                        className={`${startAdornment ? inputClass.replace("w-full min-w-0", "w-0 flex-1 min-w-[10ch]") : inputClass} py-[16.5px]`}
                    />
                )}
            </div>
        </OutlinedField>
    );
};

export default TextField;
