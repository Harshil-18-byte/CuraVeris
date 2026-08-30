import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className, count = 1, ...props }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn("bg-neutral-200 animate-pulse rounded", className)}
          {...props}
        />
      ))}
    </>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        "bg-white rounded-card shadow-card border border-neutral-300 p-5 flex flex-col justify-between animate-pulse",
        className
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="w-16 h-4" />
      </div>
      <div>
        <Skeleton className="w-24 h-4 mb-2" />
        <Skeleton className="w-32 h-8" />
      </div>
    </div>
  );
};

export const SkeletonRow: React.FC<{ cols?: number; className?: string }> = ({ cols = 5, className }) => {
  return (
    <tr className={cn("border-b border-neutral-300 animate-pulse", className)}>
      <td className="p-4 w-1/4">
        <Skeleton className="h-4 w-full" />
      </td>
      <td className="p-4 w-[15%]">
        <Skeleton className="h-4 w-full" />
      </td>
      <td className="p-4 w-[15%]">
        <Skeleton className="h-4 w-full" />
      </td>
      <td className="p-4 w-[15%]">
        <Skeleton className="h-4 w-full" />
      </td>
      <td className="p-4 w-[15%] text-right">
        <Skeleton className="h-4 w-16 ml-auto" />
      </td>
    </tr>
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  width?: "sm" | "md" | "lg" | "full";
  className?: string;
}> = ({ lines = 1, width = "full", className }) => {
  const widthClass = {
    sm: "w-24",
    md: "w-48",
    lg: "w-64",
    full: "w-full",
  }[width];

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={cn("h-4", idx === lines - 1 && lines > 1 ? "w-2/3" : widthClass)}
        />
      ))}
    </div>
  );
};

