import AsyncButton from "../../../../../../components/ui/buttons/AsyncButton";
import NumberStepper from "../../../../../../components/ui/input/NumberStepper";

type MeetingAttendanceOverviewProps = {
    presentCount: number;
    totalMembers: number;
    presentPercentage: number;
    onTimePercentage: number;
    lateMinutes: number;
    maximumLateMinutes: number;
    lateMinutesInput: string;
    attendanceUrl: string;
    isEditingLateDefinition: boolean;
    isSavingLateDefinition: boolean;
    onLateMinutesInputChange: (value: string) => void;
    onBeginEditingLateDefinition: () => void;
    onCancelEditingLateDefinition: () => void;
    onSaveLateDefinition: () => Promise<void>;
    onOpenQrCode: () => void;
    onCopyAttendanceLink: () => Promise<void>;
};

const MeetingAttendanceOverview = ({
    presentCount,
    totalMembers,
    presentPercentage,
    onTimePercentage,
    lateMinutes,
    maximumLateMinutes,
    lateMinutesInput,
    attendanceUrl,
    isEditingLateDefinition,
    isSavingLateDefinition,
    onLateMinutesInputChange,
    onBeginEditingLateDefinition,
    onCancelEditingLateDefinition,
    onSaveLateDefinition,
    onOpenQrCode,
    onCopyAttendanceLink,
}: MeetingAttendanceOverviewProps) => (
    <section>
        <div className="rounded-xl border border-divider px-5 py-6 sm:px-7 sm:py-7">
            <h4>Attendance Information</h4>

            <div className="mt-8 flex flex-col gap-7 lg:flex-row lg:items-center">
                <div className="flex shrink-0 gap-4">
                    <AttendanceMetric
                        color="var(--blue)"
                        progress={presentPercentage}
                        value={`${presentCount}/${totalMembers}`}
                        label="Present"
                    />
                    <AttendanceMetric
                        color="var(--green)"
                        progress={onTimePercentage}
                        value={`${onTimePercentage}%`}
                        label="On Time"
                    />
                </div>

                <div className="min-w-0 flex-1 lg:px-2">
                    <div className="flex items-center justify-between gap-4">
                        <h5 className="leading-none">Lateness Definition</h5>
                        {!isEditingLateDefinition && (
                            <button
                                type="button"
                                onClick={onBeginEditingLateDefinition}
                            >
                                <h5 className="text-accent">Edit</h5>
                            </button>
                        )}
                    </div>

                    {isEditingLateDefinition ? (
                        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <label className="flex min-w-0 flex-1 items-center gap-2">
                                <p>Late after</p>
                                <NumberStepper
                                    min={0}
                                    max={maximumLateMinutes}
                                    step={1}
                                    value={lateMinutesInput}
                                    onChange={(event) =>
                                        onLateMinutesInputChange(
                                            event.target.value,
                                        )
                                    }
                                    aria-label="Minutes after the meeting starts"
                                />
                                <p>minutes</p>
                            </label>
                            <div className="flex gap-2">
                                <AsyncButton
                                    onClick={onCancelEditingLateDefinition}
                                    disabled={isSavingLateDefinition}
                                >
                                    Cancel
                                </AsyncButton>
                                <AsyncButton
                                    isPrimary
                                    onClick={onSaveLateDefinition}
                                    disabled={isSavingLateDefinition}
                                >
                                    Save
                                </AsyncButton>
                            </div>
                        </div>
                    ) : (
                        <p className="mt-3">
                            For members taking their own attendance with the QR
                            code or Attendance Link, they will be considered
                            late if they do so {lateMinutes} minute
                            {lateMinutes === 1 ? "" : "s"} after the meeting
                            start time.
                        </p>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            <button
                type="button"
                onClick={onOpenQrCode}
                className="group flex min-h-64 flex-col items-center overflow-hidden
                rounded-xl border border-divider px-6 pt-7 text-center transition-colors hover:bg-layer-1"
            >
                <h4>QR Code</h4>
                <p className="mt-4 max-w-xs">
                    Send Activity members a QR code which they can scan to
                    record their own attendance.
                </p>
                <img
                    src="/attendance/qr-code.png"
                    alt=""
                    className="mt-auto h-[154px] w-full translate-y-5 object-contain
                    object-bottom transition-transform group-hover:translate-y-3"
                />
            </button>

            <button
                type="button"
                onClick={() => void onCopyAttendanceLink()}
                className="group flex min-h-64 flex-col items-center overflow-hidden
                rounded-xl border border-divider px-6 pt-7 text-center transition-colors hover:bg-layer-1"
            >
                <h4>Copy Attendance Link</h4>
                <p className="mt-4 max-w-xs">
                    Send Activity members a link which they can use to record
                    their own attendance.
                </p>
                <img
                    src="/attendance/copy-attendance-link.png"
                    alt=""
                    className="mt-auto h-[154px] w-full translate-y-5 object-contain object-bottom
                    transition-transform group-hover:translate-y-3"
                />
                <span className="sr-only">{attendanceUrl}</span>
            </button>
        </div>
    </section>
);

const AttendanceMetric = ({
    color,
    progress,
    value,
    label,
}: {
    color: string;
    progress: number;
    value: string;
    label: string;
}) => (
    <div
        className="size-[84px] shrink-0 rounded-full p-[2px]"
        style={{
            background: `conic-gradient(${color} ${Math.max(
                0,
                Math.min(progress, 100),
            )}%, var(--divider) 0)`,
        }}
        role="img"
        aria-label={`${value} ${label}`}
    >
        <div className="flex size-full flex-col items-center justify-center rounded-full bg-bg text-center">
            <span className="important text-base leading-none text-typography-1">
                {value}
            </span>
            <span className="mt-1 text-xs text-typography-2">{label}</span>
        </div>
    </div>
);

export default MeetingAttendanceOverview;
