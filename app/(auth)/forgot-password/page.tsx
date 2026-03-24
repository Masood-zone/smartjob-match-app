"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { MaterialSymbol } from "@/components/common/MaterialSymbol";
import { AuthPageShell } from "@/components/sections/auth/auth-page-shell";
import { requestPasswordReset } from "@/services/auth/user-auth";

type ForgotPasswordFormValues = {
  email: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>();

  const onSubmit = async ({ email }: ForgotPasswordFormValues) => {
    const { error } = await requestPasswordReset(email);

    if (error) {
      toast.error(error.message || "Unable to request a reset code");
      return;
    }

    toast.success("Reset code sent. Check your inbox.");
    router.push(
      `/verify-otp?email=${encodeURIComponent(email)}&type=forget-password`,
    );
  };

  return (
    <AuthPageShell
      eyebrow="Account recovery"
      title="Recover access to your account"
      description="Request a password reset code and continue through verification before setting a new password."
      highlights={[
        {
          icon: "lock_reset",
          title: "OTP-first recovery",
          description:
            "The reset flow uses Better Auth's email OTP helpers so the password change step stays separate.",
        },
        {
          icon: "shield",
          title: "Safer recovery",
          description:
            "Codes expire and the reset step requires both the email address and the verification code.",
        },
      ]}
      footnote={
        <div className="space-y-2">
          <p className="text-sm leading-6 text-foreground">
            If your email exists, you’ll receive a code that takes you to the
            verification step.
          </p>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            No password is changed until the code is confirmed.
          </p>
        </div>
      }
    >
      <div className="rounded-[1.4rem] border border-border/70 bg-background/80 p-5 sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <MaterialSymbol icon="mail" className="text-[20px]" />
          </div>
          <div>
            <h2 className="text-xl text-foreground">Send recovery code</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Enter the email attached to your account and we’ll prepare the
              next step.
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

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_rgba(194,101,42,0.28)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? "Sending code..." : "Send reset code"}
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
            href="/register"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Need an account?
          </Link>
        </div>
      </div>
    </AuthPageShell>
  );
}
