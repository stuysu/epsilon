import { useContext } from "react";
import BackLink from "../../../../../components/ui/links/BackLink";
import { useNavigate, useParams } from "react-router-dom";
import OrgContext from "../../../../../contexts/OrgContext";
import ContentUnavailable from "../../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../../components/ui/lists/ItemList";
import Avatar from "../../../../../components/ui/Avatar";
import useMembershipJoinDates from "../../../../../utils/useMembershipJoinDates";
import { useOrgAttendance } from "../../components/useOrgAttendance";
import {
    AttendanceRecordList,
    AttendanceStats,
    attendanceRecord,
} from "../../components/AttendanceRecord";
import { AttendancePerformance } from "../../components/MeetingSideCards";

const MemberAttendance = () => {
    const org = useContext(OrgContext);
    const navigate = useNavigate();
    const { userId, orgUrl } = useParams();
    const id = parseInt(userId || "-1", 10);
    const { meetings, error } = useOrgAttendance(org.id, true);
    const joinDates = useMembershipJoinDates(
        org.id,
        org.memberships?.length ?? 0,
    );
    const membership = org.memberships?.find(
        (m) => m.users?.id === id && m.role !== "ADVISOR",
    );
    const base = `/${orgUrl}/admin/attendance`;

    if (org.memberships && !membership)
        return (
            <ContentUnavailable
                icon="bx-user-x"
                iconColor="text-yellow"
                title="Member Not Found"
                description="This person isn't a member of this Activity."
                action={
                    <BackLink
                        to={`${base}?view=members`}
                        className={
                            "inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-typography-1 underline-offset-2 sm:hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
                        }
                    >
                        <i
                            aria-hidden="true"
                            className={"bx bx-chevron-left"}
                        />
                        Back to Members
                    </BackLink>
                }
            />
        );

    const user = membership?.users;
    const name = `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim();
    const rows =
        meetings && membership
            ? attendanceRecord(
                  meetings,
                  id,
                  joinDates.get(membership.id as number),
              )
            : [];

    return (
        <div>
            <header className={"mb-6 mt-2"}>
                <h1 className={"mb-3 break-words"}>
                    <BackLink
                        to={`${base}?view=members`}
                        className={
                            "rounded-md text-typography-3 no-underline transition-colors sm:hover:text-typography-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        }
                    >
                        Attendance
                    </BackLink>
                    <span aria-hidden="true" className={"text-typography-3"}>
                        /
                    </span>
                    {name}
                </h1>
                {user && (
                    <div className={"flex items-center gap-3"}>
                        <Avatar
                            src={user.picture}
                            alt=""
                            className={"size-9 rounded-md"}
                        >
                            {user.first_name?.charAt(0)}
                        </Avatar>
                        <div className={"min-w-0"}>
                            <p className={"text-typography-1"}>
                                {membership?.role_name || "Member"}
                                {!membership?.active && " (pending)"}
                            </p>
                            <a
                                href={`mailto:${user.email}`}
                                className={
                                    "block truncate text-sm text-typography-2 underline-offset-2 sm:hover:underline"
                                }
                            >
                                {user.email}
                            </a>
                        </div>
                    </div>
                )}
            </header>
            {error ? (
                <ContentUnavailable
                    icon="bx-error"
                    iconColor="text-red"
                    title="Attendance Unavailable"
                    description="Couldn't load attendance. Refresh the page or contact it@stuysu.org."
                />
            ) : (
                meetings && (
                    <div className={"flex flex-col gap-4"}>
                        <AttendanceStats rows={rows} />
                        <ItemList
                            height={"auto"}
                            title={"Attendance Record"}
                            icon={"bx-calendar-check"}
                        >
                            <AttendanceRecordList
                                rows={rows}
                                onOpenMeeting={(meetingId) =>
                                    navigate(`${base}/${meetingId}`)
                                }
                            />
                        </ItemList>
                    </div>
                )
            )}
            <div className={"mt-8 xl:hidden"}>
                <AttendancePerformance />
            </div>
        </div>
    );
};

export default MemberAttendance;
