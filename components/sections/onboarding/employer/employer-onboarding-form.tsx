"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";

import { EmployerSuccessDialog } from "./index";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingStepKey,
  type EmployerOnboardingValues,
} from "./employer-onboarding-types";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

const steps = [
  {
    key: "welcome",
    label: "Welcome",
    title: "Register your company on Qualify",
    summary:
      "Start with the basics, verify your business, capture your team setup, and keep progress saved for later.",
  },
  {
    key: "basic-info",
    label: "Company Info",
    title: "Tell us about your company",
    summary:
      "Provide your official company identity, contact details, location, and a short description of what you do.",
  },
  {
    key: "verification",
    label: "Verification",
    title: "Verification & Documentation",
    summary:
      "Upload a single business registration image or PDF so the verification record stays centralized.",
  },
  {
    key: "team-setup",
    label: "Team Setup",
    title: "Capture the size of your team",
    summary:
      "Tell us how many workers you have now, how many roles you plan to hire, and how your team operates.",
  },
  {
    key: "review",
    label: "Review",
    title: "Final Review",
    summary:
      "Confirm the record, accept the declaration, and submit the employer profile for review.",
  },
] as const;

const fieldMap: Record<
  Exclude<EmployerOnboardingStepKey, "welcome">,
  (keyof EmployerOnboardingValues)[]
> = {
  "basic-info": [
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
  ],
  verification: [
    "businessRegistrationName",
    "businessRegistrationUrl",
    "businessRegistrationPublicId",
  ],
  "team-setup": ["currentTeamSize", "plannedHires", "teamFocus", "workMode"],
  review: ["accepted"],
};

const workModeOptions = [
  { label: "Onsite", value: "ONSITE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Remote-first", value: "REMOTE" },
] as const;

function getInitials(name?: string | null) {
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

export default function EmployerOnboardingForm() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const savedData = useEmployerOnboardingStore((state) => state.data);
  const currentStep = useEmployerOnboardingStore((state) => state.currentStep);
  const setCurrentStep = useEmployerOnboardingStore(
    (state) => state.setCurrentStep,
  );
  const saveStepData = useEmployerOnboardingStore(
    (state) => state.saveStepData,
  );
  const saveStepMutation = useStoreEmployerOnboardingStep();

  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isSavingAndLeaving, setIsSavingAndLeaving] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const successTimer = useRef<number | null>(null);

  const methods = useForm<EmployerOnboardingValues>({
    defaultValues: savedData ?? employerOnboardingDefaultValues,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const sessionUser = session?.user as SessionUser | undefined;
  const activeStep = steps[currentStep] ?? steps[0];
  const currentValues = methods.watch();
  const progress = ((currentStep + 1) / steps.length) * 100;
  const dashboardHref = "/onboarding/employer/dashboard";

  useEffect(() => {
    if (sessionUser?.email && !methods.getValues("accountEmail")) {
      methods.setValue("accountEmail", sessionUser.email, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [methods, sessionUser?.email]);

  useEffect(
    () => () => {
      if (successTimer.current) {
        window.clearTimeout(successTimer.current);
      }
    },
    [],
  );

  const persistStep = async (
    stepKey: Exclude<EmployerOnboardingStepKey, "welcome">,
    values: EmployerOnboardingValues,
    requireValidation = true,
  ) => {
    if (requireValidation) {
      const fields = fieldMap[stepKey];
      const isValid = await methods.trigger(fields);

      if (!isValid) {
        return false;
      }
    }

    saveStepData(values);

    await saveStepMutation.mutateAsync({
      stepKey,
      values,
    });

    return true;
  };

  const handleSaveAndExit = async () => {
    if (currentStep === 0) {
      router.push("/onboarding");
      return;
    }

    setIsSavingAndLeaving(true);

    try {
      const values = methods.getValues();
      const stepKey = activeStep.key as Exclude<
        EmployerOnboardingStepKey,
        "welcome"
      >;

      await persistStep(stepKey, values, false);
      setIsLeaveDialogOpen(false);
      router.push("/onboarding");
    } finally {
      setIsSavingAndLeaving(false);
    }
  };

  const handleBasicInfoContinue = async () => {
    const values = methods.getValues();
    const saved = await persistStep("basic-info", values);

    if (saved) {
      setCurrentStep(2);
    }
  };

  const handleVerificationContinue = async () => {
    const values = methods.getValues();
    const saved = await persistStep("verification", values);

    if (saved) {
      setCurrentStep(3);
    }
  };

  const handleTeamSetupContinue = async () => {
    const values = methods.getValues();
    const saved = await persistStep("team-setup", values);

    if (saved) {
      setCurrentStep(4);
    }
  };

  const handleReviewSubmit = async () => {
    const values = methods.getValues();
    const saved = await persistStep("review", values);

    if (!saved) {
      return;
    }

    setIsSuccessDialogOpen(true);

    if (successTimer.current) {
      window.clearTimeout(successTimer.current);
    }

    successTimer.current = window.setTimeout(() => {
      router.push(dashboardHref);
      router.refresh();
    }, 2800);
  };

  const handleUploadDocument = async () => {
    const file = fileInputRef.current?.files?.[0] ?? null;

    if (!file) {
      setUploadError("Choose a registration image or PDF first.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "onboarding/employer/verification");

      const response = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          url: string;
          secureUrl?: string | null;
          publicId?: string | null;
        };
        message?: string;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(
          payload.message || "Unable to upload registration document",
        );
      }

      methods.setValue("businessRegistrationName", file.name, {
        shouldDirty: true,
        shouldTouch: true,
      });
      methods.setValue(
        "businessRegistrationUrl",
        payload.data.secureUrl || payload.data.url,
        { shouldDirty: true, shouldTouch: true },
      );
      methods.setValue(
        "businessRegistrationPublicId",
        payload.data.publicId || "",
        {
          shouldDirty: true,
          shouldTouch: true,
        },
      );

      toast.success("Registration document uploaded");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <main className="min-h-screen bg-[#faf5ee] text-on-surface">
        <header className="sticky top-0 z-50 border-b border-[#d8d0c8]/60 bg-[#faf5ee]/92 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-6">
              <Link
                href="/onboarding"
                className="font-serif text-2xl font-bold italic tracking-tight text-primary"
              >
                Qualify
              </Link>

              <nav className="hidden items-center gap-6 lg:flex">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  const isClickable = index <= currentStep;

                  return (
                    <button
                      key={step.key}
                      type="button"
                      onClick={() => {
                        if (isClickable) {
                          setCurrentStep(index);
                        }
                      }}
                      disabled={!isClickable}
                      className={cn(
                        "cursor-pointer border-b-2 pb-1 text-sm font-medium transition-colors disabled:cursor-default",
                        isActive
                          ? "border-primary font-semibold text-primary"
                          : "border-transparent text-stone-500 hover:text-primary",
                      )}
                    >
                      {step.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
                aria-label="Help"
              >
                <MaterialSymbol icon="help_outline" className="text-[18px]" />
              </button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-stone-500 transition-colors hover:text-primary"
                aria-label="Security"
              >
                <MaterialSymbol icon="lock" className="text-[18px]" />
              </button>
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-outline-variant bg-primary/10 text-xs font-semibold text-primary">
                {sessionUser?.image ? (
                  <Image
                    src={sessionUser.image}
                    alt={
                      sessionUser.name
                        ? `${sessionUser.name} avatar`
                        : "User avatar"
                    }
                    width={36}
                    height={36}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(sessionUser?.name)
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_minmax(0,1fr)_320px] lg:px-8 lg:py-10">
          <aside className="hidden rounded-[1.5rem] border border-[#d8d0c8]/60 bg-[#faf5ee] p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:block">
            <div className="space-y-2">
              <p className="text-2xl font-serif text-on-surface">Onboarding</p>
              <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
                Step {currentStep + 1} of {steps.length}
              </p>
            </div>

            <nav className="mt-6 flex flex-col gap-2">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isClickable = index <= currentStep;

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => {
                      if (isClickable) {
                        setCurrentStep(index);
                      }
                    }}
                    disabled={!isClickable}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all disabled:cursor-default",
                      isActive
                        ? "border-r-4 border-primary bg-primary/5 text-primary shadow-[0_10px_24px_rgba(194,101,42,0.08)]"
                        : "text-stone-400 hover:bg-primary/5 hover:text-primary",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                        isActive
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-outline-variant bg-surface text-stone-500",
                      )}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {step.label}
                      </span>
                      <span className="block truncate text-xs text-stone-500">
                        {step.summary}
                      </span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <section className="space-y-6">
            <div className="rounded-[1.25rem] border border-[#d8d0c8]/60 bg-surface-container-lowest px-5 py-4 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:hidden">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                    Employer onboarding
                  </p>
                  <p className="mt-1 text-sm text-on-surface-variant">
                    Step {currentStep + 1} of {steps.length}
                  </p>
                </div>
                <div className="w-36 overflow-hidden rounded-full bg-surface-container-highest">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            {currentStep === 0 ? (
              <WelcomeStep
                sessionUser={sessionUser}
                sessionPending={sessionPending}
                onStart={() => setCurrentStep(1)}
              />
            ) : (
              <div className="rounded-[1.75rem] border border-[#d8d0c8]/60 bg-surface-container-lowest p-5 shadow-[0_20px_60px_rgba(58,48,42,0.06)] sm:p-6">
                {currentStep === 1 ? (
                  <BasicInfoStep
                    onBack={() => setCurrentStep(0)}
                    onContinue={handleBasicInfoContinue}
                    onSaveForLater={handleSaveAndExit}
                    sessionUser={sessionUser}
                  />
                ) : null}

                {currentStep === 2 ? (
                  <VerificationStep
                    onBack={() => setCurrentStep(1)}
                    onContinue={handleVerificationContinue}
                    onSaveForLater={handleSaveAndExit}
                    isUploading={isUploading}
                    uploadError={uploadError}
                    onUploadDocument={handleUploadDocument}
                    fileInputRef={fileInputRef}
                  />
                ) : null}

                {currentStep === 3 ? (
                  <TeamSetupStep
                    onBack={() => setCurrentStep(2)}
                    onContinue={handleTeamSetupContinue}
                    onSaveForLater={handleSaveAndExit}
                  />
                ) : null}

                {currentStep === 4 ? (
                  <ReviewStep
                    onBack={() => setCurrentStep(3)}
                    onSaveForLater={handleSaveAndExit}
                    onSubmit={handleReviewSubmit}
                    onEditStep={setCurrentStep}
                  />
                ) : null}
              </div>
            )}
          </section>

          <aside className="hidden lg:block">
            {renderStepAside(
              currentStep,
              sessionUser,
              sessionPending,
              currentValues,
            )}
          </aside>
        </div>

        <Dialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Save onboarding progress?</DialogTitle>
              <DialogDescription>
                Your current employer onboarding draft will be saved so you can
                return later without losing the work already entered.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-6 gap-3 sm:items-center">
              <button
                type="button"
                onClick={() => setIsLeaveDialogOpen(false)}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-outline-variant px-5 py-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Continue editing
              </button>
              <button
                type="button"
                onClick={() => void handleSaveAndExit()}
                disabled={isSavingAndLeaving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_16px_34px_rgba(194,101,42,0.22)] transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingAndLeaving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving and exiting
                  </span>
                ) : (
                  "Save and exit"
                )}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <EmployerSuccessDialog
          open={isSuccessDialogOpen}
          onOpenChange={setIsSuccessDialogOpen}
          user={sessionUser}
          companyName={currentValues.companyName}
          currentTeamSize={currentValues.currentTeamSize || 0}
          plannedHires={currentValues.plannedHires || 0}
          dashboardHref={dashboardHref}
        />
      </main>
    </FormProvider>
  );
}

function WelcomeStep({
  sessionUser,
  sessionPending,
  onStart,
}: {
  sessionUser?: SessionUser;
  sessionPending: boolean;
  onStart: () => void;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Employer Portal
        </div>

        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl tracking-tight text-on-surface lg:text-6xl">
            Register Your Company on Qualify
          </h1>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
            Join our network of trusted employers and connect with qualified
            talent. Your progress will be saved so you can return and continue
            later.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            icon="verified"
            title="Verified company badge"
            copy="Build instant trust with candidates through a structured registration flow."
          />
          <FeatureCard
            icon="groups"
            title="Access to qualified candidates"
            copy="Set up the employer side so later hiring tools can match the right people to the right roles."
          />
          <FeatureCard
            icon="speed"
            title="Faster hiring process"
            copy="Reduce time-to-hire by keeping your company profile and verification data in one place."
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Button onClick={onStart} className="cursor-pointer px-8 py-3.5">
            Start Employer Registration
          </Button>
          <Link
            href="/login"
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-outline-variant px-8 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
          >
            Already registered? Sign in
          </Link>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Session preview
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <AvatarBadge user={sessionUser} sessionPending={sessionPending} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">
                {sessionUser?.name || "Signed in user"}
              </p>
              <p className="truncate text-xs text-on-surface-variant">
                {sessionPending
                  ? "Loading account..."
                  : sessionUser?.email || "No email available"}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant bg-primary/5 p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
          <div className="relative h-64 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,#f2d7c1_0%,#e9c09c_36%,#b87b4a_100%)]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(58,48,42,0.28))]" />
            <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/50 bg-white/85 p-4 shadow-[0_8px_30px_rgba(58,48,42,0.08)] backdrop-blur">
              <p className="font-serif text-xl italic text-primary">
                “The future of work begins with the right foundations.”
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
                Verification Status: Pending
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.04)]">
          <div className="flex items-center gap-2 text-primary">
            <MaterialSymbol icon="star" className="text-[16px]" />
            <p className="text-xs font-semibold uppercase tracking-[0.28em]">
              Trust Score
            </p>
          </div>
          <p className="mt-3 font-serif text-2xl italic text-on-surface">
            High Reliability
          </p>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            Your employer profile is structured to build confidence before your
            first role posting.
          </p>
        </div>
      </div>
    </section>
  );
}

function BasicInfoStep({
  onBack,
  onContinue,
  onSaveForLater,
  sessionUser,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSaveForLater: () => void;
  sessionUser?: SessionUser;
}) {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmployerOnboardingValues>();

  return (
    <div className="space-y-8">
      <StepHeader
        stepLabel="Step 2 of 5"
        title="Tell us about your company"
        description="Provide your official business details so the employer profile starts with clean and verifiable data."
        actionLabel="Save Progress"
        onAction={onSaveForLater}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <input
            type="hidden"
            {...register("accountEmail", {
              required: "Account email is required",
            })}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Company Name"
              placeholder="e.g. Sahara Architectural Studio"
              error={errors.companyName?.message}
              registration={register("companyName", {
                required: "Company name is required",
              })}
            />
            <Field
              label="Company Email"
              placeholder="name@business-domain.com"
              error={errors.companyEmail?.message}
              helperText="Please use a corporate email address (not @gmail or @yahoo)."
              registration={register("companyEmail", {
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
              error={errors.phoneNumber?.message}
              registration={register("phoneNumber", {
                required: "Phone number is required",
              })}
            />
            <Field
              label="Website"
              placeholder="https://company.com"
              error={errors.website?.message}
              registration={register("website", {
                required: "Website is required",
              })}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Industry"
              placeholder="e.g. Construction"
              error={errors.industry?.message}
              registration={register("industry", {
                required: "Industry is required",
              })}
            />
            <Field
              label="Country"
              placeholder="Ghana"
              error={errors.country?.message}
              registration={register("country", {
                required: "Country is required",
              })}
            />
            <Field
              label="City"
              placeholder="Accra"
              error={errors.city?.message}
              registration={register("city", {
                required: "City is required",
              })}
            />
          </div>

          <Field
            label="Company Address"
            placeholder="Full business street address"
            error={errors.address?.message}
            registration={register("address", {
              required: "Address is required",
            })}
          />

          <TextAreaField
            label="Business Description"
            placeholder="Tell us what your company does and the kind of work you handle."
            error={errors.businessDescription?.message}
            registration={register("businessDescription", {
              required: "Business description is required",
            })}
          />

          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              Account Email
            </p>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {sessionUser?.email ||
                "We will use your session email to save progress."}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
            >
              <MaterialSymbol icon="arrow_back" className="text-[18px]" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveForLater}>
                Save Progress
              </Button>
              <Button type="button" onClick={onContinue}>
                Continue to Verification
                <MaterialSymbol
                  icon="arrow_forward"
                  className="ml-2 text-[18px]"
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AsideCard title="Why this matters" icon="info">
            Keep the company identity, contact details, and location aligned
            with the business record you want to present to candidates.
          </AsideCard>
          <AsideCard title="Session summary" icon="person">
            <div className="flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
              <AvatarBadge user={sessionUser} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-on-surface">
                  {sessionUser?.name || "Signed in user"}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {sessionUser?.email || "account@qualify.app"}
                </p>
              </div>
            </div>
          </AsideCard>
          <AsideCard title="Accuracy note" icon="verified">
            Accuracy in Step 1 reduces verification time and keeps the next
            steps easy to complete.
          </AsideCard>
        </div>
      </div>
    </div>
  );
}

function VerificationStep({
  onBack,
  onContinue,
  onSaveForLater,
  isUploading,
  uploadError,
  onUploadDocument,
  fileInputRef,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSaveForLater: () => void;
  isUploading: boolean;
  uploadError: string | null;
  onUploadDocument: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) {
  const { watch, formState } = useFormContext<EmployerOnboardingValues>();
  const documentUrl = watch("businessRegistrationUrl");
  const documentName = watch("businessRegistrationName");

  return (
    <div className="space-y-8">
      <StepHeader
        stepLabel="Step 3 of 5"
        title="Verification & Documentation"
        description="Upload a single business registration image or PDF. The document will be attached to the onboarding draft and used for review."
        actionLabel="Save Draft"
        onAction={onSaveForLater}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border-2 border-dashed border-outline-variant bg-white p-6 transition-colors hover:border-primary">
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialSymbol icon="cloud_upload" className="text-[28px]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">
                  Drag and drop your certificate here
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  or browse your files
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-on-surface-variant">
                Accepted formats: PDF, PNG, JPG (Max 10MB)
              </p>

              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="block w-full max-w-xs rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
                />
                <Button
                  type="button"
                  onClick={onUploadDocument}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading" : "Upload document"}
                </Button>
              </div>
            </div>

            {uploadError ? (
              <p className="mt-4 text-center text-sm text-destructive">
                {uploadError}
              </p>
            ) : null}

            {documentUrl ? (
              <div className="mt-6 flex items-center gap-4 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MaterialSymbol icon="description" className="text-[20px]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {documentName || "Business registration file"}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    Saved to Cloudinary and attached to this onboarding draft.
                  </p>
                </div>
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-surface-container-low"
                >
                  View file
                  <MaterialSymbol icon="open_in_new" className="text-[16px]" />
                </a>
              </div>
            ) : null}

            {formState.errors.businessRegistrationUrl?.message ? (
              <p className="mt-3 text-xs text-destructive">
                {formState.errors.businessRegistrationUrl.message}
              </p>
            ) : null}
          </section>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
            >
              <MaterialSymbol icon="arrow_back" className="text-[18px]" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveForLater}>
                Save Draft
              </Button>
              <Button
                type="button"
                onClick={onContinue}
                disabled={!documentUrl}
              >
                Continue to Team Setup
                <MaterialSymbol
                  icon="arrow_forward"
                  className="ml-2 text-[18px]"
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AsideCard title="One document only" icon="verified_user">
            Upload the company registration image or PDF that should be attached
            to your employer onboarding record.
          </AsideCard>
          <AsideCard title="Accepted file types" icon="description">
            PDF, JPG, PNG, WEBP, or GIF are allowed. The upload is stored in
            Cloudinary and linked to the draft.
          </AsideCard>
          <AsideCard title="Review queue" icon="hourglass_top">
            Once submitted, your onboarding profile will move into the review
            queue and stay available from the dashboard.
          </AsideCard>
        </div>
      </div>
    </div>
  );
}

function TeamSetupStep({
  onBack,
  onContinue,
  onSaveForLater,
}: {
  onBack: () => void;
  onContinue: () => void;
  onSaveForLater: () => void;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EmployerOnboardingValues>();

  return (
    <div className="space-y-8">
      <StepHeader
        stepLabel="Step 4 of 5"
        title="Capture the size and shape of your team"
        description="Tell us how many workers you have now, how many people you plan to hire, and how your team works."
        actionLabel="Save Draft"
        onAction={onSaveForLater}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Current Number of Workers"
              type="number"
              placeholder="5"
              error={errors.currentTeamSize?.message}
              registration={register("currentTeamSize", {
                required: "Current team size is required",
                valueAsNumber: true,
                min: {
                  value: 1,
                  message: "Current team size must be at least 1",
                },
              })}
            />
            <Field
              label="Planned Hires"
              type="number"
              placeholder="3"
              error={errors.plannedHires?.message}
              registration={register("plannedHires", {
                required: "Planned hires is required",
                valueAsNumber: true,
                min: { value: 0, message: "Planned hires cannot be negative" },
              })}
            />
          </div>

          <Field
            label="Key Team Focus"
            placeholder="e.g. Operations, sales, product delivery"
            error={errors.teamFocus?.message}
            registration={register("teamFocus", {
              required: "Team focus is required",
            })}
          />

          <div className="space-y-2">
            <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
              Work Mode
            </label>
            <Controller
              control={control}
              name="workMode"
              rules={{ required: "Choose a work mode" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {workModeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.workMode?.message ? (
              <p className="text-xs text-destructive">
                {errors.workMode.message}
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
            >
              <MaterialSymbol icon="arrow_back" className="text-[18px]" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={onSaveForLater}>
                Save Draft
              </Button>
              <Button type="button" onClick={onContinue}>
                Continue to Review
                <MaterialSymbol
                  icon="arrow_forward"
                  className="ml-2 text-[18px]"
                />
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <AsideCard title="Team snapshot" icon="groups">
            <div className="grid gap-3">
              <PreviewStat
                label="Current workers"
                value="Captured in this step"
              />
              <PreviewStat
                label="Planned hires"
                value="Captured in this step"
              />
            </div>
          </AsideCard>
          <AsideCard title="Hiring shape" icon="work_outline">
            Capture the current headcount and expected hires so the hiring side
            of the platform can reflect your needs.
          </AsideCard>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  onBack,
  onSaveForLater,
  onSubmit,
  onEditStep,
}: {
  onBack: () => void;
  onSaveForLater: () => void;
  onSubmit: () => void;
  onEditStep: (step: number) => void;
}) {
  const { watch, register, formState } =
    useFormContext<EmployerOnboardingValues>();
  const values = watch();

  return (
    <div className="space-y-8">
      <StepHeader
        stepLabel="Step 5 of 5"
        title="Final Review"
        description="Please confirm that everything is accurate before you submit the employer profile for review."
        actionLabel="Save for Later"
        onAction={onSaveForLater}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Company Info"
          title={values.companyName || "Company name"}
          copy={`${values.companyEmail || "company@email.com"} · ${values.industry || "Industry"}`}
          onEdit={() => onEditStep(1)}
        />
        <SummaryCard
          label="Verification"
          title={values.businessRegistrationName || "Business document"}
          copy={
            values.businessRegistrationUrl
              ? "Document uploaded"
              : "Waiting for upload"
          }
          onEdit={() => onEditStep(2)}
        />
        <SummaryCard
          label="Team Setup"
          title={`${values.currentTeamSize || 0} workers now`}
          copy={`${values.plannedHires || 0} planned hires · ${values.workMode}`}
          onEdit={() => onEditStep(3)}
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
          onEdit={() => onEditStep(1)}
        />
        <SummaryCard
          label="Team Focus"
          title={values.teamFocus || "Hiring focus"}
          copy={
            values.businessDescription ||
            "Company description captured earlier in the flow."
          }
          onEdit={() => onEditStep(1)}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface-variant">
        <input
          type="checkbox"
          {...register("accepted", {
            validate: (value) =>
              value ||
              "Confirm that the information is accurate before continuing",
          })}
          className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
        />
        <span>
          I confirm that the information above is accurate and I am ready to
          submit the employer profile for review.
        </span>
      </label>
      {formState.errors.accepted?.message ? (
        <p className="text-xs text-destructive">
          {formState.errors.accepted.message}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant transition-colors hover:text-primary"
        >
          <MaterialSymbol icon="arrow_back" className="text-[18px]" />
          Back
        </button>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={onSaveForLater}>
            Save for Later
          </Button>
          <Button type="button" onClick={onSubmit}>
            Submit for Verification
            <MaterialSymbol icon="arrow_forward" className="ml-2 text-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function renderStepAside(
  currentStep: number,
  sessionUser?: SessionUser,
  sessionPending = false,
  values?: EmployerOnboardingValues,
) {
  if (currentStep === 0) {
    return (
      <WelcomeAside sessionUser={sessionUser} sessionPending={sessionPending} />
    );
  }

  if (currentStep === 1) {
    return (
      <BasicInfoAside
        sessionUser={sessionUser}
        sessionPending={sessionPending}
      />
    );
  }

  if (currentStep === 2) {
    return <VerificationAside />;
  }

  if (currentStep === 3) {
    return <TeamSetupAside values={values} />;
  }

  return <ReviewAside values={values} />;
}

function WelcomeAside({
  sessionUser,
  sessionPending,
}: {
  sessionUser?: SessionUser;
  sessionPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <AsideCard title="Session preview" icon="person">
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
          <AvatarBadge user={sessionUser} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">
              {sessionUser?.name || "Signed in user"}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {sessionPending
                ? "Loading account..."
                : sessionUser?.email || "account@qualify.app"}
            </p>
          </div>
        </div>
      </AsideCard>

      <div className="overflow-hidden rounded-[1.75rem] border border-outline-variant bg-primary/5 p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
        <div className="relative h-64 overflow-hidden rounded-[1.5rem] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_28%),linear-gradient(135deg,#f2d7c1_0%,#e9c09c_36%,#b87b4a_100%)]">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(58,48,42,0.28))]" />
          <div className="absolute bottom-5 left-5 right-5 rounded-[1.25rem] border border-white/50 bg-white/85 p-4 shadow-[0_8px_30px_rgba(58,48,42,0.08)] backdrop-blur">
            <p className="font-serif text-xl italic text-primary">
              “The future of work begins with the right foundations.”
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">
              Verification Status: Pending
            </p>
          </div>
        </div>
      </div>

      <AsideCard title="Trust Score" icon="star">
        <p className="font-serif text-2xl italic text-on-surface">
          High Reliability
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          Your employer profile is structured to build confidence before your
          first role posting.
        </p>
      </AsideCard>
    </div>
  );
}

function BasicInfoAside({
  sessionUser,
  sessionPending,
}: {
  sessionUser?: SessionUser;
  sessionPending: boolean;
}) {
  return (
    <div className="space-y-4">
      <AsideCard title="Why this matters" icon="info">
        Keep the company identity, contact details, and location aligned with
        the business record you want to present to candidates.
      </AsideCard>
      <AsideCard title="Session summary" icon="person">
        <div className="flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
          <AvatarBadge user={sessionUser} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-on-surface">
              {sessionUser?.name || "Signed in user"}
            </p>
            <p className="truncate text-xs text-on-surface-variant">
              {sessionPending
                ? "Loading account..."
                : sessionUser?.email || "account@qualify.app"}
            </p>
          </div>
        </div>
      </AsideCard>
      <AsideCard title="Accuracy note" icon="verified">
        Accuracy in Step 1 reduces verification time and keeps the next steps
        easy to complete.
      </AsideCard>
    </div>
  );
}

function VerificationAside() {
  return (
    <div className="space-y-4">
      <AsideCard title="One document only" icon="verified_user">
        Upload the company registration image or PDF that should be attached to
        your employer onboarding record.
      </AsideCard>
      <AsideCard title="Accepted file types" icon="description">
        PDF, JPG, PNG, WEBP, or GIF are allowed. The upload is stored in
        Cloudinary and linked to the draft.
      </AsideCard>
      <AsideCard title="Review queue" icon="hourglass_top">
        Once submitted, your onboarding profile will move into the review queue
        and stay available from the dashboard.
      </AsideCard>
    </div>
  );
}

function TeamSetupAside({ values }: { values?: EmployerOnboardingValues }) {
  return (
    <div className="space-y-4">
      <AsideCard title="Team snapshot" icon="groups">
        <div className="grid gap-3">
          <PreviewStat
            label="Current workers"
            value={`${values?.currentTeamSize ?? 0} workers`}
          />
          <PreviewStat
            label="Planned hires"
            value={`${values?.plannedHires ?? 0} roles`}
          />
        </div>
      </AsideCard>
      <AsideCard title="Hiring shape" icon="work_outline">
        Capture the current headcount and expected hires so the hiring side of
        the platform can reflect your needs.
      </AsideCard>
    </div>
  );
}

function ReviewAside({ values }: { values?: EmployerOnboardingValues }) {
  return (
    <div className="space-y-4">
      <AsideCard title="Checklist" icon="checklist">
        <div className="space-y-3">
          {[
            values?.companyName || "Company information captured",
            values?.businessRegistrationName ||
              "Registration document uploaded",
            `${values?.currentTeamSize ?? 0} workers now`,
            `${values?.plannedHires ?? 0} planned hires`,
          ].map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[1rem] border border-outline-variant bg-surface p-3"
            >
              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MaterialSymbol icon="done" className="text-[16px]" />
              </span>
              <p className="text-sm leading-6 text-on-surface-variant">
                {item}
              </p>
            </div>
          ))}
        </div>
      </AsideCard>
      <AsideCard title="Status" icon="pending">
        Your employer profile will be queued for review once you submit the
        final declaration.
      </AsideCard>
    </div>
  );
}

function StepHeader({
  stepLabel,
  title,
  description,
  actionLabel,
  onAction,
}: {
  stepLabel: string;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-2xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
          {stepLabel}
        </p>
        <div>
          <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onAction}
        className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
      >
        <MaterialSymbol icon="bookmark" className="text-[16px]" />
        {actionLabel}
      </button>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  error,
  helperText,
  registration,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
  helperText?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {helperText ? (
        <p className="flex items-center gap-1.5 text-xs text-primary">
          <MaterialSymbol icon="info" className="text-[14px]" />
          {helperText}
        </p>
      ) : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  error,
  registration,
}: {
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <textarea
        placeholder={placeholder}
        rows={4}
        {...registration}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function AsideCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
      <div className="flex items-center gap-2 text-primary">
        <MaterialSymbol icon={icon} className="text-[18px]" />
        <p className="text-xs font-semibold uppercase tracking-[0.28em]">
          {title}
        </p>
      </div>
      <div className="mt-4 text-sm leading-6 text-on-surface-variant">
        {children}
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  title,
  copy,
  onEdit,
}: {
  label: string;
  title: string;
  copy: string;
  onEdit: () => void;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
            {label}
          </p>
          <h3 className="mt-3 text-lg font-semibold text-on-surface">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-on-surface-variant">
            {copy}
          </p>
        </div>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:text-primary/80"
        >
          <MaterialSymbol icon="edit" className="text-[16px]" />
          Edit
        </button>
      </div>
    </div>
  );
}

function PreviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)]">
      <div className="flex items-center gap-3 text-primary">
        <MaterialSymbol icon={icon} className="text-[20px]" />
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}

function AvatarBadge({
  user,
  sessionPending = false,
}: {
  user?: SessionUser;
  sessionPending?: boolean;
}) {
  return (
    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ? `${user.name} avatar` : "User avatar"}
          width={44}
          height={44}
          className="h-full w-full object-cover"
        />
      ) : (
        <span>{getInitials(user?.name)}</span>
      )}
      {sessionPending ? (
        <span className="absolute inset-0 rounded-full bg-primary/5 animate-pulse" />
      ) : null}
    </div>
  );
}
