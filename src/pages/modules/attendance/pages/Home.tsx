import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from "@mui/material";
import { useContext, useEffect, useState } from "react";
import UserContext from "../../../../comps/context/UserContext";
import { supabase } from "../../../../supabaseClient";
import { useSnackbar } from "notistack";
import MeetingAttendanceCard from "../comps/MeetingAttendanceCard";
import { useSearchParams } from "react-router-dom";
import LoginGate from "../../../../comps/ui/LoginGate";

const Home = () => {
    const user = useContext(UserContext);

    const { enqueueSnackbar } = useSnackbar();

    const [urlParams, setSearchParams] = useSearchParams();

    const [selectedOrgId, setSelectedOrgId] = useState(-1);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const memberships =
        user.memberships?.filter((membership) =>
            ["ADMIN", "CREATOR"].includes(membership?.role || ""),
        ) || [];

    useEffect(() => {
        const updateOrgId = () => {
            if (urlParams.get("org")) {
                let num = parseInt(urlParams.get("org") || "-1");

                if (num && num !== -1) {
                    setSelectedOrgId(num);
                    return;
                }
            } else {
                let oid = memberships[0]?.organizations?.id;
                if (oid) {
                    setSelectedOrgId(oid);
                    setSearchParams({ org: oid.toString() });
                    return;
                }
            }
        };

        updateOrgId();
    });

    useEffect(() => {
        const fetchOrgMeetings = async () => {
            if (selectedOrgId === -1) return;

            // fetch meetings
            const { data: meetingsData, error: meetingFetchError } =
                await supabase
                    .from("meetings")
                    .select(`*`)
                    .eq("organization_id", selectedOrgId);

            if (meetingFetchError || !meetingsData) {
                enqueueSnackbar("Failed to fetch meetings.", {
                    variant: "error",
                });
                return;
            }

            setMeetings(meetingsData as Meeting[]);
        };

        fetchOrgMeetings();
    }, [selectedOrgId, enqueueSnackbar]);

    console.log(memberships?.length);
    return (
        <LoginGate>
            <Typography
                variant="h1"
                width="100%"
                align="center"
                marginTop="50px"
            >
                Take Attendance
            </Typography>
            <Box sx={{ width: "100%" }}>
                <Box sx={{ width: "250px", padding: "20px", height: "100px" }}>
                    <FormControl fullWidth>
                        <InputLabel>
                            {memberships.length
                                ? "Select Organization"
                                : "No Organizations"}
                        </InputLabel>
                        <Select
                            label="Select Organization"
                            value={
                                selectedOrgId <= 0 ? undefined : selectedOrgId
                            }
                            onChange={(event) => {
                                setSelectedOrgId(event.target.value as number);
                                setSearchParams({
                                    org: event.target.value.toString(),
                                });
                            }}
                            disabled={!memberships?.length}
                        >
                            {memberships.map((membership) => (
                                <MenuItem
                                    key={membership.id}
                                    value={membership.organizations?.id}
                                >
                                    {membership.organizations?.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {meetings.length === 0 ? (
                    <Typography variant="h3" align="center">
                        No meetings found.
                    </Typography>
                ) : (
                    <Box
                        sx={{
                            width: "100%",
                            display: "flex",
                            flexWrap: "wrap",
                        }}
                    >
                        {meetings.map((meeting) => (
                            <MeetingAttendanceCard
                                key={meeting.id}
                                title={meeting.title}
                                id={meeting.id}
                                startTime={meeting.start_time}
                            />
                        ))}
                    </Box>
                )}
            </Box>
        </LoginGate>
    );
};

export default Home;
