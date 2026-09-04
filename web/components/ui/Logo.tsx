"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showTagline?: boolean;
  theme?: "dark" | "light" | "auto";
  href?: string;
  className?: string;
  useImage?: boolean;
}

export const SparkleIcon: React.FC<{ className?: string; size?: number }> = ({
  className = "text-[#0F1C2E]",
  size = 12,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    className={`inline-block ${className}`}
  >
    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
  </svg>
);

export const LogoVectorIcon: React.FC<{ size?: number; className?: string }> = ({
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
      {/* Background Rounded Squircle */}
      <rect width="100" height="100" rx="24" fill="#F4F3EF" />
      <rect
        x="1"
        y="1"
        width="98"
        height="98"
        rx="23"
        stroke="#E2E0D8"
        strokeWidth="2"
      />

      {/* Navy "C" path */}
      <path
        d="M51 28C41.5 28 34 35.5 34 45C34 54.5 41.5 62 51 62C54.8 62 58.2 60.8 61 58.6L64.8 63.6C60.8 66.8 56.1 68.5 51 68.5C38 68.5 27.5 58 27.5 45C27.5 32 38 21.5 51 21.5C56.5 21.5 61.6 23.4 65.5 26.8L61 32.2C58.2 29.6 54.8 28 51 28Z"
        fill="#0F1C2E"
      />

      {/* Blue "V" with Rising Arrow */}
      <path d="M54 44L61 36L64 39L57 47Z" fill="#0B132B" opacity="0.25" />
      <path
        d="M50 47L58.5 60L74.5 36V43.5L81 33.5L70 32.2L73.5 37L60 52.5L54.5 44.5L50 47Z"
        fill="#2563EB"
      />
      <path
        d="M81 33.5L69.6 32.5L73.8 37.2L60 55L53.8 45.8L50.5 47.8L59.2 61L75.5 39.5L79.8 44.2L81 33.5Z"
        fill="#3B82F6"
      />
    </svg>
  );
};

export const LogoIcon: React.FC<{
  size?: number;
  className?: string;
  fallbackSvg?: boolean;
}> = ({ size = 32, className = "", fallbackSvg = false }) => {
  const [imgError, setImgError] = useState(false);

  if (fallbackSvg || imgError) {
    return <LogoVectorIcon size={size} className={className} />;
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={`relative flex-shrink-0 inline-flex items-center justify-center overflow-hidden rounded-[22%] shadow-[0_2px_8px_rgba(0,0,0,0.06)] bg-[#F5F4F0] ${className}`}
    >
      <Image
        src="/logo.png"
        alt="CuraVeris"
        width={size}
        height={size}
        priority
        className="object-contain w-full h-full transform transition-transform duration-200 hover:scale-105"
        onError={() => setImgError(true)}
      />
    </div>
  );
};

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  showWordmark = true,
  showTagline = false,
  theme = "auto",
  href,
  className = "",
  useImage = true,
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

  // Default to white text on dark background
  const isDarkOnLight = theme === "dark"; // dark text on white surface
  const isWhiteText = theme === "light" || theme === "auto"; // crisp white text on black/dark theme

  const content = (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={iconSizes[size]} fallbackSvg={!useImage} />
      {showWordmark && (
        <div className="flex flex-col">
          <span
            className={`font-heading font-extrabold tracking-tight leading-tight ${textSizes[size]} ${
              isWhiteText ? "text-white" : "text-[#0F1C2E]"
            }`}
          >
            CuraVeris
          </span>
          {showTagline && (
            <span
              className={`font-sans font-semibold tracking-tight leading-none mt-0.5 flex items-center gap-1.5 ${taglineSizes[size]} ${
                isWhiteText ? "text-slate-400" : "text-[#0F1C2E]/80"
              }`}
            >
              <span>Your bill. Your rights.</span>
              <SparkleIcon
                size={size === "sm" ? 9 : size === "xl" ? 14 : 11}
                className={isWhiteText ? "text-blue-400" : "text-brand-accent"}
              />
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="hover:opacity-95 transition-opacity inline-flex">
        {content}
      </Link>
    );
  }

  return content;
};
