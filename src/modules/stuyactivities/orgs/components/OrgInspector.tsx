import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import OrgContext from "../../../../contexts/OrgContext";
import UserContext from "../../../../contexts/UserContext";
import ItemList from "../../../../components/ui/lists/ItemList";
import { toNewYork } from "../../../../utils/NewYorkTime";
import {
    LINK_TYPES,
    getSocialLinks,
    linkDetail,
    linkTitle,
} from "../../../../utils/SocialLinks";
import { AttendancePerformance, MeetingRequirements } from "./MeetingSideCards";
import OrgAdvisors from "./OrgAdvisors";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const user: UserContextType = useContext(UserContext);
    const location = useLocation();
    const [strikes, setStrikes] = useState<Strike[]>([]);

    const isAuditPage = location.pathname.includes("/audit");
    const canManageAttendance =
        organization.memberships?.some(
            (m) =>
                m.users?.id === user.id &&
                (m.role === "CREATOR" ||
                    m.role === "ADMIN" ||
                    m.role === "ADVISOR") &&
                m.active,
        ) ?? false;
    const card = inspectorCardFor(location.pathname);
    const sideCard =
        card === "attendance" && !canManageAttendance ? undefined : card;
    /* strikes are only readable by the club's leaders and site admins, so
    anyone else would always be told the club has none */
    const canSeeStrikes =
        user.permission === "ADMIN" ||
        (organization.memberships?.some(
            (m) =>
                m.users?.id === user.id &&
                (m.role === "CREATOR" || m.role === "ADMIN") &&
                m.active,
        ) ??
            false);
    const socialLinks = getSocialLinks(organization.socials);
    const canEditAdvisors =
        /\/admin\/roster\/?$/.test(location.pathname) && canManageAttendance;

    useEffect(() => {
        if (!isAuditPage || !canSeeStrikes) return;
        const fetchStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(`id, reason, created_at, users (first_name, last_name)`)
                .eq("organization_id", organization.id);
            if (!error && data) setStrikes(data as Strike[]);
        };
        fetchStrikes();
    }, [isAuditPage, canSeeStrikes, organization.id]);

    return (
        <div className={"relative xl:w-[300px] xl:ml-10 xl:mr-[3rem]"}>
            {sideCard === "requirements" ? (
                <MeetingRequirements />
            ) : sideCard === "attendance" ? (
                <AttendancePerformance />
            ) : !isAuditPage ? (
                <>
                    <ItemList height={"auto"} title={"Links"}>
                        {socialLinks.length > 0 ? (
                            socialLinks.map((link, i) => (
                                <a
                                    key={i}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-underline"
                                >
                                    <div className="flex items-center gap-3 px-3.5 py-2 bg-layer-2 sm:hover:bg-layer-3 transition-colors">
                                        <i
                                            aria-hidden="true"
                                            className={`bx ${LINK_TYPES[link.type].icon} text-xl text-typography-2`}
                                        />
                                        <div className="min-w-0">
                                            <p className="important">
                                                {linkTitle(link)}
                                            </p>
                                            <p className="text-nowrap overflow-hidden text-ellipsis">
                                                {linkDetail(link)}
                                            </p>
                                        </div>
                                    </div>
                                </a>
                            ))
                        ) : (
                            <p className={"mx-4 mb-3.5"}>No Links Provided</p>
                        )}
                    </ItemList>
                    <OrgAdvisors editable={canEditAdvisors} />
                </>
            ) : (
                <ItemList
                    height={"auto"}
                    title={"Strikes"}
                    icon={"bx-error"}
                    subtitle={
                        "A combination of 3 strikes will result in the permanent revocation of the Activity’s charter."
                    }
                >
                    {!canSeeStrikes ? (
                        <p className={"px-3.5 py-3 bg-layer-2"}>
                            Only this Activity&apos;s leaders and the Clubs
                            &amp; Pubs department can see its strikes.
                        </p>
                    ) : strikes.length === 0 ? (
                        <p className={"px-3.5 py-3 bg-layer-2"}>
                            No strikes received. This Activity is in good
                            standing.
                        </p>
                    ) : (
                        strikes.map((strike, i) => (
                            <div
                                key={strike.id}
                                className={"px-3.5 py-2 bg-layer-2"}
                            >
                                <div className="flex w-full justify-between my-1">
                                    <p className={"important"}>
                                        Strike {i + 1}
                                    </p>
                                    <p className={"important"}>
                                        {toNewYork(strike.created_at).format(
                                            "L",
                                        )}
                                    </p>
                                </div>
                                <p>{strike.reason}</p>
                            </div>
                        ))
                    )}
                </ItemList>
            )}
        </div>
    );
};

/* the meeting pages swap the links card for one about meetings */
export function inspectorCardFor(pathname: string) {
    if (/\/admin\/attendance(\/|$)/.test(pathname)) return "attendance";
    if (/\/admin\/scheduler\/?$/.test(pathname)) return "requirements";
    return undefined;
}

export default OrgInspector;
