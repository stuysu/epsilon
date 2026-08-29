import { useEffect, useMemo, useRef, useState } from "react";
import { useSnackbar } from "notistack";

import { PUBLIC_URL } from "../../../../../../config/constants";
import { supabase } from "../../../../../../lib/supabaseClient";
import {
    AttendanceMeeting,
    AttendanceMembership,
    DEFAULT_LATE_MINUTES,
    MeetingAttendanceRecord,
} from "./types";

type UseMeetingAttendanceOptions = {
    meetingId: number;
    organizationId: number;
    organizationUrl?: string;
    fallbackOrgUrl?: string;
};

const useMeetingAttendance = ({
    meetingId,
    organizationId,
    organizationUrl,
    fallbackOrgUrl,
}: UseMeetingAttendanceOptions) => {
    const { enqueueSnackbar } = useSnackbar();
    const [meeting, setMeeting] = useState<AttendanceMeeting>();
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string>();
    const [updatingUserIds, setUpdatingUserIds] = useState<Set<number>>(
        new Set(),
    );
    const [isEditingLateDefinition, setIsEditingLateDefinition] =
        useState(false);
    const [lateMinutesInput, setLateMinutesInput] = useState(
        String(DEFAULT_LATE_MINUTES),
    );
    const [isSavingLateDefinition, setIsSavingLateDefinition] = useState(false);

    const fetchErrorNotifiedRef = useRef(false);
    const updatingUserIdsRef = useRef<Set<number>>(new Set());

    useEffect(() => {
        let isMounted = true;
        let requestInFlight = false;
        fetchErrorNotifiedRef.current = false;

        const fetchMeetingData = async () => {
            if (
                !Number.isFinite(meetingId) ||
                meetingId < 1 ||
                organizationId < 1
            ) {
                if (isMounted) {
                    setLoadError("This meeting link is invalid.");
                    setIsLoading(false);
                }
                return;
            }

            // A slow response can outlive the polling interval, so skip it
            if (requestInFlight) return;

            requestInFlight = true;
            const { data, error } = await supabase
                .from("meetings")
                .select(
                    `
                        id,
                        title,
                        start_time,
                        end_time,
                        attendance_late_after_minutes,
                        organizations!inner (
                            id,
                            memberships (
                                id,
                                active,
                                users!inner (
                                    id,
                                    first_name,
                                    last_name,
                                    picture,
                                    email
                                )
                            )
                        ),
                        attendance (
                            id,
                            user_id,
                            status,
                            recorded_at,
                            source
                        )
                    `,
                )
                .eq("id", meetingId)
                .eq("organization_id", organizationId)
                .eq("organizations.memberships.active", true)
                .returns<AttendanceMeeting[]>()
                .single();
            requestInFlight = false;

            if (!isMounted) return;

            if (error || !data) {
                console.error(error);
                // A failing poll repeats every 2.5 seconds, notify once only
                if (!fetchErrorNotifiedRef.current) {
                    enqueueSnackbar(
                        `Failed to fetch meeting. <${error?.message || "Unknown Error"}>`,
                        { variant: "error" },
                    );
                    fetchErrorNotifiedRef.current = true;
                }
                setLoadError(
                    "This meeting could not be loaded for the current Activity.",
                );
                setIsLoading(false);
                return;
            }

            setLoadError(undefined);
            setMeeting((currentMeeting) => {
                if (!currentMeeting || updatingUserIdsRef.current.size === 0) {
                    return data;
                }

                // Retain  local data for locked users so stale responses cannot flicker
                const lockedUserIds = updatingUserIdsRef.current;
                const unlockedRemoteAttendance = (data.attendance || []).filter(
                    (record) => !lockedUserIds.has(record.user_id),
                );
                const lockedLocalAttendance = (
                    currentMeeting.attendance || []
                ).filter((record) => lockedUserIds.has(record.user_id));

                return {
                    ...data,
                    attendance: [
                        ...unlockedRemoteAttendance,
                        ...lockedLocalAttendance,
                    ],
                };
            });
            setIsLoading(false);
        };

        void fetchMeetingData();
        const interval = window.setInterval(fetchMeetingData, 2500);

        return () => {
            isMounted = false;
            window.clearInterval(interval);
        };
    }, [meetingId, organizationId, enqueueSnackbar]);

    const activeMembers = useMemo(
        () =>
            (meeting?.organizations?.memberships || []).filter(
                (membership) =>
                    membership.active !== false && membership.users?.id != null,
            ),
        [meeting?.organizations?.memberships],
    );

    const attendanceByUserId = useMemo(
        () =>
            new Map(
                (meeting?.attendance || []).map((record) => [
                    record.user_id,
                    record,
                ]),
            ),
        [meeting?.attendance],
    );

    const activeUserIds = useMemo(
        () => new Set(activeMembers.map((membership) => membership.users?.id)),
        [activeMembers],
    );

    // Late and early-dismissal records still count as present. Only PRESENT
    // and EARLY_DISMISSAL count as on time for the second metric.
    const presentCount = useMemo(
        () =>
            (meeting?.attendance || []).filter(
                (record) =>
                    activeUserIds.has(record.user_id) &&
                    record.status !== "ABSENT",
            ).length,
        [activeUserIds, meeting?.attendance],
    );

    const onTimeCount = useMemo(
        () =>
            (meeting?.attendance || []).filter(
                (record) =>
                    activeUserIds.has(record.user_id) &&
                    (record.status === "PRESENT" ||
                        record.status === "EARLY_DISMISSAL"),
            ).length,
        [activeUserIds, meeting?.attendance],
    );

    const totalMembers = activeMembers.length;
    const presentPercentage = totalMembers
        ? Math.round((presentCount / totalMembers) * 100)
        : 0;
    const onTimePercentage = totalMembers
        ? Math.round((onTimeCount / totalMembers) * 100)
        : 0;
    const lateMinutes =
        meeting?.attendance_late_after_minutes ?? DEFAULT_LATE_MINUTES;
    // Lateness cannot begin after the meeting ends
    const maximumLateMinutes = meeting
        ? Math.max(
              0,
              Math.floor(
                  (new Date(meeting.end_time).getTime() -
                      new Date(meeting.start_time).getTime()) /
                      60_000,
              ),
          )
        : DEFAULT_LATE_MINUTES;
    const attendanceUrl = `${PUBLIC_URL.replace(/\/$/, "")}/${
        organizationUrl || fallbackOrgUrl || ""
    }/my-attendance/${meetingId}`;

    const setUserUpdating = (userId: number, isUpdating: boolean) => {
        const nextUserIds = new Set(updatingUserIdsRef.current);

        if (isUpdating) nextUserIds.add(userId);
        else nextUserIds.delete(userId);

        updatingUserIdsRef.current = nextUserIds;
        setUpdatingUserIds(nextUserIds);
    };

    const setAttendanceStatus = async (
        member: AttendanceMembership,
        status: AttendanceStatus,
    ) => {
        const userId = member.users?.id;
        if (userId == null || updatingUserIdsRef.current.has(userId)) return;

        setUserUpdating(userId, true);
        const { error } = await supabase.rpc("set_attendance_status", {
            p_meeting_id: meetingId,
            p_user_id: userId,
            p_status: status,
        });

        if (error) {
            console.error(error);
            enqueueSnackbar(
                `Failed to update attendance. <${error.message || "Unknown Error"}>`,
                { variant: "error" },
            );
            setUserUpdating(userId, false);
            return;
        }

        const currentRecord = attendanceByUserId.get(userId);
        const updatedRecord: MeetingAttendanceRecord = {
            ...currentRecord,
            user_id: userId,
            status,
            recorded_at: new Date().toISOString(),
            source: "ADMIN",
        };

        setMeeting((currentMeeting) => {
            if (!currentMeeting) return currentMeeting;

            return {
                ...currentMeeting,
                attendance: [
                    ...(currentMeeting.attendance || []).filter(
                        (record) => record.user_id !== userId,
                    ),
                    updatedRecord,
                ],
            };
        });

        enqueueSnackbar(
            `${member.users?.first_name || "Member"}'s attendance was updated.`,
            { variant: "success" },
        );
        setUserUpdating(userId, false);
    };

    const beginEditingLateDefinition = () => {
        setLateMinutesInput(String(lateMinutes));
        setIsEditingLateDefinition(true);
    };

    const cancelEditingLateDefinition = () => {
        setIsEditingLateDefinition(false);
    };

    const saveLateDefinition = async () => {
        const nextLateMinutes = Number(lateMinutesInput);
        if (
            !Number.isInteger(nextLateMinutes) ||
            nextLateMinutes < 0 ||
            nextLateMinutes > maximumLateMinutes
        ) {
            enqueueSnackbar(
                `Lateness must be a whole number between 0 and ${maximumLateMinutes} minutes.`,
                { variant: "error" },
            );
            return;
        }

        setIsSavingLateDefinition(true);
        const { error } = await supabase
            .from("meetings")
            .update({ attendance_late_after_minutes: nextLateMinutes })
            .eq("id", meetingId)
            .eq("organization_id", organizationId);

        if (error) {
            console.error(error);
            enqueueSnackbar(
                `Failed to update lateness. <${error.message || "Unknown Error"}>`,
                { variant: "error" },
            );
            setIsSavingLateDefinition(false);
            return;
        }

        setMeeting((currentMeeting) =>
            currentMeeting
                ? {
                      ...currentMeeting,
                      attendance_late_after_minutes: nextLateMinutes,
                  }
                : currentMeeting,
        );
        setIsEditingLateDefinition(false);
        setIsSavingLateDefinition(false);
        enqueueSnackbar("Lateness definition updated.", {
            variant: "success",
        });
    };

    const copyAttendanceLink = async () => {
        try {
            await navigator.clipboard.writeText(attendanceUrl);
            enqueueSnackbar("Link Copied", { variant: "success" });
        } catch {
            enqueueSnackbar("Failed to copy the attendance link.", {
                variant: "error",
            });
        }
    };

    return {
        meeting,
        isLoading,
        loadError,
        activeMembers,
        attendanceByUserId,
        updatingUserIds,
        presentCount,
        totalMembers,
        presentPercentage,
        onTimePercentage,
        lateMinutes,
        maximumLateMinutes,
        attendanceUrl,
        isEditingLateDefinition,
        lateMinutesInput,
        isSavingLateDefinition,
        setLateMinutesInput,
        beginEditingLateDefinition,
        cancelEditingLateDefinition,
        saveLateDefinition,
        setAttendanceStatus,
        copyAttendanceLink,
    };
};

export default useMeetingAttendance;
