"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { AccessPromptDialog } from "@/components/sections/auth/access-prompt-dialog";
import { useSession } from "@/lib/auth-client";

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
  );
}

export function JobSeekerAccessButton({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPendingRoute, startTransition] = useTransition();
  const { data: session, isPending } = useSession();

  const handleClick = () => {
    if (isPending || isPendingRoute) {
      return;
    }

    if (!session?.user) {
      setOpen(true);
      return;
    }

    startTransition(() => {
      router.push("/onboarding/job-seeker");
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending || isPendingRoute}
        className={className}
      >
        {isPending || isPendingRoute ? (
          <span className="inline-flex items-center gap-2">
            <Spinner />
            Checking access
          </span>
        ) : (
          children
        )}
      </button>

      <AccessPromptDialog
        open={open}
        onOpenChange={setOpen}
        title="Sign in to continue"
        description="Create an account or log back in before starting job seeker onboarding. Your profile data is saved to your account as you progress through the steps."
        loginHref="/login"
        registerHref="/register"
      />
    </>
  );
}
