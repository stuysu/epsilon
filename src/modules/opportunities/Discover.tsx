import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "../../components/ui/input/SearchInput";
import { OPPORTUNITY_SUBMISSION_URL } from "../../config/routes";
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
                    <span className="block text-[4.8rem] max-sm:text-[3.4rem]">
                        Find Your
                    </span>{" "}
                    <span className="block text-[6.4rem] max-sm:text-[4.55rem]">
                        Calling
                    </span>
                </h1>

                <form
                    role="search"
                    onSubmit={onSearch}
                    className="relative w-full max-w-[52rem]"
                >
                    <SearchInput
                        placeholder="Find Opportunities..."
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
                                className="max-w-full rounded-lg bg-layer-2 px-3 pb-[0.35rem] pt-1 text-sm text-typography-2 no-underline shadow-control transition-colors hover:bg-layer-3 hover:text-typography-1"
                            >
                                {category.name}
                            </Link>
                        ))}
                </div>
            </div>

            {/* clips the box so it never runs into the footer */}
            <div className="overflow-clip">
                <section className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-[59rem] flex-col px-14 pb-6 pt-16 max-lg:min-h-0 max-sm:px-4 max-lg:pb-0">
                    <p className="font-serif [text-wrap:pretty] text-[clamp(2.25rem,6vw,5.4rem)] leading-[0.95] tracking-[-0.02em] text-transparent [background-image:linear-gradient(180deg,#fff6e0_0%,#c9a86a_45%,#7a5f30_100%)] scheme-light:[background-image:linear-gradient(180deg,#7a5f30_0%,#5c4520_100%)] [background-clip:text] [-webkit-background-clip:text]">
                        The <em>largest</em> compendium of opportunities for
                        Stuyvesant students to learn, grow, and explore.
                    </p>
                    {/* fills the room under the tagline */}
                    <div className="relative flex-1 lg:min-h-[20rem]">
                        <p className="relative z-10 mt-14 max-w-md text-sm text-typography-2">
                            If you&apos;re an organization or business looking
                            to advertise opportunities for students, fill out
                            this{" "}
                            <a
                                href={OPPORTUNITY_SUBMISSION_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-accent underline"
                            >
                                submission form
                                <span className="sr-only">
                                    {" "}
                                    (opens in a new tab)
                                </span>
                            </a>
                            .
                        </p>
                        <img
                            src="/media/opportunities-box.webp"
                            alt=""
                            width={700}
                            height={393}
                            className="pointer-events-none absolute bottom-0 right-[max(-14rem,calc(29.5rem-50vw))] h-full max-h-[min(34rem,40vw)] w-auto max-w-none max-lg:static max-lg:-mr-[22%] max-lg:ml-auto max-lg:mt-6 max-lg:block max-lg:h-auto max-lg:max-h-none max-lg:w-[min(40rem,118%)]"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Discover;
