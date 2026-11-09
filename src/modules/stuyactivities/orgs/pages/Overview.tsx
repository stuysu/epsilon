import React, { useContext, useEffect, useMemo, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import OrgMember from "../components/OrgMember";
import OrgMeeting from "../components/OrgMeeting";
import { sortByDate, sortMembers } from "../../../../utils/DataFormatters";
import { toNewYork } from "../../../../utils/NewYorkTime";
import UserContext from "../../../../contexts/UserContext";
import RelatedActivities from "./RelatedActivities";
import { relatedActivities } from "../relatedActivities";
import { useOrgList } from "../../../../contexts/OrgListContext";
import OrgInspector from "../components/OrgInspector";
import ToggleChip from "../../../../components/ui/input/ToggleChip";
import Divider from "../../../../components/ui/Divider";
import OverviewList from "../../../../components/ui/lists/OverviewList";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { PUBLIC_URL } from "../../../../config/constants";
import DisplayLinks from "../../../../components/DisplayLinks";
import Avatar from "../../../../components/ui/Avatar";
import pressable from "../../../../utils/pressable";
import { useInvites } from "../../../../contexts/InvitesProvider";
import { sizedPicture } from "../../../../utils/sizedPicture";

const Overview = () => {
    const navigate = useNavigate();
    const organization: OrgContextType = useContext(OrgContext);
    const user: UserContextType = useContext(UserContext);
    const { orgs } = useOrgList();
    const related = useMemo(
        () =>
            orgs
                ? relatedActivities(
                      organization as Organization,
                      orgs as Organization[],
                  )
                : null,
        [orgs, organization],
    );
    const { invites } = useInvites();
    const { enqueueSnackbar } = useSnackbar();

    const [attemptingInteract, setAttemptingInteract] = useState(false);

    const [leaveConfirmation, setLeaveConfirmation] = useState(false);
    const [userLeave, setUserLeave] = useState(false);

    const isInOrg = !!organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    const isCreator =
        isInOrg &&
        organization.memberships?.find((m) => m.users?.id === user.id)?.role ===
            "CREATOR";
    const isActive =
        isInOrg &&
        organization.memberships?.find((m) => m.users?.id === user.id)?.active;

    let interactString = isInOrg
        ? isActive
            ? "LEAVE"
            : "CANCEL JOIN"
        : "JOIN";
    let disabled = false;

    if (isCreator) disabled = true;
    const pendingInvite = invites.find(
        (invite) => invite.organizations.id === organization.id,
    );
    if (!isInOrg && pendingInvite) {
        interactString = "VIEW INVITE";
    } else if (!isInOrg && !organization.joinable) {
        interactString = "🔒 Private Activity";
        disabled = true;
    } else if (!user.signed_in) {
        interactString = "Sign In To Join";
    }

    const handleInteract = async () => {
        setAttemptingInteract(true);
        try {
            if (!user.signed_in) {
                // back to this club after signing in
                await supabase.auth.signInWithOAuth({
                    provider: "google",
                    options: {
                        redirectTo:
                            window.location.origin + window.location.pathname,
                    },
                });
                return;
            }
            if (interactString === "VIEW INVITE") {
                navigate("/invites");
                return;
            }
            if (interactString === "JOIN") {
                const { data: orgData, error: orgError } = await supabase
                    .from("organizations")
                    .select("joinable")
                    .eq("id", organization.id)
                    .single();

                if (orgError || !orgData) {
                    enqueueSnackbar(
                        "Unable to verify organization joinability.",
                        {
                            variant: "error",
                        },
                    );
                    return;
                }

                if (!orgData.joinable) {
                    enqueueSnackbar("This club is not joinable.", {
                        variant: "error",
                    });
                    if (organization.setOrg) {
                        organization.setOrg({
                            ...organization,
                            joinable: false,
                        });
                    }
                    return;
                }

                const body = { organization_id: organization.id };
                const { data, error } = await supabase.functions.invoke(
                    "join-organization",
                    { body },
                );

                if (error || !data) {
                    enqueueSnackbar("Unable to join organization.", {
                        variant: "error",
                    });
                    return;
                }
                if (organization.setOrg) {
                    organization.setOrg({
                        ...organization,
                        memberships: [...organization.memberships, data],
                    });
                }
                enqueueSnackbar("Join request sent!", {
                    variant: "success",
                });
            } else if (
                interactString === "LEAVE" ||
                interactString === "CANCEL JOIN"
            ) {
                setLeaveConfirmation(true);
            }
        } finally {
            setAttemptingInteract(false);
        }
    };

    useEffect(() => {
        const leaveOrg = async () => {
            const membership = organization.memberships?.find(
                (m) => m.users?.id === user.id,
            );
            /* a blocked delete removes no rows and returns no error */
            const { data: removed, error } = await supabase
                .from("memberships")
                .delete()
                .eq("id", membership?.id)
                .select("id");

            if (error || !removed?.length) {
                enqueueSnackbar("Unable to leave organization.", {
                    variant: "error",
                });
                return;
            }
            if (organization.setOrg) {
                organization.setOrg({
                    ...organization,
                    memberships: organization.memberships.filter(
                        (m) => m.users?.id !== user.id,
                    ),
                });
            }
            enqueueSnackbar(
                membership?.active
                    ? "Left organization!"
                    : "Join request cancelled.",
                { variant: "success" },
            );
        };

        if (userLeave) {
            setAttemptingInteract(true);
            leaveOrg().finally(() => {
                setUserLeave(false);
                setAttemptingInteract(false);
            });
        }
    }, [userLeave]);

    // const handleClickOpen = () => {
    //     setAttemptingInteract(true);
    // }

    if (organization.id === -1) {
        return (
            <div>
                <h1>That organization doesn't exist!</h1>
            </div>
        );
    }

    // meetings aren't sorted and include upcoming ones
    const lastMeetingStart = (organization.meetings ?? [])
        .map((m) => m.start_time)
        .filter((t): t is string => !!t && new Date(t).getTime() < Date.now())
        .reduce<string | undefined>(
            (latest, t) =>
                !latest || new Date(t) > new Date(latest) ? t : latest,
            undefined,
        );

    const handleUserLeave = () => {
        setLeaveConfirmation(false);
        setUserLeave(true);
    };

    const handleUserStay = () => {
        setLeaveConfirmation(false);
        setUserLeave(false);
    };

    return (
        <div
            className={
                "mt-3 w-full flex flex-wrap max-w-4xl min-[2300px]:max-w-none"
            }
        >
            <div className={"flex max-sm:flex-col gap-6 mb-7"}>
                <div
                    className={
                        "max-sm:w-full max-sm:flex max-sm:justify-center max-sm:mt-5"
                    }
                >
                    <div
                        style={{
                            width: "240px",
                            height: "240px",
                            borderRadius: "25px",
                            position: "absolute",
                            boxShadow:
                                "inset 0 0 10px 1px rgba(255, 255, 255, 0.3)",
                            zIndex: 10,
                        }}
                    ></div>
                    <Avatar
                        src={sizedPicture(organization.picture, 240)}
                        style={{
                            width: "240px",
                            height: "240px",
                            borderRadius: "25px",
                            objectFit: "cover",
                            position: "absolute",
                            zIndex: 0,
                            filter: "blur(30px)",
                            opacity: 0.25,
                        }}
                    />
                    <Avatar
                        src={sizedPicture(organization.picture, 240)}
                        style={{
                            width: "240px",
                            height: "240px",
                            backgroundColor: "var(--layer-primary)",
                            borderRadius: "25px",
                            objectFit: "cover",
                            position: "relative",
                            fontSize: "140px",
                            zIndex: 1,
                            color: "#cdcdcd",
                        }}
                        alt={`organization ${organization.name}`}
                    >
                        <div
                            className={
                                "as-h1 text-[200px] font-light opacity-70"
                            }
                        >
                            {organization.name.charAt(0).toUpperCase()}
                        </div>
                    </Avatar>
                </div>

                <div className={"flex flex-col relative bottom-0.5"}>
                    <div>
                        <div className={"text-center sm:text-left max-sm:mb-6"}>
                            <h1>{organization.name}</h1>
                        </div>
                        <div
                            className={
                                "flex mb-5 gap-1 flex-wrap max-sm:justify-center"
                            }
                        >
                            {organization.tags?.map((tag, index) => (
                                <ToggleChip
                                    title={tag}
                                    selectable={false}
                                    key={index}
                                />
                            )) || (
                                <ToggleChip
                                    title={"Uncategorized"}
                                    selectable={false}
                                />
                            )}
                        </div>

                        <div
                            className={
                                "max-sm:mb-6 max-sm:m-1 max-sm:mt-6 mb-2 cursor-help sm:hover:brightness-125 transition"
                            }
                        >
                            <p
                                className="h-[4lh] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
                                {...pressable(() => navigate("./charter"), {
                                    role: "link",
                                })}
                                aria-label={`${organization.purpose || "No purpose given"}. Read the full charter`}
                            >
                                {organization.purpose || "None"}
                            </p>
                        </div>
                    </div>

                    <div
                        className={
                            "max-sm:flex max-sm:justify-center max-sm:w-full mt-2"
                        }
                    >
                        <AsyncButton
                            onClick={handleInteract}
                            disabled={disabled || attemptingInteract}
                            className="max-lg:w-full"
                            sx={{
                                ...(interactString === "LEAVE" ||
                                interactString === "CANCEL JOIN"
                                    ? {
                                          backgroundColor: "#c81e1e",
                                          color: "white",
                                      }
                                    : {}),
                            }}
                        >
                            {interactString
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </AsyncButton>
                        <UserDialog
                            title="Leave Organization?"
                            imageSrc={`${PUBLIC_URL}/symbols/warning.png`}
                            description={`Are you sure you want to leave (or cancel your join request to) this organization? You will have to request to join again.`}
                            onConfirm={handleUserLeave}
                            onClose={handleUserStay}
                            confirmText={
                                isActive
                                    ? `Leave ${organization.name}`
                                    : "Cancel request"
                            }
                            cancelText={isActive ? "Cancel" : "Keep request"}
                            open={leaveConfirmation}
                        />
                    </div>
                </div>
            </div>

            <Divider />
            <div
                className={
                    "max-w-full overflow-scroll scrollbar-none scroll-pe-10 max-lg:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] max-lg:pr-8"
                }
            >
                <div className={"flex flex-row mt-2 mb-6 items-center"}>
                    {user.signed_in && (
                        <>
                            <div>
                                <h3 className={"w-24 text-center"}>
                                    {
                                        organization.memberships.filter(
                                            (member) =>
                                                member.active &&
                                                member.role !== "ADVISOR",
                                        ).length
                                    }
                                </h3>
                                <p className={"text-center"}>Members</p>
                            </div>
                            <div className={"as-h1 opacity-25"}>•</div>
                        </>
                    )}

                    <div>
                        <h3 className={"w-40 text-center"}>
                            {organization.state.charAt(0) +
                                organization.state.slice(1).toLowerCase()}
                        </h3>
                        <p className={"text-center"}>
                            Activity Status
                            <button
                                type="button"
                                className={
                                    "bx bx-info-circle relative top-px -my-1.5 -mr-1.5 ml-[-2px] p-1.5 cursor-help sm:hover:brightness-200"
                                }
                                aria-label="What does Activity Status mean?"
                                onClick={() => navigate(`/activities-support`)}
                            ></button>
                        </p>
                    </div>

                    <div className={"as-h1 opacity-25"}>•</div>

                    <div>
                        <h3 className={"w-32 text-center"}>
                            {organization.commitment_level
                                ? organization.commitment_level
                                      .charAt(0)
                                      .toUpperCase() +
                                  organization.commitment_level
                                      .slice(1)
                                      .toLowerCase()
                                : "None"}
                        </h3>
                        <p className={"text-center"}>Commitment</p>
                    </div>

                    {user.signed_in && (
                        <>
                            <div className={"as-h1 opacity-25"}>•</div>
                            <div>
                                <h3 className={"w-48 text-center"}>
                                    {lastMeetingStart
                                        ? toNewYork(lastMeetingStart).format(
                                              "M/D/YYYY",
                                          )
                                        : "None Yet"}
                                </h3>
                                <p className={"text-center"}>Last Meeting</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={"flex flex-col gap-6 w-full"}>
                <OverviewList
                    height={"auto"}
                    title={"Meeting Schedule"}
                    glow={"bg-blue"}
                >
                    <div className={"bg-layer-2 p-4 mb-0.5"}>
                        <DisplayLinks
                            text={organization.meeting_schedule || "None"}
                        />
                    </div>
                    <div className="flex gap-1">
                        {[
                            ["Mon", "Monday"],
                            ["Tue", "Tuesday"],
                            ["Wed", "Wednesday"],
                            ["Thu", "Thursday"],
                            ["Fri", "Friday"],
                        ].map(([abbr, full]) => (
                            <p
                                key={abbr}
                                className={`flex-1 text-center py-2 ${
                                    organization.meeting_days?.includes(
                                        full.toUpperCase(),
                                    )
                                        ? "bg-accent text-white important"
                                        : "bg-layer-2"
                                }`}
                            >
                                {abbr}
                            </p>
                        ))}
                    </div>
                </OverviewList>

                <OverviewList
                    height={"auto"}
                    title={"Activity Leaders"}
                    glow={"bg-red"}
                >
                    {!user.signed_in ? (
                        <p className={"bg-layer-2 p-4"}>
                            <i
                                className={
                                    "bx bx-user mr-2 bx-sm relative top-0.5"
                                }
                            ></i>
                            <span className={"relative -top-1"}>
                                {" "}
                                Sign in to view the leaders of this
                                organization.
                            </span>
                        </p>
                    ) : (
                        <div className={"flex flex-col gap-1"}>
                            {organization.memberships
                                ?.sort(sortMembers)
                                .map(
                                    (member, i) =>
                                        [
                                            "FACULTY",
                                            "ADMIN",
                                            "CREATOR",
                                        ].includes(member.role || "") &&
                                        member.active && (
                                            <OrgMember
                                                key={i}
                                                role={member.role || "MEMBER"}
                                                role_name={member.role_name}
                                                email={
                                                    member.users?.email ||
                                                    "no email"
                                                }
                                                picture={member.users?.picture}
                                                first_name={
                                                    member.users?.first_name ||
                                                    "First"
                                                }
                                                last_name={
                                                    member.users?.last_name ||
                                                    "Last"
                                                }
                                                is_faculty={
                                                    member.users?.is_faculty ||
                                                    false
                                                }
                                            />
                                        ),
                                )}
                        </div>
                    )}
                </OverviewList>

                <OverviewList
                    height={"auto"}
                    title={"Upcoming Meetings"}
                    glow={"bg-green"}
                >
                    {organization.meetings.length === 0 ? (
                        !user.signed_in ? (
                            <p className={"bg-layer-2 p-4"}>
                                <i
                                    className={
                                        "bx bx-calendar-week mr-2 bx-sm relative top-0.5"
                                    }
                                ></i>
                                <span className={"relative -top-1"}>
                                    {" "}
                                    Sign in to view meetings in this
                                    organization.
                                </span>
                            </p>
                        ) : (
                            <p className={"bg-layer-2 p-4"}>
                                <i
                                    className={
                                        "bx bx-calendar-exclamation mr-2 bx-sm relative top-0.5"
                                    }
                                ></i>
                                <span className={"relative -top-1"}>
                                    {" "}
                                    No meeting records.
                                </span>
                            </p>
                        )
                    ) : (
                        (() => {
                            const now = new Date();
                            const upcomingMeetings =
                                organization.meetings.filter(
                                    (meeting) =>
                                        meeting.end_time &&
                                        new Date(meeting.end_time) > now,
                                );
                            if (upcomingMeetings.length === 0) {
                                return (
                                    <p className={"bg-layer-2 p-4"}>
                                        <i
                                            className={
                                                "bx bx-calendar-x mr-2 bx-sm relative top-0.5"
                                            }
                                        ></i>
                                        <span className={"relative -top-1"}>
                                            {" "}
                                            No future meetings scheduled at this
                                            time.
                                        </span>
                                    </p>
                                );
                            }
                            return upcomingMeetings
                                .sort(sortByDate)
                                .map((meeting) => (
                                    <OrgMeeting
                                        key={meeting.id}
                                        id={meeting.id}
                                        title={meeting.title}
                                        description={meeting.description}
                                        start_time={meeting.start_time}
                                        end_time={meeting.end_time}
                                        is_public={meeting.is_public}
                                        room_name={meeting.rooms?.name}
                                        advisor={meeting.advisor}
                                        org_name={organization.name}
                                        org_picture={organization.picture || ""}
                                        onlyUpcoming
                                    />
                                ));
                        })()
                    )}
                </OverviewList>

                <div className={"xl:hidden mb-10 w-full"}>
                    <OrgInspector />
                </div>
            </div>

            {related?.length !== 0 && (
                <div className={"w-full mt-10"}>
                    <h2 className={"mb-2 text-typography-1"}>
                        Activities Like This
                    </h2>
                    <div className={"lg:hidden"}>
                        <Divider />
                    </div>
                    <div
                        className={
                            "absolute h-px w-[calc(100vw-160px-3rem)] bg-divider max-lg:hidden"
                        }
                    ></div>
                    <div className={"h-80 relative right-12"}>
                        <div className={"absolute"}>
                            <RelatedActivities related={related} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Overview;
