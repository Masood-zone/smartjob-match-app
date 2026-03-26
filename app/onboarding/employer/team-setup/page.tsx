"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import { OnboardingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AsideCard,
  AvatarBadge,
  Field,
  StepHeader,
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

export default function EmployerTeamSetupPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const savedData = useEmployerOnboardingStore((state) => state.data);
  const saveStepData = useEmployerOnboardingStore(
    (state) => state.saveStepData,
  );
  const saveStepMutation = useStoreEmployerOnboardingStep();

  const methods = useForm<EmployerOnboardingValues>({
    defaultValues: savedData ?? employerOnboardingDefaultValues,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const currentTeamSize = useWatch({
    control: methods.control,
    name: "currentTeamSize",
  });
  const plannedHires = useWatch({
    control: methods.control,
    name: "plannedHires",
  });
  const workMode = useWatch({
    control: methods.control,
    name: "workMode",
  });

  const user = session?.user;

  useEffect(() => {
    if (user?.email && !methods.getValues("accountEmail")) {
      methods.setValue("accountEmail", user.email, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [methods, user?.email]);

  const persist = async () => {
    const values = methods.getValues();
    const valid = await methods.trigger([
      "currentTeamSize",
      "plannedHires",
      "teamFocus",
      "workMode",
    ]);

    if (!valid) {
      return false;
    }

    saveStepData(values);
    await saveStepMutation.mutateAsync({ stepKey: "team-setup", values });
    return true;
  };

  const handleSaveDraft = async () => {
    const saved = await persist();
    if (saved) {
      router.push("/onboarding");
      router.refresh();
    }
  };

  const handleContinue = async () => {
    const saved = await persist();
    if (saved) {
      router.push(employerRoutes.review);
      router.refresh();
      toast.success("Team setup saved");
    }
  };

  return (
    <OnboardingFrame
      currentStepKey="team-setup"
      aside={
        <div className="space-y-4">
          <AsideCard title="Size and scope" icon="groups">
            Describe how large the team is now and how quickly you expect to
            expand after onboarding.
          </AsideCard>
          <AsideCard title="Hiring mode" icon="workspaces">
            Choose the work model that best describes how your team operates.
          </AsideCard>
          <AsideCard title="Account context" icon="person">
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
              <AvatarBadge
                user={
                  user
                    ? { name: user.name, email: user.email, image: user.image }
                    : undefined
                }
                sessionPending={isPending}
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {user?.name || "Signed in user"}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {isPending
                    ? "Loading account..."
                    : user?.email || "account@qualify.app"}
                </p>
              </div>
            </div>
          </AsideCard>
        </div>
      }
    >
      <div className="space-y-8 rounded-[1.75rem] border border-[#d8d0c8]/60 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(58,48,42,0.06)] sm:p-6">
        <StepHeader
          stepLabel="Step 4 of 5"
          title="Set up your team profile"
          description="Share your current team size, expected hires, and the focus of the people you want to recruit."
          actionLabel="Save Progress"
          onAction={handleSaveDraft}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Current Team Size"
            type="number"
            placeholder="5"
            error={methods.formState.errors.currentTeamSize?.message}
            registration={methods.register("currentTeamSize", {
              required: "Current team size is required",
              valueAsNumber: true,
              min: {
                value: 1,
                message: "Enter at least 1 team member",
              },
            })}
          />
          <Field
            label="Planned Hires"
            type="number"
            placeholder="3"
            error={methods.formState.errors.plannedHires?.message}
            registration={methods.register("plannedHires", {
              required: "Planned hires is required",
              valueAsNumber: true,
              min: {
                value: 0,
                message: "Planned hires cannot be negative",
              },
            })}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant">
              Team Focus
            </label>
            <textarea
              placeholder="Operations, talent, and growth"
              rows={5}
              {...methods.register("teamFocus", {
                required: "Team focus is required",
              })}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {methods.formState.errors.teamFocus ? (
              <p className="text-xs text-destructive">
                {methods.formState.errors.teamFocus.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-on-surface-variant">
              Work Mode
            </label>
            <select
              {...methods.register("workMode", {
                required: "Work mode is required",
              })}
              className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="ONSITE">On-site</option>
              <option value="HYBRID">Hybrid</option>
              <option value="REMOTE">Remote</option>
            </select>
            {methods.formState.errors.workMode ? (
              <p className="text-xs text-destructive">
                {methods.formState.errors.workMode.message}
              </p>
            ) : null}

            <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                Step guidance
              </p>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">
                The chosen work mode helps match your company with the right job
                seekers in the dashboard.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Current team
            </p>
            <p className="mt-3 text-2xl font-semibold text-on-surface">
              {currentTeamSize || 0}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Planned hires
            </p>
            <p className="mt-3 text-2xl font-semibold text-on-surface">
              {plannedHires || 0}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Work mode
            </p>
            <p className="mt-3 text-2xl font-semibold text-on-surface">
              {workMode}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href={employerRoutes.verification}
            className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-outline-variant px-8 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
            >
              Save Progress
            </button>
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Continue to Review
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>
    </OnboardingFrame>
  );
}
