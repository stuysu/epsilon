import { useEffect, useState, useRef, MouseEvent } from "react";
import Alert from "@mui/material/Alert";
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import DisplayLinks from "../DisplayLinks";

type AlertInfo = {
    message: string;
    expiry?: number;
    severity?: "success" | "info" | "warning" | "error";
};

const AlertDisplay = () => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<AlertInfo | null>(null);
    const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
    const travelTime = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const fetchAlert = async () => {
            const res = await fetch("https://alert.stuysu.org");
            if (res.status === 404) return;
            try {
                const alertData = (await res.json()) as AlertInfo;
                setData(alertData);
                if (
                    sessionStorage.getItem("dismissedAlert") !== alertData.message
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
            if (travelTime.current) clearTimeout(travelTime.current);
        };
    }, []);

    const handleCloseClick = (event: React.SyntheticEvent<Element, Event>) => {
        if (anchorEl) handleClose();
        if (travelTime.current) {
            clearTimeout(travelTime.current);
            travelTime.current = null;
        }
        setAnchorEl(event.currentTarget as HTMLButtonElement);
    }

    const handleClose = () => {
        setOpen(false);
        setAnchorEl(null);
    }

    const handleDoNotRemindAgain = () => {
        if (data && data.message) localStorage.setItem("dismissedAlert", data.message);
        setOpen(false);
        setAnchorEl(null);
    };

    const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (travelTime.current) {
            clearTimeout(travelTime.current);
            travelTime.current = null;
        }
        setAnchorEl(event.currentTarget);
    };

    const handleMouseLeave = () => {
        travelTime.current = setTimeout(() => {
            setAnchorEl(null);
        }, 200);
    };

    const handlePopoverEnter = () => {
        if (travelTime.current) {
            clearTimeout(travelTime.current);
            travelTime.current = null;
        }
        setAnchorEl(anchorEl);
    };

    const isOpen = Boolean(anchorEl);

    if (
        !open ||
        !data ||
        !data.message ||
        // if expiry is defined, check that if the date is past
        (data.expiry !== undefined && new Date(data.expiry || 0) < new Date())
    )
        return <></>;
    return (
        <div className={"z-[9999] relative w-full p-4 bg-bg"}>
            <Alert
                sx={{ borderRadius: "10px" }}
                severity={data.severity}
                variant="filled"
                onClose={handleCloseClick}
                componentsProps={{
                    closeButton: {
                        onMouseEnter: handleMouseEnter,
                        onMouseLeave: handleMouseLeave,
                    },
                }}
            >
                <div className={"relative top-0.5 invert brightness-200 *:text-[var(--text-primary)]"}>
                    <DisplayLinks text={data.message} />
                </div>
            </Alert>

            <Popover
                sx={{ 
                    pointerEvents: 'none',
                    zIndex: 9999,
                }}
                open={isOpen}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(null);
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                disableRestoreFocus
                slotProps={{
                    paper: {
                        onMouseEnter: handlePopoverEnter,
                        onMouseLeave: handleMouseLeave,
                        sx: {
                            pointerEvents: 'auto'
                        }
                    },
                }}  
            >
                
                    <Button 
                        sx={{ 
                            size: 'small',
                            color: 'var(--text-primary)',
                            px: 2,
                            textTransform: "none"
                        }} 
                        onClick={handleDoNotRemindAgain}>
                        Do not remind me again
                    </Button>
            </Popover>
        </div>
    );
};

export default AlertDisplay;
