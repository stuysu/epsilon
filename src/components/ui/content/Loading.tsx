import { useEffect, useState } from "react";

// 4x4 squares that grow into one block in a diagonal wave
const CELLS = Array.from({ length: 16 }, (_, i) => {
    const row = Math.floor(i / 4);
    const col = i % 4;
    return { row, col, delay: (3 - row + col) * 0.1 };
});

const Loading = () => {
    // quick loads show nothing instead of flashing the animation
    const [shown, setShown] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => setShown(true), 300);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            role="status"
            className={`w-full h-[85dvh] flex items-center justify-center z-1000 pointer-events-none transition-opacity duration-200 ${
                shown ? "opacity-100" : "opacity-0"
            }`}
        >
            <span className="sr-only">Loading…</span>
            <svg
                aria-hidden="true"
                width="56"
                height="56"
                viewBox="0 0 56 56"
                className="loading-grid"
            >
                {CELLS.map(({ row, col, delay }) => (
                    <rect
                        key={`${row}-${col}`}
                        x={col * 14}
                        y={row * 14}
                        width="14.5"
                        height="14.5"
                        fill="#6666ff"
                        style={{ animationDelay: `${delay}s` }}
                    />
                ))}
            </svg>
        </div>
    );
};

export default Loading;
