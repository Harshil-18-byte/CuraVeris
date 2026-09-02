"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showTagline?: boolean;
  theme?: "dark" | "light" | "auto";
  href?: string;
  className?: string;
}

export const LogoIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      {/* Background Rounded Container */}
      <rect width="100" height="100" rx="24" fill="#F8FAFC" />
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="97"
        rx="22.5"
        stroke="#E2E8F0"
        strokeWidth="3"
        opacity="0.8"
      />

      {/* Navy "C" path */}
      <path
        d="M51 29C42.7 29 36 35.7 36 44C36 52.3 42.7 59 51 59C54.4 59 57.5 57.9 60 56L63.8 60.8C60.3 63.5 55.9 65.2 51 65.2C39.3 65.2 29.8 55.7 29.8 44C29.8 32.3 39.3 22.8 51 22.8C56.1 22.8 60.8 24.6 64.4 27.6L60.2 32.7C57.6 30.4 54.5 29 51 29Z"
        fill="#0F1C2E"
      />

      {/* Blue "V" with Rising Arrow */}
      {/* Shadow overlap */}
      <path d="M54 44L61 36L64 39L57 47Z" fill="#0B132B" opacity="0.3" />

      {/* V Body & Arrow Head */}
      <path
        d="M53 45L60.5 55.5L74 36V43L80 34L70 32.8L73.2 37.2L61 51L56 44L53 45Z"
        fill="#2563EB"
      />
      <path
        d="M80 34L69.6 33.2L73.6 37.6L61 54.4L55.4 46.4L52.6 48L60.6 59.2L75 39.2L79 43.6L80 34Z"
        fill="#3B82F6"
      />
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = true,
  showTagline = false,
  theme = "auto",
  href,
  className = "",
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const taglineSizes = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-xs",
    xl: "text-sm",
  };

  const isLight = theme === "light"; // White text on dark bg

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSizes[size]} />
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-heading font-bold tracking-tight leading-tight ${textSizes[size]} ${
              isLight ? "text-white" : "text-text-primary"
            }`}
          >
            CuraVeris
          </span>
          {showTagline && (
            <span
              className={`font-sans font-medium tracking-normal leading-none mt-0.5 ${taglineSizes[size]} ${
                isLight ? "text-white/70" : "text-text-secondary"
              }`}
            >
              Your bills, your rights.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};
