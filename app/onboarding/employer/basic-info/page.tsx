"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

import { OnboardingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AsideCard,
  AvatarBadge,
  Field,
  StepHeader,
  TextAreaField,
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";

import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

export default function EmployerBasicInfoPage() {
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

  const user = session?.user;

  useEffect(() => {
    if (user?.email && !methods.getValues("accountEmail")) {
      methods.setValue("accountEmail", user.email, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [methods, user?.email]);

  const persist = async (values: EmployerOnboardingValues) => {
    const valid = await methods.trigger([
      "accountEmail",
      "companyName",
      "companyEmail",
      "phoneNumber",
      "website",
      "industry",
      "country",
      "city",
      "address",
      "businessDescription",
    ]);

    if (!valid) {
      return false;
    }

    saveStepData(values);
    await saveStepMutation.mutateAsync({ stepKey: "basic-info", values });
    return true;
  };

  const handleSaveDraft = async () => {
    const values = methods.getValues();
    const saved = await persist(values);

    if (saved) {
      router.push("/onboarding");
      router.refresh();
    }
  };

  const handleContinue = async () => {
    const values = methods.getValues();
    const saved = await persist(values);

    if (saved) {
      router.push(employerRoutes.verification);
      router.refresh();
      toast.success("Company details saved");
    }
  };

  return (
    <OnboardingFrame
      currentStepKey="basic-info"
      aside={
        <div className="space-y-4">
          <AsideCard title="Why this matters" icon="info">
            Keep the company identity, contact details, and location aligned
            with the business record you want to present to candidates.
          </AsideCard>
          <AsideCard title="Session summary" icon="person">
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
          <AsideCard title="Accuracy note" icon="verified">
            Accuracy in Step 1 reduces verification time and keeps the next
            steps easy to complete.
          </AsideCard>
        </div>
      }
    >
      <FormProvider {...methods}>
        <div className="space-y-8 rounded-[1.75rem] border border-[#d8d0c8]/60 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(58,48,42,0.06)] sm:p-6">
          <StepHeader
            stepLabel="Step 2 of 5"
            title="Tell us about your company"
            description="Provide your official business details to begin the qualification process."
            actionLabel="Save Progress"
            onAction={handleSaveDraft}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Company Name"
              placeholder="e.g. Sahara Architectural Studio"
              error={methods.formState.errors.companyName?.message}
              registration={methods.register("companyName", {
                required: "Company name is required",
              })}
            />
            <Field
              label="Company Email"
              placeholder="name@business-domain.com"
              helperText="Please use a corporate email address (not @gmail or @yahoo)."
              error={methods.formState.errors.companyEmail?.message}
              registration={methods.register("companyEmail", {
                required: "Company email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid company email address",
                },
              })}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Phone Number"
              placeholder="+233 000 000 000"
              error={methods.formState.errors.phoneNumber?.message}
              registration={methods.register("phoneNumber", {
                required: "Phone number is required",
              })}
            />
            <Field
              label="Website"
              placeholder="https://company.com"
              error={methods.formState.errors.website?.message}
              registration={methods.register("website", {
                required: "Website is required",
              })}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Industry"
              placeholder="e.g. Construction"
              error={methods.formState.errors.industry?.message}
              registration={methods.register("industry", {
                required: "Industry is required",
              })}
            />
            <Field
              label="Country"
              placeholder="Ghana"
              error={methods.formState.errors.country?.message}
              registration={methods.register("country", {
                required: "Country is required",
              })}
            />
            <Field
              label="City"
              placeholder="Accra"
              error={methods.formState.errors.city?.message}
              registration={methods.register("city", {
                required: "City is required",
              })}
            />
          </div>

          <Field
            label="Company Address"
            placeholder="Full business street address"
            error={methods.formState.errors.address?.message}
            registration={methods.register("address", {
              required: "Address is required",
            })}
          />

          <TextAreaField
            label="Business Description"
            placeholder="Tell us what your company does and the kind of work you handle."
            error={methods.formState.errors.businessDescription?.message}
            registration={methods.register("businessDescription", {
              required: "Business description is required",
            })}
          />

          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Account Email
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {user?.email ||
                "We will use your session email to save progress."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <Link
              href="/onboarding/employer/welcome"
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
                Continue to Verification
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </FormProvider>
    </OnboardingFrame>
  );
}
