import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";
import { Popover } from "radix-ui";
import dayjs, { Dayjs } from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import TextField from "./TextField";

dayjs.extend(customParseFormat);

type DateTimeFieldProps = {
    label: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    sx?: CSSProperties;
};

const useDraft = (
    value: Dayjs | null,
    format: string,
    formats: string[],
    commit: (parsed: Dayjs) => void,
    clear: () => void,
) => {
    const formatted = value?.isValid() ? value.format(format) : "";
    const [draft, setDraft] = useState(formatted);

    useEffect(() => setDraft(formatted), [formatted]);

    return {
        draft,
        setDraft: (next: string) => {
            setDraft(next);
            if (!next.trim()) return clear();

            const parsed = dayjs(next.trim().toUpperCase(), formats, true);
            if (parsed.isValid()) commit(parsed);
        },
        // whatever was left half typed goes back to the last good value
        reset: () => setDraft(formatted),
    };
};

const PickerField = ({
    label,
    icon,
    sx,
    draft,
    placeholder,
    onDraft,
    onBlur,
    open,
    setOpen,
    children,
}: {
    label: string;
    icon: string;
    sx?: CSSProperties;
    draft: string;
    placeholder: string;
    onDraft: (next: string) => void;
    onBlur: () => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    children: ReactNode;
}) => (
    <Popover.Root open={open} onOpenChange={setOpen} modal={false}>
        <Popover.Anchor asChild>
            <div className="relative inline-flex min-w-0" style={sx}>
                <TextField
                    label={label}
                    value={draft}
                    placeholder={placeholder}
                    fullWidth
                    autoComplete="off"
                    onChange={(event) => onDraft(event.target.value)}
                    onBlur={onBlur}
                />
                <Popover.Trigger
                    aria-label={`Choose ${label.toLowerCase()}`}
                    className="absolute right-2 top-[10px] flex h-9 w-9 items-center justify-center rounded-full text-typography-2 transition-colors hover:bg-layer-3"
                >
                    <i className={`bx ${icon} text-[20px]`} />
                </Popover.Trigger>
            </div>
        </Popover.Anchor>
        <Popover.Portal>
            <Popover.Content
                align="start"
                sideOffset={6}
                collisionPadding={12}
                onOpenAutoFocus={(event) => event.preventDefault()}
                className="z-[1400] rounded-xl border border-divider bg-bg shadow-2xl outline-none"
            >
                {children}
            </Popover.Content>
        </Popover.Portal>
    </Popover.Root>
);

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const Calendar = ({
    value,
    onSelect,
}: {
    value: Dayjs | null;
    onSelect: (day: Dayjs) => void;
}) => {
    const selected = value?.isValid() ? value : null;
    const [month, setMonth] = useState((selected ?? dayjs()).startOf("month"));
    const today = dayjs();
    const blanks = month.day();
    const days = Array.from({ length: month.daysInMonth() }, (_, i) =>
        month.date(i + 1),
    );

    return (
        <div className="w-[296px] p-3">
            <div className="mb-2 flex items-center justify-between">
                <button
                    type="button"
                    aria-label="Previous month"
                    onClick={() => setMonth(month.subtract(1, "month"))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-typography-2 transition-colors hover:bg-layer-3"
                >
                    <i className="bx bx-chevron-left text-[20px]" />
                </button>
                <p className="important text-typography-1">
                    {month.format("MMMM YYYY")}
                </p>
                <button
                    type="button"
                    aria-label="Next month"
                    onClick={() => setMonth(month.add(1, "month"))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-typography-2 transition-colors hover:bg-layer-3"
                >
                    <i className="bx bx-chevron-right text-[20px]" />
                </button>
            </div>
            <div className="grid grid-cols-7 justify-items-center gap-y-0.5">
                {WEEKDAYS.map((day, i) => (
                    <span
                        key={i}
                        className="flex h-8 w-9 items-center justify-center text-[0.75rem] text-typography-3"
                    >
                        {day}
                    </span>
                ))}
                {Array.from({ length: blanks }, (_, i) => (
                    <span key={`blank-${i}`} />
                ))}
                {days.map((day) => {
                    const isSelected = selected?.isSame(day, "day");
                    return (
                        <button
                            key={day.date()}
                            type="button"
                            aria-label={day.format("MMMM D, YYYY")}
                            aria-pressed={Boolean(isSelected)}
                            onClick={() => onSelect(day)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                                isSelected
                                    ? "bg-accent text-white"
                                    : "text-typography-1 hover:bg-layer-3"
                            } ${day.isSame(today, "day") && !isSelected ? "border border-divider" : ""}`}
                        >
                            {day.date()}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const TimeColumn = ({
    label,
    options,
    selected,
    onSelect,
}: {
    label: string;
    options: { value: number; display: string }[];
    selected?: number;
    onSelect: (value: number) => void;
}) => {
    const selectedRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        selectedRef.current?.scrollIntoView({ block: "center" });
    }, []);

    return (
        <div
            role="group"
            aria-label={label}
            className="flex h-56 w-14 flex-col gap-0.5 overflow-y-auto p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    ref={option.value === selected ? selectedRef : undefined}
                    type="button"
                    aria-pressed={option.value === selected}
                    onClick={() => onSelect(option.value)}
                    className={`h-9 shrink-0 rounded-lg transition-colors ${
                        option.value === selected
                            ? "bg-accent text-white"
                            : "text-typography-1 hover:bg-layer-3"
                    }`}
                >
                    {option.display}
                </button>
            ))}
        </div>
    );
};

export const DateField = ({
    label,
    value,
    onChange,
    sx,
}: DateTimeFieldProps) => {
    const [open, setOpen] = useState(false);

    const merge = (day: Dayjs) =>
        onChange(
            value?.isValid()
                ? value.year(day.year()).month(day.month()).date(day.date())
                : day,
        );

    const { draft, setDraft, reset } = useDraft(
        value,
        "MM/DD/YYYY",
        ["MM/DD/YYYY", "M/D/YYYY"],
        merge,
        () => onChange(null),
    );

    return (
        <PickerField
            label={label}
            icon="bx-calendar"
            placeholder="MM/DD/YYYY"
            sx={sx}
            draft={draft}
            onDraft={setDraft}
            onBlur={reset}
            open={open}
            setOpen={setOpen}
        >
            <Calendar
                value={value}
                onSelect={(day) => {
                    merge(day);
                    setOpen(false);
                }}
            />
        </PickerField>
    );
};

export const TimeField = ({
    label,
    value,
    onChange,
    sx,
}: DateTimeFieldProps) => {
    const [open, setOpen] = useState(false);

    const merge = (time: Dayjs) =>
        onChange(
            (value?.isValid() ? value : dayjs())
                .hour(time.hour())
                .minute(time.minute())
                .second(0),
        );

    const { draft, setDraft, reset } = useDraft(
        value,
        "hh:mm A",
        ["hh:mm A", "h:mm A", "hh:mmA", "h:mmA"],
        merge,
        () => onChange(null),
    );

    const current = value?.isValid() ? value : null;
    const base = current ?? dayjs().minute(0).second(0);
    const hour12 = current ? current.hour() % 12 || 12 : undefined;
    const isPm = current ? current.hour() >= 12 : undefined;

    return (
        <PickerField
            label={label}
            icon="bx-time-five"
            placeholder="hh:mm AM"
            sx={sx}
            draft={draft}
            onDraft={setDraft}
            onBlur={reset}
            open={open}
            setOpen={setOpen}
        >
            <div className="flex divide-x divide-divider">
                <TimeColumn
                    label="Hour"
                    selected={hour12}
                    options={Array.from({ length: 12 }, (_, i) => ({
                        value: i + 1,
                        display: String(i + 1).padStart(2, "0"),
                    }))}
                    onSelect={(hour) => {
                        const pm = isPm ?? base.hour() >= 12;
                        merge(base.hour((hour % 12) + (pm ? 12 : 0)));
                    }}
                />
                <TimeColumn
                    label="Minute"
                    selected={current?.minute()}
                    options={Array.from({ length: 12 }, (_, i) => ({
                        value: i * 5,
                        display: String(i * 5).padStart(2, "0"),
                    }))
                        .concat(
                            current && current.minute() % 5 !== 0
                                ? [
                                      {
                                          value: current.minute(),
                                          display: String(
                                              current.minute(),
                                          ).padStart(2, "0"),
                                      },
                                  ]
                                : [],
                        )
                        .sort((a, b) => a.value - b.value)}
                    onSelect={(minute) => merge(base.minute(minute))}
                />
                <TimeColumn
                    label="AM or PM"
                    selected={isPm === undefined ? undefined : isPm ? 1 : 0}
                    options={[
                        { value: 0, display: "AM" },
                        { value: 1, display: "PM" },
                    ]}
                    onSelect={(pm) =>
                        merge(base.hour((base.hour() % 12) + (pm ? 12 : 0)))
                    }
                />
            </div>
        </PickerField>
    );
};
