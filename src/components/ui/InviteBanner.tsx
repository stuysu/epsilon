import { useState } from "react";
import { Link } from "react-router-dom";
import AlertBanner from "./AlertBanner";
import { useInvites } from "../../contexts/InvitesProvider";

/* shown on the inviting club's pages only; closing it lasts until the user leaves the club */
const InviteBanner = ({ orgId }: { orgId: number }) => {
    const { invites } = useInvites();
    const [hidden, setHidden] = useState(false);

    const invite = invites.find((item) => item.organizations.id === orgId);
    if (hidden || !invite) return null;

    const inviter = invite.inviter
        ? `${invite.inviter.first_name} ${invite.inviter.last_name}`
        : "An Activity leader";

    return (
        <AlertBanner
            severity="info"
            live="polite"
            onClose={() => setHidden(true)}
            closeButtonProps={{ "aria-label": "Dismiss invite banner" }}
        >
            <p className="relative top-0.5 text-inherit">
                {`${inviter} invited you to join ${invite.organizations.name}. `}
                <Link
                    to="/invites"
                    className="inline-block py-1 text-inherit underline"
                >
                    View invite
                </Link>
            </p>
        </AlertBanner>
    );
};

export default InviteBanner;
