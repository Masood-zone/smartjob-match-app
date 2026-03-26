"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
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

import { EmployerSuccessDialog } from "./employer-success-dialog";
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
    title: "Register your company with a structured employer flow",
    summary:
      "Capture the basics, verify your business registration, define your team size, and save progress whenever you need to step away.",
    guidance:
      "Start here to review what the employer onboarding will collect and how your progress will be preserved.",
  },
  {
    key: "basic-info",
    label: "Basic Info",
    title: "Tell us about your company",
    summary:
      "Enter the company identity, contact details, location, and a short description so the employer profile starts with clean data.",
    guidance:
      "Use the same business name and contact details you want attached to hiring activity on the platform.",
  },
  {
    key: "verification",
    label: "Verification",
    title: "Upload your business registration document",
    summary:
      "Upload only the company registration image or PDF so the verification record stays consistent and centralized.",
    guidance:
      "Attach one file in image or PDF format. The upload is stored in Cloudinary and linked to the onboarding draft.",
  },
  {
    key: "team-setup",
    label: "Team Setup",
    title: "Capture the size and shape of your team",
    summary:
      "Tell us how many workers you have now, how many people you expect to hire, and what kind of work model you use.",
    guidance:
      "This information helps the employer dashboard and later hiring tools understand your company size.",
  },
  {
    key: "review",
    label: "Review",
    title: "Review and submit your employer profile",
    summary:
      "Confirm every detail, accept the declaration, and submit the profile so your account can move into the employer dashboard.",
    guidance:
      "Review the summary carefully because this is the step that marks the onboarding record complete.",
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

  const activeStep = steps[currentStep] ?? steps[0];
  const progress =
    steps.length > 1 ? (currentStep / (steps.length - 1)) * 100 : 0;
  const stepSnapshot = methods.watch();
  const dashboardHref = "/onboarding/employer/dashboard";
  const sessionUser = session?.user as SessionUser | undefined;

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

  const goToDashboard = () => {
    router.push(dashboardHref);
    router.refresh();
  };

  const saveCurrentStep = async (
    stepKey: Exclude<EmployerOnboardingStepKey, "welcome">,
  ) => {
    const fields = fieldMap[stepKey];
    const isValid = await methods.trigger(fields);

    if (!isValid) {
      return false;
    }

    const values = methods.getValues();
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
      saveStepData(values);

      await saveStepMutation.mutateAsync({
        stepKey: activeStep.key as Exclude<
          EmployerOnboardingStepKey,
          "welcome"
        >,
        values,
      });

      setIsLeaveDialogOpen(false);
      router.push("/onboarding");
    } finally {
      setIsSavingAndLeaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await saveCurrentStep(
      activeStep.key as Exclude<EmployerOnboardingStepKey, "welcome">,
    );

    if (!saved) {
      return;
    }

    setCurrentStep(Math.min(currentStep + 1, steps.length - 1));
  };

  const handleReviewSubmit = async () => {
    const isValid = await methods.trigger(fieldMap.review);

    if (!isValid) {
      return;
    }

    const values = methods.getValues();
    saveStepData(values);

    try {
      const response = await saveStepMutation.mutateAsync({
        stepKey: "review",
        values,
      });

      if (response.completed) {
        setIsSuccessDialogOpen(true);

        if (successTimer.current) {
          window.clearTimeout(successTimer.current);
        }

        successTimer.current = window.setTimeout(() => {
          goToDashboard();
        }, 2800);
      }
    } catch {
      return;
    }
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

      const json = (await response.json()) as {
        success: boolean;
        data?: {
          id: string;
          url: string;
          secureUrl?: string | null;
          publicId?: string | null;
        };
        message?: string;
      };

      if (!response.ok || !json.success || !json.data) {
        throw new Error(
          json.message || "Unable to upload registration document",
        );
      }

      methods.setValue("businessRegistrationName", file.name, {
        shouldDirty: true,
        shouldTouch: true,
      });
      methods.setValue(
        "businessRegistrationUrl",
        json.data.secureUrl || json.data.url,
        { shouldDirty: true, shouldTouch: true },
      );
      methods.setValue(
        "businessRegistrationPublicId",
        json.data.publicId || "",
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
      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <header className="sticky top-4 z-40 rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest/92 px-5 py-4 shadow-[0_12px_40px_rgba(58,48,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/onboarding"
                className="font-serif text-2xl font-bold text-primary transition-opacity hover:opacity-80"
              >
                Qualify
              </Link>

              <div className="flex flex-1 flex-wrap items-center justify-center gap-3">
                <span className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant md:inline-flex">
                  Employer onboarding
                </span>
                <div className="h-1.5 w-36 overflow-hidden rounded-full bg-surface-container">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-on-surface-variant">
                  {String(Math.max(currentStep, 0) + 1).padStart(2, "0")}/
                  {steps.length}
                </span>
              </div>

              <div className="flex items-center gap-2 text-on-surface-variant">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant bg-surface transition-colors hover:border-primary hover:text-primary"
                  onClick={() => setIsLeaveDialogOpen(true)}
                  aria-label="Save and exit"
                >
                  <MaterialSymbol icon="bookmark" className="text-[18px]" />
                </button>
                <MaterialSymbol icon="close" className="text-[20px]" />
              </div>
            </div>
          </header>

          <section className="grid gap-6 lg:grid-cols-[minmax(240px,0.32fr)_minmax(0,1fr)_minmax(280px,0.44fr)]">
            <aside className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.06)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                  Workflow
                </p>
                <h2 className="text-2xl tracking-tight text-on-surface">
                  Step {currentStep + 1} of {steps.length}
                </h2>
                <p className="text-sm leading-6 text-on-surface-variant">
                  {activeStep.summary}
                </p>
              </div>

              <nav className="mt-6 space-y-2">
                {steps.map((step, index) => {
                  const isActive = index === currentStep;
                  return (
                    <button
                      key={step.key}
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        if (index === 0) {
                          return;
                        }

                        setCurrentStep(index);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-colors",
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary",
                        index === 0 && "cursor-default opacity-100",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-low text-xs font-semibold">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {step.label}
                        </span>
                        <span className="block truncate text-xs opacity-80">
                          {step.key === "welcome" ? "Start here" : step.title}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <div className="rounded-[1.75rem] border border-outline-variant bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.06)] sm:p-6">
              {currentStep === 0 ? (
                <WelcomeStep
                  sessionUser={sessionUser}
                  sessionPending={sessionPending}
                  onStart={() => setCurrentStep(1)}
                  onSaveForLater={() => router.push("/onboarding")}
                />
              ) : currentStep === 1 ? (
                <BasicInfoStep
                  onBack={() => setCurrentStep(0)}
                  onContinue={handleNext}
                  onSaveForLater={handleSaveAndExit}
                  sessionUser={sessionUser}
                />
              ) : currentStep === 2 ? (
                <VerificationStep
                  onBack={() => setCurrentStep(1)}
                  onContinue={handleNext}
                  onSaveForLater={handleSaveAndExit}
                  isUploading={isUploading}
                  uploadError={uploadError}
                  onUploadDocument={handleUploadDocument}
                  fileInputRef={fileInputRef}
                />
              ) : currentStep === 3 ? (
                <TeamSetupStep
                  onBack={() => setCurrentStep(2)}
                  onContinue={handleNext}
                  onSaveForLater={handleSaveAndExit}
                />
              ) : (
                <ReviewStep
                  onBack={() => setCurrentStep(3)}
                  onSubmit={handleReviewSubmit}
                  onSaveForLater={handleSaveAndExit}
                />
              )}
            </div>

            <aside className="space-y-5 rounded-[1.75rem] border border-outline-variant bg-primary/5 p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
              <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
                <div className="flex items-center gap-3 text-primary">
                  <MaterialSymbol icon="work_outline" className="text-[22px]" />
                  <p className="text-xs font-semibold uppercase tracking-[0.28em]">
                    Employer path preview
                  </p>
                </div>

                <div className="mt-5 space-y-3">
                  <PreviewStat
                    label="Account email"
                    value={
                      methods.getValues("accountEmail") ||
                      "Captured from session"
                    }
                  />
                  <PreviewStat
                    label="Company"
                    value={
                      methods.getValues("companyName") || "Company profile"
                    }
                  />
                  <PreviewStat
                    label="Team size"
                    value={`${methods.getValues("currentTeamSize") || 0} workers`}
                  />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  Guidance
                </p>
                <div className="mt-4 space-y-3">
                  <InfoTile
                    icon="verified"
                    title="One registration document"
                    copy="Upload a single business registration image or PDF so the verification record stays simple and centralized."
                  />
                  <InfoTile
                    icon="groups"
                    title="Size and growth"
                    copy="Capture the current headcount and expected hires so the hiring side of the platform can reflect your needs."
                  />
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-primary/10 bg-surface-container-lowest p-5 shadow-[0_18px_50px_rgba(58,48,42,0.04)]">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Session
                </p>
                <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {sessionUser?.image ? (
                      <Image
                        src={sessionUser.image}
                        alt={
                          sessionUser.name
                            ? `${sessionUser.name} avatar`
                            : "User avatar"
                        }
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      (sessionUser?.name || "U")
                        .split(" ")
                        .filter(Boolean)
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()
                    )}
                  </div>
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
            </aside>
          </section>
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
          companyName={stepSnapshot.companyName}
          currentTeamSize={stepSnapshot.currentTeamSize || 0}
          plannedHires={stepSnapshot.plannedHires || 0}
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
  onSaveForLater,
}: {
  sessionUser?: SessionUser;
  sessionPending: boolean;
  onStart: () => void;
  onSaveForLater: () => void;
}) {
  return (
    <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Employer portal
        </div>

        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl tracking-tight text-on-surface lg:text-6xl">
            Register your company on Qualify
          </h1>
          <p className="max-w-2xl text-base leading-7 text-on-surface-variant sm:text-lg">
            Join the employer network, verify your business, and keep your
            onboarding draft ready for later if you need to step away.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <InfoTile
            icon="verified"
            title="Verified company badge"
            copy="Build immediate trust with candidates through a structured registration flow."
          />
          <InfoTile
            icon="groups"
            title="Access to qualified candidates"
            copy="Set up the employer side so later hiring tools can match the right people to the right roles."
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button onClick={onStart} className="px-6 py-3">
            Start employer registration
          </Button>
          <Button
            onClick={onSaveForLater}
            variant="outline"
            className="px-6 py-3"
          >
            Save and exit
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-[1.75rem] border border-outline-variant bg-primary/5 p-5 shadow-[0_18px_50px_rgba(58,48,42,0.05)]">
        <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Session preview
          </p>
          <div className="mt-4 flex items-center gap-3 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {sessionUser?.image ? (
                <Image
                  src={sessionUser.image}
                  alt={
                    sessionUser.name
                      ? `${sessionUser.name} avatar`
                      : "User avatar"
                  }
                  width={44}
                  height={44}
                  className="h-full w-full object-cover"
                />
              ) : (
                (sessionUser?.name || "U")
                  .split(" ")
                  .filter(Boolean)
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase()
              )}
            </div>
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

        <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            Process snapshot
          </p>
          <div className="mt-4 space-y-3">
            {[
              "Basic company details",
              "Business registration upload",
              "Team size and hiring plan",
              "Review and submit",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-[1rem] border border-outline-variant bg-surface p-3"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MaterialSymbol icon="check" className="text-[16px]" />
                </span>
                <p className="text-sm text-on-surface-variant">{item}</p>
              </div>
            ))}
          </div>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Step 1 of 4
          </p>
          <div>
            <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
              Tell us about your company
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
              Use the company details that should be attached to hiring activity
              on the platform.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveForLater}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="bookmark" className="text-[16px]" />
          Save for later
        </button>
      </div>

      <input
        type="hidden"
        {...register("accountEmail", {
          required: "Account email is required",
        })}
      />

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Company name"
          placeholder="e.g. Sahara Architectural Studio"
          error={errors.companyName?.message}
          registration={register("companyName", {
            required: "Company name is required",
          })}
        />
        <Field
          label="Company email"
          placeholder="name@business-domain.com"
          error={errors.companyEmail?.message}
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
          label="Phone number"
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
        label="Company address"
        placeholder="Full business street address"
        error={errors.address?.message}
        registration={register("address", {
          required: "Address is required",
        })}
      />

      <TextAreaField
        label="Business description"
        placeholder="Tell us what your company does and the kind of work you handle."
        error={errors.businessDescription?.message}
        registration={register("businessDescription", {
          required: "Business description is required",
        })}
      />

      <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
          Account email
        </p>
        <p className="mt-2 text-sm leading-6 text-on-surface-variant">
          {sessionUser?.email ||
            "We will use your session email to save progress."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
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
            Save for later
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue
            <MaterialSymbol icon="arrow_forward" className="ml-2 text-[18px]" />
          </Button>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Step 2 of 4
          </p>
          <div>
            <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
              Upload your business registration document
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
              The verification step accepts a single image or PDF so the record
              stays centralized and easy to review.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveForLater}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="bookmark" className="text-[16px]" />
          Save for later
        </button>
      </div>

      <div className="rounded-[1.5rem] border border-dashed border-outline-variant bg-surface-container-low p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Business registration
            </p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-on-surface-variant">
              Accepted formats: PDF, JPG, PNG, WEBP, or GIF. Upload one file per
              employer onboarding draft.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
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
          <p className="mt-3 text-sm text-destructive">{uploadError}</p>
        ) : null}

        {documentUrl ? (
          <div className="mt-5 rounded-[1.25rem] border border-outline-variant bg-surface p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Uploaded file
            </p>
            <div className="mt-2 flex items-center justify-between gap-4">
              <div className="min-w-0">
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
          </div>
        ) : null}

        {formState.errors.businessRegistrationUrl?.message ? (
          <p className="mt-3 text-xs text-destructive">
            {formState.errors.businessRegistrationUrl.message}
          </p>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-2">
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
            Save for later
          </Button>
          <Button type="button" onClick={onContinue} disabled={!documentUrl}>
            Continue
            <MaterialSymbol icon="arrow_forward" className="ml-2 text-[18px]" />
          </Button>
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Step 3 of 4
          </p>
          <div>
            <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
              Capture the size and direction of your team
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
              This helps the hiring side of the platform understand the scale
              and structure of your business.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveForLater}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="bookmark" className="text-[16px]" />
          Save for later
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Field
          label="Current number of workers"
          type="number"
          placeholder="5"
          error={errors.currentTeamSize?.message}
          registration={register("currentTeamSize", {
            required: "Current team size is required",
            valueAsNumber: true,
            min: { value: 1, message: "Current team size must be at least 1" },
          })}
        />
        <Field
          label="Planned hires"
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
        label="Key team focus"
        placeholder="e.g. Operations, sales, product delivery"
        error={errors.teamFocus?.message}
        registration={register("teamFocus", {
          required: "Team focus is required",
        })}
      />

      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
          Work mode
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
          <p className="text-xs text-destructive">{errors.workMode.message}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-between pt-2">
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
            Save for later
          </Button>
          <Button type="button" onClick={onContinue}>
            Continue
            <MaterialSymbol icon="arrow_forward" className="ml-2 text-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function ReviewStep({
  onBack,
  onSubmit,
  onSaveForLater,
}: {
  onBack: () => void;
  onSubmit: () => void;
  onSaveForLater: () => void;
}) {
  const { watch, register, formState } =
    useFormContext<EmployerOnboardingValues>();
  const values = watch();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
            Step 4 of 4
          </p>
          <div>
            <h1 className="text-3xl tracking-tight text-on-surface lg:text-4xl">
              Review and submit
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-on-surface-variant lg:text-base">
              Confirm the company record, document upload, and team setup before
              sending the employer profile into review.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSaveForLater}
          className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <MaterialSymbol icon="bookmark" className="text-[16px]" />
          Save for later
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Company"
          title={values.companyName || "Company name"}
          copy={`${values.companyEmail || "company@email.com"} · ${values.industry || "Industry"}`}
        />
        <SummaryCard
          label="Verification"
          title={values.businessRegistrationName || "Business document"}
          copy={
            values.businessRegistrationUrl
              ? "Document uploaded"
              : "Waiting for upload"
          }
        />
        <SummaryCard
          label="Team setup"
          title={`${values.currentTeamSize || 0} workers now`}
          copy={`${values.plannedHires || 0} planned hires · ${values.workMode}`}
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
        />
        <SummaryCard
          label="Team focus"
          title={values.teamFocus || "Hiring focus"}
          copy={
            values.businessDescription ||
            "Company description captured earlier in the flow."
          }
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

      <div className="flex items-center justify-between pt-2">
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
            Save for later
          </Button>
          <Button type="button" onClick={onSubmit}>
            Submit for review
            <MaterialSymbol icon="arrow_forward" className="ml-2 text-[18px]" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  type = "text",
  error,
  registration,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        {...registration}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
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
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
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

function SummaryCard({
  label,
  title,
  copy,
}: {
  label: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
        {label}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-on-surface">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-on-surface-variant">{copy}</p>
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

function InfoTile({
  icon,
  title,
  copy,
}: {
  icon: string;
  title: string;
  copy: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-4">
      <div className="flex items-center gap-3 text-primary">
        <MaterialSymbol icon={icon} className="text-[20px]" />
        <h2 className="text-base font-semibold text-on-surface">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-on-surface-variant">{copy}</p>
    </div>
  );
}
