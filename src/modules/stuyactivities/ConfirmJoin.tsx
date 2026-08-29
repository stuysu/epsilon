import React, { useContext } from "react";
import { Navigate } from "react-router-dom";

import AsyncButton from "../../components/ui/buttons/AsyncButton";
import { PUBLIC_URL } from "../../config/constants";
import { ThemeContext } from "../../contexts/ThemeProvider";

type ConfirmJoinProps = {
    invitation?: OrganizationInvitation;
    responding?: boolean;
    errorMessage?: string | null;
    onJoin?: () => void | Promise<void>;
    onReject?: () => void | Promise<void>;
};

const ConfirmJoin = ({
    invitation,
    responding = false,
    errorMessage,
    onJoin,
    onReject,
}: ConfirmJoinProps) => {
    const { effectiveMode } = useContext(ThemeContext);

    if (!invitation) return <Navigate to="/" replace />;

    const { organization, inviter } = invitation;
    const inviterName = inviter
        ? `${inviter.first_name} ${inviter.last_name}`.trim()
        : "An Activity administrator";
    const wordmarkSrc =
        effectiveMode === "dark"
            ? `${PUBLIC_URL}/wordmark.svg`
            : `${PUBLIC_URL}/wordmark_light.svg`;
    const organizationPicture =
        organization.picture || `${PUBLIC_URL}/achievements/placeholder.png`;

    return (
        <main className="flex min-h-dvh w-full flex-col items-center bg-bg px-6 pb-12 pt-24 text-center">
            <img
                src={wordmarkSrc}
                alt="Epsilon"
                className="w-28 object-contain"
            />

            <img
                src={organizationPicture}
                alt=""
                aria-hidden="true"
                className="rounded-2xl object-cover mt-24 size-32 shadow-control"
            />

            <h1 className="mt-10">You’re invited!</h1>
            <h2 className="max-w-lg">
                {inviterName} invited you to join {organization.name}. Would you
                like to accept this invitation?
            </h2>

            <div className="mt-12 flex items-center justify-center gap-3">
                <AsyncButton isPrimary disabled={responding} onClick={onJoin}>
                    Join
                </AsyncButton>
                <AsyncButton disabled={responding} onClick={onReject}>
                    Reject
                </AsyncButton>
            </div>

            {errorMessage && (
                <p
                    className="mt-5 max-w-md text-red"
                    role="alert"
                    aria-live="assertive"
                >
                    {errorMessage}
                </p>
            )}
        </main>
    );
};

export default ConfirmJoin;
