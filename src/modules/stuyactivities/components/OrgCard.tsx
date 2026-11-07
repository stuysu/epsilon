import { PUBLIC_URL } from "../../../config/constants";
import React, { useContext, useState } from "react";
import UserContext from "../../../contexts/UserContext";
import { Link } from "react-router-dom";
import Skeleton from "../../../components/ui/Skeleton";
import Avatar from "../../../components/ui/Avatar";

const OrgCard = ({ organization }: { organization: Partial<Organization> }) => {
    const [imgLoaded, setImgLoaded] = useState(false);

    const user: UserContextType = useContext(UserContext);

    return (
        <article
            tabIndex={0}
            role="link"
            className="relative transition-transform duration-[400ms] ease-[cubic-bezier(0.3,0.9,0.3,1)] sm:sm:hover:-translate-y-[5px]"
        >
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
                        display: "block",
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
                                <p
                                    className={
                                        "absolute top-12 right-0 text-typography-2 bg-layer-2 px-2 py-1 rounded-md important shadow-control"
                                    }
                                >
                                    <i className="bx bx-group bx-xs relative top-0.5 mr-1"></i>
                                    {organization.memberships?.length ?? 0}
                                </p>
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
                    <div className={"w-full mt-4"}>
                        <p
                            className={
                                "important overflow-hidden overflow-ellipsis whitespace-normal [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:1]"
                            }
                        >
                            {organization.tags?.join(" • ")}
                        </p>
                    </div>

                    <div className="w-full mt-3.5">
                        <p
                            className={
                                "overflow-hidden overflow-ellipsis whitespace-normal [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:4]"
                            }
                        >
                            {organization.purpose}
                        </p>

                        <div
                            className={
                                "flex flex-col bg-layer-2 shadow-control py-3 px-4 mt-5 rounded-lg capitalize"
                            }
                        >
                            <div className={"flex justify-between"}>
                                <p>Commitment</p>
                                <p className={"important"}>
                                    {organization.commitment_level?.toLowerCase()}
                                </p>
                            </div>
                            <div className={"flex justify-between"}>
                                <p>Days</p>
                                <p className={"important"}>
                                    {organization.meeting_days?.length
                                        ? organization.meeting_days
                                              .map(
                                                  (day: string) =>
                                                      ({
                                                          MONDAY: "M",
                                                          TUESDAY: "T",
                                                          WEDNESDAY: "W",
                                                          THURSDAY: "R",
                                                          FRIDAY: "F",
                                                      })[day],
                                              )
                                              .join(" · ")
                                        : "None"}
                                </p>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>
        </article>
    );
};

export default OrgCard;
