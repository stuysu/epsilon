import { useContext, useState } from "react";
import OrgContext from "../../../comps/context/OrgContext";
import UserContext from "../../../comps/context/UserContext";
import AdminMeeting from "../../../comps/pages/orgs/admin/AdminMeeting";
import AdminUpsertMeeting from "../../../comps/pages/orgs/admin/AdminUpsertMeeting";

import { Button } from "@mui/material";
import { supabase } from "../../../supabaseClient";

const Meetings = () => {
  const organization = useContext(OrgContext);
  const user = useContext(UserContext);

  const [editState, setEditState] = useState<{
    id: number | undefined;
    title: string | undefined;
    description: string | undefined;
    start: string | undefined;
    end: string | undefined;
    room: number | undefined;
    isPublic: boolean | undefined;
    editing: boolean;
  }>({
    id: undefined,
    title: undefined,
    description: undefined,
    start: undefined,
    end: undefined,
    room: undefined,
    isPublic: undefined,
    editing: false,
  });

  return (
    <div>
      <h1>Meetings</h1>
      {organization.meetings.map((meeting) => (
        <AdminMeeting
          key={meeting.id}
          title={meeting.title || ""}
          description={meeting.description || ""}
          start={meeting.start_time || ""}
          end={meeting.end_time || ""}
          room={meeting.rooms?.name}
          isPublic={meeting.is_public || false}
          onEdit={() => {
            setEditState({
              id: meeting.id,
              title: meeting.title,
              description: meeting.description,
              start: meeting.start_time,
              end: meeting.end_time,
              room: meeting.rooms?.id,
              isPublic: meeting.is_public,
              editing: true,
            });
          }}
          onDelete={async () => {
            let { error } = await supabase
              .from("meetings")
              .delete()
              .eq("id", meeting.id);
            if (error) {
              return user.setMessage(
                "Error deleting meeting. Contact it@stuysu.org for support.",
              );
            }

            user.setMessage("Deleted Meeting!");
          }}
        />
      ))}
      <Button
        onClick={() =>
          setEditState({
            id: undefined,
            title: undefined,
            description: undefined,
            start: undefined,
            end: undefined,
            room: undefined,
            isPublic: undefined,
            editing: true,
          })
        }
      >
        {" "}
        Create Meeting
      </Button>

      {editState.editing ? (
        <AdminUpsertMeeting
          id={editState.id}
          title={editState.title}
          description={editState.description}
          room_id={editState.room}
          start={editState.start}
          end={editState.end}
          isPublic={editState.isPublic}
          open={editState.editing}
          onClose={() => {
            setEditState({
              id: undefined,
              title: undefined,
              description: undefined,
              start: undefined,
              end: undefined,
              room: undefined,
              isPublic: undefined,
              editing: false,
            });
          }}
        />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default Meetings;
