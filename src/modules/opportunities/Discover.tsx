import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "../../components/ui/input/SearchInput";
import {
    PILL_CLASS,
    pillColors,
} from "../../components/ui/input/FilterControls";
import { useOpportunities } from "./OpportunitiesContext";
import { getStatus, getTodayEastern } from "./utils";

const SEARCH_LINK_CLASS =
    "group flex cursor-pointer items-center gap-1.5 rounded py-1 text-sm font-medium text-typography-1 no-underline opacity-80 transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1 disabled:cursor-wait disabled:opacity-60 disabled:hover:opacity-60";
const SEARCH_LINK_ICON =
    "bx text-base transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none";

const Discover = () => {
    const navigate = useNavigate();
    const { loading, failed, opportunities, categories, student } =
        useOpportunities();
    const [query, setQuery] = useState("");

    const onSearch = (event: FormEvent) => {
        event.preventDefault();
        const trimmed = query.trim();
        navigate(
            trimmed
                ? `/opportunities/catalog?q=${encodeURIComponent(trimmed)}`
                : "/opportunities/catalog?all=1",
        );
    };

    const today = getTodayEastern();
    // only listings the student can still apply for
    const active = opportunities.filter(
        (o) => !getStatus(o, student, today).struck,
    );
    const openRandom = () => {
        const pick = active[Math.floor(Math.random() * active.length)];
        if (pick) navigate(`/opportunities/${pick.id}`);
    };

    return (
        <main className="relative overflow-x-clip">
            <Helmet>
                <title>Opportunities - Epsilon</title>
            </Helmet>

            <section className="relative flex flex-col items-center px-4 pb-10 pt-[clamp(3rem,16dvh-5rem,9rem)] max-sm:pt-32">
                {/* darkened like the design's photo */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 -top-[2.2rem] bottom-0 bg-[url('/media/opportunities-hero.webp')] bg-cover bg-[center_35%] brightness-[0.25] contrast-[0.75] saturate-[0.9] [mask-image:linear-gradient(to_bottom,black_72%,transparent)] scheme-light:opacity-30 scheme-light:brightness-100"
                />
                <h1 className="relative -mt-2 mb-[clamp(3.5rem,20dvh-4rem,9.5rem)] pt-2 text-center font-['epsilon-geometric','neue-haas-grotesk-display',sans-serif] font-medium uppercase leading-[0.8] text-transparent [-webkit-background-clip:text] [background-clip:text] [background-image:linear-gradient(95deg,#f3fbef_0%,#fbe9e4_30%,#ffa3ec_62%,#c46cff_100%)] [font-variation-settings:normal] scheme-light:[background-image:linear-gradient(95deg,var(--text-primary)_0%,#9333ea_60%,#6b21a8_100%)] max-sm:mb-28">
                    <span className="block text-[min(4.8rem,calc((100vw_-_2rem)/5))] max-sm:text-[min(3.4rem,calc((100vw_-_2rem)/5))]">
                        Find Your
                    </span>{" "}
                    {/* capped so larger text settings still fit the screen */}
                    <span className="block text-[min(6.4rem,calc((100vw_-_2rem)/3.9))] max-sm:text-[min(4.55rem,calc((100vw_-_2rem)/3.9))]">
                        Calling
                    </span>
                </h1>

                <form
                    role="search"
                    onSubmit={onSearch}
                    className="relative w-full max-w-[52rem]"
                >
                    <SearchInput
                        placeholder="Search opportunities"
                        aria-label="Search opportunities"
                        value={query}
                        onChange={setQuery}
                        containerClassName="mb-3"
                    />
                    <div className="flex flex-wrap gap-x-6 gap-y-1 pl-1">
                        <Link
                            to="/opportunities/catalog?all=1"
                            className={SEARCH_LINK_CLASS}
                        >
                            Browse all
                            <i
                                className={`${SEARCH_LINK_ICON} bx-right-arrow-alt`}
                                aria-hidden="true"
                            />
                        </Link>
                        {(loading || active.length > 0) && (
                            <button
                                type="button"
                                onClick={openRandom}
                                disabled={loading}
                                aria-busy={loading}
                                className={SEARCH_LINK_CLASS}
                            >
                                Random opportunity
                                <i
                                    className={`${SEARCH_LINK_ICON} ${loading ? "bx-loader-alt animate-spin motion-reduce:animate-none" : "bx-shuffle"}`}
                                    aria-hidden="true"
                                />
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <div className="mx-auto w-full max-w-[59rem] px-14 pb-12 max-sm:px-4">
                {failed && (
                    <p role="alert" className="text-sm text-typography-2">
                        Opportunities could not load. Refresh the page to try
                        again.
                    </p>
                )}
                <div className="relative flex flex-wrap gap-2">
                    {categories
                        .filter((category) => category.parent_id === null)
                        .map((category) => (
                            <Link
                                key={category.id}
                                to={`/opportunities/catalog?category=${category.id}`}
                                className={`important no-underline ${PILL_CLASS} ${pillColors(false)}`}
                            >
                                {category.name}
                            </Link>
                        ))}
                </div>
            </div>
        </main>
    );
};

export default Discover;
