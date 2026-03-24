"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { userLogout } from "@/services/auth/user-auth";

type SessionUser = {
  name?: string | null;
  image?: string | null;
  role?: "USER" | "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | string;
};

type SessionAvatarBadgeProps = {
  onNavigate?: () => void;
};

function getUserInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function getRoleLabel(role?: SessionUser["role"]) {
  if (role === "EMPLOYER") {
    return "Employer Account";
  }

  if (role === "JOB_SEEKER") {
    return "Job Seeker Account";
  }

  return "User";
}

export function SessionAvatarBadge({ onNavigate }: SessionAvatarBadgeProps) {
  const router = useRouter();
  const {
    data: session,
    isPending,
    isRefetching,
    refetch,
    error,
  } = useSession();
  const user = session?.user as SessionUser | undefined;

  const handleLogout = async () => {
    await userLogout();
    onNavigate?.();
    router.push("/login");
    router.refresh();
  };

  if (isPending) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-[#d8d0c8]/70 bg-surface/80 px-2 py-1.5 pr-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/10">
          <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-on-surface">
            Loading account
          </p>
          <p className="text-xs text-on-surface-variant">Please wait</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center gap-3 rounded-full border border-[#d8d0c8]/70 bg-surface/80 px-2 py-1.5 pr-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-destructive/10 ring-2 ring-destructive/10">
          <MaterialSymbol
            icon="error"
            className="text-[18px] text-destructive"
          />
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-on-surface">
            Session unavailable
          </p>
          <p className="text-xs text-on-surface-variant">Tap retry</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="ml-1 h-8 w-8 cursor-pointer rounded-full"
          onClick={() => refetch()}
          aria-label="Retry session"
        >
          <MaterialSymbol icon="refresh" className="text-[18px] text-primary" />
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="cursor-pointer rounded-md px-3 py-2 text-sm text-stone-600 transition-colors hover:text-primary"
      >
        Sign In
      </Link>
    );
  }

  const userInitials = getUserInitials(user.name);
  const avatarContent = user.image ? (
    <Image
      src={user.image}
      alt={user.name ? `${user.name} avatar` : "User avatar"}
      width={40}
      height={40}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
      {userInitials}
    </span>
  );

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-3 rounded-full border border-[#d8d0c8]/70 bg-surface/80 px-2 py-1.5 pr-4 shadow-sm">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/10">
          {avatarContent}
          {isRefetching ? (
            <span className="absolute inline-flex h-10 w-10 animate-pulse rounded-full bg-primary/5" />
          ) : null}
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-semibold text-on-surface">
            {user.name || "Signed in"}
          </p>
          <p className="text-xs text-on-surface-variant">
            {getRoleLabel(user.role)}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        className="cursor-pointer rounded-lg px-3 py-2 text-sm text-stone-600 transition-colors hover:text-primary"
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
}
