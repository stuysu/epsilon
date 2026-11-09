import { useState } from "react";
import { Link } from "react-router-dom";
import AlertBanner from "./AlertBanner";
import { useInvites } from "../../contexts/InvitesProvider";

const InviteBanner = () => {
    const { invites } = useInvites();
    const [hidden, setHidden] = useState(false);

    if (hidden || !invites.length) return null;

    const first = invites[0];
    const inviter = first.inviter
        ? `${first.inviter.first_name} ${first.inviter.last_name}`
        : "An Activity leader";

    return (
        <div className={"w-full px-4 pt-4"}>
            <AlertBanner
                severity="info"
                live="polite"
                onClose={() => setHidden(true)}
            >
                <p className="relative top-0.5 text-inherit">
                    {invites.length === 1
                        ? `${inviter} invited you to join ${first.organizations.name}. `
                        : `You have ${invites.length} invites to join Activities. `}
                    <Link
                        to="/invites"
                        className="inline-block py-1 text-inherit underline"
                    >
                        {invites.length === 1 ? "View invite" : "View invites"}
                    </Link>
                </p>
            </AlertBanner>
        </div>
    );
};

export default InviteBanner;
