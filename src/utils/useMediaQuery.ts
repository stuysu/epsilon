import { useCallback, useSyncExternalStore } from "react";

const useMediaQuery = (query: string): boolean => {
    const subscribe = useCallback(
        (onChange: () => void) => {
            const mediaQuery = window.matchMedia(query);
            mediaQuery.addEventListener("change", onChange);
            return () => mediaQuery.removeEventListener("change", onChange);
        },
        [query],
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
    );
};

export default useMediaQuery;
