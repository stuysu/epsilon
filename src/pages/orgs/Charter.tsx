import { useContext } from "react";
import OrgContext from "../../comps/context/OrgContext";

const Charter = () => {
    const organization : OrgContextType = useContext(OrgContext);

    return (
        <div>
            <h1>Charter</h1>
        </div>
    )
}

export default Charter