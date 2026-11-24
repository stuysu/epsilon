import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { supabase } from "../../../../lib/supabaseClient";
import { functionErrorText } from "../../../../utils/FunctionErrors";
import OrgContext from "../../../../contexts/OrgContext";
import ItemList from "../../../../components/ui/lists/ItemList";
import Avatar from "../../../../components/ui/Avatar";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { SUPPORT_EMAIL } from "../../../../config/constants";

const addResults: Record<string, string> = {
    already_advisor: "is already an advisor.",
    already_leader: "is already a leader of this Activity.",
    already_invited:
        "was already invited. They'll be added once their Epsilon account is set up.",
    club_not_approved:
        "doesn't have an Epsilon account yet. Invites open once this Activity is approved.",
    invalid_email: "isn't a valid email address.",
    not_faculty: "isn't a faculty account. Only faculty can be advisors.",
    too_many_invites:
        "can't be invited: this Activity already has 3 open invites. Cancel one first.",
};

type Invite = { email: string; created_at: string };

const OrgAdvisors = ({ editable }: { editable: boolean }) => {
    const organization = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const [adding, setAdding] = useState(false);
    const [email, setEmail] = useState("");
    const [problem, setProblem] = useState("");
    const [removing, setRemoving] = useState<Partial<Membership> | null>(null);
    const submitting = useRef(false);
    const [invites, setInvites] = useState<Invite[]>([]);
    const [cancelling, setCancelling] = useState<Invite | null>(null);
    // the dialogs keep their text while closing
    const [removeOpen, setRemoveOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);

    // teachers with no account yet; leaders can see and cancel these.
    // Invites older than a year no longer count.
    const loadInvites = useCallback(async () => {
        if (!editable) return [];
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        const { data } = await supabase
            .from("pending_advisors")
            .select("email, created_at")
            .eq("organization_id", organization.id)
            .gt("created_at", yearAgo.toISOString())
            .order("created_at");
        return data ?? [];
    }, [editable, organization.id]);

    const [invitesVersion, setInvitesVersion] = useState(0);
    // the Roster renders this twice (sidebar and narrow layout)
    const invitesChanged = () =>
        window.dispatchEvent(new Event("advisor-invites-changed"));

    useEffect(() => {
        const bump = () => setInvitesVersion((n) => n + 1);
        window.addEventListener("advisor-invites-changed", bump);
        return () =>
            window.removeEventListener("advisor-invites-changed", bump);
    }, []);

    useEffect(() => {
        let current = true;
        loadInvites().then((rows) => current && setInvites(rows));
        return () => {
            current = false;
        };
    }, [loadInvites, invitesVersion]);

    const advisors = (organization.memberships || []).filter(
        (m) => m.active && m.role === "ADVISOR",
    );

    const refresh = async () => {
        const { data } = await supabase
            .from("memberships")
            .select(
                "id, role, role_name, ordering_id, active, users (id, first_name, last_name, email, picture, is_faculty)",
            )
            .eq("organization_id", organization.id);
        if (data && organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: data as unknown as typeof organization.memberships,
            });
        }
    };

    const addAdvisor = async () => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) {
            setProblem("Enter the advisor's email.");
            return;
        }
        if (submitting.current) return;
        submitting.current = true;
        try {
            await submitAdvisor(trimmed);
        } finally {
            submitting.current = false;
        }
    };

    const submitAdvisor = async (trimmed: string) => {
        // the function also emails the new advisor
        const { data: response, error } = await supabase.functions.invoke(
            "add-organization-advisor",
            {
                body: {
                    organization_id: organization.id,
                    advisor_email: trimmed,
                },
            },
        );
        if (error) {
            setProblem(
                (await functionErrorText(error)) ||
                    `Couldn't add the advisor. Contact ${SUPPORT_EMAIL} for support.`,
            );
            return;
        }
        const data: string = response?.result;
        if (data === "invited" || data === "already_invited") {
            invitesChanged();
        }
        if (data === "invited") {
            enqueueSnackbar(
                response?.emailed
                    ? `Invited ${trimmed}. We emailed them, and they'll be added once their Epsilon account is set up.`
                    : `Invited ${trimmed}. They'll be added once their Epsilon account is set up, but we couldn't email them, so let them know yourself.`,
                { variant: response?.emailed ? "success" : "warning" },
            );
        } else if (data === "added") {
            await refresh();
            enqueueSnackbar("Advisor added!", { variant: "success" });
        } else {
            setProblem(
                `${trimmed} ${addResults[data] ?? "couldn't be added."}`,
            );
            return;
        }
        setAdding(false);
        setEmail("");
        setProblem("");
    };

    const removeAdvisor = async () => {
        if (!removing?.id) return;
        const { data, error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", removing.id)
            .select("id");
        if (error || !data?.length) {
            enqueueSnackbar(
                `Could not remove advisor. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }
        await refresh();
        enqueueSnackbar("Advisor removed.", { variant: "success" });
    };

    const cancelInvite = async () => {
        if (!cancelling) return;
        const { data, error } = await supabase
            .from("pending_advisors")
            .delete()
            .eq("organization_id", organization.id)
            .eq("email", cancelling.email)
            .select("email");
        if (error || !data?.length) {
            enqueueSnackbar(
                `Could not withdraw the invite. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }
        invitesChanged();
        enqueueSnackbar("Invite withdrawn.", { variant: "success" });
    };

    return (
        <ItemList height={"auto"} title={"Advisors"} icon={"bx-id-card"}>
            {advisors.length === 0 && (
                <p className={"mx-4 mb-3.5"}>No Advisor Listed</p>
            )}
            {advisors.map((advisor) => {
                const name =
                    `${advisor.users?.first_name ?? ""} ${advisor.users?.last_name ?? ""}`.trim();
                return (
                    <div
                        key={advisor.id}
                        className={
                            "flex items-center gap-3 bg-layer-2 px-3.5 py-2"
                        }
                    >
                        <Avatar
                            src={advisor.users?.picture}
                            alt=""
                            className={"size-8 shrink-0 rounded-md"}
                        >
                            {advisor.users?.first_name?.charAt(0)}
                        </Avatar>
                        <div className={"min-w-0 flex-1"}>
                            <p className={"important truncate"}>{name}</p>
                            <a
                                href={`mailto:${advisor.users?.email}`}
                                title={advisor.users?.email}
                                className={
                                    "touch-target block truncate text-sm text-typography-2"
                                }
                            >
                                {advisor.users?.email}
                            </a>
                        </div>
                        {editable && (
                            <button
                                type="button"
                                aria-label={`Remove ${name} as advisor`}
                                onClick={() => {
                                    setRemoving(advisor);
                                    setRemoveOpen(true);
                                }}
                                className={
                                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-typography-2 transition-colors sm:hover:bg-layer-3 sm:hover:text-red focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-typography-1"
                                }
                            >
                                <i
                                    aria-hidden="true"
                                    className={"bx bx-x text-xl"}
                                />
                            </button>
                        )}
                    </div>
                );
            })}
            {invites.map((invite) => (
                <div
                    key={invite.email}
                    className={"flex items-center gap-3 bg-layer-2 px-3.5 py-2"}
                >
                    <div className={"min-w-0 flex-1"}>
                        <p className={"truncate"} title={invite.email}>
                            {invite.email}
                        </p>
                        <p className={"text-sm text-typography-2"}>
                            Invited · added once their account is set up
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label={`Withdraw the invite to ${invite.email}`}
                        onClick={() => {
                            setCancelling(invite);
                            setCancelOpen(true);
                        }}
                        className={
                            "flex size-9 shrink-0 items-center justify-center rounded-lg text-typography-2 transition-colors sm:hover:bg-layer-3 sm:hover:text-red focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-typography-1"
                        }
                    >
                        <i aria-hidden="true" className={"bx bx-x text-xl"} />
                    </button>
                </div>
            ))}
            {editable && (
                <div className={"p-2"}>
                    <AsyncButton
                        onClick={() => setAdding(true)}
                        className={"w-full"}
                    >
                        <i
                            aria-hidden="true"
                            className={"bx bx-plus bx-xs mr-2 mt-px"}
                        />
                        Add Advisor
                    </AsyncButton>
                </div>
            )}

            <UserDialog
                title="Add Advisor"
                description="If they don't have an Epsilon account yet, we'll email them and add them once it's set up."
                open={adding}
                onClose={() => {
                    setAdding(false);
                    setProblem("");
                }}
                onConfirm={addAdvisor}
                closeOnConfirm={false}
                confirmText="Add Advisor"
            >
                <label
                    htmlFor="advisor-email"
                    className={
                        "mb-2 block text-[0.9rem] font-medium text-typography-1"
                    }
                >
                    Faculty email
                </label>
                <input
                    id="advisor-email"
                    type="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setProblem("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && addAdvisor()}
                    placeholder="name@stuy.edu"
                    aria-invalid={!!problem}
                    aria-describedby={problem ? "advisor-problem" : undefined}
                    className={
                        "h-11 w-full rounded-xl bg-layer-2 px-4 font-semibold text-typography-1 shadow-inner transition-colors focus:outline-1 sm:hover:bg-layer-3"
                    }
                />
                {problem && (
                    <p
                        id="advisor-problem"
                        role="alert"
                        className={"mt-3 wrap-break-word text-red"}
                    >
                        {problem}
                    </p>
                )}
            </UserDialog>

            <UserDialog
                title="Remove advisor?"
                description={`${removing?.users?.first_name ?? ""} ${removing?.users?.last_name ?? ""} will no longer be listed as an advisor of this Activity.`}
                open={removeOpen}
                onClose={() => setRemoveOpen(false)}
                onConfirm={removeAdvisor}
                confirmText="Remove"
            />

            <UserDialog
                title="Withdraw invite?"
                description={`${cancelling?.email ?? ""} won't be added as an advisor when their account is set up.`}
                open={cancelOpen}
                onClose={() => setCancelOpen(false)}
                onConfirm={cancelInvite}
                confirmText="Withdraw"
                cancelText="Keep"
            />
        </ItemList>
    );
};

export default OrgAdvisors;
