import { supabase } from "../../../../../lib/supabaseClient";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useContext } from "react";
import OrgContext from "../../../../../contexts/OrgContext";
import OrgMember from "../../components/OrgMember";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import CheckboxInput from "../../../../../components/ui/input/CheckboxInput";

const PendingMember = ({
    id,
    first_name,
    last_name,
    email,
    picture,
    selected,
    onSelect,
}: {
    id: number;
    first_name?: string;
    last_name?: string;
    email: string;
    picture: string | undefined;
    selected?: boolean;
    onSelect?: (selected: boolean) => void;
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
        <Box
            sx={{
                width: "100%",
                display: "flex",
                flexWrap: "nowrap",
                alignItems: "center",
            }}
        >
            {onSelect && (
                <div
                    className={
                        "pl-3 flex items-center self-stretch shrink-0 bg-layer-2"
                    }
                >
                    <CheckboxInput
                        checked={!!selected}
                        onChange={onSelect}
                        label={`Select ${first_name} ${last_name}`}
                    />
                </div>
            )}
            <Box sx={{ width: "100%", minWidth: 0 }}>
                <OrgMember
                    email={email}
                    picture={picture}
                    role_name={"Pending Member"}
                    first_name={first_name}
                    last_name={last_name}
                />
            </Box>
            <div
                className={
                    "flex items-center gap-2 px-3 shrink-0 self-stretch bg-layer-2"
                }
            >
                <AsyncButton
                    onClick={handleApprove}
                    variant="contained"
                    sx={{
                        height: "40px",
                        minWidth: 0,
                        padding: { xs: "0 10px", sm: "11px 20px 13px 20px" },
                    }}
                    aria-label="Approve"
                >
                    <i className={"bx bx-check bx-sm sm:hidden"}></i>
                    <span className={"hidden sm:inline"}>Approve</span>
                </AsyncButton>
                <AsyncButton
                    onClick={handleReject}
                    variant="contained"
                    sx={{
                        height: "40px",
                        minWidth: 0,
                        padding: { xs: "0 10px", sm: "11px 20px 13px 20px" },
                    }}
                    aria-label="Reject"
                >
                    <i className={"bx bx-x bx-sm sm:hidden"}></i>
                    <span className={"hidden sm:inline"}>Reject</span>
                </AsyncButton>
            </div>
        </Box>
    );
};

export default PendingMember;
