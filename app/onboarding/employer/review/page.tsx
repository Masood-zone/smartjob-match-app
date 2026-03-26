"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import { OnboardingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AsideCard,
  AvatarBadge,
  StepHeader,
  SummaryCard,
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

export default function EmployerReviewPage() {
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

  const values = useWatch({ control: methods.control });

  const user = session?.user;

  useEffect(() => {
    if (user?.email && !methods.getValues("accountEmail")) {
      methods.setValue("accountEmail", user.email, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [methods, user?.email]);

  const persist = async (accepted: boolean) => {
    const values = methods.getValues();
    methods.setValue("accepted", accepted, {
      shouldDirty: true,
      shouldTouch: true,
    });
    const valid = await methods.trigger(["accepted"]);

    if (!valid) {
      return false;
    }

    const payload = { ...values, accepted };
    saveStepData(payload);
    await saveStepMutation.mutateAsync({ stepKey: "review", values: payload });
    return true;
  };

  const handleSaveDraft = async () => {
    const saved = await persist(false);
    if (saved) {
      router.push("/onboarding");
      router.refresh();
    }
  };

  const handleSubmit = async () => {
    const saved = await persist(true);
    if (saved) {
      router.push(employerRoutes.success);
      router.refresh();
      toast.success("Employer profile submitted");
    }
  };

  return (
    <OnboardingFrame
      currentStepKey="review"
      aside={
        <div className="space-y-4">
          <AsideCard title="Final check" icon="fact_check">
            This screen should match the previously entered details. Edit any
            section before submitting if something looks wrong.
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
          <AsideCard title="After submit" icon="rocket_launch">
            You will be redirected to the employer success screen and then into
            your dashboard.
          </AsideCard>
        </div>
      }
    >
      <div className="space-y-8 rounded-[1.75rem] border border-[#d8d0c8]/60 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(58,48,42,0.06)] sm:p-6">
        <StepHeader
          stepLabel="Step 5 of 5"
          title="Review and submit"
          description="Confirm each section before sending the employer profile for verification."
          actionLabel="Save for Later"
          onAction={handleSaveDraft}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label="Company Info"
            title={values.companyName || "Company name"}
            copy={`${values.companyEmail || "company@email.com"} · ${values.industry || "Industry"}`}
            onEdit={() => router.push(employerRoutes.basicInfo)}
          />
          <SummaryCard
            label="Verification"
            title={values.businessRegistrationName || "Business document"}
            copy={
              values.businessRegistrationUrl
                ? "Document uploaded"
                : "Waiting for upload"
            }
            onEdit={() => router.push(employerRoutes.verification)}
          />
          <SummaryCard
            label="Team Setup"
            title={`${values.currentTeamSize || 0} workers now`}
            copy={`${values.plannedHires || 0} planned hires · ${values.workMode}`}
            onEdit={() => router.push(employerRoutes.teamSetup)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SummaryCard
            label="Location"
            title={
              [values.city, values.country].filter(Boolean).join(", ") ||
              "Location"
            }
            copy={values.address || "Business address captured here"}
            onEdit={() => router.push(employerRoutes.basicInfo)}
          />
          <SummaryCard
            label="Team Focus"
            title={values.teamFocus || "Hiring focus"}
            copy={
              values.businessDescription ||
              "Company description captured earlier in the flow."
            }
            onEdit={() => router.push(employerRoutes.basicInfo)}
          />
        </div>

        <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MaterialSymbol icon="shield" className="text-[24px]" />
            </div>
            <div>
              <p className="text-base font-semibold text-on-surface">
                Final declaration
              </p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Confirm that the information above is accurate and ready for
                review by the platform team.
              </p>
            </div>
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              {...methods.register("accepted", {
                validate: (value) =>
                  value ||
                  "Confirm that the information is accurate before submitting",
              })}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <span>
              I confirm that the information above is accurate and I am ready to
              submit the employer profile for review.
            </span>
          </label>
          {methods.formState.errors.accepted ? (
            <p className="mt-3 text-xs text-destructive">
              {methods.formState.errors.accepted.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href={employerRoutes.teamSetup}
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
              Save for Later
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Submit for Verification
              <MaterialSymbol icon="arrow_forward" className="text-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </OnboardingFrame>
  );
}
