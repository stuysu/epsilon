import { useEffect, useState } from "react";
import OrgBlock from "../../../../components/ui/OrgBlock";
import { useOrgList } from "../../../../contexts/OrgListContext";

function cleanName(str: string): string {
    return str
        .toLowerCase()
        .replace(/\b(stuyvesant|stuy|club|activity|team|association)\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

function stringSimilarity(a: string, b: string): number {
    a = cleanName(a);
    b = cleanName(b);
    const setA = new Set(a.split(" "));
    const setB = new Set(b.split(" "));
    const intersection = [...setA].filter((word) => setB.has(word));
    return intersection.length / Math.max(setA.size, 1);
}

type ScoredOrganization = Organization & { score: number };

const RelatedActivities = ({ currentOrg }: { currentOrg: Organization }) => {
    const [relatedOrgs, setRelatedOrgs] = useState<ScoredOrganization[]>([]);
    const [localLoading, setLocalLoading] = useState(true);
    const { orgs } = useOrgList();

    useEffect(() => {
        if (!orgs) return;

        const scoredWithExtra = orgs
            .filter((org) => org.id !== currentOrg.id)
            .map((org) => {
                let score = 0;

                // Name similarity, max 4.5 pts
                score += stringSimilarity(currentOrg.name, org.name) * 4.5;

                // Purpose text similarity, max 3.5 pts
                if (org.purpose && currentOrg.purpose) {
                    score +=
                        stringSimilarity(currentOrg.purpose, org.purpose) * 3.5;
                }

                // Shared tags - percentage overlap, max 1.5 pts
                const orgTags = org.tags ?? [];
                const currentTags = currentOrg.tags ?? [];
                const sharedTags = orgTags.filter((tag: string) =>
                    currentTags.includes(tag),
                );

                const totalUniqueTags = new Set([...orgTags, ...currentTags])
                    .size;
                const overlapRatio =
                    totalUniqueTags > 0
                        ? sharedTags.length / totalUniqueTags
                        : 0;
                score += overlapRatio * 1.5;

                // small boost for commitment level
                if (org.commitment_level === currentOrg.commitment_level)
                    score += 0.5;
                return { ...org, score };
            });

        const sorted = scoredWithExtra
            .sort((a, b) => b.score - a.score)
            .slice(0, 10)
            .map(({ score, ...org }) => ({
                ...org,
                score,
                url: org.url,
                commitment_level: (org.commitment_level ??
                    "NONE") as Organization["commitment_level"],
                state: org.state ?? "PENDING",
            }));

        setRelatedOrgs(sorted as ScoredOrganization[]);
        setLocalLoading(false);
    }, [orgs, currentOrg]);

    if (!localLoading && relatedOrgs.length === 0) return null;

    return (
        <div
            className={
                "scrollbar-none max-w-[calc(100vw+2rem)] sm:max-w-[100vw] lg:max-w-[calc(100vw-160px)] overflow-x-scroll snap-x snap-mandatory"
            }
        >
            <div className={"absolute bg-bg z-20 h-full w-8 left-0"}></div>
            <div
                className={
                    "absolute bg-gradient-to-r from-bg to-transparent z-20 h-full w-4 left-8"
                }
            ></div>
            <div className={"w-fit flex gap-2 my-4"}>
                <div className={"w-10"}></div>
                {localLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                          <div
                              key={i}
                              className="w-[180px] h-[180px] rounded-xl bg-neutral-800/50 animate-pulse mb-20"
                          />
                      ))
                    : relatedOrgs.map((org) => (
                          <div className={"snap-start scroll-ml-12"}>
                              <OrgBlock
                                  key={org.id}
                                  name={org.name || "No Name"}
                                  role={undefined}
                                  role_name={`${Math.min(org.score * 17.5, 95).toPrecision(2)}% Similar`}
                                  url={org.url}
                                  picture={org.picture}
                                  force
                              />
                          </div>
                      ))}
                <div className={"w-12"}></div>
            </div>
        </div>
    );
};

export default RelatedActivities;
