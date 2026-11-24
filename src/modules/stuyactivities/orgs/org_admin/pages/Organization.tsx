import React, { useContext, useEffect, useMemo, useState } from "react";

import { supabase } from "../../../../../lib/supabaseClient";

import OrgContext from "../../../../../contexts/OrgContext";
import UserContext from "../../../../../contexts/UserContext";

import OrgEditor from "../components/OrgEditor";

import { useSnackbar } from "notistack";
import { Link, useNavigate } from "react-router-dom";
import { SUPPORT_EMAIL } from "../../../../../config/constants";
import AsyncButton from "../../../../../components/ui/buttons/AsyncButton";
import UserDialog from "../../../../../components/ui/overlays/UserDialog";
import useOrgRole from "../../useOrgRole";
import { invalidate } from "../../../../../lib/queryCache";
import { toNewYork } from "../../../../../utils/NewYorkTime";
import { functionErrorText } from "../../../../../utils/FunctionErrors";

type Review = {
    mission: string;
    rejected_at: string | null;
};

const longDate = (iso: string) => toNewYork(iso).format("MMMM D, YYYY");

const Organization = () => {
    const { enqueueSnackbar } = useSnackbar();
    const organization = useContext(OrgContext);
    const user = useContext(UserContext);
    const navigate = useNavigate();
    const { membership } = useOrgRole();
    const isCreator = membership?.role === "CREATOR";
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    /* You may notice that some of these fields are undefined when in the database the undefined value is stored as null */
    /* undefined = frontend user has not set it yet */
    /* null = frontend user has set it to the null value */
    const [pendingEdit, setPendingEdit] = useState<OrganizationEdit>({
        id: undefined,
        organization_id: undefined,
        name: undefined,
        socials: undefined,
        url: undefined,
        picture: undefined,
        mission: undefined,
        purpose: undefined,
        goals: undefined,
        appointment_procedures: undefined,
        uniqueness: undefined,
        meeting_description: undefined,
        meeting_schedule: undefined,
        meeting_days: undefined,
        keywords: undefined,
        tags: undefined,
        commitment_level: undefined,
        fair: undefined,
        faculty_email: undefined,
    });

    // the origin story and review notes aren't shown publicly, so the club
    // page doesn't load them
    const [review, setReview] = useState<Review>();
    useEffect(() => {
        if (!organization.id || organization.id === -1) return;
        supabase
            .from("organizations")
            .select("mission, rejected_at")
            .eq("id", organization.id)
            .maybeSingle()
            .then(({ data }) =>
                setReview({
                    mission: data?.mission ?? "",
                    rejected_at: data?.rejected_at ?? null,
                }),
            );
        // reloads after a save updates the club
    }, [organization]);
    const withMission = useMemo(
        () => ({ ...organization, mission: review?.mission }),
        [organization, review],
    );

    const resubmit = async () => {
        const { error } = await supabase.rpc("resubmit_organization", {
            org_id: organization.id,
        });
        if (error) {
            enqueueSnackbar(
                error.message ||
                    `Couldn't resubmit the charter. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }
        enqueueSnackbar("Charter sent to the Student Union for review.", {
            variant: "success",
        });
        invalidate(["org"]);
        organization.setOrg?.({ ...organization, state: "PENDING" });
    };

    const deleteCharter = async () => {
        // the function also deletes the charter's pictures
        const { error } = await supabase.functions.invoke("delete-charter", {
            body: { organization_id: organization.id },
        });
        if (error) {
            enqueueSnackbar(
                (await functionErrorText(error)) ||
                    `Couldn't delete the charter. Contact ${SUPPORT_EMAIL} for support.`,
                { variant: "error" },
            );
            return;
        }
        enqueueSnackbar("Charter deleted.", { variant: "success" });
        invalidate(["org"]);
        invalidate(["home"]);
        // home lists the user's clubs from their profile
        await user.refresh?.();
        navigate("/");
    };

    useEffect(() => {
        const fetchEdits = async () => {
            const { data, error } = await supabase
                .from("organizationedits")
                .select()
                .eq("organization_id", organization.id);

            if (error || !data) {
                return enqueueSnackbar(
                    `Error fetching organization edits. Contact ${SUPPORT_EMAIL} for support.`,
                    { variant: "error" },
                );
            }

            if (data[0]) {
                setPendingEdit(data[0]);
            }
        };

        fetchEdits();
    }, [organization, enqueueSnackbar]);

    return (
        <div className="w-full">
            <div
                className={
                    "bg-layer-1 p-5 pl-7 pb-8 rounded-xl mb-10 mt-2 shadow-prominent"
                }
            >
                <h1>Amend Charter</h1>
                {organization.state === "REJECTED" ? (
                    <p>
                        Edit your charter below, then resubmit it for review.
                        Your changes save right away.
                    </p>
                ) : ["UNLOCKED", "ADMIN"].includes(organization.state) ? (
                    <p>
                        You may update your organization&apos;s charter here.
                        Changes to the name, picture, description, origin story,
                        goals, uniqueness, appointment procedures and meeting
                        description are reviewed by the Student Union first.
                        Everything else saves right away.
                    </p>
                ) : (
                    <p>
                        You may update your organization&apos;s charter here.
                        Please note that edits are requests to amend, which will
                        be reviewed by the Student Union.
                    </p>
                )}
            </div>
            {organization.state === "REJECTED" && (
                <div
                    className={
                        "bg-layer-1 p-5 pl-7 rounded-xl mb-10 shadow-prominent border-l-4 border-red"
                    }
                    role="status"
                >
                    {/* the page's second heading level, styled as before */}
                    <h2 className="as-h3 my-1 pt-[0.12em] font-normal [font-family:inherit]">
                        Your Charter Needs Changes
                    </h2>
                    <p className="text-typography-2">
                        The Student Union sent it back
                        {review?.rejected_at
                            ? ` on ${longDate(review.rejected_at)}`
                            : ""}
                        . Check{" "}
                        <Link to={`/${organization.url}/admin/messages`}>
                            Messages
                        </Link>{" "}
                        for what to change, edit the charter below, then
                        resubmit it.
                    </p>
                    <div className="flex flex-wrap gap-2.5 mt-4">
                        <AsyncButton onClick={resubmit} isPrimary>
                            Resubmit Charter
                        </AsyncButton>
                        {isCreator && (
                            <AsyncButton
                                onClick={() => setConfirmingDelete(true)}
                                color="secondary"
                            >
                                Delete Charter
                            </AsyncButton>
                        )}
                    </div>
                </div>
            )}
            {organization.state === "PENDING" &&
                (review?.rejected_at || isCreator) && (
                    <div className="mb-6">
                        {review?.rejected_at && (
                            <p className="text-typography-2" role="status">
                                You resubmitted this charter. The Student Union
                                will review it again.
                            </p>
                        )}
                        {isCreator && (
                            <AsyncButton
                                onClick={() => setConfirmingDelete(true)}
                                color="secondary"
                                className="mt-2.5"
                            >
                                Delete Charter
                            </AsyncButton>
                        )}
                    </div>
                )}
            <UserDialog
                title="Delete This Charter?"
                description={`${organization.name} and everything in it will be deleted. This can't be undone.`}
                open={confirmingDelete}
                onClose={() => setConfirmingDelete(false)}
                onConfirm={deleteCharter}
                confirmText="Delete Charter"
            />
            <OrgEditor
                organization={withMission}
                existingEdit={pendingEdit}
                setPendingEdit={setPendingEdit}
            />
        </div>
    );
};

export default Organization;
