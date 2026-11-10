import { CSSProperties } from "react";

type SkeletonProps = {
    className?: string;
    style?: CSSProperties;
};

const Skeleton = ({ className = "", style }: SkeletonProps) => (
    <div
        className={`motion-safe:animate-pulse bg-layer-2 ${className}`}
        style={style}
    />
);

export default Skeleton;
