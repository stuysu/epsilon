import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import DisplayLinks from "./DisplayLinks";

type AlertInfo = {
    message: string;
    expiry?: number;
    severity?: "success" | "info" | "warning" | "error";
};

const AlertDisplay = () => {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState<AlertInfo | null>(null);
    useEffect(() => {
        const fetchAlert = async () => {
            const res = await fetch("https://alert.stuysu.org");
            if (res.status === 404) return;
            try {
                setData((await res.json()) as AlertInfo);
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
        };
    }, []);

    if (
        !open ||
        !data ||
        !data.message ||
        // if expiry is defined, check that if the date is past
        (data.expiry !== undefined && new Date(data.expiry || 0) < new Date())
    )
        return <></>;
    return (
        <Alert
            severity={data.severity}
            variant="filled"
            sx={{
                borderRadius: "0",
            }}
            onClose={
                data.severity === "error" ? undefined : () => setOpen(false)
            }
        >
            <DisplayLinks text={data.message} />
        </Alert>
    );
};

export default AlertDisplay;
