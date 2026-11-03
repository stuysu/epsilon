import { Children, ReactNode, useEffect, useLayoutEffect, useRef } from "react";

type MasonryProps = {
    columns: number;
    gap?: number;
    className?: string;
    children: ReactNode;
};

/*
Each item goes in whichever column is shortest. Columns are made with flex order
rather than separate parents, so moving an item never remounts it.
*/
const Masonry = ({
    columns,
    gap = 0,
    className = "",
    children,
}: MasonryProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const items = Children.toArray(children);

    const layout = () => {
        const container = containerRef.current;
        if (!container) return;

        const heights = Array<number>(columns).fill(0);
        container
            .querySelectorAll<HTMLElement>(":scope > [data-masonry-item]")
            .forEach((item) => {
                const column = heights.indexOf(Math.min(...heights));
                item.style.order = String(column + 1);
                heights[column] += item.getBoundingClientRect().height + gap;
            });
        container.style.height = `${Math.ceil(Math.max(...heights))}px`;
    };

    useLayoutEffect(layout);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observer = new ResizeObserver(layout);
        container
            .querySelectorAll(":scope > [data-masonry-item]")
            .forEach((item) => observer.observe(item));
        return () => observer.disconnect();
    });

    const width = `calc((100% - ${gap * (columns - 1)}px) / ${columns})`;

    return (
        <div
            ref={containerRef}
            className={`flex flex-col flex-wrap content-start ${className}`}
            style={{ columnGap: gap }}
        >
            {items.map((item, i) => (
                <div
                    key={(item as { key?: string }).key ?? i}
                    data-masonry-item
                    style={{ width, marginBottom: gap }}
                >
                    {item}
                </div>
            ))}
            {/* forces a new flex column between each order group */}
            {Array.from({ length: columns - 1 }, (_, i) => (
                <span
                    key={i}
                    aria-hidden
                    className="w-0 basis-full"
                    style={{ order: i + 1 }}
                />
            ))}
        </div>
    );
};

export default Masonry;
