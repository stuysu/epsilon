import AlertBanner from "../../../components/ui/AlertBanner";
import AsyncButton from "../../../components/ui/buttons/AsyncButton";
import { BulletinMeta } from "../bulletin/parse";
import { ReviewEntry } from "../bulletin/sync";
import { formatDate, pluralize } from "../utils";

type ReviewHeaderProps = {
    meta: BulletinMeta;
    entries: ReviewEntry[];
    publishProblems: string[];
    isOlderIssue: boolean;
    onPublish: () => Promise<void>;
};

const ReviewHeader = ({
    meta,
    entries,
    publishProblems,
    isOlderIssue,
    onPublish,
}: ReviewHeaderProps) => {
    const includedCount = entries.filter((e) => e.include).length;
    const newCount = entries.filter((e) => e.change === "new").length;
    const changedCount = entries.filter((e) => e.change === "changed").length;

    return (
        <>
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    {/* focused once the PDF is read, so the review is announced */}
                    <h2 id="bulletin-review" tabIndex={-1} className="mb-1">
                        Review Bulletin #{meta.issue}
                    </h2>
                    <p className="text-sm text-typography-2">
                        {formatDate(meta.publishedOn, { withYear: true })} ·{" "}
                        {entries.length} found · {newCount} new · {changedCount}{" "}
                        changed
                    </p>
                </div>
                <AsyncButton
                    isPrimary
                    disabled={
                        publishProblems.length > 0 ||
                        isOlderIssue ||
                        !includedCount
                    }
                    onClick={onPublish}
                >
                    Publish{" "}
                    {pluralize(includedCount, "Opportunity", "Opportunities")}
                </AsyncButton>
            </header>

            {!meta.isLong &&
                (meta.issue.endsWith("S") ? (
                    <AlertBanner severity="warning" live="off">
                        This looks like the Short version. It only lists new and
                        urgent items, so nothing will be archived. Upload the
                        Long version to keep the full catalog current.
                    </AlertBanner>
                ) : (
                    <AlertBanner severity="warning" live="off">
                        This issue isn&apos;t marked Long or Short, so nothing
                        will be archived. Anything that ended can be archived
                        after the next Long issue.
                    </AlertBanner>
                ))}
            {isOlderIssue && (
                <AlertBanner severity="error" live="off">
                    This bulletin is older than the last one published, so it
                    can&apos;t be published. Upload the latest bulletin instead.
                </AlertBanner>
            )}
            {publishProblems.length > 0 && (
                <AlertBanner severity="error" live="polite">
                    Fix these before publishing: {publishProblems.join(" ")}
                </AlertBanner>
            )}
        </>
    );
};

export default ReviewHeader;
