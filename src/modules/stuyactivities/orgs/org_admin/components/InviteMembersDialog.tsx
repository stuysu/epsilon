import { useCallback, useContext, useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import dayjs from "dayjs";
import OrgContext from "../../../../../contexts/OrgContext";
import { supabase } from "../../../../../lib/supabaseClient";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import ItemList from "../../../../../components/ui/lists/ItemList";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";

type PendingInvite = {
    id: number;
    created_at: string;
    users: Pick<User, "first_name" | "last_name" | "email"> | null;
};

type InviteResult = {
    email: string;
    status:
        | "invited"
        | "already_invited"
        | "already_member"
        | "no_account"
        | "invalid"
        | "limit_reached";
};

const problemText: Record<
    Exclude<InviteResult["status"], "invited">,
    string
> = {
    already_invited: "already has a pending invite.",
    already_member: "is already a member.",
    no_account: "doesn't have an Epsilon account yet.",
    invalid: "isn't a valid email.",
    limit_reached: "wasn't invited. Your Activity hit today's invite limit.",
};

const splitEmails = (text: string) =>
    text
        .split(/[\s,;]+/)
        .map((email) => email.trim())
        .filter(Boolean);

const InviteMembersDialog = ({
    open,
    onClose,
}: {
    open: boolean;
    onClose: () => void;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext<OrgContextType>(OrgContext);
    const [text, setText] = useState("");
    const [problems, setProblems] = useState<InviteResult[]>([]);
    const [invites, setInvites] = useState<PendingInvite[]>([]);

    const fetchInvites = useCallback(async () => {
        const { data, error } = await supabase
            .from("organization_invites")
            .select(
                "id, created_at, users!organization_invites_user_id_fkey (first_name, last_name, email)",
            )
            .eq("organization_id", organization.id)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .returns<PendingInvite[]>();

        if (!error && data) setInvites(data);
    }, [organization.id]);

    useEffect(() => {
        if (open) {
            setProblems([]);
            fetchInvites();
        }
    }, [open, fetchInvites]);

    const sendInvites = async () => {
        const emails = splitEmails(text);
        if (!emails.length) {
            enqueueSnackbar("Enter at least one email address.", {
                variant: "error",
            });
            return;
        }

        const { data, error } = await supabase.rpc(
            "create_organization_invites",
            { org_id: organization.id, emails },
        );

        if (error || !Array.isArray(data)) {
            // P0001 is a message the database raised on purpose
            enqueueSnackbar(
                error?.code === "P0001"
                    ? error.message
                    : "Failed to send invites. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        const results = data as InviteResult[];
        const invited = results.filter((result) => result.status === "invited");
        const rest = results.filter((result) => result.status !== "invited");

        setProblems(rest);
        setText(rest.map((result) => result.email).join(", "));

        if (invited.length) {
            enqueueSnackbar(
                `Invited ${invited.length} ${invited.length === 1 ? "person" : "people"}!`,
                { variant: "success" },
            );
            fetchInvites();
        } else {
            enqueueSnackbar("No invites were sent.", { variant: "warning" });
        }
    };

    const cancelInvite = async (id: number) => {
        const { data, error } = await supabase.rpc(
            "cancel_organization_invite",
            { invite_id: id },
        );

        if (error || !data) {
            enqueueSnackbar("Failed to cancel the invite.", {
                variant: "error",
            });
            return;
        }

        const email = invites
            .find((invite) => invite.id === id)
            ?.users?.email?.toLowerCase();
        setInvites((current) => current.filter((invite) => invite.id !== id));
        setProblems((current) =>
            current.filter(
                (problem) =>
                    problem.status !== "already_invited" ||
                    problem.email.toLowerCase() !== email,
            ),
        );
    };

    return (
        <UserDialog
            title="Invite Members"
            open={open}
            onClose={onClose}
            onConfirm={sendInvites}
            closeOnConfirm={false}
            confirmText="Send Invites"
            cancelText="Close"
        >
            <label
                className={
                    "mb-2 block text-[0.9rem] font-medium text-typography-1"
                }
                htmlFor="invite-emails"
            >
                Email addresses, separated by commas or spaces
            </label>
            <textarea
                id="invite-emails"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                placeholder="name@stuy.edu, name2@stuy.edu"
                className={
                    "w-full resize-none rounded-xl bg-layer-2 font-semibold px-4 py-3 text-typography-1 shadow-inner transition-colors focus:outline-1 sm:hover:bg-layer-3"
                }
            />

            {problems.length > 0 && (
                <ul className={"mt-3 space-y-1"}>
                    {problems.map((problem) => (
                        <li key={problem.email}>
                            <p className={"break-words"}>
                                <span
                                    className={"break-all font-medium text-red"}
                                >
                                    {problem.email}
                                </span>{" "}
                                {problemText[
                                    problem.status as keyof typeof problemText
                                ] ?? "couldn't be invited."}
                            </p>
                        </li>
                    ))}
                </ul>
            )}

            {invites.length > 0 && (
                <div className={"mt-6"}>
                    <p className={"important mb-2"}>
                        Pending invites ({invites.length})
                    </p>
                    <ItemList height={"auto"}>
                        {invites.map((invite) => (
                            <div
                                key={invite.id}
                                className={
                                    "flex items-center justify-between gap-3 px-3 py-2"
                                }
                            >
                                <div className={"min-w-0"}>
                                    <p className={"truncate"}>
                                        {invite.users
                                            ? `${invite.users.first_name} ${invite.users.last_name}`
                                            : "Unknown user"}
                                    </p>
                                    <p className={"truncate text-typography-3"}>
                                        {invite.users?.email} · Invited{" "}
                                        {dayjs(invite.created_at).format(
                                            "MMM D",
                                        )}
                                    </p>
                                </div>
                                <AsyncButton
                                    onClick={() => cancelInvite(invite.id)}
                                    aria-label={`Cancel invite for ${invite.users?.first_name ?? ""} ${invite.users?.last_name ?? ""}`.trim()}
                                >
                                    Cancel
                                </AsyncButton>
                            </div>
                        ))}
                    </ItemList>
                </div>
            )}
        </UserDialog>
    );
};

export default InviteMembersDialog;
