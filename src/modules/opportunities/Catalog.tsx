import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet";
import { useSearchParams } from "react-router-dom";
import AsyncButton from "../../components/ui/buttons/AsyncButton";
import ContentUnavailable from "../../components/ui/content/ContentUnavailable";
import FilterPanel from "./components/FilterPanel";
import OpportunityList, {
    OpportunityListSkeleton,
} from "./components/OpportunityList";
import { useOpportunities } from "./OpportunitiesContext";
import {
    DEFAULT_FILTERS,
    filterOpportunities,
    getTodayEastern,
    pluralize,
} from "./utils";

const COST_STEP = 100;

const Catalog = () => {
    const {
        loading,
        failed,
        opportunities,
        categories,
        eligibilities,
        student,
        catalogFilters: filters,
        setCatalogFilters: setFilters,
    } = useOpportunities();
    const [searchParams, setSearchParams] = useSearchParams();
    const [filtersOpen, setFiltersOpen] = useState(false);
    const asideRef = useRef<HTMLElement>(null);
    const resultsRef = useRef<HTMLElement>(null);

    // ends the filters at the window's bottom, unless the results are shorter
    useEffect(() => {
        const aside = asideRef.current;
        const results = resultsRef.current;
        if (!aside || !results) return;
        const fit = () => {
            if (results.offsetHeight < aside.scrollHeight) {
                aside.style.setProperty("--filters-height", "none");
                return;
            }
            const room =
                window.innerHeight - aside.getBoundingClientRect().top - 24;
            aside.style.setProperty("--filters-height", `${room}px`);
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(results);
        if (aside.lastElementChild) observer.observe(aside.lastElementChild);
        // the page scrolls in an inner box
        document.addEventListener("scroll", fit, {
            capture: true,
            passive: true,
        });
        window.addEventListener("resize", fit);
        return () => {
            observer.disconnect();
            document.removeEventListener("scroll", fit, { capture: true });
            window.removeEventListener("resize", fit);
        };
    }, []);

    // a link from Discover starts a fresh search
    useLayoutEffect(() => {
        const query = searchParams.get("q");
        const category = Number(searchParams.get("category"));
        if (query === null && !category && !searchParams.has("all")) return;
        setFilters({
            ...DEFAULT_FILTERS,
            query: query ?? "",
            categoryIds: category ? [category] : [],
        });
        setSearchParams({}, { replace: true });
    }, [searchParams, setFilters, setSearchParams]);

    // new results start from the top, so the search stays in view
    const firstFilters = useRef(filters);
    useLayoutEffect(() => {
        if (filters === firstFilters.current) return;
        const results = resultsRef.current;
        if (results && results.getBoundingClientRect().top < 0) {
            results.parentElement?.scrollIntoView({ block: "start" });
        }
    }, [filters]);

    // ignore unknown ?category= ids
    const activeFilters = useMemo(
        () => ({
            ...filters,
            categoryIds: filters.categoryIds.filter((id) =>
                categories.some((category) => category.id === id),
            ),
        }),
        [filters, categories],
    );
    const filtered =
        JSON.stringify(activeFilters) !== JSON.stringify(DEFAULT_FILTERS);

    const resetFilters = () => {
        setFilters(DEFAULT_FILTERS);
        // on narrow screens the search may be hidden
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

    const today = getTodayEastern();
    const results = useMemo(
        () =>
            filterOpportunities(
                opportunities,
                activeFilters,
                categories,
                eligibilities,
                student,
                today,
            ),
        [
            opportunities,
            activeFilters,
            categories,
            eligibilities,
            student,
            today,
        ],
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
        <main className="mx-auto grid w-full max-w-[82rem] grid-cols-1 items-start gap-x-8 gap-y-4 px-12 lg:gap-y-8 pt-8 max-sm:px-4 max-sm:pt-14 lg:grid-cols-[18rem_minmax(0,1fr)]">
            <Helmet>
                <title>Opportunities Catalog - Epsilon</title>
            </Helmet>
            <h1 className="sr-only">Opportunities Catalog</h1>

            {/* scrolls on its own; padding keeps focus rings unclipped */}
            <aside
                ref={asideRef}
                className="lg:sticky lg:top-6 lg:-mx-2 lg:max-h-[var(--filters-height,calc(100dvh-3rem))] lg:overflow-y-auto lg:overscroll-contain lg:px-2 lg:pb-6 lg:pt-1 lg:[scrollbar-width:thin]"
            >
                <h2 className="sr-only">Filters</h2>
                <button
                    type="button"
                    id="catalog-filters-toggle"
                    aria-expanded={filtersOpen}
                    aria-controls="catalog-filters"
                    onClick={() => setFiltersOpen(!filtersOpen)}
                    className="mb-4 flex w-full cursor-pointer items-center justify-between rounded-xl bg-layer-1 px-4 py-2 text-typography-1 shadow-control lg:hidden"
                >
                    Filters
                    <i
                        className={`bx ${filtersOpen ? "bx-chevron-up" : "bx-chevron-down"}`}
                        aria-hidden="true"
                    />
                </button>
                <div
                    id="catalog-filters"
                    className={filtersOpen ? "" : "max-lg:hidden"}
                >
                    <FilterPanel
                        filters={filters}
                        onChange={setFilters}
                        categories={categories}
                        eligibilities={eligibilities}
                        maxCost={maxCost}
                    />
                </div>
            </aside>

            <section
                ref={resultsRef}
                aria-label="Opportunities"
                aria-busy={loading}
            >
                <div className="mb-3 flex items-center gap-3 text-sm text-typography-2">
                    <p role="status">
                        {loading
                            ? ""
                            : pluralize(
                                  results.length,
                                  "opportunity",
                                  "opportunities",
                              )}
                    </p>
                    {!loading && filtered && results.length > 0 && (
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="cursor-pointer rounded underline hover:text-typography-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1"
                        >
                            Reset Filters
                        </button>
                    )}
                </div>
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
        </main>
    );
};

export default Catalog;
