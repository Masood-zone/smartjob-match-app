"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import { OnboardingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AsideCard,
  AvatarBadge,
  LoadingSpinner,
  StepHeader,
} from "@/components/sections/onboarding/employer/employer-ui";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

type UploadedDocument = {
  name: string;
  url: string;
  publicId: string;
};

export default function EmployerVerificationPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: session, isPending } = useSession();
  const savedData = useEmployerOnboardingStore((state) => state.data);
  const saveStepData = useEmployerOnboardingStore(
    (state) => state.saveStepData,
  );
  const saveStepMutation = useStoreEmployerOnboardingStep();
  const isStepSaving = saveStepMutation.isPending;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedDocument, setUploadedDocument] =
    useState<UploadedDocument | null>(null);

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

    const currentUrl = methods.getValues("businessRegistrationUrl");
    const currentName = methods.getValues("businessRegistrationName");
    const currentPublicId = methods.getValues("businessRegistrationPublicId");

    if (currentUrl && currentName) {
      setUploadedDocument({
        name: currentName,
        url: currentUrl,
        publicId: currentPublicId || "",
      });
    }
  }, [methods, user?.email]);

  const uploadDocument = async () => {
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

      const url = payload.data.secureUrl || payload.data.url;
      const publicId = payload.data.publicId || "";

      methods.setValue("businessRegistrationName", file.name, {
        shouldDirty: true,
        shouldTouch: true,
      });
      methods.setValue("businessRegistrationUrl", url, {
        shouldDirty: true,
        shouldTouch: true,
      });
      methods.setValue("businessRegistrationPublicId", publicId, {
        shouldDirty: true,
        shouldTouch: true,
      });

      setUploadedDocument({
        name: file.name,
        url,
        publicId,
      });
      toast.success("Registration document uploaded");
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const persist = async () => {
    const values = methods.getValues();
    const valid = await methods.trigger([
      "businessRegistrationName",
      "businessRegistrationUrl",
      "businessRegistrationPublicId",
    ]);

    if (!valid) {
      return false;
    }

    saveStepData(values);
    await saveStepMutation.mutateAsync({ stepKey: "verification", values });
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
      router.push(employerRoutes.teamSetup);
      router.refresh();
      toast.success("Verification document saved");
    }
  };

  const documentReady = Boolean(uploadedDocument?.url);

  return (
    <OnboardingFrame
      currentStepKey="verification"
      aside={
        <div className="space-y-4">
          <AsideCard title="One file only" icon="description">
            Upload a single business registration image or PDF. Keep it clear,
            legible, and aligned with the company name you entered earlier.
          </AsideCard>
          <AsideCard title="Accepted formats" icon="upload_file">
            PDF, JPG, PNG, WebP, and GIF files are supported by the shared
            upload route.
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
          stepLabel="Step 3 of 5"
          title="Verify your business registration"
          description="Upload the official business register document that supports the company details you provided."
          actionLabel="Save Progress"
          onAction={handleSaveDraft}
        />

        <section className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <MaterialSymbol icon="verified" className="text-[24px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-on-surface">
                Business registration upload
              </p>
              <p className="mt-1 text-sm leading-6 text-on-surface-variant">
                Attach one document only. The record is stored in Cloudinary and
                linked to your onboarding draft.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,image/*"
              className="block w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-sm text-on-surface file:mr-4 file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
            />
            <button
              type="button"
              onClick={uploadDocument}
              disabled={isUploading}
              className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? "Uploading" : "Upload document"}
            </button>
          </div>

          {uploadError ? (
            <p className="mt-4 text-sm text-destructive">{uploadError}</p>
          ) : null}

          {uploadedDocument ? (
            <div className="mt-6 flex flex-col gap-4 rounded-[1.25rem] border border-outline-variant bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <MaterialSymbol icon="description" className="text-[20px]" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-on-surface">
                    {uploadedDocument.name}
                  </p>
                  <p className="truncate text-xs text-on-surface-variant">
                    Saved to the employer onboarding draft.
                  </p>
                </div>
              </div>
              <a
                href={uploadedDocument.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-outline-variant px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:bg-surface-container-low"
              >
                View file
                <MaterialSymbol icon="open_in_new" className="text-[16px]" />
              </a>
            </div>
          ) : null}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Current status
            </p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              {documentReady
                ? "The registration document is attached and ready for the next step."
                : "Upload the registration document before you continue."}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-outline-variant bg-surface-container-low p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
              Support note
            </p>
            <p className="mt-3 text-sm leading-6 text-on-surface-variant">
              If the file is rejected, ensure it is a clear scan or image with
              the company name visible.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href={employerRoutes.basicInfo}
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
              disabled={!documentReady || isStepSaving}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStepSaving ? (
                <>
                  <LoadingSpinner className="border-white/80" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  Continue to Team Setup
                  <span aria-hidden="true">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </OnboardingFrame>
  );
}
