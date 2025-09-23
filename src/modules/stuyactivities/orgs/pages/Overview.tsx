import React, { useContext, useEffect, useState } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import { Avatar, useMediaQuery } from "@mui/material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import OrgMember from "../components/OrgMember";
import OrgMeeting from "../components/OrgMeeting";
import { sortByDate, sortByRole } from "../../../../utils/DataFormatters";
import UserContext from "../../../../contexts/UserContext";
import RelatedActivities from "./RelatedActivities";
import OrgInspector from "../components/OrgInspector";
import ToggleChip from "../../../../components/ui/input/ToggleChip";
import Divider from "../../../../components/ui/Divider";
import OverviewList from "../../../../components/ui/lists/OverviewList";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { PUBLIC_URL } from "../../../../config/constants";
import DisplayLinks from "../../../../components/DisplayLinks";

const Overview = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 1024px)");
    const organization: OrgContextType = useContext(OrgContext);
    const user: UserContextType = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const isMeetingMobile = useMediaQuery("(max-width: 1450px)");

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
    if (!isInOrg && !organization.joinable) {
        interactString = "🔒 Private Activity";
        disabled = true;
    } else if (!user.signed_in) {
        interactString = "Sign In To Join";
    }

    const handleInteract = async () => {
        setAttemptingInteract(true);
        try {
            if (!user.signed_in) {
                navigate("/");
                return;
            }
            if (interactString === "JOIN") {
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
            const { error } = await supabase
                .from("memberships")
                .delete()
                .eq("id", membership?.id);

            if (error) {
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
            enqueueSnackbar("Left organization!", { variant: "success" });
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

    const handleUserLeave = () => {
        setLeaveConfirmation(false);
        setUserLeave(true);
    };

    const handleUserStay = () => {
        setLeaveConfirmation(false);
        setUserLeave(false);
    };

    return (
        <div className={"mt-3 w-full flex flex-wrap max-w-4xl"}>
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
                        src={organization.picture || ""}
                        sx={{
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
                        src={organization.picture || ""}
                        sx={{
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
                        <h1 className={"text-[200px] font-light opacity-70"}>
                            {organization.name.charAt(0).toUpperCase()}
                        </h1>
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
                                onClick={() => navigate("./charter")}
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
                            variant="contained"
                            onClick={handleInteract}
                            disabled={disabled || attemptingInteract}
                            sx={{
                                ...(interactString === "LEAVE" ||
                                interactString === "CANCEL JOIN"
                                    ? {
                                          backgroundColor:
                                              "rgba(248, 19, 19, 0.88)",
                                          color: "white",
                                      }
                                    : {}),
                                ...(isMobile && { width: "100%" }),
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
                            open={leaveConfirmation}
                        />
                    </div>
                </div>
            </div>

            <Divider />
            <div className={"max-w-full overflow-scroll scrollbar-none"}>
                <div className={"flex flex-row mt-2 mb-6 items-center"}>
                    {user.signed_in && (
                        <>
                            <div>
                                <h3 className={"w-24 text-center"}>
                                    {
                                        organization.memberships.filter(
                                            (member) => member.active,
                                        ).length
                                    }
                                </h3>
                                <p className={"text-center"}>Members</p>
                            </div>
                            <h1 className={"opacity-25"}>•</h1>
                        </>
                    )}

                    <div>
                        <h3 className={"w-40 text-center"}>
                            {organization.state.charAt(0) +
                                organization.state.slice(1).toLowerCase()}
                        </h3>
                        <p className={"text-center"}>
                            Activity Status
                            <i
                                className={
                                    "bx bx-info-circle relative top-px ml-1 cursor-help sm:hover:brightness-200"
                                }
                                onClick={() => navigate(`/activities-support`)}
                            ></i>
                        </p>
                    </div>

                    <h1 className={"opacity-25"}>•</h1>

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
                            <h1 className={"opacity-25"}>•</h1>
                            <div>
                                <h3 className={"w-48 text-center"}>
                                    {organization.meetings
                                        ?.at(-1)
                                        ?.start_time?.split("T")[0]
                                        .replaceAll("-", "/") ?? "No Meetings"}
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
                                ?.sort(sortByRole)
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
                                        org_name={organization.name}
                                        org_picture={organization.picture || ""}
                                        isMobile={isMeetingMobile}
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

            <div className={"w-full mt-10"}>
                <h2 className={"mb-2 text-typography-1"}>
                    Activities Like This
                    <span className={"opacity-75"}> (Beta)</span>
                </h2>
                {isMobile ? (
                    <Divider />
                ) : (
                    <div
                        className={
                            "absolute w-[calc(100vw-160px-3rem)] h-px bg-divider"
                        }
                    ></div>
                )}
                <div className={"h-80 relative right-12"}>
                    <div className={"absolute"}>
                        <RelatedActivities currentOrg={organization} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Overview;
