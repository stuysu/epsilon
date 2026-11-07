import { useEffect } from "react";

const MESSAGE = "Leave this page? Your unsaved changes will be lost.";

// warns before a reload, close or in-app link loses unsaved work
const useLeaveWarning = (active: boolean) => {
    useEffect(() => {
        if (!active) return;
        const warn = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            // older browsers only prompt when this is set
            event.returnValue = "";
        };
        // runs before the router's own click handler
        const confirmLink = (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }
            const link = (event.target as Element | null)?.closest("a");
            if (
                !link ||
                link.target === "_blank" ||
                link.hasAttribute("download") ||
                link.origin !== window.location.origin ||
                link.pathname === window.location.pathname
            ) {
                return;
            }
            if (!window.confirm(MESSAGE)) {
                event.preventDefault();
                event.stopPropagation();
            }
        };
        window.addEventListener("beforeunload", warn);
        document.addEventListener("click", confirmLink, true);
        return () => {
            window.removeEventListener("beforeunload", warn);
            document.removeEventListener("click", confirmLink, true);
        };
    }, [active]);
};

export default useLeaveWarning;
