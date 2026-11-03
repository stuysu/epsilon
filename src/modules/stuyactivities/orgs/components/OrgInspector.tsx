import { useContext, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import OrgContext from "../../../../contexts/OrgContext";
import ItemList from "../../../../components/ui/lists/ItemList";
import { toNewYork } from "../../../../utils/NewYorkTime";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const location = useLocation();
    const [strikes, setStrikes] = useState<Strike[]>([]);

    const isAuditPage = location.pathname.includes("/audit");
    const socialLinks = (organization.socials ?? "")
        .split(/\s+/)
        .filter((social) => /^https?:\/\/\S+/i.test(social));

    useEffect(() => {
        if (!isAuditPage) return;
        const fetchStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(`id, reason, created_at, users (first_name, last_name)`)
                .eq("organization_id", organization.id);
            if (!error && data) setStrikes(data as Strike[]);
        };
        fetchStrikes();
    }, [isAuditPage, organization.id]);

    return (
        <div className={"relative xl:w-[300px] xl:ml-10 xl:mr-[3rem]"}>
            {!isAuditPage ? (
                <ItemList height={"auto"} title={"Links"}>
                    {socialLinks.length > 0 ? (
                        socialLinks.map((social, i) => {
                            const platform = getPlatform(social);
                            const path = social.replace(
                                /^https?:\/\/[^/]+\/?/i,
                                "",
                            );

                            return (
                                <a
                                    key={i}
                                    href={social}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="no-underline"
                                >
                                    <div
                                        className={
                                            "px-3.5 py-2 bg-layer-2 sm:hover:bg-layer-3 transition-colors"
                                        }
                                    >
                                        <p className="important">
                                            {platform.charAt(0).toUpperCase() +
                                                platform.slice(1)}
                                        </p>
                                        <p className="text-nowrap overflow-hidden text-ellipsis">
                                            {path || getHostname(social)}
                                        </p>
                                    </div>
                                </a>
                            );
                        })
                    ) : (
                        <p className={"mx-4 mb-3.5"}>No Links Provided</p>
                    )}
                </ItemList>
            ) : (
                <ItemList
                    height={"auto"}
                    title={"Strikes"}
                    icon={"bx-error"}
                    subtitle={
                        "A combination of 3 strikes will result in the permanent revocation of the Activity’s charter."
                    }
                >
                    {strikes.length === 0 ? (
                        <p className={"px-3.5 py-3 bg-layer-2"}>
                            No strikes received. This Activity is in good
                            standing.
                        </p>
                    ) : (
                        strikes.map((strike, i) => (
                            <div className={"px-3.5 py-2 bg-layer-2"}>
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

function getHostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "");
    } catch {
        return url;
    }
}

function getPlatform(url: string): string {
    const clamp = getHostname(url);
    return clamp.endsWith(".com") ? clamp.slice(0, -4) : clamp;
}

export default OrgInspector;
