import React, { FC, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../../contexts/UserContext";
import { isStuyActivitiesPath } from "../../../config/routes";
import useMediaQuery from "../../../utils/useMediaQuery";

const STUY_ACTIVITIES_ITEMS = [
    { label: "Catalog", path: "/stuyactivities" },
    { label: "Charter", path: "/charter" },
    { label: "Regulations", path: "/rules" },
    { label: "Archives", path: "/archives" },
    { label: "Support", path: "/activities-support" },
];

const SubNavBar: FC = () => {
    const user = useContext(UserContext);
    const isMobile = useMediaQuery("(max-width: 640px)");
    const navigate = useNavigate();
    const location = useLocation();

    const isOnStuyActivitiesPage = isStuyActivitiesPath(location.pathname);
    if (!isOnStuyActivitiesPage) return null;

    return (
        <div
            className="max-sm:pb-3 max-[1099px]:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)]"
            style={{
                overflowX: "scroll",
                scrollbarWidth: "none",
                position: isMobile ? "fixed" : "relative",
                top: isMobile ? 0 : undefined,
                left: isMobile ? 0 : undefined,
                backgroundColor: isMobile ? "var(--blur-dark)" : undefined,
                width: isMobile ? "100%" : undefined,
                zIndex: isMobile ? 1000 : undefined,
                borderBottom: isMobile
                    ? "1px solid rgba(255,255,255,0.1)"
                    : undefined,
                backdropFilter: isMobile ? "blur(30px)" : undefined,
            }}
        >
            <div
                className={`relative z-[2] flex flex-row gap-6 ${
                    isMobile ? "ml-4 mt-3" : "ml-12 mt-4"
                }`}
            >
                {STUY_ACTIVITIES_ITEMS.map(({ label, path }) => (
                    <p
                        key={path}
                        className="cursor-pointer transition-opacity whitespace-nowrap important text-typography-1"
                        onClick={() => navigate(path)}
                        style={{
                            opacity: location.pathname === path ? 1 : 0.5,
                        }}
                    >
                        {label}
                    </p>
                ))}

                {user.permission && (
                    <div
                        onClick={() => navigate("/admin")}
                        className="inline-flex cursor-pointer whitespace-nowrap gap-1 text-yellow"
                    >
                        <i className="bx bx-shield pt-px" />
                        <p className="cursor-pointer whitespace-nowrap important text-yellow">
                            Admin Panel
                        </p>
                    </div>
                )}
                <div className="min-w-4" />
            </div>
        </div>
    );
};

export default SubNavBar;
