import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";

// a page may still be filling in when Back lands on it
const RESTORE_TRIES = 30;

// the site scrolls in one Scrollbars box, so reset or restore it on navigation
const ScrollToTopOnNavigate = ({
    scrollbars,
}: {
    scrollbars: RefObject<Scrollbars>;
}) => {
    const { pathname, key } = useLocation();
    const navigationType = useNavigationType();
    const last = useRef({ pathname, key });
    const positions = useRef(new Map<string, number>());

    useEffect(() => {
        // not in the library's types
        const view = (scrollbars.current as { view?: HTMLElement } | null)
            ?.view;
        if (!view) return;
        const save = () =>
            positions.current.set(last.current.key, view.scrollTop);
        view.addEventListener("scroll", save, { passive: true });
        return () => view.removeEventListener("scroll", save);
    }, [scrollbars]);

    // before paint, so the new page's scroll isn't saved under the old entry
    useLayoutEffect(() => {
        const previous = last.current;
        if (key === previous.key) return;
        last.current = { pathname, key };

        // a search or filter change replaces the entry but stays on the page
        if (pathname === previous.pathname) {
            const kept = positions.current.get(previous.key);
            if (kept !== undefined) positions.current.set(key, kept);
            return;
        }

        const box = scrollbars.current;
        if (!box) return;
        const target = positions.current.get(key);
        if (navigationType !== "POP" || target === undefined) {
            box.scrollToTop();
            return;
        }

        let tries = 0;
        let frame = 0;
        const restore = () => {
            box.scrollTop(target);
            const reachable = box.getScrollHeight() - box.getClientHeight();
            if (reachable < target && ++tries < RESTORE_TRIES) {
                frame = requestAnimationFrame(restore);
            }
        };
        restore();
        return () => cancelAnimationFrame(frame);
    }, [pathname, key, navigationType, scrollbars]);

    return null;
};

export default ScrollToTopOnNavigate;
