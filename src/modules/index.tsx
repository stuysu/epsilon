import { PUBLIC_URL } from "../config/constants";
import { Helmet } from "react-helmet";
import Loading from "../components/ui/content/Loading";
import UserContext from "../contexts/UserContext";

import { Route, Routes, useLocation } from "react-router-dom";
import React, { lazy, Suspense, useContext } from "react";

// Pages
import Index from "./home";
import CalendarIndex from "./calendar";
import NavBar from "../components/ui/navigation/NavBar";
import AboutIndex from "./about";
import Regulations from "./stuyactivities/Regulations";
import Support from "./stuyactivities/Support";
import SubNavBar from "../components/ui/navigation/SubNavBar";
import Arista from "./arista";
import { ThemeContext } from "../contexts/ThemeProvider";

const Catalog = lazy(() => import("./stuyactivities/Catalog"));
const CommsSettings = lazy(() => import("./user/./CommsSettings"));
const UserPreferences = lazy(() => import("./user/./UserPreferences"));
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

    const theme = useContext(ThemeContext);
    const wordmarkSrc =
        theme.effectiveMode === "dark"
            ? `${PUBLIC_URL}/wordmark.svg`
            : `${PUBLIC_URL}/wordmark_light.svg`;

    return (
        <div className="bg-bg">
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
                {!(!user.signed_in && location.pathname === "/") && (
                    <div>
                        <div
                            className={
                                "max-sm:w-full sm:relative bg-blurDark fixed z-50 bottom-0 sm:bg-opacity-0 bg-opacity-80 max-sm:backdrop-blur-2xl max-sm:border-t border-divider"
                            }
                        >
                            <NavBar />
                        </div>
                        <div className="sm:hidden fixed bg-gradient-to-r to-bg from-transparent z-[1500] h-[50px] w-14 top-0 right-0 pointer-events-none" />
                        <div className={"max-sm:h-8"}>
                            <SubNavBar />
                        </div>
                    </div>
                )}
                <Routes>
                    <Route path={"/"} Component={Index} />
                    <Route path={"/arista"} Component={Arista} />
                    <Route path={"/stuyactivities"} Component={Catalog} />
                    <Route path={"/confirm-join"} Component={ConfirmJoin} />
                    <Route path={"/communications"} Component={CommsSettings} />
                    <Route path={"/preferences"} Component={UserPreferences} />
                    <Route path={"/passport"} Component={Profile} />
                    <Route path={"/create"} Component={Create} />
                    <Route path={"/charter"} Component={Charter} />
                    <Route path={"/about"} Component={AboutIndex} />
                    <Route path={"/meetings"} Component={CalendarIndex} />
                    <Route path={"/rules"} Component={Regulations} />
                    <Route path={"/archives"} Component={Archives} />
                    <Route path={"/activities-support"} Component={Support} />
                    <Route path={"/admin/*"} Component={AdminRouter} />
                    <Route path={"/:orgUrl/*"} Component={OrgRouter} />
                </Routes>
                {user.signed_in && (
                    <footer
                        className={
                            "w-full h-36 bg-layer-1 p-10 max-sm:p-6 pr-12 flex justify-between items-center mt-20 max-sm:pb-56 max-sm:flex-col gap-2"
                        }
                    >
                        <div className="w-72 flex max-sm:justify-center">
                            <img
                                src={wordmarkSrc}
                                className={
                                    "w-36 max-sm:w-28 relative bottom-0.5"
                                }
                                alt={"Epsilon"}
                            ></img>
                        </div>
                        <div
                            className={
                                "flex items-center justify-center gap-5 w-72"
                            }
                        >
                            <p className={"hover:opacity-75"}>
                                <a
                                    href={"https://github.com/stuysu/epsilon/"}
                                    className={"no-underline text-typography-2"}
                                >
                                    Source
                                </a>
                            </p>
                            <p className={"hover:opacity-75"}>
                                <a
                                    href={"https://stuysu.org/"}
                                    className={"no-underline text-typography-2"}
                                >
                                    StuySU
                                </a>
                            </p>
                            <p className={"hover:opacity-75"}>
                                <a
                                    className={"no-underline text-typography-2"}
                                    href={
                                        "https://www.figma.com/design/WfaOkjsU63VjVD1sdmSTXu/Epsilon-Design-File-Revision-1?node-id=0-1&t=xuEKneeUJMZXyrt1-1"
                                    }
                                >
                                    Design
                                </a>
                            </p>
                            <p className={"hover:opacity-75"}>
                                <a
                                    className={"no-underline text-typography-2"}
                                    href={
                                        "https://github.com/willpill/Epsilon-Press-Kit/archive/refs/heads/main.zip"
                                    }
                                >
                                    Press Kit
                                </a>
                            </p>
                        </div>
                        <p
                            className={
                                "opacity-50 w-72 text-right max-sm:text-center"
                            }
                        >
                            MMXXIV
                        </p>
                    </footer>
                )}
            </Suspense>
        </div>
    );
};

export default Pages;
