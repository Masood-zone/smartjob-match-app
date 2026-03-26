"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, FormProvider, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { OnboardingFrame } from "@/components/sections/onboarding/employer/employer-page-frame";
import {
  AsideCard,
  Field,
  LoadingSpinner,
  StepHeader,
  TextAreaField,
} from "@/components/sections/onboarding/employer/employer-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession } from "@/lib/auth-client";
import { useStoreEmployerOnboardingStep } from "@/services/onboarding/employer-onboarding";
import { useEmployerOnboardingStore } from "@/stores/employer-onboarding-store";
import {
  getTownsForRegion,
  ghanaRegions,
  skillSectors,
} from "@/utils/platform-data";

import { employerRoutes } from "@/components/sections/onboarding/employer/employer-flow";
import {
  employerOnboardingDefaultValues,
  type EmployerOnboardingValues,
} from "@/components/sections/onboarding/employer/employer-onboarding-types";

export default function EmployerBasicInfoPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const savedData = useEmployerOnboardingStore((state) => state.data);
  const saveStepData = useEmployerOnboardingStore(
    (state) => state.saveStepData,
  );
  const saveStepMutation = useStoreEmployerOnboardingStep();
  const isStepSaving = saveStepMutation.isPending;

  const methods = useForm<EmployerOnboardingValues>({
    defaultValues: savedData ?? employerOnboardingDefaultValues,
    shouldUnregister: false,
    mode: "onSubmit",
  });

  const selectedCountry = useWatch({
    control: methods.control,
    name: "country",
  });

  const cityOptions = getTownsForRegion(selectedCountry || "");

  const user = session?.user;

  useEffect(() => {
    if (user?.email && !methods.getValues("accountEmail")) {
      methods.setValue("accountEmail", user.email, {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [methods, user?.email]);

  useEffect(() => {
    const currentCity = methods.getValues("city");
    const availableCities = getTownsForRegion(selectedCountry || "");

    if (
      currentCity &&
      (!selectedCountry || !availableCities.includes(currentCity))
    ) {
      methods.setValue("city", "", {
        shouldDirty: true,
        shouldTouch: true,
      });
    }
  }, [methods, selectedCountry]);

  const persist = async (values: EmployerOnboardingValues) => {
    const nextValues = {
      ...values,
      businessRegistrationName:
        values.businessRegistrationName?.trim() || values.companyName.trim(),
    };

    const valid = await methods.trigger([
      "accountEmail",
      "companyName",
      "phoneNumber",
      "industry",
      "country",
      "city",
      "address",
    ]);

    if (!valid) {
      return false;
    }

    saveStepData(nextValues);
    await saveStepMutation.mutateAsync({
      stepKey: "basic-info",
      values: nextValues,
    });
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

          <div className="rounded-[1.5rem] border border-outline-variant bg-surface-container-low p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="max-w-2xl space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary">
                  Account Email
                </p>
                <p className="text-sm leading-6 text-on-surface-variant">
                  This is the email linked to your employer profile. We use it
                  to save this draft and connect the onboarding record to your
                  account.
                </p>
              </div>
              <div className="rounded-full border border-outline-variant bg-surface px-3 py-2 text-sm font-medium text-on-surface-variant">
                {user?.email || "We will use your session email"}
              </div>
            </div>
          </div>

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
              registration={methods.register("companyEmail")}
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
              label="Website (Optional)"
              placeholder="https://company.com"
              registration={methods.register("website")}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Industry
              </label>
              <Controller
                control={methods.control}
                name="industry"
                rules={{ required: "Industry is required" }}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillSectors.map((sector) => (
                        <SelectItem key={sector.id} value={sector.label}>
                          {sector.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {methods.formState.errors.industry ? (
                <p className="text-xs text-destructive">
                  {methods.formState.errors.industry.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                Region
              </label>
              <Controller
                control={methods.control}
                name="country"
                rules={{ required: "Region is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      methods.setValue("city", "", {
                        shouldDirty: true,
                        shouldTouch: true,
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a region" />
                    </SelectTrigger>
                    <SelectContent>
                      {ghanaRegions.map((region) => (
                        <SelectItem key={region.name} value={region.name}>
                          {region.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {methods.formState.errors.country ? (
                <p className="text-xs text-destructive">
                  {methods.formState.errors.country.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface-variant">
                City
              </label>
              <Controller
                control={methods.control}
                name="city"
                rules={{ required: "City is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCountry
                            ? "Select a city"
                            : "Select a country first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {cityOptions.map((town) => (
                        <SelectItem key={town} value={town}>
                          {town}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {methods.formState.errors.city ? (
                <p className="text-xs text-destructive">
                  {methods.formState.errors.city.message}
                </p>
              ) : null}
            </div>
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
            registration={methods.register("businessDescription")}
            autoResize
          />

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
                disabled={isStepSaving}
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStepSaving ? (
                  <>
                    <LoadingSpinner className="border-white/80" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    Continue to Verification
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </FormProvider>
    </OnboardingFrame>
  );
}
