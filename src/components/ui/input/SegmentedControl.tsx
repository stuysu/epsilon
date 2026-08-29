import React, { useEffect, useRef, useState } from "react";

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

type DragState = {
    pointerId: number;
    startX: number;
    trackLeft: number;
    trackWidth: number;
    segmentWidth: number;
    pointerOffset: number;
    leftPercent: number;
    moved: boolean;
};

const SegmentedControl = <T extends string>({
    value,
    options,
    onChange,
    className,
}: SegmentedControlProps<T>) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragLeftPercent, setDragLeftPercent] = useState<number>();
    const hasMountedRef = useRef(false);
    const suppressNextClickRef = useRef(false);
    const dragStateRef = useRef<DragState>();
    const activeIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );
    const segmentWidth = options.length > 0 ? 100 / options.length : 100;

    useEffect(() => {
        if (hasMountedRef.current) setIsAnimating(true);
        else hasMountedRef.current = true;
    }, [activeIndex]);

    const isHighlightExpanded = isPressed || isAnimating || isDragging;
    const highlightLeftPercent = dragLeftPercent ?? activeIndex * segmentWidth;

    const beginDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 || options.length === 0) return;

        const bounds = event.currentTarget.getBoundingClientRect();
        const trackInset = 4;
        const trackLeft = bounds.left + trackInset;
        const trackWidth = bounds.width - trackInset * 2;
        const segmentWidthPx = trackWidth / options.length;
        const pointerX = event.clientX - trackLeft;
        const activeLeft = activeIndex * segmentWidthPx;

        // Only the selected highlight itself acts as the draggable handle
        if (pointerX < activeLeft || pointerX > activeLeft + segmentWidthPx) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        dragStateRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            trackLeft,
            trackWidth,
            segmentWidth: segmentWidthPx,
            pointerOffset: pointerX - activeLeft,
            leftPercent: activeIndex * segmentWidth,
            moved: false,
        };
        setDragLeftPercent(activeIndex * segmentWidth);
        setIsDragging(true);
    };

    const updateDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragStateRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        const pointerX = event.clientX - drag.trackLeft;
        const maxLeft = drag.trackWidth - drag.segmentWidth;
        const left = Math.max(
            0,
            Math.min(pointerX - drag.pointerOffset, maxLeft),
        );
        const leftPercent = (left / drag.trackWidth) * 100;

        drag.leftPercent = leftPercent;
        drag.moved ||= Math.abs(event.clientX - drag.startX) > 3;
        setDragLeftPercent(leftPercent);
    };

    const finishDrag = (event: React.PointerEvent<HTMLDivElement>) => {
        const drag = dragStateRef.current;
        if (!drag || drag.pointerId !== event.pointerId) return;

        if (drag.moved) {
            const nextIndex = Math.max(
                0,
                Math.min(
                    options.length - 1,
                    Math.round(drag.leftPercent / segmentWidth),
                ),
            );

            suppressNextClickRef.current = true;
            onChange(options[nextIndex].value);
            window.setTimeout(() => {
                suppressNextClickRef.current = false;
            }, 0);
        }

        dragStateRef.current = undefined;
        setDragLeftPercent(undefined);
        setIsDragging(false);
        setIsPressed(false);
    };

    const cancelDrag = () => {
        dragStateRef.current = undefined;
        setDragLeftPercent(undefined);
        setIsDragging(false);
        setIsPressed(false);
    };

    return (
        <div
            className={`relative touch-none select-none overflow-visible rounded-xl bg-layer-1 p-1 shadow-control ${
                isDragging ? "cursor-grabbing" : ""
            } ${className || ""}`}
            onPointerDown={beginDrag}
            onPointerMove={updateDrag}
            onPointerUp={finishDrag}
            onPointerCancel={cancelDrag}
        >
            <div className="pointer-events-none absolute inset-1">
                <div
                    className="absolute inset-y-0 rounded-lg bg-layer-3"
                    style={{
                        width: `${segmentWidth}%`,
                        left: `${highlightLeftPercent}%`,
                        transform: isHighlightExpanded
                            ? "scaleX(1.01) scaleY(1.08)"
                            : "scaleX(1) scaleY(1)",
                        // After scaling each corner's center remains concentric with the 12px outer edge
                        borderRadius: isHighlightExpanded
                            ? "calc(7.92px + 0.495%) / calc(7.41px + 3.704%)"
                            : "8px",
                        transitionProperty: "left, transform, border-radius",
                        transitionDuration: isDragging
                            ? "0ms, 150ms, 150ms"
                            : "300ms, 150ms, 150ms",
                        transitionTimingFunction:
                            "ease-in-out, ease-out, ease-out",
                    }}
                    onTransitionEnd={(event) => {
                        if (
                            event.target === event.currentTarget &&
                            event.propertyName === "left"
                        ) {
                            setIsAnimating(false);
                        }
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
                            onClick={() => {
                                if (suppressNextClickRef.current) return;
                                onChange(option.value);
                            }}
                            onPointerDown={() => setIsPressed(true)}
                            onPointerUp={() => setIsPressed(false)}
                            onPointerCancel={() => setIsPressed(false)}
                            onPointerLeave={() => setIsPressed(false)}
                            onKeyDown={(event) => {
                                if (
                                    event.key === "Enter" ||
                                    event.key === " "
                                ) {
                                    setIsPressed(true);
                                }
                            }}
                            onKeyUp={() => setIsPressed(false)}
                            onBlur={() => setIsPressed(false)}
                            className={`important py-2 transition-colors ${
                                isActive
                                    ? isDragging
                                        ? "cursor-grabbing text-typography-1"
                                        : "cursor-grab text-typography-1"
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
