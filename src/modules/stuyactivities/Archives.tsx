import React from "react";
import usePageMeta from "../../utils/usePageMeta";
// one entry per school year, newest first; scripts/archive-year.mjs exports
// the year's clubs and adds the entry (see the top of that script)
import archives from "./archives.json";

const Archives = () => {
    usePageMeta(
        "StuyActivities Archives - Epsilon",
        "Browse past years' StuyActivities data and records.",
    );

    return (
        <div className={"p-10 max-sm:mb-32"}>
            <div
                className={
                    "flex sm:justify-center items-center w-full h-48 sm:h-96"
                }
            >
                <h1
                    className={
                        "max-w-3xl bg-blend-color-dodge text-typography-1 sm:text-8xl text-4xl sm:text-center font-light"
                    }
                >
                    StuyActivities
                    <br />
                    Archives
                </h1>
            </div>
            <div className={"flex w-full justify-center"}>
                <div className={"flex flex-col gap-5 w-full mb-32 max-w-3xl"}>
                    {archives.map((archive) => (
                        <a
                            key={archive.year}
                            href={archive.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="transition-colors p-6 from-layer-2 to-layer-1 bg-linear-to-b/srgb rounded-xl flex justify-center no-underline gap-4 sm:hover:bg-layer-3 shadow-control focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1"
                        >
                            <div>
                                <h2
                                    className={
                                        "as-h1 font-['instrument-serif'] text-beige font-normal"
                                    }
                                >
                                    {archive.year} Archives
                                </h2>
                                <p className={"text-center"}>
                                    {archive.activities} Activities
                                </p>
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Archives;
