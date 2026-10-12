import { useState } from "react";
import Alert from "@mui/material/Alert";
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
            <Alert
                sx={{ borderRadius: "10px" }}
                severity="info"
                variant="filled"
                onClose={handleClose}
            >
                <div
                    className={
                        "relative top-0.5 invert brightness-200 *:text-[var(--text-primary)]"
                    }
                >
                    <p>
                        Times on Epsilon are shown in New York time (Eastern
                        Time), which is different from your device's time zone.
                    </p>
                </div>
            </Alert>
        </div>
    );
};

export default TimezoneNotice;
