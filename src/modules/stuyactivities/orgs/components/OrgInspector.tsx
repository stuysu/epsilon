import { useContext, useEffect, useState } from "react";
import { Link } from "@mui/material";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import OrgContext from "../../../../contexts/OrgContext";
import ItemList from "../../../../components/ui/lists/ItemList";

const OrgInspector = () => {
    const organization: OrgContextType = useContext(OrgContext);
    const location = useLocation();
    const [strikes, setStrikes] = useState<Strike[]>([]);

    const isAuditPage = location.pathname.includes("/audit");

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
                    {organization.socials &&
                    organization.socials
                        .split(" ")
                        .some((social) => social.startsWith("http")) ? (
                        organization.socials.split(" ").map((social, i) =>
                            social.startsWith("http") ? (
                                <Link
                                    key={i}
                                    href={social}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    underline="none"
                                >
                                    <div
                                        className={
                                            "px-3.5 py-2 bg-layer-2 hover:bg-layer-3 transition-colors"
                                        }
                                    >
                                        <p className="important">
                                            {getPlatform(social)
                                                .charAt(0)
                                                .toUpperCase() +
                                                getPlatform(social).slice(1)}
                                        </p>
                                        <p className="text-nowrap overflow-hiden text-ellipsis">
                                            {social.replace(
                                                /^https?:\/\/[^\/]+\/?/,
                                                "",
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            ) : null,
                        )
                    ) : (
                        <p className={"mx-4 mb-3.5"}>No Links Provided</p>
                    )}
                </ItemList>
            ) : (
                <ItemList height={"auto"} title={"Strikes"} icon={"bx-error"}>
                    {strikes.length === 0 ? (
                        <p className={"mx-4 mb-3.5"}>
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
                                        {new Date(
                                            strike.created_at,
                                        ).toLocaleDateString()}
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

function getPlatform(url: string): string {
    const { hostname } = new URL(url);
    const clamp = hostname.replace(/^www\./, "");
    return clamp.endsWith(".com") ? clamp.slice(0, -4) : clamp;
}

export default OrgInspector;
