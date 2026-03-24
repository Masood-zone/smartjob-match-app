import { useFormContext } from "react-hook-form";
import type { Path } from "react-hook-form";

import type { JobSeekerOnboardingValues } from "./job-seeker-onboarding-types";

export function Field({
  name,
  label,
  placeholder,
  type = "text",
  suggestions,
}: {
  name: Path<JobSeekerOnboardingValues>;
  label: string;
  placeholder: string;
  type?: string;
  suggestions?: string[];
}) {
  const { register } = useFormContext<JobSeekerOnboardingValues>();
  const listId = `${String(name)}-suggestions`;

  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-bold uppercase tracking-[0.28em] text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        list={suggestions?.length ? listId : undefined}
        className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/15"
        {...register(name)}
      />
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
