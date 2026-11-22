import { ReactNode } from "react";

// shared by the Activities and Opportunities catalogs so both filter panels look the same
export const PILL_CLASS =
    "inline-flex min-h-8 max-w-full items-center gap-1 rounded-2xl px-3 py-1 text-left text-sm font-semibold leading-tight shadow-control transition-[background-color,color,transform] duration-150 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1";

export const pillColors = (on: boolean) =>
    `cursor-pointer active:scale-[0.97] ${
        on
            ? "bg-accent text-white"
            : "bg-layer-2 text-typography-2 sm:hover:bg-layer-3 sm:hover:text-typography-1"
    }`;

type FilterGroupProps = {
    title: string;
    action?: ReactNode;
    children: ReactNode;
};

export const FilterGroup = ({ title, action, children }: FilterGroupProps) => (
    <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-normal text-typography-2">{title}</h3>
            {action}
        </div>
        {children}
    </section>
);

type FiltersToggleProps = {
    open: boolean;
    onToggle: () => void;
    controls: string;
    count?: number;
    className?: string;
    id?: string;
};

export const FiltersToggle = ({
    open,
    onToggle,
    controls,
    count = 0,
    className = "",
    id,
}: FiltersToggleProps) => (
    <button
        type="button"
        id={id}
        aria-expanded={open}
        aria-controls={controls}
        onClick={onToggle}
        className={`mb-4 flex min-h-11 w-full cursor-pointer items-center justify-between rounded-xl bg-layer-1 px-4 py-2 text-typography-1 shadow-control focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 ${className}`}
    >
        {count ? `Filters (${count})` : "Filters"}
        <i
            className={`bx ${open ? "bx-chevron-up" : "bx-chevron-down"}`}
            aria-hidden="true"
        />
    </button>
);

type ResetFiltersProps = {
    disabled: boolean;
    onReset: () => void;
};

export const ResetFiltersButton = ({
    disabled,
    onReset,
}: ResetFiltersProps) => (
    <button
        type="button"
        onClick={onReset}
        disabled={disabled}
        className="important -mt-2 mb-5 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-layer-2 px-3 py-1.5 text-sm text-typography-1 shadow-control transition-colors enabled:cursor-pointer enabled:hover:bg-layer-3 disabled:text-typography-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
    >
        <i className="bx bx-reset" aria-hidden="true" />
        Reset Filters
    </button>
);
