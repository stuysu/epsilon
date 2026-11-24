import { supabase } from "../../../../lib/supabaseClient";

import { useSnackbar } from "notistack";
import OrgChat from "./OrgChat";

import { useState } from "react";
import AsyncButton from "../../../../components/ui/buttons/AsyncButton";
import Divider from "../../../../components/ui/Divider";
import Avatar from "../../../../components/ui/Avatar";
import {
    functionErrorStatus,
    functionErrorText,
} from "../../../../utils/FunctionErrors";
import { sortWeekdays } from "../../../../utils/DataFormatters";
import UserDialog from "../../../../components/ui/overlays/UserDialog";
import { SUPPORT_EMAIL } from "../../../../config/constants";
import { toNewYork } from "../../../../utils/NewYorkTime";

const OrgApproval = ({
    onBack,
    onDecision,
    ...org
}: {
    onBack: () => void;
    onDecision: () => void;
} & Partial<OrgContextType>) => {
    const { enqueueSnackbar } = useSnackbar();
    const [buttonsDisabled, setButtonsDisabled] = useState(false);
    const [confirmingReject, setConfirmingReject] = useState(false);

    const approve = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "approve-organization",
            { body: { organization_id: org.id } },
        );

        if (error) {
            setButtonsDisabled(false);
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    `Error approving organization. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            /* someone else already approved or rejected it: refresh the list */
            if ([404, 409].includes(functionErrorStatus(error) ?? 0)) {
                onDecision();
            }
            return;
        }

        enqueueSnackbar("Organization approved!", { variant: "success" });
        setButtonsDisabled(false);
        onDecision();
    };

    const reject = async () => {
        setButtonsDisabled(true);
        const { error } = await supabase.functions.invoke(
            "reject-organization",
            { body: { organization_id: org.id } },
        );
        if (error) {
            setButtonsDisabled(false);
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    `Error rejecting organization. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            /* someone else already approved or rejected it: refresh the list */
            if ([404, 409].includes(functionErrorStatus(error) ?? 0)) {
                onDecision();
            }
            return;
        }

        enqueueSnackbar("Charter sent back to its leaders.", {
            variant: "success",
        });
        setButtonsDisabled(false);
        setConfirmingReject(false);
        onDecision();
    };

    return (
        <div className="m-4 sm:m-10">
            <div className="mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
                <h1 className={"font-['instrument-serif'] font-normal"}>
                    New Charter: {org.name}
                </h1>
                <div className="flex flex-wrap gap-2.5 sm:shrink-0">
                    <AsyncButton onClick={onBack}>Back</AsyncButton>
                    <AsyncButton
                        onClick={approve}
                        color="success"
                        disabled={buttonsDisabled}
                        isPrimary={true}
                    >
                        Approve Activity & Publish
                    </AsyncButton>
                    <AsyncButton
                        onClick={() => setConfirmingReject(true)}
                        color="secondary"
                        disabled={buttonsDisabled}
                    >
                        Reject
                    </AsyncButton>
                </div>
            </div>

            <UserDialog
                title="Reject this charter?"
                description={`${org.name || "This Activity"} goes back to its leaders as needing changes. They can fix it and send it back for review. Use Send Message to tell them what to change.`}
                open={confirmingReject}
                onClose={() => setConfirmingReject(false)}
                onConfirm={reject}
                closeOnConfirm={false}
                confirmText="Reject Charter"
            />

            {org.rejected_at && (
                <div className="mb-6 rounded-xl border border-divider p-4">
                    <h4>
                        Rejected Before, on{" "}
                        {toNewYork(org.rejected_at).format("MMMM D, YYYY")}
                    </h4>
                </div>
            )}

            <div className={"flex flex-col sm:flex-row gap-10"}>
                <div className={"w-full min-w-0 flex flex-col gap-2"}>
                    <h4>Activity Name</h4>
                    <p>{org.name}</p>
                    <Divider />

                    <h4>URL</h4>
                    <p className={"font-mono wrap-anywhere"}>{org.url}</p>
                    <Divider />

                    <h4>Picture</h4>
                    {org.picture ? (
                        <Avatar
                            src={org.picture}
                            alt={org.name}
                            style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "15px",
                            }}
                        />
                    ) : (
                        <p>No picture provided</p>
                    )}
                    <Divider />

                    <h4>Origin Story</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.mission}
                    </p>
                    <Divider />

                    <h4>Goals</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.goals}
                    </p>
                    <Divider />

                    <h4>Activity Description</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.purpose}
                    </p>
                    <Divider />

                    <h4>Appointment Procedures</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.appointment_procedures}
                    </p>
                    <Divider />

                    <h4>Uniqueness</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.uniqueness}
                    </p>
                    <Divider />

                    <h4 className={org.is_returning ? "text-yellow" : ""}>
                        Returning Activity Declaration
                    </h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.is_returning
                            ? org?.returning_info || "N/A"
                            : "Claims to not be a returning Activity."}
                    </p>
                    <Divider />

                    <h4>Meeting Description</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.meeting_description}
                    </p>
                    <Divider />

                    <h4>Meeting Schedule</h4>
                    <p className="whitespace-pre-line wrap-anywhere">
                        {org.meeting_schedule}
                    </p>
                    <Divider />

                    <h4>Meeting Days</h4>
                    <p>{sortWeekdays(org.meeting_days ?? []).join(", ")}</p>
                    <Divider />

                    <h4>Commitment Level</h4>
                    <p>{org.commitment_level}</p>
                    <Divider />

                    <h4>Keywords</h4>
                    <p className={"font-mono wrap-anywhere"}>
                        {org.keywords || "none"}
                    </p>
                    <Divider />

                    <h4>Tags</h4>
                    <p>{org.tags?.join(", ") || "none"}</p>
                    <Divider />

                    <h4>Clubs/Pubs Fair Interest</h4>
                    <p>{org.fair ? "Attending" : "Not Attending"}</p>
                    <Divider />

                    <h4>Creator</h4>
                    <p className={"font-mono wrap-anywhere"}>
                        {
                            org.memberships?.find((m) => m.role === "CREATOR")
                                ?.users?.email
                        }
                    </p>
                    <Divider />

                    <h4>Faculty Advisor</h4>
                    <p className={"font-mono wrap-anywhere"}>
                        {org?.faculty_email || "N/A"}
                    </p>
                    <Divider />
                </div>

                <div className="h-fit sticky top-12 w-full min-w-0 mb-12">
                    <OrgChat organization_id={org.id as number} />
                </div>
            </div>
        </div>
    );
};

export default OrgApproval;
