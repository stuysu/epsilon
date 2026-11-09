import { useContext } from "react";
import { FROM_LIST } from "../../../../components/ui/links/BackLink";
import { Navigate, useNavigate } from "react-router-dom";
import OrgContext from "../../../../contexts/OrgContext";
import UserContext from "../../../../contexts/UserContext";
import LoginGate from "../../../../components/ui/content/LoginGate";
import ContentUnavailable from "../../../../components/ui/content/ContentUnavailable";
import ItemList from "../../../../components/ui/lists/ItemList";
import { useOrgAttendance } from "../components/useOrgAttendance";
import useMembershipJoinDates from "../../../../utils/useMembershipJoinDates";
import {
    AttendanceRecordList,
    AttendanceStats,
    attendanceRecord,
} from "../components/AttendanceRecord";

const MyAttendance = () => {
    const organization = useContext(OrgContext);
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const { meetings, error } = useOrgAttendance(organization.id);
    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    const joinDates = useMembershipJoinDates(
        organization.id,
        organization.memberships?.length ?? 0,
    );

    if (
        user.signed_in &&
        (!membership?.active || membership.role === "ADVISOR")
    )
        return <Navigate to=".." replace />;

    const rows = meetings
        ? attendanceRecord(
              meetings,
              user.id,
              joinDates.get(membership?.id as number),
          )
        : [];

    return (
        <LoginGate page="see your attendance">
            <h1 className={"sr-only"}>My Attendance</h1>
            <div className={"mt-2 flex flex-col gap-4"}>
                {error ? (
                    <ContentUnavailable
                        icon="bx-error"
                        iconColor="text-red"
                        title="Attendance Unavailable"
                        description="Couldn't load your attendance. Refresh the page or contact it@stuysu.org."
                    />
                ) : !meetings ? (
                    <></>
                ) : (
                    <>
                        <AttendanceStats rows={rows} />
                        <ItemList
                            height={"auto"}
                            title={"My Attendance Record"}
                            icon={"bx-calendar-check"}
                        >
                            <AttendanceRecordList
                                rows={rows}
                                onOpenMeeting={(id) =>
                                    navigate(
                                        `/${organization.url}/my-attendance/${id}`,
                                        { state: FROM_LIST },
                                    )
                                }
                            />
                        </ItemList>
                    </>
                )}
            </div>
        </LoginGate>
    );
};

export default MyAttendance;
