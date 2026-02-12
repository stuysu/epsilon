import React from "react";

type SegmentedOption<T extends string> = {
    label: string;
    value: T;
};

type SegmentedControlProps<T extends string> = {
    value: T;
    options: SegmentedOption<T>[];
    onChange: (value: T) => void;
    className?: string;
};

const SegmentedControl = <T extends string>({
    value,
    options,
    onChange,
    className,
}: SegmentedControlProps<T>) => {
    const activeIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );
    const segmentWidth = options.length > 0 ? 100 / options.length : 100;

    return (
        <div
            className={`relative overflow-hidden rounded-xl bg-layer-1 p-1 shadow-control ${
                className || ""
            }`}
        >
            <div className="absolute inset-1 pointer-events-none">
                <div
                    className="absolute inset-y-0 left-0 rounded-lg bg-layer-3 transition-transform duration-300 ease-in-out"
                    style={{
                        width: `${segmentWidth}%`,
                        transform: `translateX(${activeIndex * 100}%)`,
                    }}
                />
            </div>
            <div
                className="relative grid w-full"
                style={{
                    gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
                }}
            >
                {options.map((option) => {
                    const isActive = option.value === value;
                    return (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onChange(option.value)}
                            className={`py-2 important transition-colors ${
                                isActive
                                    ? "text-typography-1"
                                    : "text-typography-2"
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SegmentedControl;
