import { useContext, useState, ChangeEvent } from "react";
import UserContext from "../comps/context/UserContext";
import { 
    Button,
    Box,
    TextField,
    FormControl,
    FormLabel,
    FormControlLabel,
    FormGroup, 
    Checkbox,
    Select,
    MenuItem,
    SelectChangeEvent
} from "@mui/material";

import { supabase } from "../supabaseClient";

const Create = () => {
    const user = useContext(UserContext);

    const [name, setName] = useState<string>("")
    const [url, setUrl] = useState<string>("")

    /* use google drive for pictures + provide default pfps */

    const [mission, setMission] = useState<string>("")
    const [purpose, setPurpose] = useState<string>("")
    const [benefit, setBenefit] = useState<string>("")
    const [appointmentProcedures, setAppointmentProcedures] = useState<string>("")
    const [uniqueness, setUniqueness] = useState<string>("")
    const [meetingSchedule, setMeetingSchedule] = useState<string>("")
    const [meetingDays, setMeetingDays] = useState({
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false
    })
    const [keywords, setKeywords] = useState("") /* MAX 3, ex: coding,programming,events */
    const [commitmentLevel, setCommitmentLevel] = useState<Organization["commitment_level"]>("NONE")
    const [joinInstructions, setJoinInstructions] = useState<string>("")

    const handleDayChange = (event: ChangeEvent<HTMLInputElement>) => {
        setMeetingDays({
            ...meetingDays,
            [event.target.name]: event.target.checked
        })
    }

    const createActivity = async () => {
        let mdays = []
        if (meetingDays.monday) mdays.push("MONDAY")
        if (meetingDays.tuesday) mdays.push("TUESDAY")
        if (meetingDays.wednesday) mdays.push("WEDNESDAY")
        if (meetingDays.thursday) mdays.push("THURSDAY")
        if (meetingDays.friday) mdays.push("FRIDAY")

        let meetDays = mdays.join(",")

        let { error } = await supabase
            .from("organizations")
            .insert({
                creator_id: user.id,
                name: name,
                url: url,
                picture: null,
                mission: mission,
                purpose: purpose,
                benefit: benefit,
                appointment_procedures: appointmentProcedures,
                uniqueness: uniqueness,
                meeting_schedule: meetingSchedule,
                meeting_days: meetDays,
                keywords: keywords,
                commitment_level: commitmentLevel,
                join_instructions: joinInstructions
            })
        if (error) {
            return user.setMessage("Error creating organization. Contact it@stuysu.org for support.")
        }

        user.setMessage("Organization created!")
        /* REDIRECT user to organization pending page*/
    }

    return (
        <Box bgcolor="background.default" color="primary.contrastText">
            <h1>Create Organization</h1>
            <TextField label="name" value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} />
            <TextField label="url" value={url} onChange={(event: ChangeEvent<HTMLInputElement>) => setUrl(event.target.value)} />
            <TextField label="mission" value={mission} onChange={(event: ChangeEvent<HTMLInputElement>) => setMission(event.target.value)} />
            <TextField label="purpose" value={purpose} onChange={(event: ChangeEvent<HTMLInputElement>) => setPurpose(event.target.value)} />
            <TextField label="benefit" value={benefit} onChange={(event: ChangeEvent<HTMLInputElement>) => setBenefit(event.target.value)} />
            <TextField label="appointment procedures" value={appointmentProcedures} onChange={(event: ChangeEvent<HTMLInputElement>) => setAppointmentProcedures(event.target.value)} />
            <TextField label="uniqueness" value={uniqueness} onChange={(event: ChangeEvent<HTMLInputElement>) => setUniqueness(event.target.value)} />
            <TextField label="meeting schedule" value={meetingSchedule} onChange={(event: ChangeEvent<HTMLInputElement>) => setMeetingSchedule(event.target.value)} />
            <TextField label="keywords" value={keywords} onChange={(event: ChangeEvent<HTMLInputElement>) => setKeywords(event.target.value)} />
            <TextField label="join instructions" value={joinInstructions} onChange={(event: ChangeEvent<HTMLInputElement>) => setJoinInstructions(event.target.value)} />
            <Select
                value={commitmentLevel}
                onChange={(event: SelectChangeEvent) => setCommitmentLevel(event.target.value as Organization["commitment_level"])}
                label="commitment level"
            >
                <MenuItem value={"NONE"}>None</MenuItem>
                <MenuItem value={"LOW"}>Low</MenuItem>
                <MenuItem value={"MEDIUM"}>Medium</MenuItem>
                <MenuItem value={"HIGH"}>High</MenuItem>
            </Select>
            <FormControl>
                <FormLabel>Meeting Days</FormLabel>
                <FormGroup>
                    <FormControlLabel 
                        control={
                            <Checkbox checked={meetingDays.monday} onChange={handleDayChange} name="monday" />
                        }
                        label="Monday"
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox checked={meetingDays.tuesday} onChange={handleDayChange} name="tuesday" />
                        }
                        label="Tuesday"
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox checked={meetingDays.wednesday} onChange={handleDayChange} name="wednesday" />
                        }
                        label="Wednesday"
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox checked={meetingDays.thursday} onChange={handleDayChange} name="thursday" />
                        }
                        label="Thursday"
                    />
                    <FormControlLabel 
                        control={
                            <Checkbox checked={meetingDays.friday} onChange={handleDayChange} name="friday" />
                        }
                        label="Friday"
                    />
                </FormGroup>
            </FormControl>
            <Button onClick={createActivity}>Create Activity</Button>
        </Box>
    )
}

export default Create;