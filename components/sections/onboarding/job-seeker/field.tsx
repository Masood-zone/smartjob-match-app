import { useFormContext } from "react-hook-form";
import type { Path, RegisterOptions } from "react-hook-form";

import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function Field({
  name,
  label,
  placeholder,
  type = "text",
  suggestions,
  rules,
  readOnly = false,
}: {
  name: Path<JobSeekerOnboardingValues>;
  label: string;
  placeholder: string;
  type?: string;
  suggestions?: string[];
  rules?: RegisterOptions<
    JobSeekerOnboardingValues,
    Path<JobSeekerOnboardingValues>
  >;
  readOnly?: boolean;
}) {
  const { register, getFieldState, formState } =
    useFormContext<JobSeekerOnboardingValues>();
  const listId = `${String(name)}-suggestions`;
  const fieldState = getFieldState(name, formState);

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        list={suggestions?.length ? listId : undefined}
        readOnly={readOnly}
        className={`w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15 ${readOnly ? "cursor-not-allowed bg-surface-container-low text-on-surface-variant" : ""}`}
        {...register(name, rules)}
      />
      {fieldState.error?.message ? (
        <p className="text-xs text-destructive">{fieldState.error.message}</p>
      ) : null}
      {suggestions?.length ? (
        <datalist id={listId}>
          {suggestions.map((item) => (
            <option key={item} value={item} />
          ))}
        </datalist>
      ) : null}
    </div>
  );
}
