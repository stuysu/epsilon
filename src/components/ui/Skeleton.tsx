import { CSSProperties } from "react";

type SkeletonProps = {
    className?: string;
    style?: CSSProperties;
};

const Skeleton = ({ className = "", style }: SkeletonProps) => (
    <div
        className={`animate-pulse bg-typography-3/20 ${className}`}
        style={style}
    />
);

export default Skeleton;
