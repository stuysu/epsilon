import RouteTabs from "../../../../components/ui/navigation/RouteTabs";
import { Link } from "../links";
import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

const FADE = 32;

const AdminNav = ({ links }: { links: Link[] }) => {
    const ref = useRef<HTMLDivElement>(null);
    const { pathname } = useLocation();
    const [cutStart, setCutStart] = useState(false);
    const [cutEnd, setCutEnd] = useState(false);
    // getLinks makes a new array each render
    const tabCount = links.length;

    // an edge fades while tabs are cut off past it
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const update = () => {
            setCutStart(el.scrollLeft > 1);
            setCutEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
        };
        update();
        el.addEventListener("scroll", update, { passive: true });
        const observer = new ResizeObserver(update);
        observer.observe(el);
        return () => {
            el.removeEventListener("scroll", update);
            observer.disconnect();
        };
    }, [tabCount]);

    // the current tab is scrolled clear of the faded edges
    useEffect(() => {
        const center = () => {
            const el = ref.current;
            const tab = el?.querySelector('[data-state="active"]');
            if (!el || !tab) return;
            const box = el.getBoundingClientRect();
            const rect = tab.getBoundingClientRect();
            if (rect.left < box.left + FADE || rect.right > box.right - FADE)
                el.scrollLeft +=
                    rect.left - box.left - (box.width - rect.width) / 2;
        };
        center();
        // the web font widens the tabs after the first paint
        let live = true;
        document.fonts?.ready.then(() => live && center());
        return () => {
            live = false;
        };
    }, [pathname, tabCount]);

    const mask =
        cutStart || cutEnd
            ? `linear-gradient(to right, ${cutStart ? `transparent, black ${FADE}px` : "black"}, ${cutEnd ? `black calc(100% - ${FADE}px), transparent` : "black"})`
            : undefined;

    return (
        <div
            ref={ref}
            style={{ maskImage: mask }}
            className="relative max-sm:mt-[0.7rem] sm:pl-9 overflow-x-scroll mt-4 bg-blurDark backdrop-blur-xl border-y-divider border-y z-40"
        >
            <RouteTabs tabs={links} />
        </div>
    );
};

export default AdminNav;
