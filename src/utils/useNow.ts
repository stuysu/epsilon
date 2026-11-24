import { useEffect, useState } from "react";

// the current time in ms, updated every interval
export default function useNow(interval = 60_000) {
    const [now, setNow] = useState(() => Date.now());
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), interval);
        return () => clearInterval(timer);
    }, [interval]);
    return now;
}
