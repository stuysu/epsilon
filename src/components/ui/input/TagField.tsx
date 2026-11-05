import {
    CSSProperties,
    KeyboardEvent,
    ReactNode,
    useRef,
    useState,
} from "react";
import OutlinedField from "./OutlinedField";

type TagFieldProps = {
    label?: ReactNode;
    value?: string[];
    onChange?: (value: string[]) => void;
    /* Suggested values. Without options, anything typed can be added. */
    options?: string[];
    helperText?: ReactNode;
    sx?: CSSProperties;
};

const TagField = ({
    label,
    value = [],
    onChange,
    options,
    helperText,
    sx,
}: TagFieldProps) => {
    const [inputValue, setInputValue] = useState("");
    const [focused, setFocused] = useState(false);
    const [highlighted, setHighlighted] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const matches = (options ?? []).filter(
        (option) =>
            !value.includes(option) &&
            option.toLowerCase().includes(inputValue.trim().toLowerCase()),
    );
    const showOptions = focused && Boolean(options) && matches.length > 0;

    const add = (tag: string) => {
        setInputValue("");
        setHighlighted(0);
        if (!value.includes(tag)) onChange?.([...value, tag]);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Backspace" && !inputValue && value.length) {
            onChange?.(value.slice(0, -1));
            return;
        }

        if (showOptions && event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((i) => (i + 1) % matches.length);
            return;
        }
        if (showOptions && event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((i) => (i - 1 + matches.length) % matches.length);
            return;
        }

        if (event.key === "Enter" || (!options && event.key === ",")) {
            if (options) {
                if (!showOptions) return;
                event.preventDefault();
                add(matches[highlighted] ?? matches[0]);
            } else if (inputValue.trim()) {
                event.preventDefault();
                add(inputValue.trim());
            }
        }
    };

    return (
        <OutlinedField
            label={label}
            focused={focused}
            shrink={focused || value.length > 0 || Boolean(inputValue)}
            helperText={helperText}
            fullWidth
            style={sx}
        >
            <div
                className="flex min-h-14 w-full cursor-text flex-wrap items-center gap-1 px-[9px] py-[9px]"
                onClick={() => inputRef.current?.focus()}
            >
                {value.map((tag) => (
                    <span
                        key={tag}
                        className="inline-flex h-8 max-w-full items-center gap-1 rounded-full bg-layer-3 pl-3 pr-1.5 text-[0.8125rem] text-typography-1"
                    >
                        <span className="truncate">{tag}</span>
                        <button
                            type="button"
                            aria-label={`Remove ${tag}`}
                            onClick={(event) => {
                                event.stopPropagation();
                                onChange?.(value.filter((t) => t !== tag));
                            }}
                            className="flex h-5 w-5 items-center justify-center rounded-full text-typography-2 transition-colors hover:bg-divider"
                        >
                            <i className="bx bx-x text-[16px]" />
                        </button>
                    </span>
                ))}
                <input
                    ref={inputRef}
                    value={inputValue}
                    role={options ? "combobox" : undefined}
                    aria-expanded={options ? showOptions : undefined}
                    aria-label={typeof label === "string" ? label : undefined}
                    onChange={(event) => {
                        setInputValue(event.target.value);
                        setHighlighted(0);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        setFocused(false);
                        if (!options && inputValue.trim()) {
                            add(inputValue.trim());
                        }
                    }}
                    className="min-w-[30px] flex-1 bg-transparent px-[5px] py-[7.5px] text-base leading-[1.4375em] text-typography-1 outline-none"
                />
                {value.length > 0 && (
                    <button
                        type="button"
                        aria-label={`Clear all ${typeof label === "string" ? label : "tags"}`}
                        title="Clear all"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={(event) => {
                            event.stopPropagation();
                            onChange?.([]);
                            setInputValue("");
                        }}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-typography-2 opacity-0 transition-[opacity,background-color] hover:bg-layer-3 focus-visible:opacity-100 group-focus-within:opacity-100 group-hover:opacity-100"
                    >
                        <i className="bx bx-x text-[20px]" />
                    </button>
                )}
            </div>
            {showOptions && (
                <ul
                    role="listbox"
                    className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-divider bg-bg p-1 shadow-2xl"
                >
                    {matches.map((option, i) => (
                        <li
                            key={option}
                            role="option"
                            aria-selected={i === highlighted}
                            // keeps focus in the input so the click lands before onBlur closes the list
                            onMouseDown={(event) => {
                                event.preventDefault();
                                add(option);
                            }}
                            onMouseEnter={() => setHighlighted(i)}
                            className={`cursor-pointer rounded-lg px-3 py-2 text-typography-1 ${i === highlighted ? "bg-layer-3" : ""}`}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </OutlinedField>
    );
};

export default TagField;
