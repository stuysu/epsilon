import { useContext, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { supabase } from "../../../../lib/supabaseClient";
import OrgContext from "../../../../contexts/OrgContext";
import ItemList from "../../../../components/ui/lists/ItemList";
import Avatar from "../../../../components/ui/Avatar";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../components/ui/overlays/UserDialog";

const addResults: Record<string, string> = {
    already_advisor: "is already an advisor.",
    already_leader: "is already a leader of this Activity.",
    no_account:
        "doesn't have an Epsilon account yet. They need to sign in once first.",
    not_faculty: "isn't a faculty account. Only faculty can be advisors.",
};

const OrgAdvisors = ({ editable }: { editable: boolean }) => {
    const organization = useContext(OrgContext);
    const { enqueueSnackbar } = useSnackbar();
    const [adding, setAdding] = useState(false);
    const [email, setEmail] = useState("");
    const [problem, setProblem] = useState("");
    const [removing, setRemoving] = useState<Partial<Membership> | null>(null);
    const submitting = useRef(false);

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
        const { data, error } = await supabase.rpc("add_organization_advisor", {
            org_id: organization.id,
            advisor_email: trimmed,
        });
        if (error) {
            setProblem(
                "Couldn't add the advisor. Contact it@stuysu.org for support.",
            );
            return;
        }
        if (data !== "added") {
            setProblem(
                `${trimmed} ${addResults[data] ?? "couldn't be added."}`,
            );
            return;
        }
        await refresh();
        enqueueSnackbar("Advisor added!", { variant: "success" });
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
                "Could not remove advisor. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }
        await refresh();
        enqueueSnackbar("Advisor removed.", { variant: "success" });
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
                                onClick={() => setRemoving(advisor)}
                                className={
                                    "flex size-9 shrink-0 items-center justify-center rounded-lg text-typography-2 transition-colors sm:hover:bg-layer-3 sm:hover:text-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-typography-1"
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
                description="Advisors must have a faculty Epsilon account."
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
                    placeholder="name@schools.nyc.gov"
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
                        className={"mt-3 break-words text-red"}
                    >
                        {problem}
                    </p>
                )}
            </UserDialog>

            <UserDialog
                title="Remove advisor?"
                description={`${removing?.users?.first_name ?? ""} ${removing?.users?.last_name ?? ""} will no longer be listed as an advisor of this Activity.`}
                open={!!removing}
                onClose={() => setRemoving(null)}
                onConfirm={removeAdvisor}
                confirmText="Remove"
            />
        </ItemList>
    );
};

export default OrgAdvisors;
