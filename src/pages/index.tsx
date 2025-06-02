import { PUBLIC_URL } from "../constants";
import { Helmet } from "react-helmet";
import Loading from "../comps/ui/Loading";
import UserContext from "../comps/context/UserContext";

import { Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useContext, useEffect, useState } from "react";

// Pages
import Home from "./Home";
import AllMeetings from "./AllMeetings";
import NavBar from "../comps/ui/nav/NavBar";
import About from "./About";
import Rules from "./Rules";
import ActivitiesSupport from "./ActivitiesSupport";
import { Typography } from "@mui/material";

const ModuleRouter = lazy(() => import("./modules/ModuleRouter"));
const Catalog = lazy(() => import("./Catalog"));
const Settings = lazy(() => import("./Settings"));
const Profile = lazy(() => import("./Profile"));
const Create = lazy(() => import("./Create"));
const Charter = lazy(() => import("./Charter"));
const ConfirmJoin = lazy(() => import("./ConfirmJoin"));
const Archives = lazy(() => import("./Archives"));
const OrgRouter = lazy(() => import("./orgs"));
const AdminRouter = lazy(() => import("./admin"));

const Pages = () => {
    const location = useLocation();
    const user: UserContextType = useContext(UserContext);
    const [showDesignBanner, setDesignBanner] = useState(
        localStorage.getItem("bannerClosed") !== "true",
    ); // State for banner visibility

    useEffect(() => {
        const bannerClosed = localStorage.getItem("bannerClosed");
        if (bannerClosed === "true") {
            setDesignBanner(false);
        }
    }, []);

    const handleCloseBanner = () => {
        setDesignBanner(false);
        localStorage.setItem("bannerClosed", "true");
    };

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
                        "max-sm:w-full sm:relative bg-neutral-800 fixed z-50 bottom-0 sm:bg-opacity-0 bg-opacity-80 max-sm:backdrop-blur-2xl max-sm:border-t border-neutral-700"
                    }
                >
                    <NavBar />
                </div>
                <Routes>
                    <Route path={"/"} Component={Home} />
                    <Route path={"/catalog"} Component={Catalog} />
                    <Route path={"/confirm-join"} Component={ConfirmJoin} />
                    <Route path={"/settings"} Component={Settings} />
                    <Route path={"/profile"} Component={Profile} />
                    <Route path={"/create"} Component={Create} />
                    <Route path={"/charter"} Component={Charter} />
                    <Route path={"/about"} Component={About} />
                    <Route path={"/meetings"} Component={AllMeetings} />
                    <Route path={"/rules"} Component={Rules} />
                    <Route path={"/archives"} Component={Archives} />
                    <Route
                        path={"/activities-support"}
                        Component={ActivitiesSupport}
                    />
                    <Route path={"/modules/*"} Component={ModuleRouter} />
                    <Route path={"/admin/*"} Component={AdminRouter} />
                    <Route path={"/:orgUrl/*"} Component={OrgRouter} />
                </Routes>
                {user.signed_in && (
                    <div
                        className={
                            "w-full h-36 bg-neutral-900 p-10 max-sm:p-6 pr-12 flex justify-between items-center mt-4 max-sm:pb-56 max-sm:flex-col gap-2"
                        }
                    >
                        <div className="w-48 flex max-sm:justify-center">
                            <img
                                src={`${PUBLIC_URL}/wordmark.svg`}
                                className={
                                    "w-36 max-sm:w-28 relative bottom-0.5"
                                }
                            ></img>
                        </div>
                        <div
                            className={
                                "flex items-center justify-center gap-4 w-48"
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
                        </div>
                        <Typography
                            className={
                                "opacity-50 w-48 text-right max-sm:text-center"
                            }
                        >
                            MMXXIV
                        </Typography>
                    </div>
                )}
                {showDesignBanner && (
                    <div
                        style={{ zIndex: 51 }}
                        className="fixed flex bottom-0 w-full h-12 border-t border-stone-700 bg-stone-900/85 backdrop-blur-xl items-center justify-center"
                    >
                        <p className="text-center text-gray-200 p-14">
                            We’re redesigning Epsilon! Please pardon our
                            appearance.
                        </p>
                        <button
                            onClick={handleCloseBanner}
                            className="absolute right-3"
                        >
                            <i className="bx bx-x bx-md text-gray-200"></i>
                        </button>
                    </div>
                )}
            </Suspense>
        </div>
    );
};

export default Pages;
