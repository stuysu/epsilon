import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

const Meetings = () => {
    const organization : OrgContextType = useContext(OrgContext);

    return (
        <div>
            <h1>Meetings</h1>
        </div>
    )
}

export default Meetings;