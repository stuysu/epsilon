import { useMemo } from "react";
import { Link } from "react-router-dom";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import OpportunityList, {
    OpportunityListSkeleton,
} from "./components/OpportunityList";
import { useOpportunities } from "./OpportunitiesContext";
import { getTodayEastern, sortOpportunities } from "./utils";
import usePageMeta from "../../utils/usePageMeta";
import { SUPPORT_EMAIL } from "../../config/constants";

const Saved = () => {
    usePageMeta("My Opportunities - Epsilon");

    const { loading, failed, opportunities, savedIds } = useOpportunities();

    const today = getTodayEastern();
    const saved = useMemo(
        () =>
            sortOpportunities(
                opportunities.filter((o) => savedIds.has(o.id)),
                "deadline",
                today,
            ),
        [opportunities, savedIds, today],
    );

    if (failed) {
        return (
            <div>
                <ContentUnavailable
                    icon="bx-error-circle"
                    iconColor="text-red"
                    title="Your opportunities could not load"
                    description={`Refresh the page to try again. If this keeps happening, contact ${SUPPORT_EMAIL}.`}
                />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-4xl px-12 pt-8 max-sm:px-4 max-sm:pt-14">
            <h1 className="mb-8">My Opportunities</h1>

            {loading ? (
                <OpportunityListSkeleton />
            ) : saved.length ? (
                <OpportunityList opportunities={saved} />
            ) : (
                <div className="flex flex-col items-center gap-4 py-24 text-center">
                    <i
                        className="bx bx-bookmark bx-lg text-typography-3"
                        aria-hidden="true"
                    />
                    <h2 className="text-xl font-semibold">Nothing saved yet</h2>
                    <Link
                        to="/opportunities/catalog"
                        className="rounded-lg bg-layer-2 px-3 py-1 text-typography-1 no-underline shadow-control hover:bg-layer-3"
                    >
                        Browse the catalog
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Saved;
