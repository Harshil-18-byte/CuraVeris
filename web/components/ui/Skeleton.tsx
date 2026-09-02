import React from "react";
import { cn } from "@/lib/utils";

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "animate-shimmer rounded-sm bg-neutral-200/70",
        className
      )}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  width?: "sm" | "md" | "lg" | "full";
  lines?: number;
  className?: string;
}> = ({ width = "md", lines = 1, className }) => {
  const widthClass =
    width === "sm"
      ? "w-16"
      : width === "md"
      ? "w-32"
      : width === "lg"
      ? "w-48"
      : "w-full";

  if (lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-3.5 rounded-sm", i === lines - 1 && width !== "full" ? widthClass : "w-full", className)}
          />
        ))}
      </div>
    );
  }

  return <Skeleton className={cn("h-3.5 rounded-sm", widthClass, className)} />;
};

export const SkeletonTitle: React.FC<{
  width?: "sm" | "md" | "lg" | "full";
  className?: string;
}> = ({ width = "md", className }) => {
  const widthClass =
    width === "sm"
      ? "w-28"
      : width === "md"
      ? "w-44"
      : width === "lg"
      ? "w-64"
      : "w-full";

  return <Skeleton className={cn("h-6 rounded-md", widthClass, className)} />;
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "p-6 rounded-lg bg-white border border-border-subtle shadow-sm space-y-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <SkeletonTitle width="sm" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <SkeletonText width="full" />
      <SkeletonText width="lg" />
      <div className="pt-2 flex items-center justify-between border-t border-border-subtle">
        <SkeletonText width="sm" />
        <Skeleton className="w-20 h-8 rounded-md" />
      </div>
    </div>
  );
};

export const SkeletonStat: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "p-5 rounded-lg bg-white border border-border-subtle shadow-sm min-h-[100px] flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <SkeletonText width="sm" />
        <Skeleton className="w-6 h-6 rounded-md" />
      </div>
      <Skeleton className="w-28 h-8 rounded-md mt-3" />
      <SkeletonText width="md" className="mt-1" />
    </div>
  );
};

export const SkeletonAvatar: React.FC<{
  size?: "sm" | "md" | "lg";
  className?: string;
}> = ({ size = "md", className }) => {
  const sizeClass =
    size === "sm" ? "w-8 h-8" : size === "md" ? "w-10 h-10" : "w-16 h-16";

  return <Skeleton className={cn("rounded-full flex-shrink-0", sizeClass, className)} />;
};

export const SkeletonBadge: React.FC<{ className?: string }> = ({ className }) => {
  return <Skeleton className={cn("w-16 h-[22px] rounded-full", className)} />;
};

export const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 5 }) => {
  return (
    <tr className="border-b border-border-subtle animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 rounded w-3/4" />
        </td>
      ))}
    </tr>
  );
};
