"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { cn } from "@/lib/utils";

import { employerFlowSteps } from "./employer-flow";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function getInitials(name?: string | null) {
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

export function AvatarBadge({
  user,
  sessionPending = false,
  size = 44,
}: {
  user?: SessionUser;
  sessionPending?: boolean;
  size?: number;
}) {
  return (
    <div
      className="relative flex items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary"
      style={{ width: size, height: size }}
    >
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ? `${user.name} avatar` : "User avatar"}
          width={size}
          height={size}
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

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
    />
  );
}

export function FeatureCard({
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

export function AsideCard({
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

export function SummaryCard({
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

export function PreviewStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1rem] border border-outline-variant bg-surface p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold text-on-surface">{value}</p>
    </div>
  );
}

export function StepHeader({
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

export function Field({
  label,
  placeholder,
  type = "text",
  error,
  helperText,
  registration,
  readOnly = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  error?: string;
  helperText?: string;
  registration: UseFormRegisterReturn;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        readOnly={readOnly}
        {...registration}
        className={cn(
          "w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20",
          readOnly &&
            "cursor-not-allowed bg-surface-container-low text-on-surface-variant",
        )}
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

export function TextAreaField({
  label,
  placeholder,
  error,
  registration,
  autoResize = false,
}: {
  label: string;
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  autoResize?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-on-surface-variant">
        {label}
      </label>
      {(() => {
        const { ref: registrationRef, ...inputRegistration } = registration;

        return (
          <textarea
            placeholder={placeholder}
            rows={4}
            {...inputRegistration}
            ref={(element) => {
              textareaRef.current = element;

              if (typeof registrationRef === "function") {
                registrationRef(element);
              } else if (registrationRef) {
                registrationRef.current = element;
              }

              if (element && autoResize) {
                resizeTextarea();
              }
            }}
            onInput={autoResize ? resizeTextarea : undefined}
            className="w-full rounded-lg border border-outline-variant bg-surface px-4 py-3 text-on-surface outline-none transition-all placeholder:text-stone-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        );
      })()}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

export function ProgressSidebar({
  currentStepKey,
}: {
  currentStepKey: string;
}) {
  const currentStepIndex = Math.max(
    employerFlowSteps.findIndex((step) => step.key === currentStepKey),
    0,
  );

  return (
    <aside className="hidden rounded-[1.75rem] border border-[#d8d0c8]/60 bg-[#faf5ee] p-5 shadow-[0_2px_16px_rgba(58,48,42,0.04)] lg:sticky lg:top-24 lg:self-start lg:block">
      <div className="space-y-2">
        <p className="text-2xl font-serif text-on-surface">Onboarding</p>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
          Step {currentStepIndex + 1} of 5
        </p>
      </div>

      <nav className="mt-6 flex flex-col gap-2">
        {employerFlowSteps.slice(1, 5).map((step, index) => {
          const stepFullIndex = employerFlowSteps.findIndex(
            (item) => item.key === step.key,
          );
          const isActive = step.key === currentStepKey;
          const isCompleted = stepFullIndex < currentStepIndex;
          const isClickable = stepFullIndex <= currentStepIndex;

          return (
            <Link
              key={step.key}
              href={step.href}
              aria-current={isActive ? "step" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all",
                isActive
                  ? "border-r-4 border-primary bg-primary/5 text-primary shadow-[0_10px_24px_rgba(194,101,42,0.08)]"
                  : "text-stone-400 hover:bg-primary/5 hover:text-primary",
                !isClickable && "pointer-events-none opacity-70",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                  isCompleted
                    ? "border-primary bg-primary/10 text-primary"
                    : isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-outline-variant bg-surface text-stone-500",
                )}
              >
                {isCompleted ? (
                  <MaterialSymbol icon="check" className="text-[16px]" />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">
                  {step.label}
                </span>
                <span className="block truncate text-xs text-stone-500">
                  {step.key === "verification"
                    ? "Upload a single business document"
                    : step.key === "basic-info"
                      ? "Provide your official business details"
                      : step.key === "team-setup"
                        ? "Tell us how many workers you have"
                        : "Confirm the record and submit"}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
