import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export default function ConfirmationDialog(
    {
        title,
        description,
        open,
        onClose,
        onCancel,
        onConfirm
    } : 
    {
        title: string,
        description: string,
        open: boolean,
        onClose: () => void,
        onCancel?: () => void, 
        onConfirm?: () => void, 
    }
) {
  return (
      <Dialog open={open} onClose={onClose}>
        {title && <DialogTitle>{title}</DialogTitle>}
        {description && (
          <DialogContent>
            <DialogContentText>{description}</DialogContentText>
          </DialogContent>
        )}
        <DialogActions>
          <Button
            onClick={() => {
              onClose();
              if (onCancel) onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onClose();
              if (onConfirm) onConfirm();
            }}
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
  );
}