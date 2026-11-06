import { useEffect, useState } from "react";
import OrgEditApproval from "../components/OrgEditApproval";
import OrgBlock from "../../../../components/ui/OrgBlock";

import { supabase } from "../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import Divider from "../../../../components/ui/Divider";

const ApproveEdit = () => {
    const { enqueueSnackbar } = useSnackbar();
    const [pendingEdits, setPendingEdits] = useState<EditType[]>([]);
    const [view, setView] = useState<EditType>();

    useEffect(() => {
        const fetchPendingEdits = async () => {
            const pEdits: EditType[] = [];

            const { data, error } = await supabase
                .from("organizationedits")
                .select();

            if (error || !data) {
                return enqueueSnackbar(
                    "Failed to fetch pending edits. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            const orgIds = [];
            for (const edit of data as OrganizationEdit[]) {
                orgIds.push(edit.organization_id);
            }

            /* get name and picture from corresponding organization */
            const { data: odata, error: oerror } = await supabase
                .from("organizations")
                .select(
                    `
                    id,
                    name,
                    picture
                `,
                )
                .in("id", orgIds);

            if (oerror || !odata) {
                return enqueueSnackbar(
                    "Failed to fetch corresponding org data. Contact it@stuysu.org for support.",
                    { variant: "error" },
                );
            }

            for (const edit of data as OrganizationEdit[]) {
                let meta = odata.find((o) => o.id === edit.organization_id);
                if (!meta) {
                    meta = {
                        id: edit.organization_id,
                        name: `Invalid Organization ID: ${edit.organization_id}`,
                        picture: "",
                    };
                }

                pEdits.push({
                    ...edit,
                    organization_name: meta.name,
                    organization_picture: meta.picture,
                });
            }

            setPendingEdits(pEdits);
        };

        fetchPendingEdits();
    });

    if (view) {
        return (
            <OrgEditApproval
                {...view}
                onBack={() => setView(undefined)}
                onApprove={() => {
                    // remove self from pending edits
                    setPendingEdits(
                        pendingEdits.filter((e) => e.id !== view.id),
                    );
                    setView(undefined);
                }}
                onReject={() => {
                    // remove self from pending edits
                    setPendingEdits(
                        pendingEdits.filter((e) => e.id !== view.id),
                    );
                    setView(undefined);
                }}
            />
        );
    }

    return (
        <div className={"w-full p-12"}>
            <h1>Approve Edits</h1>
            <Divider />
            <div className={"flex mt-8 gap-3 flex-wrap"}>
                {pendingEdits.map((edit) => {
                    return (
                        <button
                            type="button"
                            key={edit.id}
                            onClick={() => setView(edit)}
                            className="rounded-xl text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        >
                            <OrgBlock
                                name={edit.organization_name}
                                role_name={"Pending"}
                                picture={edit.organization_picture || ""}
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ApproveEdit;
