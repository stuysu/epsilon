import { useContext } from "react";
import OrgContext from "../../../comps/context/OrgContext";

const Members = () => {
    const organization = useContext<OrgContextType>(OrgContext);
    const members = organization.memberships?.filter(member => member.active).map(member => {
        return {
            name: member.users?.first_name + ' ' + member.users?.last_name,
            email: member.users?.email,
            membershipId: member.id,
            picture: member.users?.picture,
            role_name: member.role_name,
            role: member.role
        }
    })

    return (
        <div>
            <h1>MEMBERS</h1>
            <pre>{JSON.stringify(members, undefined, 4)}</pre>
        </div>
    )
}

export default Members;