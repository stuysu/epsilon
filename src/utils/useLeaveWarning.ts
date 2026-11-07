import { useEffect } from "react";

// warns before a reload or close loses unsaved work
const useLeaveWarning = (active: boolean) => {
    useEffect(() => {
        if (!active) return;
        const warn = (event: BeforeUnloadEvent) => event.preventDefault();
        window.addEventListener("beforeunload", warn);
        return () => window.removeEventListener("beforeunload", warn);
    }, [active]);
};

export default useLeaveWarning;
