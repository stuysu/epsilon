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
        <div className={"z-[9999] relative w-full p-4"}>
            <Alert
                severity={data.severity}
                variant="filled"
                onClose={
                    data.severity === "error" ? undefined : () => setOpen(false)
                }
            >
                <div className={"relative top-0.5 invert brightness-200"}>
                    <DisplayLinks text={data.message} />
                </div>
            </Alert>
        </div>
    );
};

export default AlertDisplay;
