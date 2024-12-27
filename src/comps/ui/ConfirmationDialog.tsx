import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from "@mui/material";
import AsyncButton from "./AsyncButton";

export default function ConfirmationDialog({
    title,
    description,
    open,
    onClose,
    onCancel,
    onConfirm,
}: {
    title: string;
    description: string;
    open: boolean;
    onClose: () => void;
    onCancel?: () => void;
    onConfirm?: () => void;
}) {
    return (
        <Dialog open={open} onClose={onClose}>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && (
                <DialogContent>
                    <DialogContentText>{description}</DialogContentText>
                </DialogContent>
            )}
            <DialogActions>
                <AsyncButton
                    onClick={() => {
                        onClose();
                        if (onCancel) onCancel();
                    }}
                >
                    Cancel
                </AsyncButton>
                <AsyncButton
                    onClick={() => {
                        onClose();
                        if (onConfirm) onConfirm();
                    }}
                    autoFocus
                >
                    Confirm
                </AsyncButton>
            </DialogActions>
        </Dialog>
    );
}
