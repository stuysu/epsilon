import { QRCodeSVG } from "qrcode.react";

import UserDialog from "../../../../../../components/ui/overlays/UserDialog";

const AttendanceQrDialog = ({
    open,
    attendanceUrl,
    onClose,
}: {
    open: boolean;
    attendanceUrl: string;
    onClose: () => void;
}) => (
    <UserDialog
        title="Attendance QR Code"
        description="Members can scan this code to take their own attendance."
        open={open}
        onClose={onClose}
        confirmText="Close"
        showCancel={false}
    >
        <QRCodeSVG
            value={attendanceUrl}
            level="M"
            includeMargin
            size={300}
            className="rounded-md"
            aria-label="Self-attendance QR code"
        />
    </UserDialog>
);

export default AttendanceQrDialog;
