import OrgBlock from "../../../../components/ui/OrgBlock";
import { RelatedActivity } from "../relatedActivities";

// null while the catalog loads
const RelatedActivities = ({
    related,
}: {
    related: RelatedActivity<Organization>[] | null;
}) => {
    return (
        // on desktops it starts 160px into the centered page frame and runs to the frame's edge
        <div
            className={
                "scrollbar-none max-w-[100vw] lg:max-w-[calc(min(100vw,var(--frame)+6rem)-160px)] overflow-x-scroll snap-x snap-mandatory"
            }
        >
            <div
                className={
                    "absolute bg-bg z-20 h-full w-8 left-0 max-sm:hidden"
                }
            ></div>
            <div
                className={
                    "absolute bg-linear-to-r/srgb from-bg to-transparent z-20 h-full w-4 left-8 max-sm:left-0"
                }
            ></div>
            <div className={"w-fit flex gap-2 my-4"}>
                {/* phones line the first card up with the page text */}
                <div className={"w-10 max-sm:w-3"}></div>
                {!related
                    ? Array.from({ length: 10 }).map((_, i) => (
                          <div
                              key={i}
                              className="w-44 h-44 rounded-xl bg-neutral-800/50 animate-pulse mb-20"
                          />
                      ))
                    : related.map(({ org, reason }) => (
                          <div
                              className={
                                  "snap-start scroll-ml-12 max-sm:scroll-ml-3"
                              }
                              key={org.id}
                          >
                              <OrgBlock
                                  key={org.id}
                                  name={org.name || "No Name"}
                                  role={undefined}
                                  role_name={reason}
                                  url={org.url}
                                  picture={org.picture}
                                  force
                              />
                          </div>
                      ))}
                <div className={"w-12 max-sm:w-3"}></div>
            </div>
        </div>
    );
};

export default RelatedActivities;
