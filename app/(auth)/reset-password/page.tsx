"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { AuthPageShell } from "@/components/sections/auth/auth-page-shell";
import { resetPasswordWithOtp } from "@/services/auth/user-auth";

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const otp = searchParams.get("otp") || "";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>();

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }

    if (!email || !otp) {
      toast.error("The reset code is missing. Please verify it again.");
      return;
    }

    const { error } = await resetPasswordWithOtp({
      email,
      otp,
      password: values.password,
    });

    if (error) {
      toast.error(error.message || "Unable to update the password");
      return;
    }

    toast.success("Password updated successfully");
    router.push("/login?reset=1");
  };

  return (
    <AuthPageShell
      eyebrow="Set a new password"
      title="Finish resetting your password"
      description="Use the confirmed code to create a fresh password and close the recovery flow."
      highlights={[
        {
          icon: "lock",
          title: "Password change only",
          description:
            "The code is already verified, so this screen only updates the credential itself.",
        },
        {
          icon: "security",
          title: "Session safety",
          description:
            "The Better Auth flow can revoke old sessions after a password reset when configured to do so.",
        },
      ]}
      footnote={
        <div className="space-y-2">
          <p className="text-sm leading-6 text-foreground">
            Reset codes are tied to the email and OTP you just confirmed.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            If the token is missing, return to verification first.
          </p>
        </div>
      }
    >
      <div className="rounded-[1.4rem] border border-border/70 bg-background/80 p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MaterialSymbol icon="key" className="text-[20px]" />
          </div>
          <div>
            <h2 className="text-xl text-foreground">Create a new password</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {email
                ? `Recovery email: ${email}`
                : "No email found in the reset link."}
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="password"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a strong password"
                className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 pr-12 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 8, message: "Use at least 8 characters" },
                })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <MaterialSymbol
                  icon={showPassword ? "visibility_off" : "visibility"}
                  className="text-[18px]"
                />
              </button>
            </div>
            {errors.password ? (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="confirmPassword"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Repeat the password"
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
              {...register("confirmPassword", {
                required: "Confirm your password",
              })}
            />
            {errors.confirmPassword ? (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_rgba(194,101,42,0.28)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Updating password..." : "Update password"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <Link
            href="/login"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Back to login
          </Link>
          <Link
            href="/verify-otp?type=forget-password"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Verify code again
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
