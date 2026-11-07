import { ChangeEvent, useContext, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSnackbar } from "notistack";
import AlertBanner from "../../../components/ui/AlertBanner";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../../components/ui/content/ContentUnavailable";
import UserContext from "../../../contexts/UserContext";
import { supabase } from "../../../lib/supabaseClient";
import { readBulletinFile } from "../bulletin/load";
import { BulletinFormatError, BulletinMeta } from "../bulletin/parse";
import {
    adoptExistingMatch,
    applyEntryPatch,
    buildReview,
    findNoLongerListed,
    findPublishProblems,
    refreshChange,
    ReviewEntry,
    ReviewPatch,
    toImportEntries,
} from "../bulletin/sync";
import { useOpportunities } from "../OpportunitiesContext";
import { Opportunity } from "../types";
import { formatDate, pluralize } from "../utils";
import NoLongerListed from "./NoLongerListed";
import ReviewEntries from "./ReviewEntries";
import ReviewHeader from "./ReviewHeader";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
// errors the import raises on purpose, written for admins
const IMPORT_ERROR_CODE = "P0001";

// focused after an upload or publish, so the result is read out
type FocusTarget =
    | "bulletin-review"
    | "bulletin-read-error"
    | "bulletin-published";

type ReviewState = {
    meta: BulletinMeta;
    fileName: string;
    entries: ReviewEntry[];
    noLongerListed: Opportunity[];
    archiveIds: number[];
};

const Admin = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const {
        loading,
        failed,
        opportunities,
        categories,
        eligibilities,
        latestBulletin,
        reload,
    } = useOpportunities();

    const [progress, setProgress] = useState<string | null>(null);
    const [readError, setReadError] = useState<string | null>(null);
    const [review, setReview] = useState<ReviewState | null>(null);
    const [publishedSummary, setPublishedSummary] = useState<string | null>(
        null,
    );
    const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);

    useEffect(() => {
        if (!focusTarget) return;
        document.getElementById(focusTarget)?.focus();
        setFocusTarget(null);
    }, [focusTarget]);

    const publishProblems = useMemo(
        () =>
            review
                ? findPublishProblems(review.entries, categories, opportunities)
                : [],
        [review, categories, opportunities],
    );

    if (user.permission !== "ADMIN") {
        return (
            <main>
                <ContentUnavailable
                    icon="bx-no-entry"
                    iconColor="text-red"
                    title="Restricted Access"
                    description="You do not have access to this page at this time."
                />
            </main>
        );
    }

    // after a publish, a failed reload shouldn't hide that the publish worked
    if (failed && !publishedSummary) {
        return (
            <main>
                <ContentUnavailable
                    icon="bx-error-circle"
                    iconColor="text-red"
                    title="The catalog could not load"
                    description="Refresh the page to try again. If this keeps happening, contact it@stuysu.org."
                />
            </main>
        );
    }

    const onFileChosen = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        // let the same file be chosen again after fixing a problem
        event.target.value = "";
        // one PDF at a time
        if (!file || progress !== null) return;

        setReadError(null);
        setPublishedSummary(null);
        setReview(null);

        if (file.size > MAX_FILE_BYTES) {
            setReadError("That file is over 25 MB. Choose the bulletin PDF.");
            setFocusTarget("bulletin-read-error");
            return;
        }

        setProgress("Opening the PDF...");
        try {
            const { meta, entries } = await readBulletinFile(
                file,
                (done, total) => {
                    setProgress(`Reading page ${done} of ${total}...`);
                },
            );
            const noLongerListed = findNoLongerListed(
                entries,
                opportunities,
                meta,
            );
            setReview({
                meta,
                fileName: file.name,
                entries: buildReview(entries, opportunities),
                noLongerListed,
                archiveIds: noLongerListed.map((o) => o.id),
            });
            setFocusTarget("bulletin-review");
        } catch (error) {
            setReadError(
                error instanceof BulletinFormatError
                    ? error.message
                    : "This file could not be read. Make sure it's the bulletin PDF, then try again.",
            );
            setFocusTarget("bulletin-read-error");
        } finally {
            setProgress(null);
        }
    };

    const updateEntry = (index: number, patch: ReviewPatch) => {
        setReview((current) => {
            if (!current) return current;
            const entries = [...current.entries];
            const { existingId, renameSettled, ...fields } = patch;
            const patched = {
                ...applyEntryPatch(
                    entries[index],
                    fields,
                    current.meta.publishedOn,
                ),
                ...(existingId !== undefined && { existingId }),
                ...(renameSettled !== undefined && { renameSettled }),
            };
            entries[index] = refreshChange(
                adoptExistingMatch(patched, opportunities, entries),
                opportunities,
            );
            const noLongerListed = findNoLongerListed(
                entries,
                opportunities,
                current.meta,
            );
            const newlyUnlisted = noLongerListed
                .map((o) => o.id)
                .filter(
                    (id) => !current.noLongerListed.some((o) => o.id === id),
                );
            return {
                ...current,
                entries,
                noLongerListed,
                archiveIds: [...current.archiveIds, ...newlyUnlisted],
            };
        });
    };

    const setArchiveIds = (archiveIds: number[]) =>
        setReview((current) => current && { ...current, archiveIds });

    const publish = async () => {
        if (!review) return;

        // re-included entries leave the list but stay in archiveIds
        const archiveIds = review.noLongerListed
            .map((o) => o.id)
            .filter((id) => review.archiveIds.includes(id));
        const payload = toImportEntries(
            review.entries,
            categories,
            eligibilities,
        );

        const { error } = await supabase.rpc("import_opportunity_bulletin", {
            bulletin: {
                issue: review.meta.issue,
                published_on: review.meta.publishedOn,
                file_name: review.fileName,
            },
            entries: payload,
            archive_ids: archiveIds,
        });

        if (error) {
            enqueueSnackbar(
                error.code === IMPORT_ERROR_CODE
                    ? `Nothing was published. ${error.message}`
                    : "Error publishing bulletin, so nothing changed. Contact it@stuysu.org for support.",
                { variant: "error" },
            );
            return;
        }

        setPublishedSummary(
            `Published bulletin #${review.meta.issue}: ${pluralize(payload.length, "opportunity", "opportunities")}, ${archiveIds.length} archived.`,
        );
        setReview(null);
        setFocusTarget("bulletin-published");
        await reload();
    };

    const isOlderIssue = Boolean(
        review &&
            latestBulletin &&
            review.meta.publishedOn < latestBulletin.published_on,
    );

    return (
        <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-12 pt-8 max-sm:px-4 max-sm:pt-14">
            <Helmet>
                <title>Opportunities Admin - Epsilon</title>
            </Helmet>

            <header>
                <h1 className="mb-2">Upload Bulletin</h1>
                <p className="text-typography-2">
                    {latestBulletin
                        ? `Last published: #${latestBulletin.issue}, ${formatDate(latestBulletin.published_on, { withYear: true })}, with ${pluralize(latestBulletin.entry_count, "opportunity", "opportunities")}.`
                        : "No bulletin has been published yet."}
                </p>
            </header>

            {publishedSummary && (
                <div id="bulletin-published" tabIndex={-1}>
                    {/* focus moves here, which reads it out, so it needn't be live too */}
                    <AlertBanner
                        severity="success"
                        live="off"
                        onClose={() => setPublishedSummary(null)}
                    >
                        {publishedSummary}
                        {failed &&
                            " The catalog couldn't reload, so refresh the page to see it."}
                    </AlertBanner>
                </div>
            )}

            <section className="flex flex-wrap items-center gap-4 rounded-2xl bg-layer-1 p-6 shadow-control">
                <AsyncButton
                    component="label"
                    isPrimary
                    disabled={loading}
                    aria-busy={progress !== null}
                >
                    {review ? "Choose a Different PDF" : "Choose Bulletin PDF"}
                    <input
                        type="file"
                        accept="application/pdf,.pdf"
                        className="sr-only"
                        disabled={loading}
                        onChange={onFileChosen}
                    />
                </AsyncButton>
                <p className="text-sm text-typography-2">
                    {progress ??
                        "Use the Long version. Nothing goes live until you publish."}
                </p>
                {/* page-by-page progress would be too chatty to read out */}
                <p role="status" className="sr-only">
                    {progress ? "Reading the bulletin PDF." : ""}
                </p>
            </section>

            {readError && (
                <div id="bulletin-read-error" tabIndex={-1}>
                    <AlertBanner severity="error" live="off">
                        {readError}
                    </AlertBanner>
                </div>
            )}

            {review && (
                <>
                    <ReviewHeader
                        meta={review.meta}
                        entries={review.entries}
                        publishProblems={publishProblems}
                        isOlderIssue={isOlderIssue}
                        onPublish={publish}
                    />
                    {review.noLongerListed.length > 0 && (
                        <NoLongerListed
                            opportunities={review.noLongerListed}
                            archiveIds={review.archiveIds}
                            onChange={setArchiveIds}
                        />
                    )}
                    <ReviewEntries
                        entries={review.entries}
                        categories={categories}
                        eligibilities={eligibilities}
                        onChange={updateEntry}
                    />
                </>
            )}
        </main>
    );
};

export default Admin;
