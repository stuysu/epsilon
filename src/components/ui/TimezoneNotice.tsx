import { useState } from "react";
import AlertBanner from "./AlertBanner";
import { usesNewYorkTime } from "../../utils/NewYorkTime";

const STORAGE_KEY = "dismissedTimezoneNotice";

const TimezoneNotice = () => {
    const [open, setOpen] = useState(() => {
        if (usesNewYorkTime()) return false;
        try {
            return localStorage.getItem(STORAGE_KEY) !== "true";
        } catch {
            return true;
        }
    });

    const handleClose = () => {
        try {
            localStorage.setItem(STORAGE_KEY, "true");
        } catch {}
        setOpen(false);
    };

    if (!open) return <></>;
    return (
        <div className={"z-[9999] relative w-full p-4 bg-bg"}>
            {/* shown on every page load, so it shouldn't interrupt a screen reader */}
            <AlertBanner severity="info" live="polite" onClose={handleClose}>
                {/* the message takes the banner's own text colour, which is
                    chosen to read on each severity in every theme */}
                <div className="relative top-0.5 [&_a]:text-inherit [&_a]:underline [&_p]:text-inherit">
                    <p>
                        Times on Epsilon are shown in New York time (EST) which
                        is different from your device's time zone.
                    </p>
                </div>
            </AlertBanner>
        </div>
    );
};

export default TimezoneNotice;
