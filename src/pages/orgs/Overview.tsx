import { useContext, useState } from "react";
import OrgContext from "../../comps/context/OrgContext";
import {
    Avatar,
    Box,
    Typography,
    useMediaQuery,
    Stack,
    Chip,
    Divider,
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
            }
        } finally {
            setAttemptingInteract(false);
        }
    };

    if (organization.id === -1) {
        return (
            <Box>
                <Typography>That organization doesn't exist!</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: "100%", display: "flex", flexWrap: "wrap" }}>
            <Stack direction="row" spacing={5}>
                <Avatar
                    src={organization.picture || ""}
                    sx={{
                        width: "250px",
                        height: "250px",
                        borderRadius: "25px",
                        boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
                        fontSize: "100px",
                        objectFit: "cover",
                    }}
                    alt={`organization ${organization.name}`}
                >
                    {organization.name.charAt(0).toUpperCase()}
                </Avatar>

                <Stack>
                    <Typography variant="h1" width="100%">
                        {organization.name}
                    </Typography>

                    <Stack
                        direction="row"
                        maxWidth={150}
                        spacing={1}
                        paddingBottom={3}
                    >
                        {organization.tags?.map((tag, index) => (
                            <Chip key={index} label={tag} variant="filled" />
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
                        }}
                    >
                        <AsyncButton
                            variant="contained"
                            onClick={handleInteract}
                            disabled={disabled || attemptingInteract}
                        >
                            {interactString}
                        </AsyncButton>
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

            <Stack direction="row" marginBottom={3}>
                <Box>
                    <Typography variant="h3" align="center" width="100%">
                        {
                            organization.memberships.filter(
                                (member) => member.active,
                            ).length
                        }
                    </Typography>
                    <Typography variant="body1" align="center" width="100%">
                        Members
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h3" align="center" width="100%">
                        12/3/31
                    </Typography>
                    <Typography variant="body1" align="center" width="100%">
                        Initiated
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h3" align="center" width="100%">
                        {organization.state}
                    </Typography>
                    <Typography variant="body1" align="center" width="100%">
                        Activity Status
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h3" align="center" width="100%">
                        {organization.commitment_level}
                    </Typography>
                    <Typography variant="body1" align="center" width="100%">
                        Commitment
                    </Typography>
                </Box>

                <Box>
                    <Typography variant="h3" align="center" width="100%">
                        {organization.meetings.at(-1)?.start_time || "Never"}
                    </Typography>
                    <Typography variant="body1" align="center" width="100%">
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
                    bgcolor="rgba(85, 98, 246, 0.1)"
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
                    bgcolor="rgba(228, 174, 59, 0.1)"
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
                            No meetings scheduled...
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
                    bgcolor="#75FB7A1A"
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
        </Box>
    );
};

export default Overview;
