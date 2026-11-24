import { useContext } from "react";
import OrgContext from "../../../contexts/OrgContext";
import UserContext from "../../../contexts/UserContext";

/* the signed-in user's place in the club on screen */
export default function useOrgRole() {
    const organization = useContext<OrgContextType>(OrgContext);
    const user = useContext<UserContextType>(UserContext);
    const membership = organization.memberships?.find(
        (m) => m.users?.id === user.id,
    );
    const active = !!membership?.active;
    const isOrgAdmin =
        active &&
        (membership?.role === "CREATOR" || membership?.role === "ADMIN");
    const isAdvisor = active && membership?.role === "ADVISOR";
    return {
        membership,
        isOrgAdmin,
        isAdvisor,
        isSiteAdmin: user.permission === "ADMIN",
    };
}
