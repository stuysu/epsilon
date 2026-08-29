import { Avatar, ToggleGroup } from "radix-ui";

import ItemList from "../../../../../../components/ui/lists/ItemList";
import {
    AttendanceMembership,
    attendanceStatuses,
    MeetingAttendanceRecord,
} from "./types";
import ContentUnavailable from "../../../../../../components/ui/content/ContentUnavailable";

type ManualAttendanceListProps = {
    members: AttendanceMembership[];
    attendanceByUserId: Map<number, MeetingAttendanceRecord>;
    updatingUserIds: Set<number>;
    onStatusChange: (
        member: AttendanceMembership,
        status: AttendanceStatus,
    ) => Promise<void>;
};

const ManualAttendanceList = ({
    members,
    attendanceByUserId,
    updatingUserIds,
    onStatusChange,
}: ManualAttendanceListProps) => (
    <ItemList height="auto">
        {members.length > 0 ? (
            members.map((member) => {
                const user = member.users;
                const userId = user?.id as number;
                const attendance = attendanceByUserId.get(userId);
                const status = attendance?.status || "ABSENT";
                const isUpdating = updatingUserIds.has(userId);

                return (
                    <div
                        key={member.id || userId}
                        className={`bg-layer-2 px-4 py-4 sm:px-5 ${
                            isUpdating ? "opacity-65" : ""
                        }`}
                    >
                        <div className="flex min-w-0 items-center gap-2.5">
                            <Avatar.Root className="size-8 shrink-0 overflow-hidden rounded-md">
                                <Avatar.Image
                                    className="size-full object-cover"
                                    src={user?.picture}
                                    alt={`${user?.first_name || ""} ${user?.last_name || ""}`.trim()}
                                />
                                <Avatar.Fallback
                                    className="flex size-full items-center justify-center bg-layer-3 text-typography-1"
                                    delayMs={500}
                                >
                                    {(user?.first_name || "M")
                                        .charAt(0)
                                        .toUpperCase()}
                                </Avatar.Fallback>
                            </Avatar.Root>

                            <div className="min-w-0">
                                <h4 className="truncate">
                                    {user?.first_name || "Member"}{" "}
                                    {user?.last_name || ""}
                                </h4>
                                <a
                                    href={`mailto:${user?.email || ""}`}
                                    className="block truncate !text-typography-2"
                                >
                                    <p>{user?.email || "No email provided"}</p>
                                </a>
                            </div>
                        </div>

                        <ToggleGroup.Root
                            type="single"
                            value={status}
                            disabled={isUpdating}
                            onValueChange={(value) => {
                                if (!value) return;
                                void onStatusChange(
                                    member,
                                    value as AttendanceStatus,
                                );
                            }}
                            className="mt-4 grid min-w-0 grid-cols-4 items-center gap-2"
                            aria-label={`Attendance status for ${user?.first_name || "member"}`}
                        >
                            {attendanceStatuses.map((option) => (
                                <ToggleGroup.Item
                                    key={option.value}
                                    value={option.value}
                                    className="important h-8 min-w-0 truncate rounded-full bg-layer-3 px-2
                                    text-typography-1 text-sm transition-colors hover:brightness-125
                                    data-[state=on]:bg-accent data-[state=on]:text-white"
                                    aria-label={`Mark ${option.label}`}
                                >
                                    {status === option.value
                                        ? `Marked ${option.label}`
                                        : `Mark ${option.label}`}
                                </ToggleGroup.Item>
                            ))}
                        </ToggleGroup.Root>
                    </div>
                );
            })
        ) : (
            <ContentUnavailable
                icon="bx-error"
                title="No available members"
                description="No members are available for this meeting."
            />
        )}
    </ItemList>
);

export default ManualAttendanceList;
