import { useContext, useEffect, useState } from "react";
import OrgContext from "../../comps/context/OrgContext";
import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Stack,
    Typography,
    useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import AsyncButton from "../../comps/ui/AsyncButton";
import OrgMember from "../../comps/pages/orgs/OrgMember";
import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";
import { sortByDate, sortByRole } from "../../utils/DataFormatters";
import UserContext from "../../comps/context/UserContext";

const Overview = () => {
    const navigate = useNavigate();
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
        interactString = "JOINING DISABLED";
        disabled = true;
    } else if (!user.signed_in) {
        interactString = "Sign In To Join";
        disabled = true;
    }

    const handleInteract = async () => {
        setAttemptingInteract(true);
        try {
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
                enqueueSnackbar("Sent organization a join request!", {
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
            <Box>
                <Typography>That organization doesn't exist!</Typography>
            </Box>
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
        <Box
            marginTop={1}
            sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}
        >
            <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <Box>
                    <div
                        className={
                            "max-sm:w-full max-sm:flex max-sm:justify-center max-sm:mt-5"
                        }
                    >
                        <Box
                            sx={{
                                width: "250px",
                                height: "250px",
                                borderRadius: "25px",
                                position: "absolute",
                                boxShadow:
                                    "inset 0 0 10px 1px rgba(255, 255, 255, 0.3)",
                                zIndex: 10,
                            }}
                        ></Box>
                        <Avatar
                            src={organization.picture || ""}
                            sx={{
                                width: "250px",
                                height: "250px",
                                borderRadius: "25px",
                                objectFit: "cover",
                                position: "absolute",
                                zIndex: 0,
                                filter: "blur(30px)",
                                opacity: 0.3,
                            }}
                        />
                        <Avatar
                            src={organization.picture || ""}
                            sx={{
                                width: "250px",
                                height: "250px",
                                borderRadius: "25px",
                                objectFit: "cover",
                                position: "relative",
                                fontSize: "120px",
                                zIndex: 1,
                            }}
                            alt={`organization ${organization.name}`}
                        >
                            <h1>{organization.name.charAt(0).toUpperCase()}</h1>
                        </Avatar>
                    </div>
                </Box>

                <Stack direction={"column"} justifyContent={"space-between"}>
                    <div>
                        <div
                            className={"text-center sm:text-left max-sm:mb-10"}
                        >
                            <Typography variant="h1">
                                {organization.name}
                            </Typography>
                        </div>
                        <Stack
                            direction="row"
                            marginBottom={2}
                            gap={0.5}
                            rowGap={0.5}
                            flexWrap={"wrap"}
                        >
                            {organization.tags?.map((tag, index) => (
                                <Chip
                                    key={index}
                                    label={tag}
                                    variant="filled"
                                    sx={{
                                        borderRadius: 2,
                                        boxShadow:
                                            "inset 0 0 1px 1px rgba(255, 255, 255, 0.15)",
                                    }}
                                />
                            )) || <p>Uncategorized</p>}
                        </Stack>

                        <Typography
                            onClick={() => navigate("./charter")}
                            variant="body1"
                            sx={{
                                cursor: "pointer",
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                WebkitLineClamp: 4,
                                textOverflow: "ellipsis",
                            }}
                        >
                            {organization.purpose || "None"}
                        </Typography>
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
                            sx={
                                interactString === "LEAVE" ||
                                interactString === "CANCEL JOIN"
                                    ? {
                                          backgroundColor:
                                              "rgba(248, 19, 19, 0.88)",
                                          color: "white",
                                      }
                                    : undefined
                            }
                        >
                            {interactString
                                .toLowerCase()
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </AsyncButton>
                        <Dialog
                            open={leaveConfirmation}
                            onClose={handleUserStay}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle variant="h2" id="alert-dialog-title">
                                Confirm Leave?
                            </DialogTitle>
                            <DialogContent dividers>
                                <DialogContentText id="alert-dialog-description">
                                    Are you sure you want to leave/cancel your
                                    join to this organization? Once you confirm
                                    your leave, you will have to request to join
                                    again.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <AsyncButton onClick={handleUserStay}>
                                    Cancel
                                </AsyncButton>
                                <AsyncButton
                                    sx={{
                                        backgroundColor:
                                            "rgba(248, 19, 19, 0.9)",
                                    }}
                                    onClick={handleUserLeave}
                                >
                                    Leave
                                </AsyncButton>
                            </DialogActions>
                        </Dialog>
                    </div>
                </Stack>
            </Stack>

            <Divider
                sx={{
                    background: "#7d7d7d",
                    opacity: "30%",
                    width: "100%",
                    marginTop: "40px",
                    marginBottom: "20px",
                }}
            />

            <Stack
                direction={{ xs: "column", sm: "row" }}
                marginBottom={{ xs: 0, sm: 3 }}
                alignItems="center"
            >
                {user.signed_in && (
                    <>
                        <Box>
                            <Typography variant="h3" align="center" width={100}>
                                {
                                    organization.memberships.filter(
                                        (member) => member.active,
                                    ).length
                                }
                            </Typography>
                            <Typography variant="body1" align="center">
                                Members
                            </Typography>
                        </Box>
                        <Typography
                            variant="h1"
                            align="center"
                            sx={{ opacity: "25%" }}
                        >
                            •
                        </Typography>
                    </>
                )}

                <Box>
                    <Typography variant="h3" align="center" width={170}>
                        {organization.state.charAt(0) +
                            organization.state.slice(1).toLowerCase()}
                    </Typography>
                    <Typography variant="body1" align="center">
                        Activity Status
                        <i
                            className={
                                "bx bx-info-circle relative top-px ml-1 cursor-help"
                            }
                            title={
                                "Activities with less than 10 members, or otherwise" +
                                " specified by the SU, are locked and have limited privileges."
                            }
                        ></i>
                    </Typography>
                </Box>

                <Typography
                    variant="h1"
                    align="center"
                    width="100%"
                    sx={{ opacity: "25%" }}
                >
                    •
                </Typography>

                <Box>
                    <Typography variant="h3" align="center" width={140}>
                        {organization.commitment_level
                            ? organization.commitment_level
                                  .charAt(0)
                                  .toUpperCase() +
                              organization.commitment_level
                                  .slice(1)
                                  .toLowerCase()
                            : "None"}
                    </Typography>
                    <Typography variant="body1" align="center">
                        Commitment
                    </Typography>
                </Box>

                {user.signed_in && (
                    <>
                        <Typography
                            variant="h1"
                            align="center"
                            width="100%"
                            sx={{ opacity: "25%" }}
                        >
                            •
                        </Typography>
                        <Box>
                            <Typography variant="h3" align="center" width={200}>
                                {organization.meetings
                                    ?.at(-1)
                                    ?.start_time?.split("T")[0]
                                    .replaceAll("-", "/") ?? "No Meetings"}
                            </Typography>
                            <Typography variant="body1" align="center">
                                Last Meeting
                            </Typography>
                        </Box>
                    </>
                )}
            </Stack>

            <Box position="relative" width={"100%"} marginBottom={3}>
                <Box
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h3" margin={3}>
                        Meeting Schedule
                    </Typography>

                    <Box borderRadius={2} overflow="hidden">
                        <Box bgcolor="#36363666" padding={3}>
                            <Typography variant="body1">
                                {organization.meeting_schedule || "None"}
                            </Typography>
                        </Box>

                        <Stack
                            marginTop={0.5}
                            direction="row"
                            spacing={0.5}
                            overflow={"scroll"}
                        >
                            {[
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                            ].map((day) => (
                                <Typography
                                    width={"20%"}
                                    key={day}
                                    textAlign="center"
                                    sx={{
                                        fontVariationSettings: "'wght' 700",
                                        padding: "0.5rem",
                                        backgroundColor:
                                            organization.meeting_days?.includes(
                                                day.toUpperCase(),
                                            )
                                                ? "#2D6AE2CC"
                                                : "#36363666",
                                        color: organization.meeting_days?.includes(
                                            day.toUpperCase(),
                                        )
                                            ? "#E8E8E8CC"
                                            : "inherit",
                                    }}
                                >
                                    {day}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                </Box>

                <Box
                    bgcolor="rgba(85, 98, 246, 0.05)"
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    borderRadius={3}
                    zIndex={-1}
                    sx={{
                        filter: "blur(40px)",
                    }}
                />
            </Box>

            <Box position="relative" width={"100%"} marginBottom={3}>
                <Box
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h3" margin={3}>
                        Activity Leaders
                    </Typography>

                    {!user.signed_in && (
                        <Typography
                            variant="body1"
                            marginX={3}
                            marginBottom={3}
                        >
                            Sign in to view the leaders of this organization.
                        </Typography>
                    )}

                    <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
                        {organization.memberships
                            ?.sort(sortByRole)
                            .map(
                                (member, i) =>
                                    ["FACULTY", "ADMIN", "CREATOR"].includes(
                                        member.role || "",
                                    ) &&
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
                    </Stack>
                </Box>

                <Box
                    bgcolor="rgba(228, 174, 59, 0.05)"
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    borderRadius={3}
                    zIndex={-1}
                    sx={{
                        filter: "blur(40px)",
                    }}
                />
            </Box>

            <Box position="relative" width={"100%"} marginBottom={10}>
                <Box
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h3" margin={3}>
                        Upcoming Meetings
                    </Typography>

                    <Stack borderRadius={2} overflow="hidden" spacing={0.5}>
                        {organization.meetings.length === 0 ? (
                            !user.signed_in ? (
                                <Typography
                                    variant="body1"
                                    paddingLeft={3}
                                    paddingBottom={3}
                                >
                                    Sign in to view meetings.
                                </Typography>
                            ) : (
                                <Typography
                                    variant="body1"
                                    paddingLeft={3}
                                    paddingBottom={3}
                                >
                                    No meetings have ever been held.
                                </Typography>
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
                                        <Typography
                                            variant="body1"
                                            paddingLeft={3}
                                            paddingBottom={3}
                                        >
                                            No meetings scheduled for the
                                            future.
                                        </Typography>
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
                                            org_picture={
                                                organization.picture || ""
                                            }
                                            isMobile={isMeetingMobile}
                                            onlyUpcoming
                                        />
                                    ));
                            })()
                        )}
                    </Stack>
                </Box>

                <Box
                    bgcolor="#75FB7A"
                    position="absolute"
                    top="0"
                    left="0"
                    right="0"
                    bottom="0"
                    borderRadius={3}
                    zIndex={-1}
                    sx={{
                        opacity: "0.05",
                        filter: "blur(40px)",
                    }}
                />
            </Box>
        </Box>
    );
};

export default Overview;
