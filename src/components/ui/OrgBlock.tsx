import React, { useState } from "react";
import { Link } from "react-router-dom";
import Skeleton from "./Skeleton";

type Props = {
    name?: Organization["name"];
    role?: Membership["role"];
    role_name: Membership["role_name"];
    url?: Organization["url"];
    picture: Organization["picture"];
    force?: boolean;
    // fills its grid cell instead of the fixed 11rem square
    fluid?: boolean;
};

const formatCapitals = (txt: string) => {
    return txt.slice(0, 1).toUpperCase() + txt.slice(1).toLowerCase();
};

const OrgBlock = ({
    name,
    url,
    role,
    role_name,
    picture,
    force = false,
    fluid = false,
}: Props) => {
    const box = fluid ? "w-full aspect-square" : "h-44 w-44";
    const [imgLoaded, setImgLoaded] = useState(false);
    // a broken picture shows the letter instead of an endless placeholder
    const [imgFailed, setImgFailed] = useState(false);
    const href = url ? `/${url.replace(/^\/+/, "")}` : undefined;
    const Root: React.ElementType = href ? (force ? "a" : Link) : "div";
    const rootProps = href ? (force ? { href } : { to: href }) : {};

    return (
        <Root
            className={`cursor-pointer flex flex-col no-underline text-inherit ${fluid ? "w-full min-w-0" : "w-44"}`}
            {...rootProps}
        >
            <div>
                {picture && !imgFailed ? (
                    <>
                        {!imgLoaded && (
                            <Skeleton className={`${box} rounded-[15px]`} />
                        )}
                        <div
                            className={"relative"}
                            onMouseEnter={(e) => {
                                const img =
                                    e.currentTarget.querySelector("img");
                                if (img) img.style.filter = "blur(30px)";
                            }}
                            onMouseLeave={(e) => {
                                const img =
                                    e.currentTarget.querySelector("img");
                                if (img) img.style.filter = "blur(10px)";
                            }}
                        >
                            {/*background glow*/}
                            <img
                                src={picture}
                                alt=""
                                className={box}
                                style={{
                                    display: imgLoaded ? "block" : "none",
                                    borderRadius: "15px",
                                    objectFit: "cover",
                                    opacity: "0.3",
                                    filter: "blur(10px)",
                                    transition: "filter 0.2s ease",
                                }}
                            />

                            {/*main avatar image*/}
                            <img
                                onLoad={() => setImgLoaded(true)}
                                onError={() => setImgFailed(true)}
                                src={picture}
                                alt={name}
                                className={box}
                                style={{
                                    transition: "opacity 0.5s ease 0.5s",
                                    opacity: imgLoaded ? 1 : 0,
                                    position: "absolute",
                                    bottom: "0px",
                                    zIndex: 10,
                                    borderRadius: "15px",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    </>
                ) : (
                    // fallback for no picture
                    <div
                        className={box}
                        style={{
                            containerType: "inline-size",
                            overflow: "hidden",
                            borderRadius: "15px",
                            backgroundColor: "var(--layer-secondary)",
                            color: "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <div className="as-h1 font-light text-[72cqw] leading-none">
                            {name?.charAt(0).toUpperCase()}
                        </div>
                    </div>
                )}
            </div>
            <div style={{ padding: 10, paddingTop: 10 }}>
                <h4
                    className={
                        "h-[3lh] overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]"
                    }
                >
                    {name}
                </h4>
                <p className={"important"}>
                    {role_name || formatCapitals(role || "")}
                </p>
            </div>
        </Root>
    );
};

export default OrgBlock;
