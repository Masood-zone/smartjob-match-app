"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { AuthPageShell } from "@/components/sections/auth/auth-page-shell";
import {
  checkVerificationOtp,
  requestPasswordReset,
  sendVerificationOtp,
  userLoginWithOtp,
  verifyEmailOtp,
} from "@/services/auth/user-auth";

type VerifyOtpFormValues = {
  email: string;
  otp: string;
};

type VerificationFlow = "sign-in" | "email-verification" | "forget-password";

type VerifyOtpFormProps = {
  email: string;
  type: VerificationFlow;
};

export function VerifyOtpForm({
  email: emailFromQuery,
  type,
}: VerifyOtpFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyOtpFormValues>({
    defaultValues: {
      email: emailFromQuery,
    },
  });

  const flowCopy = useMemo(() => {
    if (type === "forget-password") {
      return {
        eyebrow: "Password reset",
        title: "Confirm the recovery code",
        description:
          "Enter the one-time code you received to unlock the final password reset step.",
        action: "Confirm code",
        icon: "lock_reset",
      };
    }

    if (type === "sign-in") {
      return {
        eyebrow: "Sign in with OTP",
        title: "Use the email code to log in",
        description:
          "Enter the code sent to your inbox to access your account without a password.",
        action: "Sign in",
        icon: "key",
      };
    }

    return {
      eyebrow: "Email verification",
      title: "Check your inbox for the verification code",
      description:
        "Enter the six-digit code to verify your account and unlock the next step.",
      action: "Verify code",
      icon: "mail",
    };
  }, [type]);

  const onSubmit = async ({ email, otp }: VerifyOtpFormValues) => {
    if (type === "forget-password") {
      const { error } = await checkVerificationOtp({
        email,
        otp,
        type: "forget-password",
      });

      if (error) {
        toast.error(error.message || "Unable to confirm the code");
        return;
      }

      toast.success("Code confirmed. Continue to reset your password.");
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      );
      return;
    }

    if (type === "sign-in") {
      const { error } = await userLoginWithOtp({ email, otp });

      if (error) {
        toast.error(error.message || "Unable to sign you in");
        return;
      }

      toast.success("Signed in successfully");
      router.push("/");
      return;
    }

    const { error } = await verifyEmailOtp(email, otp);

    if (error) {
      toast.error(error.message || "Unable to verify the email address");
      return;
    }

    toast.success("Email verified successfully");
    router.push("/login?verified=1");
  };

  const handleResend = async () => {
    const email = emailFromQuery;

    if (!email) {
      toast.error("Add your email address first");
      return;
    }

    if (type === "forget-password") {
      const { error } = await requestPasswordReset(email);

      if (error) {
        toast.error(error.message || "Unable to resend the reset code");
        return;
      }

      toast.success("Reset code resent");
      return;
    }

    if (type === "sign-in") {
      const { error } = await sendVerificationOtp(email);

      if (error) {
        toast.error(error.message || "Unable to resend the sign in code");
        return;
      }

      toast.success("Sign in code resent");
      return;
    }

    const { error } = await sendVerificationOtp(email);

    if (error) {
      toast.error(error.message || "Unable to resend the verification code");
      return;
    }

    toast.success("Verification code resent");
  };

  return (
    <AuthPageShell
      eyebrow={flowCopy.eyebrow}
      title={flowCopy.title}
      description={flowCopy.description}
      highlights={[
        {
          icon: flowCopy.icon,
          title: "Code-based control",
          description:
            "This page is shared across sign-in, email verification, and password reset verification.",
        },
        {
          icon: "timer",
          title: "Short-lived recovery",
          description:
            "Codes expire quickly so the flow stays secure and easy to reason about.",
        },
      ]}
      footnote={
        <div className="space-y-2">
          <p className="text-sm leading-6 text-foreground">
            Use the resend action only if the code has not arrived yet.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            The verification route is driven by the query string type.
          </p>
        </div>
      }
    >
      <div className="rounded-[1.4rem] border border-border/70 bg-background/80 p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MaterialSymbol icon={flowCopy.icon} className="text-[20px]" />
          </div>
          <div>
            <h2 className="text-xl text-foreground">Enter your code</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              If you started from another page, your email should already be
              filled in.
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
              {...register("email", { required: "Email address is required" })}
            />
            {errors.email ? (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="otp"
            >
              Verification code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
              {...register("otp", {
                required: "Enter the verification code",
                minLength: { value: 4, message: "Code is too short" },
              })}
            />
            {errors.otp ? (
              <p className="text-xs text-destructive">{errors.otp.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_rgba(194,101,42,0.28)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Checking code..." : flowCopy.action}
          </button>

          <button
            type="button"
            onClick={handleResend}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border/70 bg-background px-4 py-4 text-sm font-semibold text-foreground transition-all hover:border-primary hover:text-primary"
          >
            Resend code
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
            href="/forgot-password"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Reset by code
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
