import { Link } from "react-router-dom";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import Avatar from "../../components/ui/Avatar";
import LoginGate from "../../components/ui/content/LoginGate";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import ItemList from "../../components/ui/lists/ItemList";
import { PendingInvite, useInvites } from "../../contexts/InvitesProvider";
import { supabase } from "../../lib/supabaseClient";
import { functionErrorText } from "../../utils/FunctionErrors";
import { sizedPicture } from "../../utils/sizedPicture";

const Invites = () => {
    const { invites, refresh } = useInvites();
    const { enqueueSnackbar } = useSnackbar();

    const accept = async (invite: PendingInvite) => {
        const { error } = await supabase.functions.invoke("accept-invite", {
            body: { invite_id: invite.id },
        });

        if (error) {
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    "Failed to accept the invite. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            await refresh();
            return;
        }

        // a full load so the user's own list of Activities includes this one
        window.location.assign(`/${invite.organizations.url}`);
    };

    const decline = async (invite: PendingInvite) => {
        const { error } = await supabase.rpc("decline_organization_invite", {
            invite_id: invite.id,
        });

        if (error) {
            enqueueSnackbar(
                "Failed to decline the invite. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        enqueueSnackbar("Invite declined.", { variant: "success" });
        await refresh();
    };

    return (
        <LoginGate page="see your invites">
            <main className={"sm:m-12 m-6 min-h-[60vh]"}>
                <h1 className={"mb-6"}>Invites</h1>
                {invites.length === 0 ? (
                    <ContentUnavailable
                        icon="bx-envelope"
                        headingLevel="h2"
                        title="No pending invites"
                        description="When an Activity's leaders invite you, it will show up here."
                    />
                ) : (
                    <ItemList height={"auto"}>
                        {invites.map((invite) => (
                            <div
                                key={invite.id}
                                className={
                                    "flex flex-wrap items-center justify-between gap-3 bg-layer-2 px-4 py-3"
                                }
                            >
                                <div
                                    className={
                                        "flex min-w-0 items-center gap-3"
                                    }
                                >
                                    <Avatar
                                        src={sizedPicture(
                                            invite.organizations.picture,
                                            40,
                                        )}
                                        alt=""
                                        className={"rounded-md"}
                                    >
                                        {invite.organizations.name.charAt(0)}
                                    </Avatar>
                                    <div className={"min-w-0"}>
                                        <Link
                                            to={`/${invite.organizations.url}`}
                                            className={
                                                "important block break-words text-typography-1 no-underline sm:hover:underline"
                                            }
                                        >
                                            {invite.organizations.name}
                                        </Link>
                                        <p className={"text-typography-3"}>
                                            Invited
                                            {invite.inviter
                                                ? ` by ${invite.inviter.first_name} ${invite.inviter.last_name}`
                                                : ""}{" "}
                                            <span
                                                className={"whitespace-nowrap"}
                                            >
                                                on{" "}
                                                {dayjs(
                                                    invite.created_at,
                                                ).format("MMM D")}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className={"flex gap-2"}>
                                    <AsyncButton
                                        onClick={() => decline(invite)}
                                        aria-label={`Decline invite to ${invite.organizations.name}`}
                                    >
                                        Decline
                                    </AsyncButton>
                                    <AsyncButton
                                        isPrimary
                                        onClick={() => accept(invite)}
                                        aria-label={`Accept invite to ${invite.organizations.name}`}
                                    >
                                        Accept
                                    </AsyncButton>
                                </div>
                            </div>
                        ))}
                    </ItemList>
                )}
            </main>
        </LoginGate>
    );
};

export default Invites;
