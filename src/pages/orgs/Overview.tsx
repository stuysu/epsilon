import { useContext, useEffect, useState } from "react";
import OrgContext from "../../comps/context/OrgContext";
import {
    Avatar,
    Box,
    Typography,
    useMediaQuery,
    Stack,
    Chip,
    Divider,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { supabase } from "../../supabaseClient";
import AsyncButton from "../../comps/ui/AsyncButton";
import OrgMember from "../../comps/pages/orgs/OrgMember";
import OrgMeeting from "../../comps/pages/orgs/OrgMeeting";
import { sortByDate, sortByRole } from "../../utils/DataFormatters";
import UserContext from "../../comps/context/UserContext";

const Overview = () => {
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
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={5}>
                <Box>
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
                            zIndex: 1,
                        }}
                        alt={`organization ${organization.name}`}
                    >
                        {organization.name.charAt(0).toUpperCase()}
                    </Avatar>
                </Box>

                <Stack>
                    <Typography variant="h1" width="100%">
                        {organization.name}
                    </Typography>

                    <Stack
                        direction="row"
                        flexWrap="wrap"
                        marginBottom={3}
                        spacing={1}
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
                        variant="body1"
                        width="100%"
                        sx={{
                            display: "-webkit-box",
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            WebkitLineClamp: 4,
                            textOverflow: "ellipsis",
                        }}
                    >
                        {organization.purpose || "None"}
                    </Typography>

                    <Box
                        sx={{
                            display: "flex",
                            width: "100%",
                            marginTop: 2,
                            alignItems: "center",
                        }}
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
                            {interactString}
                        </AsyncButton>
                        <Dialog
                            open={leaveConfirmation}
                            onClose={handleUserStay}
                            aria-labelledby="alert-dialog-title"
                            aria-describedby="alert-dialog-description"
                        >
                            <DialogTitle id="alert-dialog-title">
                                {
                                    "Are you sure you want to leave/cancel your join to this organization?"
                                }
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText id="alert-dialog-description">
                                    Once you confirm your leave, you will have
                                    to request to join again.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <AsyncButton onClick={handleUserStay}>
                                    Return
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

                        <Box sx={{ marginLeft: 2 }}>
                            {organization.socials &&
                                organization.socials
                                    .split(" ")
                                    .map((social, i) =>
                                        social.startsWith("http") ? (
                                            <Link
                                                key={i}
                                                href={social}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{
                                                    marginRight: "10px",
                                                }}
                                            >
                                                {social}
                                            </Link>
                                        ) : null,
                                    )}
                        </Box>
                    </Box>
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

                <Typography variant="h1" align="center" sx={{ opacity: "25%" }}>
                    •
                </Typography>

                <Box>
                    <Typography variant="h3" align="center" width={150}>
                        {organization.state.charAt(0) +
                            organization.state.slice(1).toLowerCase()}
                    </Typography>
                    <Typography variant="body1" align="center">
                        State
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
                    <Typography variant="h3" align="center" width={150}>
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
                            ?.start_time?.split("T")[0] ?? "No Meetings"}
                    </Typography>
                    <Typography variant="body1" align="center">
                        Last Meeting
                    </Typography>
                </Box>
            </Stack>

            <Box position="relative" width={"100%"} marginBottom={3}>
                <Box
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h3" width="100%" margin={3}>
                        Meeting Schedule
                    </Typography>

                    <Box borderRadius={2} overflow="hidden">
                        <Box bgcolor="#36363666" padding={3}>
                            <Typography variant="body1" width="100%">
                                {organization.meeting_schedule || "None"}
                            </Typography>
                        </Box>

                        <Stack marginTop={0.5} direction="row" spacing={0.5}>
                            {[
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday",
                            ].map((day) => (
                                <Typography
                                    flexGrow="1"
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
                    <Typography variant="h3" width="100%" margin={3}>
                        Activity Leaders
                    </Typography>

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

            <Box position="relative" width={"100%"} marginBottom={3}>
                <Box
                    bgcolor="#1f1f1f80"
                    padding={0.5}
                    borderRadius={3}
                    boxShadow="inset 0 0 1px 1px rgba(255, 255, 255, 0.15)"
                >
                    <Typography variant="h3" width="100%" margin={3}>
                        Upcoming Meetings
                    </Typography>

                    {organization.meetings.length === 0 ? (
                        <Typography
                            variant="body1"
                            width="100%"
                            marginLeft={3}
                            marginBottom={3}
                        >
                            No past or future meetings.
                        </Typography>
                    ) : (
                        organization.meetings
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
                            ))
                    )}
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
