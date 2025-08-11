import { PUBLIC_URL } from "../config/constants";
import { Helmet } from "react-helmet";
import Loading from "../components/ui/Loading";
import UserContext from "../contexts/UserContext";

import { Route, Routes, useLocation } from "react-router-dom";
import React, { lazy, Suspense, useContext } from "react";

// Pages
import Index from "./home";
import CalendarIndex from "./calendar";
import NavBar from "../components/ui/NavBar";
import AboutIndex from "./about";
import Regulations from "./stuyactivities/Regulations";
import Support from "./stuyactivities/Support";
import { Typography } from "@mui/material";
import UnaffiliatedRoomReservation from "./stuyactivities/UnaffiliatedRoomReservation";
import ContextualNavBar from "../components/ui/ContextualNavBar";

const Catalog = lazy(() => import("./stuyactivities/Catalog"));
const Settings = lazy(() => import("./user/Settings"));
const Profile = lazy(() => import("./user/Profile"));
const Create = lazy(() => import("./stuyactivities/CharterForm"));
const Charter = lazy(() => import("./stuyactivities/CharterLanding"));
const ConfirmJoin = lazy(() => import("./stuyactivities/ConfirmJoin"));
const Archives = lazy(() => import("./stuyactivities/Archives"));
const OrgRouter = lazy(() => import("./stuyactivities/orgs"));
const AdminRouter = lazy(() => import("./stuyactivities/admin"));

const Pages = () => {
    const location = useLocation();
    const user: UserContextType = useContext(UserContext);

    return (
        <div>
            <Helmet>
                <meta
                    property="og:url"
                    content={PUBLIC_URL + location.pathname}
                />
                <meta property="og:site_name" content={"Epsilon"} />
                <meta property="og:type" content={"website"} />
                <meta
                    property="og:description"
                    content={
                        "An app to help students navigate the clubs and organizations at Stuyvesant High School."
                    }
                />
                <meta property={"og:title"} content={"Epsilon"} />
                <title>Epsilon</title>
            </Helmet>

            <Suspense fallback={<Loading />}>
                <div
                    className={
                        "fixed bg-gradient-to-b from-[#111111] to-transparent z-[5000] h-5 sm:h-2.5 w-full top-0"
                    }
                ></div>
                {!(!user.signed_in && location.pathname === "/") && (
                    <div>
                        <div
                            className={
                                "max-sm:w-full sm:relative bg-neutral-800 fixed z-50 bottom-0 sm:bg-opacity-0 bg-opacity-80 max-sm:backdrop-blur-2xl max-sm:border-t border-neutral-700"
                            }
                        >
                            <NavBar />
                        </div>
                        <div className="sm:hidden fixed bg-gradient-to-r to-[#111111] from-transparent z-[1500] h-[50px] w-14 top-0 right-0 pointer-events-none" />
                        <div className={"max-sm:h-8"}>
                            <ContextualNavBar />
                        </div>
                    </div>
                )}
                <Routes>
                    <Route path={"/"} Component={Index} />
                    <Route path={"/stuyactivities"} Component={Catalog} />
                    <Route path={"/confirm-join"} Component={ConfirmJoin} />
                    <Route path={"/settings"} Component={Settings} />
                    <Route path={"/profile"} Component={Profile} />
                    <Route path={"/create"} Component={Create} />
                    <Route path={"/charter"} Component={Charter} />
                    <Route
                        path={`/unaffiliated-room-reservation`}
                        Component={UnaffiliatedRoomReservation}
                    />
                    <Route path={"/about"} Component={AboutIndex} />
                    <Route path={"/meetings"} Component={CalendarIndex} />
                    <Route path={"/rules"} Component={Regulations} />
                    <Route path={"/archives"} Component={Archives} />
                    <Route path={"/activities-support"} Component={Support} />
                    <Route path={"/admin/*"} Component={AdminRouter} />
                    <Route path={"/:orgUrl/*"} Component={OrgRouter} />
                </Routes>
                {user.signed_in && (
                    <div
                        className={
                            "w-full h-36 bg-neutral-900 p-10 max-sm:p-6 pr-12 flex justify-between items-center mt-20 max-sm:pb-56 max-sm:flex-col gap-2"
                        }
                    >
                        <div className="w-72 flex max-sm:justify-center">
                            <img
                                src={`${PUBLIC_URL}/wordmark.svg`}
                                className={
                                    "w-36 max-sm:w-28 relative bottom-0.5"
                                }
                                alt={"Epsilon"}
                            ></img>
                        </div>
                        <div
                            className={
                                "flex items-center justify-center gap-4 w-72"
                            }
                        >
                            <Typography>
                                <a href={"https://github.com/stuysu/epsilon/"}>
                                    Source
                                </a>
                            </Typography>
                            <Typography>
                                <a href={"https://stuysu.org/"}>StuySU</a>
                            </Typography>
                            <Typography>
                                <a
                                    href={
                                        "https://www.figma.com/design/WfaOkjsU63VjVD1sdmSTXu/Epsilon-Design-File-Revision-1?node-id=0-1&t=xuEKneeUJMZXyrt1-1"
                                    }
                                >
                                    Design
                                </a>
                            </Typography>
                            <Typography>
                                <a
                                    href={
                                        "https://github.com/willpill/Epsilon-Press-Kit/archive/refs/heads/main.zip"
                                    }
                                >
                                    Press Kit
                                </a>
                            </Typography>
                        </div>
                        <Typography
                            className={
                                "opacity-50 w-72 text-right max-sm:text-center"
                            }
                        >
                            MMXXIV
                        </Typography>
                    </div>
                )}
            </Suspense>
        </div>
    );
};

export default Pages;
