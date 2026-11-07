import { RefObject, useEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { Scrollbars } from "react-custom-scrollbars-2";

/* The whole site scrolls inside one Scrollbars box, which the browser doesn't
   reset when you go to another page, so opening a page kept the old scroll
   position (e.g. a meeting's attendance opened near the bottom). Start each
   newly opened page at the top; Back and Forward are left alone. */
const ScrollToTopOnNavigate = ({
    scrollbars,
}: {
    scrollbars: RefObject<Scrollbars>;
}) => {
    const { pathname } = useLocation();
    const navigationType = useNavigationType();
    const lastPath = useRef(pathname);

    useEffect(() => {
        if (pathname === lastPath.current) return;
        lastPath.current = pathname;
        if (navigationType !== "POP") scrollbars.current?.scrollToTop();
    }, [pathname, navigationType, scrollbars]);

    return null;
};

export default ScrollToTopOnNavigate;
