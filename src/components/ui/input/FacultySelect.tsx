import {
    CSSProperties,
    Fragment,
    KeyboardEvent,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTheme } from "@mui/material";
import { Popover } from "radix-ui";

export type FacultyOption = {
    id: number;
    name: string;
    email: string;
    group?: string;
};

type FacultySelectProps = {
    label: string;
    options: FacultyOption[];
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
    error?: boolean;
    helperText?: string;
    noneLabel?: string;
    notFoundText?: string;
};

type Entry = { key: string; option?: FacultyOption };

export default function FacultySelect({
    label,
    options,
    value,
    onChange,
    required = false,
    error = false,
    helperText,
    noneLabel = "No faculty",
    notFoundText = "Faculty not found. They may not be registered on Epsilon yet.",
}: FacultySelectProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlighted, setHighlighted] = useState(0);
    const listRef = useRef<HTMLUListElement>(null);
    const listId = useId();
    const { palette } = useTheme();

    const themeVars = {
        "--fs-text": palette.text.primary,
        "--fs-muted": palette.text.secondary,
        "--fs-border":
            palette.mode === "light"
                ? "rgba(0, 0, 0, 0.23)"
                : "rgba(255, 255, 255, 0.23)",
        "--fs-focus": palette.primary.main,
        "--fs-error": palette.error.main,
        "--fs-surface": palette.background.paper,
        "--fs-overlay":
            palette.mode === "dark"
                ? "rgba(255, 255, 255, 0.12)"
                : "rgba(255, 255, 255, 0)",
        "--fs-divider": palette.divider,
        "--fs-hover-bg": palette.action.hover,
        "--fs-selected-bg": palette.action.selected,
    } as CSSProperties;

    const entries = useMemo<Entry[]>(() => {
        const term = query.trim().toLowerCase();
        const matching = term
            ? options.filter((option) =>
                  `${option.name} ${option.email}`.toLowerCase().includes(term),
              )
            : options;
        const list: Entry[] = matching.map((option) => ({
            key: String(option.id),
            option,
        }));
        return !required && !term ? [{ key: "none" }, ...list] : list;
    }, [options, query, required]);

    useEffect(() => {
        setHighlighted(0);
    }, [query, open]);

    useEffect(() => {
        listRef.current
            ?.querySelector<HTMLElement>(`[data-index="${highlighted}"]`)
            ?.scrollIntoView({ block: "nearest" });
    }, [highlighted]);

    const choose = (name: string) => {
        onChange(name);
        setOpen(false);
        setQuery("");
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "ArrowDown") {
            event.preventDefault();
            setHighlighted((index) => Math.min(index + 1, entries.length - 1));
        } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setHighlighted((index) => Math.max(index - 1, 0));
        } else if (event.key === "Enter") {
            event.preventDefault();
            const entry = entries[highlighted];
            if (entry) choose(entry.option?.name ?? "");
        }
    };

    return (
        <div className="w-full" style={themeVars}>
            <Popover.Root
                open={open}
                onOpenChange={(next) => {
                    setOpen(next);
                    if (!next) setQuery("");
                }}
            >
                <fieldset
                    className={`group relative m-0 h-14 min-w-0 rounded-[4px] border-[1px] px-0 py-0 transition-colors focus-within:border-2 has-[[data-state=open]]:border-2 ${
                        error
                            ? "border-[color:var(--fs-error)]"
                            : "border-[color:var(--fs-border)] hover:border-[color:var(--fs-text)] focus-within:border-[color:var(--fs-focus)] has-[[data-state=open]]:border-[color:var(--fs-focus)]"
                    }`}
                >
                    <legend
                        className={`ml-[9px] px-1 text-xs leading-none ${
                            error
                                ? "text-[color:var(--fs-error)]"
                                : "text-[color:var(--fs-muted)] group-focus-within:text-[color:var(--fs-focus)] group-has-[[data-state=open]]:text-[color:var(--fs-focus)]"
                        }`}
                    >
                        {label}
                        {required ? " *" : ""}
                    </legend>
                    <Popover.Trigger asChild>
                        <button
                            type="button"
                            role="combobox"
                            aria-expanded={open}
                            aria-controls={listId}
                            aria-label={label}
                            aria-invalid={error}
                            className="absolute inset-0 flex items-center justify-between gap-3 px-[14px] text-left text-base text-[color:var(--fs-text)] outline-0"
                        >
                            <span
                                className={`min-w-0 truncate ${
                                    value ? "" : "text-[color:var(--fs-muted)]"
                                }`}
                            >
                                {value ||
                                    (required
                                        ? "Select a faculty member"
                                        : noneLabel)}
                            </span>
                            <i className="bx bx-chevron-down text-xl text-[color:var(--fs-muted)] shrink-0" />
                        </button>
                    </Popover.Trigger>
                </fieldset>
                <Popover.Content
                    align="start"
                    sideOffset={4}
                    onOpenAutoFocus={(event) => {
                        event.preventDefault();
                        (
                            (event.currentTarget as HTMLElement).querySelector(
                                "input",
                            ) as HTMLInputElement | null
                        )?.focus();
                    }}
                    className="z-[1400] w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-[4px] bg-[color:var(--fs-surface)] bg-[image:linear-gradient(var(--fs-overlay),var(--fs-overlay))] text-[color:var(--fs-text)] shadow-[0_5px_5px_-3px_rgba(0,0,0,0.2),0_8px_10px_1px_rgba(0,0,0,0.14),0_3px_14px_2px_rgba(0,0,0,0.12)]"
                >
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search faculty by name or email"
                        aria-label="Search faculty"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={
                            entries[highlighted]
                                ? `${listId}-${entries[highlighted].key}`
                                : undefined
                        }
                        className="w-full h-12 px-4 bg-transparent text-base text-[color:var(--fs-text)] placeholder:text-[color:var(--fs-muted)] border-b border-[color:var(--fs-divider)] outline-0"
                    />
                    <ul
                        ref={listRef}
                        id={listId}
                        role="listbox"
                        className="max-h-60 overflow-y-auto py-1"
                    >
                        {entries.length ? (
                            entries.map((entry, index) => {
                                const previous = entries[index - 1]?.option;
                                const showGroup =
                                    entry.option?.group &&
                                    entry.option.group !== previous?.group;
                                const selected = entry.option
                                    ? entry.option.name === value
                                    : value === "";

                                return (
                                    <Fragment key={entry.key}>
                                        {showGroup && (
                                            <li
                                                role="presentation"
                                                className="px-4 pt-2 pb-1 text-xs uppercase tracking-wide text-[color:var(--fs-muted)]"
                                            >
                                                {entry.option?.group}
                                            </li>
                                        )}
                                        <li
                                            id={`${listId}-${entry.key}`}
                                            role="option"
                                            data-index={index}
                                            aria-selected={selected}
                                            onMouseEnter={() =>
                                                setHighlighted(index)
                                            }
                                            onClick={() =>
                                                choose(entry.option?.name ?? "")
                                            }
                                            className={`flex items-center justify-between gap-3 px-4 py-2 cursor-pointer ${
                                                index === highlighted
                                                    ? "bg-[color:var(--fs-hover-bg)]"
                                                    : ""
                                            } ${selected ? "bg-[color:var(--fs-selected-bg)]" : ""}`}
                                        >
                                            {entry.option ? (
                                                <span className="min-w-0">
                                                    <span className="block truncate">
                                                        {entry.option.name}
                                                    </span>
                                                    {entry.option.email && (
                                                        <span className="block truncate text-sm text-[color:var(--fs-muted)]">
                                                            {entry.option.email}
                                                        </span>
                                                    )}
                                                </span>
                                            ) : (
                                                <span className="text-[color:var(--fs-muted)]">
                                                    {noneLabel}
                                                </span>
                                            )}
                                            {selected && (
                                                <i className="bx bx-check shrink-0" />
                                            )}
                                        </li>
                                    </Fragment>
                                );
                            })
                        ) : (
                            <li className="px-4 py-3 text-sm text-[color:var(--fs-muted)]">
                                {notFoundText}
                            </li>
                        )}
                    </ul>
                </Popover.Content>
            </Popover.Root>
            {helperText && (
                <p
                    className={`mt-1 px-[14px] text-xs ${
                        error
                            ? "text-[color:var(--fs-error)]"
                            : "text-[color:var(--fs-muted)]"
                    }`}
                >
                    {helperText}
                </p>
            )}
        </div>
    );
}
