import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../../lib/supabaseClient";
import { PUBLIC_URL } from "../../../../../config/constants";
import QRCode from "qrcode.react";
import { LayoutGroup, motion } from "framer-motion";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import OrgMember from "../../components/OrgMember";
import ItemList from "../../../../../components/ui/lists/ItemList";
import SortSelect from "../../../../../components/ui/input/SortSelect";
import { MemberSort, sortMembersBy } from "../../../../../utils/DataFormatters";

const MeetingAttendance = () => {
    const { meetingId: meetingIdParam, orgUrl } = useParams();
    const meetingId = parseInt(meetingIdParam || "-1", 10);

    const { enqueueSnackbar } = useSnackbar();
    const [meeting, setMeeting] = useState<Meeting | undefined>();
    const [sort, setSort] = useState<MemberSort>("default");
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    useEffect(() => {
        let isMounted = true;

        const fetchMeetingData = async () => {
            const { data: meetingData, error } = await supabase
                .from("meetings")
                .select(
                    `
          title,
          start_time,
          end_time,
          organizations!inner (
            id,
            memberships (
              active,
              created_at,
              users!inner (
                id,
                first_name,
                last_name,
                picture,
                email
              )
            )
          ),
          attendance ( user_id )
        `,
                )
                .eq("id", meetingId)
                .returns<Meeting>()
                .single();

            if (error || !meetingData) {
                if (isMounted) {
                    console.error(error);
                    enqueueSnackbar(
                        `Failed to fetch meeting. <${error?.message || "Unknown Error"}>`,
                        { variant: "error" },
                    );
                }
                return;
            }

            if (isMounted) setMeeting(meetingData);
        };

        // initial + poll
        fetchMeetingData();
        const interval = setInterval(fetchMeetingData, 2500);
        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [meetingId, enqueueSnackbar]);

    const updateStatus = async (
        userId?: number,
        firstName?: string,
        lastName?: string,
        isPresent?: boolean,
    ) => {
        if (
            userId == null ||
            firstName == null ||
            lastName == null ||
            isPresent == null
        ) {
            enqueueSnackbar("Invalid parameters.", { variant: "error" });
            return;
        }

        let updateData: Attendance | null | undefined;
        let updateError;

        if (isPresent) {
            ({ error: updateError } = await supabase
                .from("attendance")
                .delete()
                .eq("user_id", userId)
                .eq("meeting_id", meetingId));
        } else {
            const res = await supabase
                .from("attendance")
                .insert({
                    user_id: userId,
                    meeting_id: meetingId,
                    organization_id: meeting?.organizations?.id,
                })
                .select(`*`)
                .returns<Attendance>()
                .single();
            updateData = res.data;
            updateError = res.error;
        }

        if (updateError) {
            console.error(updateError);
            enqueueSnackbar(
                `Failed to update attendance. <${updateError?.message || "Unknown Error"}>`,
                { variant: "error" },
            );
            return;
        }

        setMeeting((prev) => {
            if (!prev) return prev;
            const attendance = isPresent
                ? (prev.attendance || []).filter((a) => a.user_id !== userId)
                : [...(prev.attendance || []), updateData!];
            return { ...prev, attendance } as Meeting;
        });

        enqueueSnackbar(
            `${firstName} ${lastName} is now ${isPresent ? "Absent" : "Present"}!`,
            { variant: "success" },
        );
    };

    const attendedUserIds = new Set(
        (meeting?.attendance || []).map((attendance) => attendance.user_id),
    );
    const attendees = (meeting?.organizations?.memberships || [])
        .filter((member) => member.active && member.users?.id != null)
        .map((member) => ({
            userId: member.users?.id as number,
            firstName: member.users?.first_name || "",
            lastName: member.users?.last_name || "",
            picture: member.users?.picture,
            email: member.users?.email,
            joinedAt: member.created_at,
            isPresent: attendedUserIds.has(member.users?.id as number),
        }));
    const sortAttendees = (list: typeof attendees) =>
        sortMembersBy(list, sort, (member) => ({
            first_name: member.firstName,
            last_name: member.lastName,
            joined_at: member.joinedAt,
        }));
    const presentMembers = sortAttendees(
        attendees.filter((member) => member.isPresent),
    );
    const absentMembers = sortAttendees(
        attendees.filter((member) => !member.isPresent),
    );

    return (
        <Box>
            <h1>{meeting?.title}</h1>

            <div className={"w-full flex gap-5 max-md:flex-col mb-6"}>
                <div className={"w-full rounded-lg border border-divider p-5"}>
                    <p>
                        Send this link to allow attendees to mark their own
                        attendance. Click to copy the link to your clipboard.
                        <br />
                        <a
                            href="#"
                            onClick={(e) => {
                                e.preventDefault();
                                navigator.clipboard.writeText(
                                    `${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`,
                                );
                                enqueueSnackbar("Copied link to clipboard!", {
                                    variant: "success",
                                });
                            }}
                            className="cursor-pointer text-blue-500 underline"
                        >
                            {`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
                        </a>
                    </p>
                </div>

                <div className={"w-full rounded-lg border border-divider p-5"}>
                    <p className={"mb-5"}>Or, send them this QR code.</p>
                    <QRCode
                        value={`${PUBLIC_URL}/${orgUrl}/my-attendance/${meetingId}`}
                        size={300}
                        style={{ borderRadius: 10, border: "1px solid white" }}
                    />
                </div>
            </div>
            <SortSelect value={sort} onChange={setSort} />

            <LayoutGroup>
                {[
                    {
                        title: "Present",
                        members: presentMembers,
                        empty: "No one has been marked present yet.",
                    },
                    {
                        title: "Absent",
                        members: absentMembers,
                        empty: "Everyone has been marked present.",
                    },
                ].map((section) => (
                    <section key={section.title} className={"mb-8"}>
                        <h3 className={"mb-3"}>
                            <button
                                type="button"
                                aria-expanded={!collapsed[section.title]}
                                onClick={() =>
                                    setCollapsed((prev) => ({
                                        ...prev,
                                        [section.title]: !prev[section.title],
                                    }))
                                }
                                className={
                                    "flex items-center gap-2 cursor-pointer sm:hover:brightness-125"
                                }
                            >
                                <i
                                    className={`bx bx-chevron-down transition-transform ${
                                        collapsed[section.title]
                                            ? "-rotate-90"
                                            : ""
                                    }`}
                                />
                                <span>
                                    {section.title}{" "}
                                    <span className={"text-typography-2"}>
                                        ({section.members.length})
                                    </span>
                                </span>
                            </button>
                        </h3>
                        {collapsed[section.title] ? null : section.members
                              .length ? (
                            <ItemList height={"auto"}>
                                {section.members.map((member) => (
                                    <motion.div
                                        layout
                                        layoutId={`attendee-${member.userId}`}
                                        transition={{ duration: 0.25 }}
                                        key={member.userId}
                                    >
                                        <OrgMember
                                            email={member.email}
                                            picture={member.picture}
                                            role_name={
                                                member.isPresent
                                                    ? "Present"
                                                    : "Absent"
                                            }
                                            first_name={`${member.firstName} ${member.lastName}`}
                                            last_name={String(
                                                member.userId,
                                            ).padStart(5, "0")}
                                            action={
                                                <AsyncButton
                                                    isPrimary={
                                                        !member.isPresent
                                                    }
                                                    sx={{ height: "40px" }}
                                                    onClick={() =>
                                                        updateStatus(
                                                            member.userId,
                                                            member.firstName,
                                                            member.lastName,
                                                            member.isPresent,
                                                        )
                                                    }
                                                >
                                                    {member.isPresent
                                                        ? "Mark Absent"
                                                        : "Mark Present"}
                                                </AsyncButton>
                                            }
                                        />
                                    </motion.div>
                                ))}
                            </ItemList>
                        ) : (
                            <p className={"bg-layer-2 p-4 text-typography-2"}>
                                {section.empty}
                            </p>
                        )}
                    </section>
                ))}
            </LayoutGroup>
        </Box>
    );
};

export default MeetingAttendance;
