import { Helmet } from "react-helmet";
import { Link, useParams } from "react-router-dom";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import Loading from "../../components/ui/content/Loading";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import { getSafeLinks } from "./bulletin/normalize";
import EligibilityLine from "./components/EligibilityLine";
import OpportunityDetails from "./components/OpportunityDetails";
import StatusBadge from "./components/StatusBadge";
import { useOpportunities } from "./OpportunitiesContext";
import { getStatus, getTodayEastern } from "./utils";

const Detail = () => {
    const { id } = useParams();
    const { loading, failed, opportunities, savedIds, setSaved, student } =
        useOpportunities();

    if (loading) {
        return (
            <main>
                <Loading />
            </main>
        );
    }

    if (failed) {
        return (
            <main>
                <ContentUnavailable
                    icon="bx-error-circle"
                    iconColor="text-red"
                    title="Opportunities could not load"
                    description="Refresh the page to try again. If this keeps happening, contact it@stuysu.org."
                />
            </main>
        );
    }

    const opportunity = opportunities.find((o) => o.id === Number(id));

    if (!opportunity) {
        return (
            <main>
                <ContentUnavailable
                    icon="bx-search"
                    title="Opportunity not found"
                    description="It may have been removed. Browse the catalog to find others."
                />
            </main>
        );
    }

    const status = getStatus(opportunity, student, getTodayEastern());
    const [mainLink, ...otherLinks] = getSafeLinks(opportunity.links);
    const isSaved = savedIds.has(opportunity.id);

    return (
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-12 pt-8 max-sm:px-4 max-sm:pt-14">
            <Helmet>
                <title>{`${opportunity.title} - Epsilon`}</title>
            </Helmet>

            <Link
                to="/opportunities/catalog"
                className="inline-flex items-center gap-1 text-sm text-typography-2 no-underline"
            >
                <i className="bx bx-chevron-left" aria-hidden="true" />
                Catalog
            </Link>

            <div className="flex items-start justify-between gap-4 max-sm:flex-col">
                <h1 className={status.struck ? "line-through" : ""}>
                    {opportunity.title}
                </h1>
                <StatusBadge status={status} />
            </div>

            {opportunity.categories.length > 0 && (
                <p className="text-sm text-typography-2">
                    {opportunity.categories.map((c) => c.name).join(" · ")}
                </p>
            )}

            <OpportunityDetails opportunity={opportunity} full />
            {opportunity.eligibilities.length > 0 && (
                <EligibilityLine opportunity={opportunity} />
            )}

            <p className="whitespace-pre-line text-typography-1">
                {opportunity.description}
            </p>

            <div className="flex flex-wrap gap-3">
                {mainLink && (
                    <a
                        href={mainLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg bg-accent px-4 py-1.5 text-white no-underline shadow-control"
                    >
                        Open Link
                        <i className="bx bx-link-external" aria-hidden="true" />
                    </a>
                )}
                <AsyncButton onClick={() => setSaved(opportunity.id, !isSaved)}>
                    {isSaved
                        ? "Remove from My Opportunities"
                        : "Save to My Opportunities"}
                </AsyncButton>
            </div>

            {otherLinks.length > 0 && (
                <section>
                    <h2 className="mb-2 text-sm font-normal text-typography-2">
                        More links
                    </h2>
                    <ul className="flex flex-col gap-1">
                        {otherLinks.map((link) => (
                            <li key={link} className="min-w-0 truncate text-sm">
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent underline scheme-dark:text-typography-1"
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </main>
    );
};

export default Detail;
