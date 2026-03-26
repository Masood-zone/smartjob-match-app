"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { userLogout } from "@/services/auth/user-auth";

type SessionUser = {
  name?: string | null;
  image?: string | null;
  role?: "USER" | "JOB_SEEKER" | "EMPLOYER" | "ADMIN" | string;
  email?: string | null;
};

type SessionAvatarBadgeProps = {
  onNavigate?: () => void;
  mobile?: boolean;
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

function getDashboardHref(role?: SessionUser["role"]) {
  if (role === "EMPLOYER") {
    return "/onboarding/employer/dashboard";
  }

  if (role === "JOB_SEEKER") {
    return "/onboarding/job-seeker/dashboard";
  }

  return "/onboarding";
}

export function SessionAvatarBadge({
  onNavigate,
  mobile,
}: SessionAvatarBadgeProps) {
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

  if (mobile) {
    if (!user) {
      return (
        <div className="rounded-[1.3rem] border border-[#d8d0c8]/70 bg-white/80 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MaterialSymbol icon="person" className="text-[22px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-on-surface">
                Sign in to continue
              </p>
              <p className="mt-1 text-sm text-on-surface-variant">
                Access your dashboard, save progress, and pick up where you left
                off.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/login"
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              onClick={onNavigate}
              className="inline-flex items-center justify-center rounded-xl border border-[#d8d0c8]/70 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-primary/40 hover:text-primary"
            >
              Create account
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="rounded-[1.3rem] border border-[#d8d0c8]/70 bg-white/80 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 ring-2 ring-primary/10">
            <Avatar
              size="default"
              className="h-12 w-12 border-0 bg-transparent"
            >
              <AvatarImage
                src={user.image || undefined}
                alt={user.name ? `${user.name} avatar` : "User avatar"}
              />
              <AvatarFallback className="bg-transparent text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                {getUserInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-on-surface">
              {user.name || "Signed in"}
            </p>
            <p className="text-xs text-on-surface-variant">
              {getRoleLabel(user.role)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              router.push(dashboardHref);
            }}
            className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Open dashboard
          </button>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              router.push("/onboarding");
            }}
            className="inline-flex items-center justify-center rounded-xl border border-[#d8d0c8]/70 px-4 py-3 text-sm font-semibold text-stone-700 transition-colors hover:border-primary/40 hover:text-primary"
          >
            Onboarding hub
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Link
          href="/login"
          className="hidden cursor-pointer rounded-md px-3 py-2 text-sm text-stone-600 transition-colors hover:text-primary sm:inline-flex"
        >
          Sign In
        </Link>
        <Link
          href="/login"
          aria-label="Sign in"
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#d8d0c8]/70 bg-surface/80 p-2 text-stone-600 shadow-sm transition-colors hover:border-primary/40 hover:text-primary sm:hidden"
        >
          <MaterialSymbol icon="login" className="text-[18px]" />
        </Link>
      </>
    );
  }

  const userInitials = getUserInitials(user.name);
  const dashboardHref = getDashboardHref(user.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-3 rounded-full border border-[#d8d0c8]/70 bg-surface/80 px-2 py-1.5 pr-4 shadow-sm outline-none transition-colors hover:border-primary/40">
        <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-2 ring-primary/10">
          <Avatar size="default" className="h-10 w-10 border-0 bg-transparent">
            <AvatarImage
              src={user.image || undefined}
              alt={user.name ? `${user.name} avatar` : "User avatar"}
            />
            <AvatarFallback className="bg-transparent text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {userInitials}
            </AvatarFallback>
          </Avatar>
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
        <MaterialSymbol
          icon="keyboard_arrow_down"
          className="text-[18px] text-on-surface-variant"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72">
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-on-surface">
                {user.name || "Signed in"}
              </p>
              <p className="text-xs text-on-surface-variant">
                {user.email || "account@qualify.app"}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(dashboardHref)}>
          <MaterialSymbol icon="dashboard" className="text-[16px]" />
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/onboarding")}>
          <MaterialSymbol icon="route" className="text-[16px]" />
          Onboarding hub
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/resources")}>
          <MaterialSymbol icon="help" className="text-[16px]" />
          Help center
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleLogout()}
          variant="destructive"
        >
          <MaterialSymbol icon="logout" className="text-[16px]" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
