"use client";

import Image from "next/image";

const sizeClass = {
  xs: "h-7 w-7 text-xs",
  sm: "h-9 w-9 text-sm",
  md: "h-10 w-10 text-sm",
  lg: "h-32 w-32 text-3xl",
};

export function UserAvatar({
  name,
  profileImageUrl,
  size = "md",
  className = "",
}: {
  name: string;
  profileImageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const initials = name.slice(0, 2).toUpperCase();
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center rounded-full bg-[var(--primary)] font-bold text-white overflow-hidden ${sizeClass[size]} ${className}`}
    >
      {profileImageUrl ? (
        <Image src={profileImageUrl} alt={name} fill unoptimized className="object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
