import React, {
    CSSProperties,
    FC,
    useContext,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import UserContext from "../../../contexts/UserContext";
import { useSnackbar } from "notistack";
import { ThemeContext } from "../../../contexts/ThemeProvider";
import { PUBLIC_URL, SUPPORT_EMAIL } from "../../../config/constants";
import pressable from "../../../utils/pressable";
import useOnChange from "../../../utils/useOnChange";
import {
    isOpportunitiesPath,
    isStuyActivitiesPath,
    topNavItems,
} from "../../../config/routes";
import Divider from "../Divider";
import Avatar from "../Avatar";
import useMediaQuery from "../../../utils/useMediaQuery";
import { useInvites } from "../../../contexts/InvitesProvider";
import revealOnKeyboardFocus from "../../../utils/revealOnKeyboardFocus";

// same as .px-frame in app.css
const FRAME_GUTTER = "max(3rem, calc((100% - var(--frame)) / 2))";

const linkStyle: CSSProperties = {
    color: "inherit",
    textDecoration: "none",
};

type TopNavItem = (typeof topNavItems)[number];

const itemHref = (item: TopNavItem) => ("url" in item ? item.url : item.path);

type ItemLinkProps = Omit<
    React.AnchorHTMLAttributes<HTMLAnchorElement>,
    "href"
> & { to: string; external?: boolean; focusable?: boolean };

/* a real link, so middle-click and "open in new tab" work */
const ItemLink = React.forwardRef<HTMLAnchorElement, ItemLinkProps>(
    ({ to, external, focusable = true, className = "", ...rest }, ref) => {
        const shared = {
            ...rest,
            ref,
            tabIndex: focusable ? undefined : -1,
            className: `no-underline ${className}`,
        };
        return external ? (
            <a
                {...shared}
                href={to}
                target="_blank"
                rel="noopener noreferrer"
            />
        ) : (
            <Link {...shared} to={to} />
        );
    },
);

// Menu toggles are divs, so each gets the role, focus and keys of a button
// (see utils/pressable); destinations are real links.

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

// links in an open menu have no tabindex; pressable items have tabindex 0
const MENU_ITEMS = 'a[href]:not([tabindex="-1"]), [tabindex="0"]';

// Menus close on Escape, handing focus back to their button, and once focus
// moves anywhere else, so a keyboard user never leaves one open behind them.
const useMenuDismiss = (
    open: boolean,
    close: () => void,
    menuRef: React.RefObject<HTMLElement | null>,
    triggerRef: React.RefObject<HTMLElement | null>,
    { focusFirstItem = false } = {},
) => {
    useEffect(() => {
        if (!open) return;
        // a menu placed before its button in the page would otherwise be
        // reached only by tabbing backwards
        if (focusFirstItem) {
            menuRef.current?.querySelector<HTMLElement>(MENU_ITEMS)?.focus();
        }
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                close();
                triggerRef.current?.focus();
                return;
            }
            if (!focusFirstItem) return;
            const items = Array.from(
                menuRef.current?.querySelectorAll<HTMLElement>(MENU_ITEMS) ??
                    [],
            );
            const active = document.activeElement;
            const trigger = triggerRef.current;
            let target: HTMLElement | null | undefined;
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                const index = items.indexOf(active as HTMLElement);
                if (index < 0) return;
                const step = event.key === "ArrowDown" ? 1 : -1;
                event.preventDefault();
                items[(index + step + items.length) % items.length]?.focus();
                return;
            }
            if (event.key !== "Tab") return;
            // This menu sits before its button in the page, so Tab is steered
            // to behave as if it came right after the button.
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

const FOCUS_OUTLINE =
    "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-typography-1";
const FOCUS_RING = `rounded-sm ${FOCUS_OUTLINE}`;
// marks the current page under a phone tab's icon (also when it's in "More")
const CURRENT_BAR =
    "after:absolute after:-bottom-2 after:left-1/2 after:h-0.5 after:w-3 after:-translate-x-1/2 after:rounded-full after:bg-typography-1 after:content-['']";

// pages reached from the phone "More" menu's Account section
const InviteCount = ({ count }: { count: number }) =>
    count ? (
        <span
            aria-label={`${count} pending`}
            className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue px-1.5 text-xs text-white"
        >
            {count}
        </span>
    ) : null;

const InviteDot = ({ show }: { show: boolean }) =>
    show ? (
        <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-1 -top-1 size-2.5 rounded-full bg-blue ring-2 ring-bg"
        />
    ) : null;

const ACCOUNT_PATHS = [
    "/profile",
    "/invites",
    "/preferences",
    "/communications",
];

// the phone tabs are only as tall as their icons, so their tap area reaches
// the top and bottom of the 46px bar (13px each way still fits inside it)
const PHONE_TAP_AREA =
    "max-sm:before:absolute max-sm:before:inset-x-0 max-sm:before:inset-y-[-13px] max-sm:before:content-['']";

// for the tabs, whose scroller clips anything drawn below them
const FOCUS_RING_INSET =
    "rounded-sm focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-typography-1";

const NavBar: FC = () => {
    const user = useContext(UserContext);
    const inviteCount = useInvites().invites.length;
    const { enqueueSnackbar } = useSnackbar();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const isMobile = useMediaQuery("not all and (min-width: 640px)");

    // on wider screens, the tabs that don't fit go into a "More" tab
    const [fitCount, setFitCount] = useState<number>(topNavItems.length);
    const itemsToRender = React.useMemo(
        () =>
            isMobile ? topNavItems.slice(0, 4) : topNavItems.slice(0, fitCount),
        [isMobile, fitCount],
    );
    const tabOverflow = React.useMemo(
        () => (isMobile ? [] : topNavItems.slice(fitCount)),
        [isMobile, fitCount],
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
        paddingRight: FRAME_GUTTER,
        paddingLeft: FRAME_GUTTER,
        zIndex: 50,
    };

    const itemRefs = useRef<HTMLAnchorElement[]>([]);
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
        itemRefs.current.length = itemsToRender.length;
    }, [itemsToRender.length]);

    const navRef = useRef<HTMLElement | null>(null);
    const scrollerRef = useRef<HTMLDivElement | null>(null);
    const measureRef = useRef<HTMLDivElement | null>(null);
    const tabMoreRef = useRef<HTMLDivElement | null>(null);
    const tabMenuRef = useRef<HTMLDivElement | null>(null);
    const [tabMoreOpen, setTabMoreOpen] = useState(false);
    const [tabMenuLeft, setTabMenuLeft] = useState(0);
    const closeTabMore = React.useCallback(() => setTabMoreOpen(false), []);
    useMenuDismiss(tabMoreOpen, closeTabMore, tabMenuRef, tabMoreRef);

    useLayoutEffect(() => {
        if (isMobile) return;
        const fit = () => {
            const scroller = scrollerRef.current;
            const row = containerRef.current;
            const measure = measureRef.current;
            if (!scroller || !row || !measure) return;
            const style = getComputedStyle(row);
            const gap = parseFloat(style.columnGap) || 0;
            const room =
                scroller.clientWidth -
                parseFloat(style.marginLeft) -
                parseFloat(style.marginRight);
            const widths = Array.from(measure.children).map(
                (c) => c.getBoundingClientRect().width,
            );
            const more = widths.pop() || 0;
            const all =
                widths.reduce((a, b) => a + b, 0) + gap * (widths.length - 1);
            let count = widths.length;
            if (all > room) {
                let used = more;
                count = 0;
                while (
                    count < widths.length &&
                    used + gap + widths[count] <= room
                ) {
                    used += gap + widths[count];
                    count++;
                }
            }
            setFitCount(Math.max(1, count));
        };
        fit();
        // the unseen row resizes when the web font arrives
        const observer = new ResizeObserver(fit);
        if (scrollerRef.current) observer.observe(scrollerRef.current);
        if (measureRef.current) observer.observe(measureRef.current);
        return () => observer.disconnect();
    }, [isMobile]);

    useOnChange(`${fitCount} ${location.key}`, () => setTabMoreOpen(false));

    useEffect(() => {
        if (!tabMoreOpen) return;
        const onClick = (e: MouseEvent) => {
            const target = e.target as Node;
            if (
                !tabMoreRef.current?.contains(target) &&
                !tabMenuRef.current?.contains(target)
            )
                setTabMoreOpen(false);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [tabMoreOpen]);

    // placed under the More tab as it opens, kept 16px inside the window
    useLayoutEffect(() => {
        if (!tabMoreOpen) return;
        const nav = navRef.current?.getBoundingClientRect();
        const tab = tabMoreRef.current?.getBoundingClientRect();
        const menuWidth = tabMenuRef.current?.offsetWidth || 0;
        if (nav && tab)
            setTabMenuLeft(
                Math.max(
                    0,
                    Math.min(tab.left - nav.left, nav.width - menuWidth - 16),
                ),
            );
    }, [tabMoreOpen]);
    const toggleTabMore = () => setTabMoreOpen((v) => !v);

    const [optionUnderline, setOptionUnderline] = useState({
        left: 0,
        width: 0,
    });

    const [isOrgPage, setIsOrgPage] = useState(false);
    useEffect(() => {
        // the club page is only known once the router has rendered it
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsOrgPage(!!document.querySelector("#activity-page"));
    }, [location.pathname]);

    const getActivePaths = (item: TopNavItem): string[] => [item.path];

    const isPageOptnActive = (item: TopNavItem): boolean => {
        if (!item.external && item.path === "/stuyactivities") {
            if (isOrgPage) return true;
            return isStuyActivitiesPath(location.pathname);
        }
        if (item.path === "/opportunities") {
            return isOpportunitiesPath(location.pathname);
        }
        return getActivePaths(item).includes(location.pathname);
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            enqueueSnackbar(
                `Error signing out. Contact ${SUPPORT_EMAIL} for support.`,
                {
                    variant: "error",
                },
            );
            return;
        }
        setDrawerOpen(false);
        navigate("/");
    };

    useOnChange(location.key, () => {
        setDrawerOpen(false);
        setMoreOpen(false);
    });

    useEffect(() => {
        if (!moreOpen) return;
        const onClick = (e: MouseEvent) => {
            if (!dotsRef.current) return;
            if (!dotsRef.current.contains(e.target as Node)) setMoreOpen(false);
        };
        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, [moreOpen]);

    const tabOverflowActive = tabOverflow.some(isPageOptnActive);
    const updateUnderline = React.useCallback(() => {
        if (isMobile) {
            setOptionUnderline({ left: 0, width: 0 });
            return;
        }

        const currentIndex = itemsToRender.findIndex((item) => {
            if (!item.external && item.path === "/stuyactivities") {
                return isStuyActivitiesPath(location.pathname) || isOrgPage;
            }
            if (item.path === "/opportunities") {
                return isOpportunitiesPath(location.pathname);
            }
            return getActivePaths(item).includes(location.pathname);
        });

        const parent = containerRef.current;
        const el =
            currentIndex >= 0
                ? itemRefs.current[currentIndex]
                : tabOverflowActive
                  ? tabMoreRef.current
                  : null;

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
    }, [
        location.pathname,
        isOrgPage,
        isMobile,
        itemsToRender,
        tabOverflowActive,
    ]);

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
        <nav aria-label="Main" ref={navRef} className="relative">
            {/* Mobile nav toolbox */}
            <div
                ref={moreMenuRef}
                id="nav-more-menu"
                className={`transform-gpu z-50 fixed left-2 right-2 bottom-16 rounded-lg bg-bg
    shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),0_10px_25px_rgba(0,0,0,0.5)]
    duration-200 ${
        // visible at once on open, so its first item can take focus
        moreOpen
            ? "visible opacity-100 translate-y-0 transition-[opacity,transform]"
            : "invisible pointer-events-none opacity-0 translate-y-1 transition-all"
    }`}
            >
                <div className="px-6 py-4" aria-hidden={!moreOpen}>
                    {/* overflow nav */}
                    <h5>More Tools</h5>
                    {overflowItems.map((item, idx) => (
                        <ItemLink
                            key={`${item.path}-overflow-${idx}`}
                            aria-current={
                                isPageOptnActive(item) ? "page" : undefined
                            }
                            // the current page is brighter
                            className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                isPageOptnActive(item)
                                    ? "text-typography-1"
                                    : "text-typography-2"
                            }`}
                            to={itemHref(item)}
                            external={item.external}
                            focusable={moreOpen}
                            onClick={() => {
                                setMoreOpen(false);
                                setTimeout(() => setIsHovered(false), 300);
                            }}
                        >
                            <i className={item.icon} aria-hidden="true" />
                            <span className="important">{item.label}</span>
                        </ItemLink>
                    ))}

                    <Divider />

                    <h5>Account</h5>

                    {user?.signed_in ? (
                        <>
                            <ItemLink
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
                                to="/profile"
                                focusable={moreOpen}
                                onClick={() => setMoreOpen(false)}
                            >
                                <i
                                    className="bx bx-id-card"
                                    aria-hidden="true"
                                />
                                <span className="important">Profile</span>
                            </ItemLink>

                            <ItemLink
                                aria-current={
                                    location.pathname === "/invites"
                                        ? "page"
                                        : undefined
                                }
                                className={`flex items-center gap-2 py-1 cursor-pointer sm:hover:text-typography-1 transition-colors ${FOCUS_RING} ${
                                    location.pathname === "/invites"
                                        ? "text-typography-1"
                                        : "text-typography-2"
                                }`}
                                to="/invites"
                                focusable={moreOpen}
                                onClick={() => setMoreOpen(false)}
                            >
                                <i
                                    className="bx bx-envelope-open"
                                    aria-hidden="true"
                                />
                                <span className="important">Invites</span>
                                <InviteCount count={inviteCount} />
                            </ItemLink>

                            <ItemLink
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
                                to="/preferences"
                                focusable={moreOpen}
                                onClick={() => setMoreOpen(false)}
                            >
                                <i
                                    className="bx bx-slider"
                                    aria-hidden="true"
                                />
                                <span className="important">Preferences</span>
                            </ItemLink>

                            <ItemLink
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
                                to="/communications"
                                focusable={moreOpen}
                                onClick={() => setMoreOpen(false)}
                            >
                                <i
                                    className="bx bx-envelope"
                                    aria-hidden="true"
                                />
                                <span className="important">
                                    Communications
                                </span>
                            </ItemLink>

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
                        <ItemLink
                            className={`flex items-center gap-2 py-1 cursor-pointer text-typography-2 sm:hover:text-typography-1 transition-colors ${FOCUS_RING}`}
                            to="/"
                            focusable={moreOpen}
                            onClick={() => setMoreOpen(false)}
                        >
                            <i className="bx bx-log-in" aria-hidden="true" />
                            <span className="important">Sign In</span>
                        </ItemLink>
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
                    <ItemLink
                        style={{ ...linkStyle, cursor: "pointer" }}
                        className={FOCUS_RING}
                        to="/"
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
                    </ItemLink>
                </div>

                {/* User dropdown */}
                <div className="max-sm:hidden pointer-events-auto relative flex flex-row justify-end top-1 right-0">
                    <div
                        ref={drawerTriggerRef}
                        className={`flex cursor-pointer flex-row items-center justify-center gap-2 rounded-lg bg-layer-1 pl-1.5 pr-1.5 shadow-control h-10 ${FOCUS_OUTLINE}`}
                        aria-expanded={drawerOpen}
                        aria-controls="nav-user-menu"
                        {...pressable(() => setDrawerOpen(!drawerOpen))}
                    >
                        <span className="relative">
                            <Avatar
                                style={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: 4,
                                }}
                                src={user.picture}
                            />
                            <InviteDot show={inviteCount > 0} />
                        </span>
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
                        in-data-[theme=orange]:bg-bg
                        backdrop-blur-xl shadow-prominent
                        transition-all duration-300 ${
                            drawerOpen
                                ? "translate-y-0 opacity-100"
                                : "pointer-events-none sm:-translate-y-3 translate-y-3 opacity-0"
                        }`}
                        aria-hidden={!drawerOpen}
                    >
                        {!user?.signed_in ? (
                            <ItemLink
                                style={{ fontVariationSettings: "'wght' 700" }}
                                className={`block text-[0.9rem] leading-[1.2rem] text-typography-2 cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                to="/"
                                focusable={drawerOpen}
                            >
                                <i
                                    className={
                                        "bx bx-user-circle relative top-px mr-1"
                                    }
                                ></i>
                                Sign In
                            </ItemLink>
                        ) : (
                            <>
                                <ItemLink
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`block text-[0.9rem] leading-[1.2rem] text-typography-2 cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    to="/profile"
                                    focusable={drawerOpen}
                                >
                                    Profile
                                </ItemLink>
                                <ItemLink
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`flex text-[0.9rem] leading-[1.2rem] text-typography-2 cursor-pointer items-center gap-2 transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    to="/invites"
                                    focusable={drawerOpen}
                                >
                                    Invites
                                    <InviteCount count={inviteCount} />
                                </ItemLink>
                                <ItemLink
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`block text-[0.9rem] leading-[1.2rem] text-typography-2 cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    to="/preferences"
                                    focusable={drawerOpen}
                                >
                                    Preferences
                                </ItemLink>
                                <ItemLink
                                    style={{
                                        fontVariationSettings: "'wght' 700",
                                    }}
                                    className={`block text-[0.9rem] leading-[1.2rem] text-typography-2 cursor-pointer transition-colors sm:hover:text-typography-3 ${FOCUS_RING}`}
                                    to="/communications"
                                    focusable={drawerOpen}
                                >
                                    Communications
                                </ItemLink>
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
                // its own layer above the hover backdrop
                ref={scrollerRef}
                className="relative z-41 scroll-pe-10 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {/* same tabs, unseen, to work out how many fit */}
                {!isMobile && (
                    <div className="pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden">
                        <div
                            ref={measureRef}
                            aria-hidden="true"
                            className="flex w-max text-[20px] [font-variation-settings:'wght'_700]"
                        >
                            {topNavItems.map((item) => (
                                <div
                                    key={item.path}
                                    className="flex text-nowrap"
                                >
                                    <i className={item.icon} />
                                    <span style={{ marginLeft: 3 }}>
                                        {item.label}
                                    </span>
                                </div>
                            ))}
                            <div className="flex text-nowrap">
                                <span>More</span>
                                <i className="bx bx-chevron-down" />
                            </div>
                        </div>
                    </div>
                )}
                {/* colorful backdrop */}
                {/* clipped to the row so the taller glow can't make it scroll up and down */}
                {theme.effectiveMode === "dark" && (
                    <div className="pointer-events-none absolute inset-0 z-1 overflow-hidden">
                        <div
                            className="absolute top-0 w-full h-[100px] bg-cover bg-center opacity-50 blur-[20px]"
                            style={{
                                backgroundImage: `url(${PUBLIC_URL}/textures/navigation.png)`,
                            }}
                        />
                    </div>
                )}

                <div
                    ref={containerRef}
                    className={`relative z-40 flex flex-row gap-6 text-[20px] [font-variation-settings:'wght'_700] ${
                        isMobile
                            ? "mb-3 ml-6 mr-2 mt-[14.4px] max-[359px]:ml-4 max-[359px]:gap-4"
                            : "mx-frame mt-6"
                    }`}
                >
                    {itemsToRender.map((item, index) => (
                        <ItemLink
                            key={`${item.path}${index}`}
                            ref={(el) => {
                                if (el) itemRefs.current[index] = el;
                            }}
                            // the scroller clips below the tabs, so the outline is drawn inside
                            className={`group/tab max-sm:w-full text-nowrap flex items-start flex-nowrap cursor-pointer transition-colors ${FOCUS_RING_INSET} ${PHONE_TAP_AREA} max-sm:focus-visible:outline-hidden! ${
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
                            to={itemHref(item)}
                            external={item.external}
                            onClick={() => {
                                setTimeout(() => setIsHovered(false), 300);
                                requestAnimationFrame(updateUnderline);
                            }}
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
                                className={`sm:hidden relative w-10 flex justify-center rounded max-sm:group-focus-visible/tab:outline-solid max-sm:group-focus-visible/tab:outline-2 max-sm:group-focus-visible/tab:outline-offset-2 max-sm:group-focus-visible/tab:outline-typography-1 ${
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
                        </ItemLink>
                    ))}

                    {tabOverflow.length > 0 && (
                        <div
                            ref={tabMoreRef}
                            className={`text-nowrap flex items-start cursor-pointer transition-colors ${FOCUS_RING_INSET} ${
                                tabMoreOpen ||
                                tabOverflow.some(isPageOptnActive)
                                    ? "text-typography-1"
                                    : "sm:hover:text-typography-1 text-typography-2"
                            }`}
                            onMouseEnter={() => setIsHovered(true)}
                            onFocus={revealOnKeyboardFocus}
                            aria-expanded={tabMoreOpen}
                            aria-controls="nav-tab-more-menu"
                            {...pressable(toggleTabMore)}
                            style={{ position: "relative" }}
                        >
                            <span style={{ position: "relative", bottom: 5 }}>
                                More
                            </span>
                            <i
                                aria-hidden="true"
                                className={`bx bx-chevron-down transition-transform ${
                                    tabMoreOpen ? "rotate-180" : ""
                                }`}
                            />
                        </div>
                    )}

                    {/* mobile hidden items */}
                    {isMobile && overflowItems.length > 0 && (
                        <div ref={dotsRef} className="relative">
                            <div
                                ref={moreTriggerRef}
                                className={`relative w-11 flex justify-center ${FOCUS_RING_INSET} ${PHONE_TAP_AREA} ${
                                    overflowItems.some(isPageOptnActive) ||
                                    (user?.signed_in &&
                                        ACCOUNT_PATHS.includes(
                                            location.pathname,
                                        ))
                                        ? CURRENT_BAR
                                        : ""
                                }`}
                                aria-label={
                                    inviteCount
                                        ? "More, you have invites"
                                        : "More"
                                }
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
                                <InviteDot show={inviteCount > 0} />
                            </div>
                        </div>
                    )}

                    {/* Animated underline */}
                    {!isMobile && (
                        <div
                            className="absolute bottom-0 h-px bg-typography-1 pointer-events-none transition-[left,width] duration-300 motion-reduce:transition-none"
                            style={{
                                left: optionUnderline.left + 1,
                                width: optionUnderline.width,
                            }}
                        />
                    )}
                    <div className={"max-sm:hidden min-w-3"}></div>
                </div>
            </div>

            {tabOverflow.length > 0 && (
                <div
                    ref={tabMenuRef}
                    id="nav-tab-more-menu"
                    style={{ left: tabMenuLeft }}
                    className={`absolute top-full z-50 mt-2 w-56 rounded-xl bg-bg p-2 shadow-[inset_0_0_1px_1px_rgba(255,255,255,0.15),0_10px_25px_rgba(0,0,0,0.5)] transition-[opacity,transform] duration-150 ${
                        tabMoreOpen
                            ? "visible translate-y-0 opacity-100"
                            : "invisible pointer-events-none -translate-y-1 opacity-0"
                    }`}
                >
                    {tabOverflow.map((item) => (
                        <ItemLink
                            key={item.path}
                            aria-current={
                                isPageOptnActive(item) ? "page" : undefined
                            }
                            className={`flex min-h-11 items-center gap-2 rounded-lg px-3 cursor-pointer transition-colors sm:hover:bg-layer-2 sm:hover:text-typography-1 ${FOCUS_OUTLINE} ${
                                isPageOptnActive(item)
                                    ? "text-typography-1"
                                    : "text-typography-2"
                            }`}
                            to={itemHref(item)}
                            external={item.external}
                            focusable={tabMoreOpen}
                            onClick={() => {
                                setTabMoreOpen(false);
                                setIsHovered(false);
                            }}
                        >
                            <i className={item.icon} aria-hidden="true" />
                            <span className="important">{item.label}</span>
                        </ItemLink>
                    ))}
                </div>
            )}

            {/* Divider under main nav */}
            <div
                className={
                    "max-sm:hidden relative z-45 bottom-px w-full h-px bg-divider"
                }
            />
        </nav>
    );
};

export default NavBar;
