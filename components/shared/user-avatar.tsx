"use client";

import { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "size-6 text-[9px]",
  default: "size-8 text-xs",
  lg: "size-10 text-sm",
};

interface UserAvatarProps {
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function UserAvatar({ size = "default", className }: UserAvatarProps) {
  const { user } = useAuth();
  const [imgError, setImgError] = useState(false);
  const initials = (user?.displayName || "U").charAt(0).toUpperCase();
  const photoURL = user?.photoURL;

  return (
    <div
      className={cn(
        "rounded-full shrink-0 overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange to-orange-light",
        sizeClasses[size],
        className
      )}
    >
      {photoURL && !imgError ? (
        <img
          src={photoURL}
          alt={user?.displayName || "User"}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="size-full object-cover"
        />
      ) : (
        <span className="font-bold text-white">{initials}</span>
      )}
    </div>
  );
}
