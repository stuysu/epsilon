import { PUBLIC_URL } from "../../../config/constants";
import React, { useContext, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import { Link } from "react-router-dom";
import Skeleton from "../../../components/ui/Skeleton";
import Avatar from "../../../components/ui/Avatar";
import { MeetingChip } from "../orgs/components/MeetingChips";

import { capitalizeWords, sortWeekdays } from "../../../utils/DataFormatters";
const dayLetters: Record<string, string> = {
    MONDAY: "M",
    TUESDAY: "T",
    WEDNESDAY: "W",
    THURSDAY: "R",
    FRIDAY: "F",
};

const SHOWN_TAGS = 2;

const TAG_PILL =
    "inline-block h-7 truncate rounded-full bg-layer-3 px-2.5 text-sm font-semibold leading-7 text-typography-1 shadow-control";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    const user: UserContextType = useContext(UserContext);
    const memberCount =
        organization.member_count ?? organization.memberships?.length ?? 0;

    return (
        <article className="relative transition-transform duration-[400ms] ease-[cubic-bezier(0.3,0.9,0.3,1)] sm:sm:hover:-translate-y-[5px]">
            <div className="mt-10"></div>
            <div className="relative rounded-2xl overflow-visible">
                <div
                    className="absolute top-[0px] left-[0px] w-full opacity-[0.2] h-full bg-cover bg-center z-[0]"
                    style={{
                        backgroundImage: `url(${PUBLIC_URL}/textures/org_card.png)`,
                        filter: "blur(50px)",
                    }}
                />
                <Link
                    to={`/${organization.url}`}
                    style={{
                        textDecoration: "none",
                        color: "inherit",
                        display: "flex",
                    }}
                    className="
    relative
    rounded-3xl
    cursor-pointer
    h-[445px]
    flex flex-col
    overflow-visible
    p-6
    transition-colors
    bg-layer-1
    shadow-prominent
    sm:sm:hover:bg-layer-2
    justify-start
  "
                >
                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "150px",
                            height: "1px",
                            position: "absolute",
                            bottom: "0px",
                            right: "65px",
                            opacity: 0.25,
                        }}
                    ></div>

                    <div
                        style={{
                            background:
                                "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0) 0%, rgba(143, 143, 143, 0.67) 50%, rgba(0, 0, 0, 0) 100%)",
                            width: "250px",
                            height: "1px",
                            position: "absolute",
                            top: "0px",
                            opacity: 0.5,
                        }}
                    ></div>

                    <div className="w-full flex flex-col">
                        <div className="relative top-[-45px] mb-[-12px]">
                            <div
                                className="w-[120px] h-[120px] rounded-[20px] absolute z-[10]"
                                style={{
                                    boxShadow:
                                        "inset 0 0 5px 1px rgba(255, 255, 255, 0.3)",
                                }}
                            ></div>

                            {user.signed_in && (
                                <span
                                    className={"absolute right-0 top-12"}
                                    aria-label={`${memberCount} members`}
                                >
                                    <MeetingChip
                                        icon="bx-group"
                                        iconClass="text-typography-2"
                                        label={String(memberCount)}
                                    />
                                </span>
                            )}

                            {/* Background avatar with blur effect */}
                            <Avatar
                                src={organization.picture || ""}
                                style={{
                                    display: imgLoaded ? "block" : "none",
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "20px",
                                    position: "absolute",
                                    opacity: 0.25,
                                    objectFit: "cover",
                                    filter: "blur(20px)",
                                }}
                            ></Avatar>

                            {!imgLoaded && organization.picture && (
                                <Skeleton className="absolute z-20 h-[120px] w-[120px] rounded-[20px]" />
                            )}

                            {/* Main avatar with text fallback */}
                            <div
                                className="w-[120px] h-[120px] rounded-[20px] absolute"
                                style={{ backgroundColor: "var(--bg-main)" }}
                            ></div>

                            <Avatar
                                onLoad={() => setImgLoaded(true)}
                                src={organization.picture || ""}
                                style={{
                                    transition: "opacity 0.3s ease",
                                    opacity:
                                        imgLoaded || !organization.picture
                                            ? "100%"
                                            : "0%",
                                    width: "120px",
                                    height: "120px",
                                    borderRadius: "20px",
                                    objectFit: "cover",
                                    backgroundColor: "var(--layer-secondary)",
                                    color: "var(--text-primary)",
                                }}
                                alt={`${organization.name}`}
                            >
                                <div className="as-h1 text-7xl font-light">
                                    {organization.name?.charAt(0).toUpperCase()}
                                </div>
                            </Avatar>
                        </div>

                        <div className={"flex h-20 items-start"}>
                            <h3
                                style={{
                                    maxWidth: "90%",
                                    height: "3lh",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "normal",
                                    display: "-webkit-box",
                                    WebkitBoxOrient: "vertical",
                                    WebkitLineClamp: 3,
                                }}
                            >
                                {organization.name}
                            </h3>
                        </div>
                    </div>
                    {!!organization.tags?.length && (
                        <div className={"mt-4 flex w-full gap-1.5"}>
                            {organization.tags
                                .slice(0, SHOWN_TAGS)
                                .map((tag: string) => (
                                    <span
                                        key={tag}
                                        title={tag}
                                        className={`${TAG_PILL} ${tag.length <= 10 ? "shrink-0" : "min-w-0"}`}
                                    >
                                        {tag}
                                    </span>
                                ))}
                            {organization.tags.length > SHOWN_TAGS && (
                                <span className={`${TAG_PILL} shrink-0`}>
                                    +{organization.tags.length - SHOWN_TAGS}
                                </span>
                            )}
                        </div>
                    )}

                    <p
                        className={
                            "mt-3.5 overflow-hidden overflow-ellipsis whitespace-normal [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
                        }
                    >
                        {organization.purpose}
                    </p>

                    <div className={"mt-auto flex flex-wrap gap-1.5 pt-4"}>
                        {organization.commitment_level && (
                            <MeetingChip
                                icon="bx-bar-chart-alt-2"
                                iconClass="text-blue"
                                label={
                                    organization.commitment_level === "NONE"
                                        ? "No Commitment"
                                        : `${organization.commitment_level.charAt(0)}${organization.commitment_level.slice(1).toLowerCase()} Commitment`
                                }
                            />
                        )}
                        <MeetingChip
                            icon="bx-calendar"
                            iconClass="text-yellow"
                            label={
                                organization.meeting_days?.length
                                    ? sortWeekdays(organization.meeting_days)
                                          .map((day: string) => dayLetters[day])
                                          .join(" · ")
                                    : "No Set Days"
                            }
                            fullLabel={
                                organization.meeting_days?.length
                                    ? `Meets ${sortWeekdays(
                                          organization.meeting_days,
                                      )
                                          .map((d) =>
                                              capitalizeWords(d.toLowerCase()),
                                          )
                                          .join(", ")}`
                                    : "No set meeting days"
                            }
                        />
                    </div>
                </Link>
            </div>
        </article>
    );
};

export default OrgCard;
