import { useContext, useLayoutEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import UserContext from "../../contexts/UserContext";
import FilterPanel from "./components/FilterPanel";
import OpportunityList, {
    OpportunityListSkeleton,
} from "./components/OpportunityList";
import { OPPORTUNITY_SUBMISSION_URL } from "../../config/routes";
import { useOpportunities } from "./OpportunitiesContext";
import {
    DEFAULT_FILTERS,
    filterOpportunities,
    getTodayEastern,
    pluralize,
} from "./utils";

const COST_STEP = 100;

const Catalog = () => {
    const user = useContext(UserContext);
    const {
        loading,
        failed,
        opportunities,
        categories,
        eligibilities,
        catalogFilters: filters,
        setCatalogFilters: setFilters,
    } = useOpportunities();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);

    // A link from Discover (?q= or ?category=) starts a fresh search. Without
    // one, the filters from the last visit stay, so Back from a listing works.
    // before paint, so the last visit's search never flashes
    useLayoutEffect(() => {
        const query = searchParams.get("q");
        const category = Number(searchParams.get("category"));
        if (query === null && !category) return;
        setFilters({
            ...DEFAULT_FILTERS,
            query: query ?? "",
            categoryIds: category ? [category] : [],
        });
        setSearchParams({}, { replace: true });
    }, [searchParams, setFilters, setSearchParams]);

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        // on narrow screens the filter panel may be closed, and its search hidden
        const search = document.getElementById("opportunity-search");
        const target = search?.offsetParent
            ? search
            : document.getElementById("catalog-filters-toggle");
        target?.focus();
    };

    const maxCost = useMemo(() => {
        const highest = Math.max(
            0,
            ...opportunities.map((o) => o.cost_max ?? o.cost_min ?? 0),
        );
        return Math.ceil(highest / COST_STEP) * COST_STEP;
    }, [opportunities]);

    const results = useMemo(
        () =>
            filterOpportunities(
                opportunities,
                {
                    ...filters,
                    // an old or mistyped ?category= link shouldn't hide everything
                    categoryIds: filters.categoryIds.filter((id) =>
                        categories.some((category) => category.id === id),
                    ),
                },
                categories,
                eligibilities,
                user.grade,
                getTodayEastern(),
            ),
        [opportunities, filters, categories, eligibilities, user.grade],
    );

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

    return (
        <main className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-8 px-12 pt-8 max-sm:px-4 max-sm:pt-14 lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)_16rem]">
            <Helmet>
                <title>Opportunities Catalog - Epsilon</title>
            </Helmet>
            <h1 className="sr-only">Opportunities Catalog</h1>

            <aside className="lg:sticky lg:top-6">
                <h2 className="sr-only">Filters</h2>
                <button
                    type="button"
                    id="catalog-filters-toggle"
                    aria-expanded={filtersOpen}
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-xl bg-layer-1 px-4 py-2 text-typography-1 shadow-control lg:hidden"
                >
                    Filters
                    <i
                        className={`bx ${filtersOpen ? "bx-chevron-up" : "bx-chevron-down"}`}
                        aria-hidden="true"
                    />
                </button>
                <div className={filtersOpen ? "" : "max-lg:hidden"}>
                    <FilterPanel
                        filters={filters}
                        onChange={setFilters}
                        categories={categories}
                        eligibilities={eligibilities}
                        maxCost={maxCost}
                    />
                </div>
            </aside>

            <section aria-label="Opportunities" aria-busy={loading}>
                <p role="status" className="mb-3 text-sm text-typography-2">
                    {loading
                        ? ""
                        : pluralize(
                              results.length,
                              "opportunity",
                              "opportunities",
                          )}
                </p>
                {loading ? (
                    <OpportunityListSkeleton />
                ) : results.length ? (
                    <OpportunityList opportunities={results} />
                ) : (
                    <div className="flex flex-col items-center gap-4 py-24 text-center">
                        <i
                            className="bx bx-search bx-lg text-typography-3"
                            aria-hidden="true"
                        />
                        <h2 className="text-xl font-semibold">
                            {opportunities.length
                                ? "No opportunities match these filters"
                                : "No opportunities have been posted yet"}
                        </h2>
                        {opportunities.length > 0 && (
                            <AsyncButton onClick={resetFilters}>
                                Reset Filters
                            </AsyncButton>
                        )}
                    </div>
                )}
            </section>

            <a
                href={OPPORTUNITY_SUBMISSION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="sticky top-6 hidden flex-col items-center gap-1 rounded-2xl bg-layer-1 p-6 text-center no-underline shadow-prominent transition-colors hover:bg-layer-2 xl:flex"
            >
                <i className="bx bx-plus text-yellow" aria-hidden="true" />
                <span className="font-serif text-xl text-beige">
                    Submit an Opportunity
                </span>
                <span className="text-sm text-typography-2">
                    Share a program with Stuyvesant students
                </span>
            </a>
        </main>
    );
};

export default Catalog;
