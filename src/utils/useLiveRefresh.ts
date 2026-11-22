import { useEffect } from "react";

/* re-runs load while the tab is visible, and right away when it comes back */
export default function useLiveRefresh(
    load: () => unknown,
    intervalMs: number,
    enabled = true,
) {
    useEffect(() => {
        if (!enabled) return;
        load();
        let last = Date.now();

        /* returning to a tab fires both focus and visibilitychange; load once */
        const tick = () => {
            if (document.visibilityState !== "visible") return;
            if (Date.now() - last < 1000) return;
            last = Date.now();
            load();
        };
        const interval = setInterval(tick, intervalMs);
        document.addEventListener("visibilitychange", tick);
        window.addEventListener("focus", tick);
        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", tick);
            window.removeEventListener("focus", tick);
        };
    }, [load, intervalMs, enabled]);
}
