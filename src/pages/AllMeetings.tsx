import { useContext, useEffect, useState } from "react";

import { supabase } from "../supabaseClient";

import UserContext from "../comps/context/UserContext";

const AllMeetings = () => {
  const user = useContext(UserContext);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    let d = new Date();
    let monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
    let monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);

    const fetchMeetings = async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select()
        .lte("start_time", monthEnd.toISOString())
        .gte("start_time", monthStart.toISOString());

      if (error || !data) {
        return user.setMessage(
          "Error fetching meetings. Contact it@stuysu.org for support.",
        );
      }

      setMeetings(data as Meeting[]);
    };

    fetchMeetings();
  }, []);

  return (
    <div>
      <h1>All Meetings</h1>
      <pre>{JSON.stringify(meetings, undefined, 4)}</pre>
    </div>
  );
};

export default AllMeetings;
