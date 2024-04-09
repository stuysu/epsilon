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
}: {
  id: number | undefined;
  title: string | undefined;
  description: string | undefined;
  room_id: number | undefined;
  start: string | undefined;
  end: string | undefined;
  isPublic: boolean | undefined;
  open: boolean;
  onClose: () => void;
}) => {
  const user = useContext(UserContext);
  const organization = useContext(OrgContext);

  const [meetingTitle, setMeetingTitle] = useState(title || "");
  const [meetingDesc, setMeetingDesc] = useState(description || "");
  const [roomId, setRoomId] = useState(room_id);
  const [startTime, setStartTime] = useState<Dayjs | null>(
    start ? dayjs(start) : null,
  );
  const [endTime, setEndTime] = useState<Dayjs | null>(end ? dayjs(end) : null);
  const [endTimePicked, setEndTimePicked] = useState(false);
  const [isPub, setIsPub] = useState(isPublic === undefined ? true : isPublic);

  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  /* TODO: edit to filter out rooms that are already taken for that day */
  useEffect(() => {
    const fetchRooms = async () => {
      const { data, error } = await supabase.from("rooms").select();

      if (error) {
        user.setMessage(
          "Error fetching rooms. Contact it@stuysu.org for support.",
        );
        return;
      }

      setAvailableRooms(data);
      setLoading(false);
    };

    fetchRooms();
  }, [user]);

  const handleSave = async () => {
    let supabaseReturn;

    let isCreated = false;

    if (id) {
      // update
      supabaseReturn = await supabase
        .from("meetings")
        .update({
          title: meetingTitle,
          description: meetingDesc,
          room_id: roomId,
          start_time: startTime?.toISOString(),
          end_time: endTime?.toISOString(),
          is_public: isPub,
        })
        .eq("id", id);
    } else {
      // create
      supabaseReturn = await supabase.from("meetings").insert({
        organization_id: organization.id,
        title: meetingTitle,
        description: meetingDesc,
        room_id: roomId,
        start_time: startTime?.toISOString(),
        end_time: endTime?.toISOString(),
        is_public: isPub,
      });
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
