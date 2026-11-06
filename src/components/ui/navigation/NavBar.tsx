import React, {
    CSSProperties,
    FC,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import UserContext from "../../../contexts/UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "../../../contexts/ThemeProvider";
import { PUBLIC_URL } from "../../../config/constants";
import pressable from "../../../utils/pressable";
import { isStuyActivitiesPath, topNavItems } from "../../../config/routes";
import Divider from "../Divider";
import Avatar from "../Avatar";
import useMediaQuery from "../../../utils/useMediaQuery";
import revealOnKeyboardFocus from "../../../utils/revealOnKeyboardFocus";

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

type TopNavItem = (typeof topNavItems)[number];

// The nav is built from divs and paragraphs, so each clickable one gets the
// role, focus and keys of the control it stands for (see utils/pressable).

// The first focusable element after `anchor` in the page, skipping `skip`
const nextFocusableAfter = (
    anchor: HTMLElement | null,
    skip: HTMLElement | null,
) => {
    if (!anchor) return null;
    const focusables = Array.from(
        document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), summary, [contenteditable="true"], [tabindex]',
        ),
    ).filter(
        (element) =>
            !skip?.contains(element) &&
            element.tabIndex >= 0 &&
            // rendered, including fixed-position controls (offsetParent is null for those)
            element.getClientRects().length > 0,
    );
    return focusables.find(
        (element) =>
            anchor.compareDocumentPosition(element) &
                Node.DOCUMENT_POSITION_FOLLOWING && !anchor.contains(element),
    );
};

// Menus close on Escape, handing focus back to their button, and once focus
// moves anywhere else, so a keyboard user never leaves one open behind them.
const useMenuDismiss = (
    open: boolean,
    close: () => void,
    menuRef: React.RefObject<HTMLElement>,
    triggerRef: React.RefObject<HTMLElement>,
    { focusFirstItem = false } = {},
) => {
    useEffect(() => {
        if (!open) return;
        // a menu placed before its button in the page would otherwise be
        // reached only by tabbing backwards
        if (focusFirstItem) {
            menuRef.current
                ?.querySelector<HTMLElement>('[tabindex="0"]')
                ?.focus();
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                close();
                triggerRef.current?.focus();
                return;
            }
            if (!focusFirstItem || event.key !== "Tab") return;
            // This menu sits before its button in the page, so Tab is steered
            // to behave as if it came right after the button.
            const items = Array.from(
                menuRef.current?.querySelectorAll<HTMLElement>(
                    '[tabindex="0"]',
                ) ?? [],
            );
            const active = document.activeElement;
            const trigger = triggerRef.current;
            let target: HTMLElement | null | undefined;
            if (!event.shiftKey && active === trigger) target = items[0];
            if (event.shiftKey && active === items[0]) target = trigger;
            if (!event.shiftKey && active === items[items.length - 1]) {
                target = nextFocusableAfter(trigger, menuRef.current);
                close();
            }
            if (target) {
                event.preventDefault();
                target.focus();
            }
        };
        const onFocusIn = (event: FocusEvent) => {
            const target = event.target as Node;
            if (
                !menuRef.current?.contains(target) &&
                !triggerRef.current?.contains(target)
            ) {
                close();
            }
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("focusin", onFocusIn);
        const menu = menuRef.current;
        const trigger = triggerRef.current;
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("focusin", onFocusIn);
            // closing after an item was chosen would leave focus on a hidden item
            if (menu?.contains(document.activeElement)) trigger?.focus();
        };
    }, [open, close, menuRef, triggerRef, focusFirstItem]);
};

const FOCUS_RING =
    "rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1";
// marks the current page under a phone tab's icon (also when it's in "More")
const CURRENT_BAR =
    "after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-full after:bg-typography-1 after:content-['']";

// the underline under the current page's label in the menus
const CURRENT_LABEL = "underline decoration-2 underline-offset-4";
// pages reached from the phone "More" menu's Account section
const ACCOUNT_PATHS = ["/profile", "/preferences", "/communications"];

// the phone tabs are only as tall as their icons, so their tap area reaches
// the top and bottom of the 46px bar (13px each way still fits inside it)
const PHONE_TAP_AREA =
    "max-sm:before:absolute max-sm:before:inset-x-0 max-sm:before:-inset-y-[13px] max-sm:before:content-['']";

// for the tabs, whose scroller clips anything drawn below them
const FOCUS_RING_INSET =
    "rounded focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1";

const NavBar: FC = () => {
    const user = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const isMobile = useMediaQuery("not all and (min-width: 640px)");

    const itemsToRender = React.useMemo(
        () => (isMobile ? topNavItems.slice(0, 4) : topNavItems),
        [isMobile],
    );

    const overflowItems = React.useMemo(
        () => (isMobile ? topNavItems.slice(4) : []),
        [isMobile],
    );

    const wordmarkSrc =
        theme.effectiveMode === "dark"
            ? `${PUBLIC_URL}/wordmark.svg`
            : `${PUBLIC_URL}/wordmark_light.svg`;

    const titleStyle: CSSProperties = {
        color: "inherit",
        fontSize: "25px",
        bottom: "2px",
        right: "10px",
        position: "relative",
        height: "100%",
        display: isMobile ? "none" : "flex",
        alignItems: "center",
        justifyContent: "center",
    };

    const topStyle: CSSProperties = {
        width: "100%",
        height: "50px",
        top: "5px",
        pointerEvents: "none",
        position: isMobile ? "absolute" : "relative",
        justifyContent: "space-between",
        display: "flex",
        alignItems: "center",
        paddingRight: "3rem",
        paddingLeft: "3rem",
        zIndex: 50,
    };

    const itemRefs = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const dotsRef = useRef<HTMLDivElement | null>(null);

    const [moreOpen, setMoreOpen] = useState(false);
    const moreMenuRef = useRef<HTMLDivElement | null>(null);
    const moreTriggerRef = useRef<HTMLDivElement | null>(null);
    const drawerRef = useRef<HTMLDivElement | null>(null);
    const drawerTriggerRef = useRef<HTMLDivElement | null>(null);
    const closeMore = React.useCallback(() => setMoreOpen(false), []);
    const closeDrawer = React.useCallback(() => setDrawerOpen(false), []);
    useMenuDismiss(moreOpen, closeMore, moreMenuRef, moreTriggerRef, {
        focusFirstItem: true,
    });
    useMenuDismiss(drawerOpen, closeDrawer, drawerRef, drawerTriggerRef);

    // the hover backdrop covers the page, so Escape clears it too
    useEffect(() => {
        if (!isHovered) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setIsHovered(false);
        };
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isHovered]);

    useEffect(() => {
        itemRefs.current = new Array(itemsToRender.length);
    }, [itemsToRender.length]);

    const [optionUnderline, setOptionUnderline] = useState({
        left: 0,
        width: 0,
    });

    const [isOrgPage, setIsOrgPage] = useState(false);
    useEffect(() => {
        setIsOrgPage(!!document.querySelector("#activity-page"));
    }, [location.pathname]);

    const getActivePaths = (item: TopNavItem): string[] => [item.path];

    const isPageOptnActive = (item: TopNavItem): boolean => {
        if (!item.external && item.path === "/stuyactivities") {
            if (isOrgPage) return true;
            return isStuyActivitiesPath(location.pathname);
        }
        return getActivePaths(item).includes(location.pathname);
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            enqueueSnackbar(
                "Error signing out. Contact it@stuysu.org for support.",
                {
                    variant: "error",
                },
            );
            return;
        }
        setDrawerOpen(false);
        navigate("/");
    };

    useEffect(() => {
        setDrawerOpen(false);
        setMoreOpen(false);
    }, [location]);

    useEffect(() => {
        if (!moreOpen) return;
        const onClick = (e: MouseEvent) => {
            if (!dotsRef.current) return;
            if (!dotsRef.current.contains(e.target as Node)) setMoreOpen(false);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [moreOpen]);

    const updateUnderline = React.useCallback(() => {
        if (isMobile) {
            setOptionUnderline({ left: 0, width: 0 });
            return;
        }

        const currentIndex = itemsToRender.findIndex((item) => {
            if (!item.external && item.path === "/stuyactivities") {
                return isStuyActivitiesPath(location.pathname) || isOrgPage;
            }
            return getActivePaths(item).includes(location.pathname);
        });

        const parent = containerRef.current;
        const el = currentIndex >= 0 ? itemRefs.current[currentIndex] : null;

        if (!parent || !el) {
            setOptionUnderline({ left: 0, width: 0 });
            return;
        }

        const parentRect = parent.getBoundingClientRect();
        const rect = el.getBoundingClientRect();

        setOptionUnderline({
            left: rect.left - parentRect.left,
            width: rect.width,
        });
    }, [location.pathname, isOrgPage, isMobile, itemsToRender]);

    useLayoutEffect(() => {
        const raf = requestAnimationFrame(updateUnderline);

        const onResize = () => requestAnimationFrame(updateUnderline);
        const onPageShow = () => requestAnimationFrame(updateUnderline);
        window.addEventListener("resize", onResize);
        window.addEventListener("pageshow", onPageShow);
        document?.fonts?.ready?.then?.(() =>
            requestAnimationFrame(updateUnderline),
        );
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("pageshow", onPageShow);
        };
    }, [updateUnderline, isMobile]);

    if (!user?.signed_in && location.pathname === "/")
        return <div className="h-5" />;

    return (
        <nav aria-label="Main">
            {/* Mobile nav toolbox */}
            <div
                ref={moreMenuRef}
                id="nav-more-menu"
                className={`transform-gpu z-50 fixed left-2 right-2 bottom-16 rounded-lg bg-bg
    shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),_0_10px_25px_rgba(0,0,0,0.5)]
    transition-all duration-200 ${
        moreOpen
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-1"
    }`}
            >
                <div className="px-6 py-4" aria-hidden={!moreOpen}>
                    {/* overflow nav */}
                    <h5>More Tools</h5>
                    {overflowItems.map((item, idx) => (
                        <div
                            key={`${item.path}-overflow-${idx}`}
                            aria-current={
                                isPageOptnActive(item) ? "page" : undefined
                            }
                            // the current page is brighter and underlined here too
                            className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                isPageOptnActive(item)
                                    ? "text-typography-1"
                                    : "text-typography-2"
                            }`}
                            {...pressable(
                                () => {
                                    if (item.external && (item as any).url) {
                                        window.open(
                                            (item as any).url!,
                                            "_blank",
                                            "noopener",
                                        );
                                    } else {
                                        navigate(item.path);
                                    }
                                    setMoreOpen(false);
                                    setTimeout(() => setIsHovered(false), 300);
                                },
                                { role: "link", focusable: moreOpen },
                            )}
                        >
                            <i className={item.icon} aria-hidden="true" />
                            <span
                                className={`important ${isPageOptnActive(item) ? CURRENT_LABEL : ""}`}
                            >
                                {item.label}
                            </span>
                        </div>
                    ))}

                    <Divider />

                    <h5>Account</h5>

                    {user?.signed_in ? (
                        <>
                            <div
                                aria-current={
                                    location.pathname === "/profile"
                                        ? "page"
                                        : undefined
                                }
                                className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                    location.pathname === "/profile"
                                        ? "text-typography-1"
                                        : "text-typography-2"
                                }`}
                                {...pressable(
                                    () => {
                                        navigate("/profile");
                                        setMoreOpen(false);
                                    },
                                    { role: "link", focusable: moreOpen },
                                )}
                            >
                                <i
                                    className="bx bx-id-card"
                                    aria-hidden="true"
                                />
                                <span
                                    className={`important ${location.pathname === "/profile" ? CURRENT_LABEL : ""}`}
                                >
                                    Profile
                                </span>
                            </div>

                            <div
                                aria-current={
                                    location.pathname === "/preferences"
                                        ? "page"
                                        : undefined
                                }
                                className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                    location.pathname === "/preferences"
                                        ? "text-typography-1"
                                        : "text-typography-2"
                                }`}
                                {...pressable(
                                    () => {
                                        navigate("/preferences");
                                        setMoreOpen(false);
                                    },
                                    { role: "link", focusable: moreOpen },
                                )}
                            >
                                <i
                                    className="bx bx-slider"
                                    aria-hidden="true"
                                />
                                <span
                                    className={`important ${location.pathname === "/preferences" ? CURRENT_LABEL : ""}`}
                                >
                                    Preferences
                                </span>
                            </div>

                            <div
                                aria-current={
                                    location.pathname === "/communications"
                                        ? "page"
                                        : undefined
                                }
                                className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                    location.pathname === "/communications"
                                        ? "text-typography-1"
                                        : "text-typography-2"
                                }`}
                                {...pressable(
                                    () => {
                                        navigate("/communications");
                                        setMoreOpen(false);
                                    },
                                    { role: "link", focusable: moreOpen },
                                )}
                            >
                                <i
                                    className="bx bx-envelope"
                                    aria-hidden="true"
                                />
                                <span
                                    className={`important ${location.pathname === "/communications" ? CURRENT_LABEL : ""}`}
                                >
                                    Communications
                                </span>
                            </div>

                            <div
                                className={`flex items-center gap-2 py-1 cursor-pointer text-red sm:hover:brightness-90 transition-[filter,color] ${FOCUS_RING}`}
                                {...pressable(
                                    () => {
                                        signOut();
                                        setMoreOpen(false);
                                    },
                                    { focusable: moreOpen },
                                )}
                            >
                                <i
                                    className="bx bx-log-out"
                                    aria-hidden="true"
                                />
                                <span className="important">Sign Out</span>
                            </div>
                        </>
                    ) : (
                        <div
                            className={`flex items-center gap-2 py-1 cursor-pointer text-typography-2 sm:hover:text-typography-1 transition-colors ${FOCUS_RING}`}
                            {...pressable(
                                () => {
                                    navigate("/");
                                    setMoreOpen(false);
                                },
                                { role: "link", focusable: moreOpen },
                            )}
                        >
                            <i className="bx bx-log-in" aria-hidden="true" />
                            <span className="important">Sign In</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Backdrop when hovering over nav items */}
            <div
                className={`max-sm:hidden bg-blurDark fixed left-0 top-0 z-40 h-full w-full backdrop-blur-2xl transition-opacity duration-300 ${
                    isHovered ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
            />

            {/* Top items — logo & user dropdown menu */}
            <div style={topStyle}>
                {/* Logo / Wordmark */}
                <div style={titleStyle}>
                    <span
                        style={{ ...linkStyle, cursor: "pointer" }}
                        className={FOCUS_RING}
                        {...pressable(() => navigate("/"), { role: "link" })}
                    >
                        <img
                            src={wordmarkSrc}
                            alt="Epsilon"
                            style={{
                                marginTop: 14,
                                maxWidth: 100,
                                height: "auto",
                                position: "relative",
                                zIndex: 1,
                            }}
                        />
                    </span>
                </div>

                {/* User dropdown */}
                <div className="max-sm:hidden pointer-events-auto relative flex flex-row justify-end top-1 right-0">
                    <div
                        ref={drawerTriggerRef}
                        className={`flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-layer-1 pl-1.5 pr-1.5 shadow-control h-10 ${FOCUS_RING}`}
                        aria-expanded={drawerOpen}
                        aria-controls="nav-user-menu"
                        {...pressable(() => setDrawerOpen(!drawerOpen))}
                    >
                        <Avatar
                            style={{ width: 30, height: 30, borderRadius: 4 }}
                            src={user.picture}
                        />
                        <p className="pr-2">
                            {user?.signed_in
                                ? `${user.first_name} ${user.last_name}`
                                : "Guest"}
                        </p>
                        <i
                            className={`text-typography-2 bx bx-chevron-down bx-sm inline-block pr-1 transition-transform duration-200 ${
                                drawerOpen ? "bx-flip-vertical" : ""
                            }`}
                            aria-hidden="true"
                        />
                    </div>

                    {/* User Drawer */}
                    <div
                        ref={drawerRef}
                        id="nav-user-menu"
                        className={`absolute top-14 bottom-auto right-auto
                        z-50 flex w-72 flex-col gap-2 rounded-xl bg-blurDark p-5
                        [[data-theme=orange]_&]:bg-bg
                        backdrop-blur-xl shadow-prominent
                        transition-all duration-300 ${
                            drawerOpen
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none sm:-translate-y-3 translate-y-3 opacity-0"
                        }`}
                        aria-hidden={!drawerOpen}
                    >
                        {!user?.signed_in ? (
                            <p
                                style={{ fontVariationSettings: "'wght' 700" }}
                                className={`cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                {...pressable(() => navigate("/"), {
                                    role: "link",
                                    focusable: drawerOpen,
                                })}
                            >
                                <i
                                    className={
                                        "bx bx-user-circle relative top-px mr-1"
                                    }
                                ></i>
                                Sign In
                            </p>
                        ) : (
                            <>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    {...pressable(() => navigate("/profile"), {
                                        role: "link",
                                        focusable: drawerOpen,
                                    })}
                                >
                                    Profile
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    {...pressable(
                                        () => navigate("/preferences"),
                                        {
                                            role: "link",
                                            focusable: drawerOpen,
                                        },
                                    )}
                                >
                                    Preferences
                                </p>
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    {...pressable(
                                        () => navigate("/communications"),
                                        {
                                            role: "link",
                                            focusable: drawerOpen,
                                        },
                                    )}
                                >
                                    Communications
                                </p>
                                <Divider />
                                <p
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`cursor-pointer transition-[filter] text-red sm:hover:brightness-75 ${FOCUS_RING}`}
                                    {...pressable(signOut, {
                                        focusable: drawerOpen,
                                    })}
                                >
                                    Sign Out
                                </p>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Top-level tabs */}
            <div
                onMouseLeave={() => setIsHovered(false)}
                // its own layer above the hover backdrop, since the fade's mask would
                // otherwise sink the tabs under it and swallow clicks
                className="relative z-[41] scroll-pe-10 sm:max-[1099px]:[mask-image:linear-gradient(to_right,black_calc(100%-32px),transparent)] overflow-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* colorful backdrop */}
                {theme.effectiveMode === "dark" && (
                    <div
                        className="absolute top-0 w-full h-[100px] bg-cover bg-center pointer-events-none opacity-50 blur-[20px] z-[1]"
                        style={{
                            backgroundImage: `url(${PUBLIC_URL}/textures/navigation.png)`,
                        }}
                    />
                )}

                <div
                    ref={containerRef}
                    className={`relative z-40 flex flex-row gap-6 text-[20px] [font-variation-settings:'wght'_700] ${
                        isMobile ? "mb-3 ml-6 mr-2 mt-[14.4px]" : "mx-12 mt-6"
                    }`}
                >
                    {itemsToRender.map((item, index) => (
                        <div
                            key={`${item.path}${index}`}
                            ref={(el) => {
                                if (el) itemRefs.current[index] = el;
                            }}
                            // the scroller clips below the tabs, so the outline is drawn inside
                            className={`group/tab max-sm:w-full text-nowrap flex items-start flex-nowrap cursor-pointer transition-colors ${FOCUS_RING_INSET} ${PHONE_TAP_AREA} max-sm:focus-visible:!outline-none ${
                                isPageOptnActive(item)
                                    ? "text-typography-1"
                                    : "sm:hover:text-typography-1 text-typography-2"
                            }`}
                            onMouseEnter={() => setIsHovered(true)}
                            // browsers leave a partly visible tab where it is, so
                            // bring it clear of the faded edge
                            onFocus={revealOnKeyboardFocus}
                            // the label is hidden on phones, so name the link here
                            aria-label={item.label}
                            aria-current={
                                isPageOptnActive(item) ? "page" : undefined
                            }
                            {...pressable(
                                () => {
                                    if (item.external && (item as any).url) {
                                        window.open(
                                            (item as any).url!,
                                            "_blank",
                                            "noopener",
                                        );
                                    } else {
                                        navigate(item.path);
                                    }
                                    setTimeout(() => setIsHovered(false), 300);
                                    requestAnimationFrame(updateUnderline);
                                },
                                { role: "link" },
                            )}
                            style={{ position: "relative" }}
                        >
                            <i
                                className={`${item.icon} max-sm:hidden`}
                                aria-hidden="true"
                            ></i>
                            {/* phones have no sliding underline, so a bar marks
                                the current page as well as its brighter colour */}
                            <div
                                // on phones the focus ring and current-page bar sit on
                                // this icon slot rather than the stretched tab
                                className={`sm:hidden relative w-10 flex justify-center rounded max-sm:group-focus-visible/tab:outline max-sm:group-focus-visible/tab:outline-2 max-sm:group-focus-visible/tab:outline-offset-2 max-sm:group-focus-visible/tab:outline-typography-1 ${
                                    isPageOptnActive(item) ? CURRENT_BAR : ""
                                }`}
                            >
                                <i
                                    className={`${item.icon} scale-125`}
                                    aria-hidden="true"
                                ></i>
                            </div>
                            {!isMobile && (
                                <span
                                    style={{
                                        marginLeft: 3,
                                        position: "relative",
                                        bottom: 5,
                                    }}
                                >
                                    {item.label}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* mobile hidden items */}
                    {isMobile && overflowItems.length > 0 && (
                        <div ref={dotsRef} className="relative">
                            <div
                                ref={moreTriggerRef}
                                className={`relative w-10 flex justify-center ${FOCUS_RING_INSET} ${PHONE_TAP_AREA} ${
                                    overflowItems.some(isPageOptnActive) ||
                                    ACCOUNT_PATHS.includes(location.pathname)
                                        ? CURRENT_BAR
                                        : ""
                                }`}
                                aria-label="More"
                                aria-expanded={moreOpen}
                                aria-controls="nav-more-menu"
                                {...pressable(() => setMoreOpen((v) => !v))}
                            >
                                <i
                                    className={`bx bx-dots-horizontal-rounded scale-150 ${
                                        moreOpen
                                            ? "text-typography-1"
                                            : "text-typography-2"
                                    }`}
                                    aria-hidden="true"
                                ></i>
                            </div>
                        </div>
                    )}

                    {/* Animated underline */}
                    {!isMobile && (
                        <div
                            className="absolute bottom-0 h-px bg-typography-1 pointer-events-none transition-[left,width] duration-300"
                            style={{
                                left: optionUnderline.left + 1,
                                width: optionUnderline.width,
                            }}
                        />
                    )}
                    <div className={"max-sm:hidden min-w-3"}></div>
                </div>
            </div>

            {/* Divider under main nav */}
            <div
                className={
                    "max-sm:hidden relative z-[45] bottom-px w-full h-px bg-divider"
                }
            />
        </nav>
    );
};

export default NavBar;
