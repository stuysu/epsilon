import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";

// a page may still be loading when Back lands on it
const RESTORE_MS = 5000;
// enough for any Back a person would press
const KEPT_POSITIONS = 100;

// any of these means the user is scrolling themselves
const USER_SCROLL = ["wheel", "touchstart", "keydown", "pointerdown"];

// keeps scrolling to target until the page is tall enough, or the user scrolls
const restore = (box: Scrollbars, target: number, onDone: () => void) => {
    const started = performance.now();
    let frame = 0;
    const stop = () => {
        cancelAnimationFrame(frame);
        for (const type of USER_SCROLL) window.removeEventListener(type, stop);
        onDone();
    };
    const step = () => {
        box.scrollTop(target);
        const reachable = box.getScrollHeight() - box.getClientHeight();
        if (reachable >= target || performance.now() - started > RESTORE_MS) {
            for (const type of USER_SCROLL) {
                window.removeEventListener(type, stop);
            }
            // its scroll event comes before the next frame
            frame = requestAnimationFrame(onDone);
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
    // scrolls from restoring aren't the user's, so they aren't saved
    const restoring = useRef<string | null>(null);

    useEffect(() => {
        // not in the library's types
        const view = (scrollbars.current as { view?: HTMLElement } | null)
            ?.view;
        if (!view) return;
        const save = () => {
            if (restoring.current === last.current.key) return;
            const kept = positions.current;
            kept.delete(last.current.key);
            kept.set(last.current.key, view.scrollTop);
            if (kept.size > KEPT_POSITIONS) {
                kept.delete(kept.keys().next().value!);
            }
        };
        view.addEventListener("scroll", save, { passive: true });
        return () => view.removeEventListener("scroll", save);
    }, [scrollbars]);

    // before paint, so the new page's scroll isn't saved under the old entry
    useLayoutEffect(() => {
        const previous = last.current;
        if (key === previous.key) return;
        last.current = { pathname, key };

        const box = scrollbars.current;
        if (!box) return;
        const target = positions.current.get(key);
        if (navigationType === "POP" && target !== undefined) {
            restoring.current = key;
            return restore(box, target, () => {
                if (restoring.current === key) restoring.current = null;
            });
        }

        // a search or filter change replaces the entry but stays on the page
        if (pathname === previous.pathname) {
            const kept = positions.current.get(previous.key);
            if (kept !== undefined) positions.current.set(key, kept);
            return;
        }
        box.scrollToTop();
    }, [pathname, key, navigationType, scrollbars]);

    return null;
};

export default ScrollToTopOnNavigate;
