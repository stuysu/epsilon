import { FormEvent, useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import SearchInput from "../../components/ui/input/SearchInput";
import { OPPORTUNITY_SUBMISSION_URL } from "../../config/routes";
import { useOpportunities } from "./OpportunitiesContext";

const Discover = () => {
    const navigate = useNavigate();
    const { categories } = useOpportunities();
    const [query, setQuery] = useState("");

    const onSearch = (event: FormEvent) => {
        event.preventDefault();
        const trimmed = query.trim();
        navigate(
            trimmed
                ? `/opportunities/catalog?q=${encodeURIComponent(trimmed)}`
                : "/opportunities/catalog",
        );
    };

    return (
        <main>
            <Helmet>
                <title>Opportunities - Epsilon</title>
            </Helmet>

            <section className="flex flex-col items-center border-b border-divider px-4 pb-16 pt-20 max-sm:pt-24">
                <h1 className="mb-14 text-center font-display text-7xl font-bold uppercase leading-none tracking-tight text-transparent [background-image:linear-gradient(90deg,var(--text-primary)_0%,#f6c1ff_50%,#a855f7_100%)] scheme-light:[background-image:linear-gradient(90deg,var(--text-primary)_0%,#9333ea_50%,#6b21a8_100%)] [background-clip:text] [-webkit-background-clip:text] max-sm:text-5xl">
                    Find Your
                    <br />
                    Calling
                </h1>

                <form
                    role="search"
                    onSubmit={onSearch}
                    className="w-full max-w-2xl"
                >
                    <SearchInput
                        placeholder="Find opportunities..."
                        aria-label="Search opportunities"
                        value={query}
                        onChange={setQuery}
                    />
                </form>

                <div className="flex w-full max-w-2xl flex-wrap justify-center gap-2">
                    {categories
                        .filter((category) => category.parent_id === null)
                        .map((category) => (
                            <Link
                                key={category.id}
                                to={`/opportunities/catalog?category=${category.id}`}
                                className="max-w-full rounded-lg bg-layer-2 px-3 py-1 text-center text-sm text-typography-1 no-underline shadow-control transition-colors hover:bg-layer-3"
                            >
                                {category.name}
                            </Link>
                        ))}
                </div>
            </section>

            <section className="mx-auto max-w-3xl px-6 py-16">
                <p className="mb-8 font-serif text-5xl leading-tight text-beige max-sm:text-3xl">
                    The <em>largest</em> compendium of opportunities for
                    Stuyvesant students to learn, grow, and explore.
                </p>
                <p className="text-sm text-typography-2">
                    Running a program for high school students? Share it with
                    Stuyvesant through{" "}
                    <a
                        href={OPPORTUNITY_SUBMISSION_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent underline scheme-dark:text-typography-1"
                    >
                        Submit an Opportunity
                    </a>
                    .
                </p>
            </section>
        </main>
    );
};

export default Discover;
