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

        const tick = () => {
            if (document.visibilityState === "visible") load();
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
