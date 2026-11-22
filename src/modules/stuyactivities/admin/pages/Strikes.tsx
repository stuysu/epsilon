import { useEffect, useState } from "react";
import Divider from "../../../../components/ui/Divider";
import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import SearchInput from "../../../../components/ui/input/SearchInput";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import TextField from "../../../../components/ui/input/TextField";

const Strikes = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [orgId, setOrgId] = useState<number>();
    const [orgName, setOrgName] = useState("");
    const [orgStrikes, setOrgStrikes] = useState<Strike[]>([]);
    const [reason, setReason] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [filteredOrgs, setFilteredOrgs] = useState<Organization[]>([]);
    const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [strikeToDelete, setStrikeToDelete] = useState<Strike | null>(null);

    useEffect(() => {
        const fetchAllOrgs = async () => {
            const { data, error } = await supabase
                .from("organizations")
                .select("*");
            if (error || !data) {
                enqueueSnackbar(
                    "Failed to load organizations. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
                return;
            }
            setAllOrgs(data);
        };

        fetchAllOrgs();
    }, [enqueueSnackbar]);

    useEffect(() => {
        if (searchInput) {
            setFilteredOrgs(
                allOrgs.filter((org) =>
                    org.name.toLowerCase().includes(searchInput.toLowerCase()),
                ),
            );
        } else {
            setFilteredOrgs([]);
        }
    }, [searchInput, allOrgs]);

    useEffect(() => {
        if (!orgId) return;
        let stale = false;

        const fetchOrgStrikes = async () => {
            const { data, error } = await supabase
                .from("strikes")
                .select(
                    `
                    id,
                    reason,
                    created_at,
                    organizations (name),
                    users (first_name, last_name, picture)
                `,
                )
                .eq("organization_id", orgId);
            if (stale) return;

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to load strikes. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            setOrgStrikes(data as Strike[]);
        };

        setOrgStrikes([]);
        fetchOrgStrikes();
        return () => {
            stale = true;
        };
    }, [orgId, enqueueSnackbar]);

    const issueStrike = async () => {
        if (!reason.trim()) {
            enqueueSnackbar("Enter a reason for the strike.", {
                variant: "error",
            });
            return;
        }
        const { data, error } = await supabase.functions.invoke(
            "issue-strike",
            {
                body: {
                    organization_id: orgId,
                    reason: reason.trim(),
                },
            },
        );

        if (error) {
            enqueueSnackbar(
                "Error issuing strike. Contact it@stuysu.org for support",
                { variant: "error" },
            );
            return;
        }

        setOrgStrikes([...orgStrikes, data as Strike]);
        enqueueSnackbar("Strike issued!", { variant: "success" });
        setReason("");
    };

    const openDeleteDialog = (strike: Strike) => {
        setStrikeToDelete(strike);
        setDeleteDialogOpen(true);
    };

    const closeDeleteDialog = () => {
        setDeleteDialogOpen(false);
    };

    const confirmDeleteStrike = async () => {
        if (!strikeToDelete) return;
        const { error } = await supabase
            .from("strikes")
            .delete()
            .eq("id", strikeToDelete.id);

        if (error) {
            enqueueSnackbar(
                "Error deleting strike. Contact it@stuysu.org for support",
                { variant: "error" },
            );
            return;
        }

        setOrgStrikes(orgStrikes.filter((s) => s.id !== strikeToDelete.id));
        setStrikeToDelete(null);
        enqueueSnackbar("Strike deleted!", { variant: "success" });
    };

    return (
        <div className={"w-full p-4 sm:p-12 min-h-dvh flex flex-col gap-4"}>
            <h1>Strikes</h1>
            <SearchInput
                placeholder="Search Activities..."
                value={searchInput}
                onChange={(e) => setSearchInput(e)}
            />
            {searchInput.length < 3 ? (
                <p>Keep typing to find an Activity.</p>
            ) : filteredOrgs.length > 10 ? (
                <p>Too many activities, try a more specific query.</p>
            ) : filteredOrgs.length > 0 ? (
                <div>
                    {filteredOrgs.map((org) => (
                        <div key={org.id}>
                            <button
                                type="button"
                                className={
                                    "important w-full py-2 text-left cursor-pointer"
                                }
                                onClick={() => {
                                    setOrgId(org.id);
                                    setOrgName(org.name);
                                    setSearchInput("");
                                    setFilteredOrgs([]);
                                }}
                            >
                                {org.name}
                            </button>
                            <Divider />
                        </div>
                    ))}
                </div>
            ) : null}
            {orgId && (
                <>
                    <div className={"my-10"}>
                        <Divider />
                    </div>
                    <div className="w-full flex justify-center flex-wrap">
                        <div className="w-full max-w-[500px] flex justify-center flex-wrap">
                            <h3 className={"mb-6"}>
                                Issue Strike to {orgName}
                            </h3>
                            <TextField
                                sx={{ width: "100%" }}
                                label="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                multiline
                                rows={4}
                            />
                            <AsyncButton
                                onClick={issueStrike}
                                sx={{ width: "100%", marginTop: "10px" }}
                            >
                                Issue
                            </AsyncButton>
                        </div>
                    </div>

                    <div className="mt-2.5 w-full flex flex-wrap justify-center">
                        {orgStrikes.map((strike, i) => (
                            <div
                                className="w-full flex justify-center"
                                key={strike.id}
                            >
                                <div
                                    className="rounded bg-layer-2 shadow-control"
                                    style={{
                                        width: "500px",
                                        padding: "20px",
                                        marginTop: "10px",
                                        marginBottom: "10px",
                                    }}
                                >
                                    <h4>{strike.reason}</h4>
                                    <p>
                                        Issued by {strike.users?.first_name}{" "}
                                        {strike.users?.last_name}
                                    </p>
                                    <AsyncButton
                                        onClick={() => openDeleteDialog(strike)}
                                    >
                                        Delete
                                    </AsyncButton>
                                </div>
                            </div>
                        ))}
                    </div>

                    <UserDialog
                        title="Delete this strike?"
                        description="This can't be undone. Only delete a strike after confirming with the Clubs & Pubs Department that it should be removed under the Clubs & Pubs Regulations."
                        open={deleteDialogOpen}
                        onClose={closeDeleteDialog}
                        onCancel={() => {
                            setStrikeToDelete(null);
                        }}
                        onConfirm={async () => {
                            await confirmDeleteStrike();
                        }}
                        confirmText="Delete"
                        cancelText="Cancel"
                        imageSrc="/symbols/warning.png"
                    ></UserDialog>
                </>
            )}
        </div>
    );
};

export default Strikes;
