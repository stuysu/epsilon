import { motion, useReducedMotion } from "framer-motion";
import { KeyboardEvent, ReactNode } from "react";

/* left/right arrows move between a group's buttons; tabs also select */
export const moveWithArrows = (
    event: KeyboardEvent<HTMLElement>,
    select = false,
) => {
    const step =
        event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step && event.key !== "Home" && event.key !== "End") return;
    const items = [
        ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
            "button:not(:disabled)",
        ),
    ];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    event.preventDefault();
    const next =
        event.key === "Home"
            ? items[0]
            : event.key === "End"
              ? items[items.length - 1]
              : items[(i + step + items.length) % items.length];
    next.focus();
    if (select) next.click();
};

export const SegmentedControl = <T extends string>({
    options,
    value,
    onChange,
    label,
}: {
    options: { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    label: string;
}) => (
    <div
        role="tablist"
        aria-label={label}
        onKeyDown={(event) => moveWithArrows(event, true)}
        className={"mb-5 flex gap-1 rounded-xl bg-layer-1 p-1 shadow-control"}
    >
        {options.map((option) => {
            const selected = option.value === value;
            return (
                <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => onChange(option.value)}
                    className={`touch-target flex-1 rounded-lg px-3 py-2 text-sm font-semibold outline-0 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1 ${
                        selected
                            ? "bg-layer-3 text-typography-1 shadow-control"
                            : "text-typography-2 hover:bg-layer-2"
                    }`}
                >
                    {option.label}
                </button>
            );
        })}
    </div>
);

/* red at 0, yellow at half, green when full */
export const scoreColor = (value: number) => {
    const v = Math.max(0, Math.min(1, value));
    const hue =
        v < 0.5
            ? 4 + (55 - 4) * (v / 0.5)
            : 55 + (135 - 55) * ((v - 0.5) / 0.5);
    return `hsl(${Math.round(hue)} 72% 56%)`;
};

export const ProgressBar = ({
    value,
    color = "bg-typography-3",
    label,
    scored = false,
    score,
}: {
    value: number;
    color?: string;
    label: string;
    // color the bar by how full it is, or by score when given
    scored?: boolean;
    score?: number;
}) => {
    const reduceMotion = useReducedMotion();
    const v = Math.max(0, Math.min(1, value));
    return (
        <div
            role="progressbar"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(v * 100)}
            className={"h-1 w-full overflow-hidden rounded-full bg-layer-3"}
        >
            <motion.div
                className={`h-full rounded-full ${scored ? "" : color}`}
                initial={reduceMotion ? false : { width: 0 }}
                animate={{
                    width: `${v * 100}%`,
                    ...(scored
                        ? { backgroundColor: scoreColor(score ?? v) }
                        : {}),
                }}
                transition={{
                    duration: reduceMotion ? 0 : 0.6,
                    ease: "easeOut",
                }}
            />
        </div>
    );
};

export const Ring = ({
    value,
    stroke,
    children,
    size = 64,
    width = 1.5,
}: {
    value: number;
    stroke: string;
    children: ReactNode;
    size?: number;
    width?: number;
}) => {
    const r = size / 2 - width;
    const c = 2 * Math.PI * r;
    return (
        // shrinks below size only when its row runs out of room
        <div
            className={
                "relative flex aspect-square min-w-0 shrink items-center justify-center"
            }
            style={{ width: size }}
        >
            <svg
                aria-hidden="true"
                viewBox={`0 0 ${size} ${size}`}
                className={"absolute inset-0 size-full -rotate-90"}
            >
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={width}
                    className={"stroke-layer-3"}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    strokeWidth={width}
                    strokeLinecap="round"
                    strokeDasharray={c}
                    strokeDashoffset={c * (1 - Math.max(0, Math.min(1, value)))}
                    className={`${stroke} transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none`}
                />
            </svg>
            <div className={"relative text-center leading-tight"}>
                {children}
            </div>
        </div>
    );
};

export const CountChip = ({ icon, label }: { icon: string; label: string }) => (
    <span
        className={
            "inline-flex h-7 items-center gap-1.5 rounded-full bg-layer-3 px-2.5 text-xs font-semibold text-typography-1 shadow-control"
        }
    >
        <i aria-hidden="true" className={`bx ${icon} text-sm text-yellow`} />
        {label}
    </span>
);

export const StatusPill = ({ children }: { children: ReactNode }) => (
    <span
        className={
            "inline-flex h-7 shrink-0 items-center rounded-full bg-layer-3 px-3 text-xs font-semibold text-typography-1 shadow-control"
        }
    >
        {children}
    </span>
);
