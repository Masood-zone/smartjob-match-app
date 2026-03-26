"use client";
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
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

type ReviewField = {
  label: string;
  value: string;
  hint?: string;
};

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

  const companyFields: ReviewField[] = [
    { label: "Company Name", value: values.companyName || "Company name" },
    {
      label: "Company Email",
      value: values.companyEmail || "No company email provided",
    },
    {
      label: "Website",
      value: values.website || "No website provided",
    },
  ];

  const adminFields: ReviewField[] = [
    {
      label: "Account Email",
      value: values.accountEmail || user?.email || "No account email",
    },
    { label: "Phone Number", value: values.phoneNumber || "No phone number" },
    {
      label: "Location",
      value:
        [values.city, values.country].filter(Boolean).join(", ") ||
        "No location",
    },
  ];

  const companyDetailFields: ReviewField[] = [
    { label: "Industry", value: values.industry || "Industry" },
    {
      label: "Company Size",
      value: `${values.currentTeamSize || 0} employees now`,
    },
    {
      label: "Founded",
      value: values.plannedHires
        ? `${values.plannedHires} planned hires`
        : "Not specified",
    },
  ];

  const documentFields: ReviewField[] = [
    {
      label: "Business Registration",
      value:
        values.businessRegistrationName ||
        values.companyName ||
        "Business document",
      hint: values.businessRegistrationUrl
        ? "Uploaded and ready"
        : "Waiting for upload",
    },
    {
      label: "Registration status",
      value: values.businessRegistrationUrl
        ? "Verified upload attached"
        : "No file uploaded yet",
      hint: values.businessRegistrationPublicId
        ? "Cloudinary linked"
        : undefined,
    },
  ];

  return (
    <OnboardingFrame
      currentStepKey="review"
      layout="wide"
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
      <div className="space-y-8 rounded-[1.75rem] border border-[#d8d0c8]/60 bg-surface-container-lowest p-6 shadow-[0_20px_60px_rgba(58,48,42,0.06)] sm:p-7 lg:p-8">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Step 5 of 5
          </p>
          <h1 className="font-serif text-4xl tracking-tight text-on-surface sm:text-5xl">
            Review and submit
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
            Confirm each section before sending the employer profile for
            verification.
          </p>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-high">
          <div className="h-full w-full rounded-full bg-primary" />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">
                Company Info
              </h2>
              <button
                type="button"
                onClick={() => router.push(employerRoutes.basicInfo)}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
              >
                <MaterialSymbol icon="edit" className="text-[16px]" />
                Edit
              </button>
            </div>
            <div className="space-y-4">
              {companyFields.map((field) => (
                <ReviewLine key={field.label} {...field} />
              ))}
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">
                Admin Info
              </h2>
              <button
                type="button"
                onClick={() => router.push(employerRoutes.basicInfo)}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
              >
                <MaterialSymbol icon="edit" className="text-[16px]" />
                Edit
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
              <AvatarBadge
                user={
                  user
                    ? { name: user.name, email: user.email, image: user.image }
                    : undefined
                }
                sessionPending={isPending}
                size={56}
              />
              <div className="min-w-0">
                <p className="truncate text-base font-semibold text-on-surface">
                  {user?.name || "Signed in user"}
                </p>
                <p className="truncate text-sm text-on-surface-variant">
                  {user?.email || "account@qualify.app"}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {adminFields.map((field) => (
                <ReviewLine key={field.label} {...field} />
              ))}
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:col-span-2">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">
                Company Details
              </h2>
              <button
                type="button"
                onClick={() => router.push(employerRoutes.basicInfo)}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
              >
                <MaterialSymbol icon="edit" className="text-[16px]" />
                Edit
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {companyDetailFields.map((field) => (
                <ReviewLine key={field.label} {...field} />
              ))}
              <div className="md:col-span-3">
                <ReviewLine
                  label="Business Description"
                  value={
                    values.businessDescription ||
                    "Company description captured earlier in the flow."
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:col-span-2">
            <div className="mb-6 flex items-start justify-between gap-4">
              <h2 className="font-serif text-2xl font-semibold text-on-surface">
                Uploaded Documents
              </h2>
              <button
                type="button"
                onClick={() => router.push(employerRoutes.verification)}
                className="inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-[0.16em] text-primary"
              >
                <MaterialSymbol icon="edit" className="text-[16px]" />
                Edit
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {documentFields.map((field) => (
                <div
                  key={field.label}
                  className="flex items-center gap-4 rounded-xl border border-outline-variant bg-white/50 p-4"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <MaterialSymbol
                      icon="description"
                      className="text-[20px]"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-on-surface">
                      {field.value}
                    </p>
                    <p className="truncate text-xs uppercase tracking-[0.22em] text-stone-400">
                      {field.label}
                    </p>
                    {field.hint ? (
                      <p className="mt-1 text-xs text-stone-400">
                        {field.hint}
                      </p>
                    ) : null}
                  </div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <MaterialSymbol icon="check" className="text-[14px]" />
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
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

          <div className="mt-5 space-y-4 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm text-on-surface-variant">
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
                I confirm that the information above is accurate and I am ready
                to submit the employer profile for review.
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 text-sm text-on-surface-variant">
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span>
                I accept the Terms &amp; Conditions regarding digital
                verification and data processing.
              </span>
            </label>
          </div>

          {methods.formState.errors.accepted ? (
            <p className="mt-3 text-xs text-destructive">
              {methods.formState.errors.accepted.message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-col items-stretch justify-between gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg border border-outline-variant px-8 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:w-auto"
            >
              Save for Later
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto"
            >
              Submit for Verification
              <MaterialSymbol icon="send" className="text-[18px]" />
            </button>
          </div>
        </section>

        <footer className="pb-4 text-center text-sm text-stone-400">
          <p>
            © 2026 Qualify Professional Licensing System. All data is encrypted
            and handled securely.
          </p>
        </footer>
      </div>
    </OnboardingFrame>
  );
}

function ReviewLine({ label, value, hint }: ReviewField) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-stone-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium leading-6 text-on-surface">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-stone-400">{hint}</p> : null}
    </div>
  );
}
