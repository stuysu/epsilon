import React from "react";

const OrgContext = React.createContext<OrgContextType>({
    id: -1,
    name: "",
    url: "",
    picture: "",
    mission: "",
    purpose: "",
    benefit: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_schedule: "",
    meeting_days: [],
    commitment_level: "NONE",
    state: "PENDING",
    joinable: false,
    join_instructions: "",
    memberships: [],
    meetings: [],
    posts: []
});

export default OrgContext;
