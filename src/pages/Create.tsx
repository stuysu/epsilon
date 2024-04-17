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
  SelectChangeEvent,
} from "@mui/material";

import { supabase } from "../supabaseClient";
import { HOSTNAME } from "../constants";

type tField = {
  label: string,
  id: string,
  requirements?: {
    notRequired?: boolean,
    minChar?: Number,
    maxChar?: Number,
    minWords?: Number,
    maxWords?: Number
  },
  description?: String
}

type tState = {
  name: string,
  url: string,
  mission: string,
  purpose: string,
  benefit: string,
  appointment_procedures: string,
  uniqueness: string,
  meeting_schedule: string
}

type mDays = {
  monday: boolean,
  tuesday: boolean,
  wednesday: boolean,
  thursday: boolean,
  friday: boolean
}

const textRequirements : tField[] = [
  {
    label: "name",
    id: "name",
  },
  {
    label: "url",
    id: "url",
    requirements: {
      minChar: 1,
      maxChar: 80
    },
    description: `https://${HOSTNAME}/<url>`
  },
  {
    label: "mission",
    id: "mission",
    requirements: {
      minChar: 20,
      maxChar: 150
    },
    description: "A quick blurb of what this organization is all about"
  },
  {
    label: "purpose",
    id: "purpose",
    requirements: {
      minWords: 100,
      maxWords: 400
    },
    description: "This will serve as the official description of the club. Please include a brief statement about what is expected of general members involved in the club."
  },
  {
    label: "benefit",
    id: "benefit",
    requirements: {
      minWords: 200,
      maxWords: 400
    },
    description: "How will this activity benefit the Stuyvesant community?"
  },
  {
    label: "appointment procedures",
    id: "appointment_procedures",
    requirements: {
      minWords: 50,
      maxWords: 400
    },
    description: "What are the leadership positions and how are they appointed? Are there any specific protocols members are expected to follow? What is the policy for transfer of leadership between school years? How will leaders be removed if necessary?"
  },
  {
    label: "uniqueness",
    id: "uniqueness",
    requirements: {
      minWords: 75,
      maxWords: 400
    },
    description: "What makes your organization unique?"
  },
  {
    label: "meeting schedule",
    id: "meeting_schedule",
    requirements: {
      minChar: 50,
      maxChar: 1000
    },
    description: `Something like "Our meeting schedule varies throughout the year, but we meet at least once a month and up to 3 times in the Spring."`
  }
]

const Create = () => {
  const user = useContext(UserContext);
  const [textState, setTextState] = useState<tState>({
    name: "",
    url: "",
    mission: "",
    purpose: "",
    benefit: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_schedule: ""
  });

  const onTextChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setTextState({
      ...textState,
      [name]: value,
    });
  }

  const [meetingDays, setMeetingDays] = useState<mDays>({
    monday: false,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
  });
  const [keywords, setKeywords] = useState(""); /* MAX 3, ex: coding,programming,events */
  const [commitmentLevel, setCommitmentLevel] = useState<Organization["commitment_level"]>("NONE");
  const [joinInstructions, setJoinInstructions] = useState<string>("");

  const handleDayChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMeetingDays({
      ...meetingDays,
      [event.target.name]: event.target.checked,
    });
  };

  const createActivity = async () => {
    let mdays = [];
    if (meetingDays.monday) mdays.push("MONDAY");
    if (meetingDays.tuesday) mdays.push("TUESDAY");
    if (meetingDays.wednesday) mdays.push("WEDNESDAY");
    if (meetingDays.thursday) mdays.push("THURSDAY");
    if (meetingDays.friday) mdays.push("FRIDAY");

    let meetDays = mdays.join(",");

    /* TODO: VALIDATE PAYLOAD FRONTEND */
    let payload = {
      creator_id: user.id,
      name: textState.name,
      url: textState.url,
      picture: null,
      mission: textState.mission,
      purpose: textState.purpose,
      benefit: textState.benefit,
      appointment_procedures: textState.appointment_procedures,
      uniqueness: textState.uniqueness,
      meeting_schedule: textState.meeting_schedule,
      meeting_days: meetDays,
      keywords: keywords,
      commitment_level: commitmentLevel,
      join_instructions: joinInstructions,
    }

    let { error } = await supabase.from("organizations").insert(payload);
    if (error) {
      return user.setMessage(
        "Error creating organization. Contact it@stuysu.org for support.",
      );
    }

    user.setMessage("Organization created!");
    /* REDIRECT user to organization pending page */
  };

  return (
    <Box bgcolor="background.default" color="primary.contrastText">
      <h1>Create Organization</h1>
      {
        textRequirements.map((tInfo, i) => {
          let tKey = tInfo.id as (keyof tState)

          return (
            <TextField 
              key={i}
              label={tInfo.label}
              name={tInfo.id}
              value={textState[tKey]}
              onChange={onTextChange}
            />
          )
        })
      }
      <TextField
        label="keywords"
        value={keywords}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setKeywords(event.target.value)
        }
      />
      <TextField
        label="join instructions"
        value={joinInstructions}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          setJoinInstructions(event.target.value)
        }
      />
      <Select
        value={commitmentLevel}
        onChange={(event: SelectChangeEvent) =>
          setCommitmentLevel(
            event.target.value as Organization["commitment_level"],
          )
        }
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
          {
            Object.keys(meetingDays).map((day, i) => {
              let mKey = day as keyof mDays

              return (
                <FormControlLabel 
                  control={
                    <Checkbox 
                      checked={meetingDays[mKey]}
                      onChange={handleDayChange}
                      name={day}
                    />
                  }
                  label={day}
                />
              )
            })
          }
        </FormGroup>
      </FormControl>
      <Button onClick={createActivity}>Create Activity</Button>
    </Box>
  );
};

export default Create;
