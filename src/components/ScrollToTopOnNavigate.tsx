import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

// a page may still be loading when Back lands on it
const RESTORE_MS = 5000;
// enough for any Back a person would press
const KEPT_POSITIONS = 100;

// any of these means the user is scrolling themselves
const USER_SCROLL = ["wheel", "touchstart", "keydown", "pointerdown"];

// keeps scrolling to target until the page is tall enough, or the user scrolls
const restore = (target: number, onDone: (reached: boolean) => void) => {
    const started = performance.now();
    let frame = 0;
    const stop = () => {
        cancelAnimationFrame(frame);
        for (const type of USER_SCROLL) window.removeEventListener(type, stop);
        onDone(false);
    };
    const step = () => {
        window.scrollTo(0, target);
        const page = document.documentElement;
        const reachable = page.scrollHeight - page.clientHeight;
        if (reachable >= target || performance.now() - started > RESTORE_MS) {
            for (const type of USER_SCROLL) {
                window.removeEventListener(type, stop);
            }
            // its scroll event comes before the next frame
            frame = requestAnimationFrame(() => onDone(reachable >= target));
        } else {
            frame = requestAnimationFrame(step);
        }
    };
    for (const type of USER_SCROLL) {
        window.addEventListener(type, stop, { passive: true });
    }
    step();
    return stop;
};

// the router doesn't restore scroll, so reset or restore it on navigation
const ScrollToTopOnNavigate = () => {
    const { pathname, key, state } = useLocation();
    const navigationType = useNavigationType();
    const last = useRef({ pathname, key });
    const positions = useRef(new Map<string, number>());
    // the latest position per page, for links that return to it
    const byPath = useRef(new Map<string, number>());
    // scrolls from restoring aren't the user's, so they aren't saved
    const restoring = useRef<string | null>(null);

    useEffect(() => {
        // this component restores positions itself
        window.history.scrollRestoration = "manual";
        const save = () => {
            if (restoring.current === last.current.key) return;
            const kept = positions.current;
            kept.delete(last.current.key);
            kept.set(last.current.key, window.scrollY);
            byPath.current.set(last.current.pathname, window.scrollY);
            if (kept.size > KEPT_POSITIONS) {
                kept.delete(kept.keys().next().value!);
            }
        };
        window.addEventListener("scroll", save, { passive: true });
        return () => window.removeEventListener("scroll", save);
    }, []);

    // before paint, so the new page's scroll isn't saved under the old entry
    useLayoutEffect(() => {
        const previous = last.current;
        if (key === previous.key) return;
        last.current = { pathname, key };

        const target =
            navigationType === "POP"
                ? positions.current.get(key)
                : (state as { restoreScroll?: boolean } | null)?.restoreScroll
                  ? byPath.current.get(pathname)
                  : undefined;
        if (target !== undefined) {
            restoring.current = key;
            return restore(target, (reached) => {
                if (restoring.current === key) restoring.current = null;
                // a later Back to this entry should land here too
                if (reached) {
                    positions.current.set(key, target);
                    byPath.current.set(pathname, target);
                }
            });
        }

        // a search or filter change replaces the entry but stays on the page
        if (pathname === previous.pathname) {
            const kept = positions.current.get(previous.key);
            if (kept !== undefined) positions.current.set(key, kept);
            return;
        }
        window.scrollTo(0, 0);
    }, [pathname, key, state, navigationType]);

    return null;
};

export default ScrollToTopOnNavigate;
