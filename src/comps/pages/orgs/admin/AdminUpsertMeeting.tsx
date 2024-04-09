import { useState, useEffect, ChangeEvent, useContext } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  DialogActions,
  Switch,
  FormControlLabel,
} from "@mui/material";

import { DateTimePicker } from "@mui/x-date-pickers";

import { supabase } from "../../../../supabaseClient";
import UserContext from "../../../context/UserContext";
import OrgContext from "../../../context/OrgContext";
import dayjs, { Dayjs } from "dayjs";

const getDefaultTime = () => {
  let d = new Date();
  let defaultTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() + (1000 * 60 * 60 * 15) + (1000 * 60 * 35);
  return defaultTime;
}

const AdminUpsertMeeting = ({
  id,
  title,
  description,
  room_id,
  start,
  end,
  isPublic,
  open,
  onClose,
  onSave,
}: {
  id?: number;
  title?: string;
  description?: string;
  room_id?: number;
  start?: string;
  end?: string;
  isPublic?: boolean;
  open: boolean;
  onClose: () => void;
  onSave: (saveState : Partial<Meeting>, isInsert : boolean) => void;
}) => {
  const user = useContext(UserContext);
  const organization = useContext(OrgContext);

  const [meetingTitle, setMeetingTitle] = useState(title || "");
  const [meetingDesc, setMeetingDesc] = useState(description || "");
  
  const [roomId, setRoomId] = useState(room_id);

  // let default date be today at 3:35-5:00
  const [startTime, setStartTime] = useState<Dayjs | null>(
    start ? dayjs(start) : dayjs(getDefaultTime()),
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(end ? dayjs(end) : dayjs(getDefaultTime()));
  const [endTimePicked, setEndTimePicked] = useState(false);
  const [isPub, setIsPub] = useState(isPublic === undefined ? true : isPublic);

  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);

  // fixes select menu item bug where it is trying to map over undefined rooms
  const [loading, setLoading] = useState(true);

  /* Filtering out rooms that are taken for that day */
  
  useEffect(() => {
    const fetchRooms = async () => {
      let { data, error } = await supabase.from("rooms").select();

      if (error || !data) {
        user.setMessage(
          "Error fetching rooms. Contact it@stuysu.org for support.",
        );
        return;
      }

      setAllRooms(data);
      setLoading(false);
    };

    fetchRooms();
  }, [user]);

  useEffect(() => {
    const filterRooms = async () => {
      /* 
      get ids of rooms that are booked. 
      there is a special case when we fetch an existing booked room from save
      */
      
      let { data, error } = await supabase
          .rpc(
            'get_booked_rooms', 
            { meeting_start: startTime , meeting_end: endTime }
          )

      if (error || !data) {
        user.setMessage(
          "Error fetching booked rooms. Contact it@stuysu.org for support."
        );
        return;
      }

      setAvailableRooms(
        allRooms.filter(
          room => (
            room.id === roomId ||
            !data.includes(room.id)
          )
        )
      )
    }

    filterRooms();
  }, [user, allRooms, startTime, endTime])

  const handleSave = async () => {
    let supabaseReturn;

    let isCreated = false;
    let isInsert = false;
    let returnSelect = `
      id,
      is_public,
      title,
      description,
      start_time,
      end_time,
      rooms (
          id,
          name,
          floor
      )
    `

    if (id) {
      // update
      supabaseReturn = await supabase
        .from("meetings")
        .update({
          title: meetingTitle,
          description: meetingDesc,
          room_id: roomId || null,
          start_time: startTime?.toISOString(),
          end_time: endTime?.toISOString(),
          is_public: isPub,
        })
        .eq("id", id)
        .select(returnSelect);
    } else {
      // create
      isInsert = true;
      supabaseReturn = await supabase.from("meetings")
        .insert({
          organization_id: organization.id,
          title: meetingTitle,
          description: meetingDesc,
          room_id: roomId || null,
          start_time: startTime?.toISOString(),
          end_time: endTime?.toISOString(),
          is_public: isPub,
        })
        .select(returnSelect);
      isCreated = true;
    }

    if (supabaseReturn.error) {
      user.setMessage(
        "Error creating meeting. Contact it@stuysu.org for support.",
      );
      return;
    }

    if (isCreated) {
      user.setMessage("Meeting created!");
    } else {
      user.setMessage("Meeting updated!");
    }

    onSave(supabaseReturn.data[0] as Partial<Meeting>, isInsert)
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Upsert Meeting</DialogTitle>
      <DialogContent>
        <TextField
          value={meetingTitle}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setMeetingTitle(event.target.value)
          }
          label="Title"
        />
        <TextField
          value={meetingDesc}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setMeetingDesc(event.target.value)
          }
          label="Description"
        />

        <Select
          value={!loading ? String(roomId) : ""}
          label="Room"
          onChange={(event: SelectChangeEvent) =>
            setRoomId(Number(event.target.value) || undefined)
          }
        >
          <MenuItem value={"undefined"}>Virtual</MenuItem>
          {availableRooms.map((room) => (
            <MenuItem key={room.id} value={String(room.id)}>
              {room.name}
            </MenuItem>
          ))}
        </Select>

        <DateTimePicker
          label="Start Time"
          value={dayjs(startTime)}
          onChange={(newTime) => {
            setStartTime(newTime);
            if (!endTimePicked) setEndTime(newTime);
          }}
        />

        <DateTimePicker
          label="End Time"
          value={dayjs(endTime)}
          onChange={(newTime) => {
            if (!endTimePicked) setEndTimePicked(true);
            setEndTime(newTime)
          }}
        />
        <FormControlLabel
          control={
            <Switch
              checked={isPub}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setIsPub(event.target.checked)
              }
            />
          }
          label="is public?"
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUpsertMeeting;
