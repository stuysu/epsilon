import { useEffect, useState, useRef } from "react";
import Alert from "@mui/material/Alert";
import Popper from '@mui/material/Popper';
import Button from '@mui/material/Button';
import DisplayLinks from "../DisplayLinks";
import { Paper } from "@mui/material";

type AlertInfo = {
    message: string;
    expiry?: number;
    severity?: "success" | "info" | "warning" | "error";
};

const AlertDisplay = () => {
    const [open, setOpen] = useState(false);
    const [sessionDismissed, setSessionDismissed] = useState(false);
    const [data, setData] = useState<AlertInfo | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const travelTime = useRef<NodeJS.Timeout | null>(null);
    const openTimeout = useRef<NodeJS.Timeout | null>(null);
    const isError = data?.severity === "error";
    const isOpen = Boolean(anchorEl);
    useEffect(() => {
        const fetchAlert = async () => {
            // the alert service being down shouldn't surface as an error
          // use Alert.json for testing purposes, dont push to prod before reverting to https://alert.stuysu.org
            const res = await fetch("https://alert.stuysu.org").catch(
                () => null,
            );
            if (!res || res.status === 404) return;
            try {
                const alertData = (await res.json()) as AlertInfo;
                setData(alertData);
                if (
                    localStorage.getItem("dismissedAlert") !== alertData.message
                    
                )
                    setOpen(true);
            } catch (e) {
                    // log error for debugging
                console.error(e);
            }
        };

        fetchAlert();
        return () => {
            setOpen(false);
            setData(null);
            if (openTimeout.current) { clearTimeout(openTimeout.current); }
            if (travelTime.current) { clearTimeout(travelTime.current); }
        };
    }, []);

    const handleCloseClick = (event: React.SyntheticEvent<Element, Event>) => {
        if (openTimeout.current) { clearTimeout(openTimeout.current); }
        if (travelTime.current) { clearTimeout(travelTime.current); }
        setSessionDismissed(true);
        setAnchorEl(null);
    }

    const handleDoNotRemindAgain = () => {
        if (data && data.message) { localStorage.setItem("dismissedAlert", data.message); }
        setOpen(false);
        setAnchorEl(null);
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        const t = event.currentTarget;
        if (travelTime.current) {
            clearTimeout(travelTime.current);
            travelTime.current = null;
        }
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
        }
        openTimeout.current = setTimeout(() => {
            setAnchorEl(t);
        }, 150);
    };

    const handleMouseLeave = () => {
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }
        travelTime.current = setTimeout(() => {
            setAnchorEl(null);
        }, 150);
    };

    const handleTouchEnd = (event: React.TouchEvent<HTMLButtonElement>) => {
        event.preventDefault();
        if (openTimeout.current) {
            clearTimeout(openTimeout.current);
            openTimeout.current = null;
        }
        if (anchorEl === event.currentTarget) { 
            setAnchorEl(null);
            setSessionDismissed(true);
        }
        else { setAnchorEl(event.currentTarget); }
    }

    const handlePopperEnter = () => {
        if (travelTime.current) {
            clearTimeout(travelTime.current);
            travelTime.current = null;
        }
    }

    if (
        sessionDismissed ||
        !open ||
        !data ||
        !data.message ||
        // if expiry is defined, check that if the date is past
        (data.expiry !== undefined && new Date(data.expiry || 0) < new Date())
    )
        return <></>;
    return (
        <div className={"z-[9999] relative w-full p-4 bg-bg"}>
            <AlertBanner
                severity={data.severity}
                variant="filled"
                {... isError ? { action: null } : { onClose: handleCloseClick }}
                componentsProps={isError ? undefined : {
                    closeButton: {
                        title: "",
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: handleMouseLeave,
                        onTouchEnd: handleTouchEnd,
                    },
                }}
            >
                {/* the message takes the banner's own text colour, which is
                    chosen to read on each severity in every theme */}
                <div className="relative top-0.5 [&_a]:text-inherit [&_a]:underline [&_p]:text-inherit">
                    <DisplayLinks text={data.message} />
                </div>
            </Alert>

            {!isError && <Popper
                sx={{
                    zIndex: 9999,
                }}
                open={isOpen}
                anchorEl={anchorEl}
                placement="bottom-end"
                disablePortal
            >
                <Paper
                    onMouseEnter={handlePopperEnter}
                    onMouseLeave={handleMouseLeave}
                    sx={{
                        pointerEvents: "auto",
                        backgroundColor: "background.paper",
                        opacity: 1
                    }}>
                    <Button
                        sx={{
                            textTransform: "none",
                            color: "var(--text-primary)",
                            px: 1.5,
                        }}
                        onClick={handleDoNotRemindAgain}>
                        Do not remind me again
                    </Button>
                </Paper>
            </Popper>}
        </div>
    );
};

export default AlertDisplay;
