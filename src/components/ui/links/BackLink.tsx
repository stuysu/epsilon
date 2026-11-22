import { ComponentProps, MouseEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// list pages navigate with this state so their breadcrumb can go Back and keep the scroll spot
export const FROM_LIST = { fromList: true };

const BackLink = ({ onClick, ...props }: ComponentProps<typeof Link>) => {
    const location = useLocation();
    const navigate = useNavigate();
    return (
        <Link
            {...props}
            onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                onClick?.(event);
                const plain =
                    event.button === 0 &&
                    !event.metaKey &&
                    !event.ctrlKey &&
                    !event.shiftKey &&
                    !event.altKey;
                if (
                    plain &&
                    !event.defaultPrevented &&
                    (location.state as typeof FROM_LIST | null)?.fromList
                ) {
                    event.preventDefault();
                    navigate(-1);
                }
            }}
        />
    );
};

export default BackLink;
