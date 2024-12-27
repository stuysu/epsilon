import React from "react";

const OrgContext = React.createContext<OrgContextType>({
    id: -1,
    name: "",
    socials: "",
    url: "",
    picture: "",
    mission: "",
    purpose: "",
    goals: "",
    appointment_procedures: "",
    uniqueness: "",
    meeting_description: "",
    meeting_schedule: "",
    meeting_days: [],
    commitment_level: "NONE",
    state: "PENDING",
    joinable: false,
    join_instructions: "",
    memberships: [],
    meetings: [],
    posts: [],
    faculty_email: "",
});

export default OrgContext;
