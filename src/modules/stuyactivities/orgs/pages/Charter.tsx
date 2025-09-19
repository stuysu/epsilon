import { useContext } from "react";
import OrgContext from "../../../../contexts/OrgContext";
import Divider from "../../../../components/ui/Divider";

const formatDays = (meeting_days: string[]) => {
    return meeting_days
        .map((m) => m.slice(0, 1).toUpperCase() + m.slice(1).toLowerCase())
        .join(", ");
};

const Charter = () => {
    const organization: OrgContextType = useContext(OrgContext);

    return (
        <div
            className={
                "max-w-3xl flex flex-col mt-2 gap-4 mb-10 max-sm:mt-10 max-sm:mx-4"
            }
        >
            <h3 className={"font-['instrument-serif'] text-beige"}>What is this Activity?</h3>
            <p>{organization.purpose || "None"}</p>
            <Divider />

            <h3 className={"font-['instrument-serif'] text-beige"}>On what days does this Activity meet?</h3>
            <p>{formatDays(organization.meeting_days || []) || "None"}</p>
            <Divider />

            <h3 className={"font-['instrument-serif'] text-beige"}>What is the meeting schedule?</h3>
            <p>{organization.meeting_schedule || "None"}</p>
            <Divider />

            <h3 className={"font-['instrument-serif'] text-beige"}>What does a typical meeting look like?</h3>
            <p>{organization.meeting_description || "None"}</p>
            <Divider />

            <h3 className={"font-['instrument-serif'] text-beige"}>How does this Activity appoint leaders?</h3>
            <p>{organization.appointment_procedures || "None"}</p>
            <Divider />

            <h3 className={"font-['instrument-serif'] text-beige"}>What makes this Activity unique?</h3>
            <p>{organization.uniqueness || "None"}</p>
        </div>
    );
};

export default Charter;
