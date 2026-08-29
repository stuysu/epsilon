import { supabase } from "../../../../../lib/supabaseClient";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import OrgMember from "../../components/OrgMember";
import ToggleChip from "../../../../../components/ui/input/ToggleChip";

const PendingMember = ({
    id,
    first_name,
    last_name,
    email,
    picture,
}: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    picture: string | undefined;
}) => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);

    const handleApprove = async () => {
        const { error } = await supabase.functions.invoke("approve-member", {
            body: { member_id: id },
        });

        if (error) {
            enqueueSnackbar(
                "Error approving member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        let memberIndex = organization.memberships.findIndex(
            (m) => m.id === id,
        );
        let memberData = organization.memberships[memberIndex];

        memberData.active = true;

        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: [
                    ...organization.memberships.slice(0, memberIndex),
                    memberData,
                    ...organization.memberships.slice(memberIndex + 1),
                ],
            });
        }

        enqueueSnackbar("Member approved!", { variant: "success" });
    };

    const handleReject = async () => {
        const { error } = await supabase
            .from("memberships")
            .delete()
            .eq("id", id);
        if (error) {
            enqueueSnackbar(
                "Error rejecting member. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        // update contexts
        if (organization.setOrg) {
            organization.setOrg({
                ...organization,
                memberships: organization.memberships.filter(
                    (m) => m.id !== id,
                ),
            });
        }

        enqueueSnackbar("User rejected!", { variant: "success" });
    };

    return (
        <OrgMember
            email={email}
            picture={picture}
            role_name="Pending Member"
            first_name={first_name}
            last_name={last_name}
            actions={
                <div className="flex gap-2">
                    <ToggleChip
                        title="Approve"
                        variant="pill"
                        onClick={() => void handleApprove()}
                        className="!bg-accent !text-typography-1"
                    />
                    <ToggleChip
                        title="Deny"
                        variant="pill"
                        onClick={() => void handleReject()}
                        className="!bg-red !text-typography-1"
                    />
                </div>
            }
        />
    );
};

export default PendingMember;
