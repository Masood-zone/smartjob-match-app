"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthPageShell } from "@/components/sections/auth/auth-page-shell";
import { userLogin } from "@/services/auth/user-auth";

type LoginFormValues = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: {
      rememberMe: true,
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const { error } = await userLogin({
      email: values.email,
      password: values.password,
      rememberMe: values.rememberMe,
    });

    if (error) {
      toast.error(
        error.message || "Unable to sign in. Check your credentials.",
      );
      return;
    }

    toast.success("Signed in successfully");
    router.push("/onboarding/job-seeker");
  };

  return (
    <AuthPageShell
      eyebrow="Secure access"
      title="Welcome back to Qualify"
      description="Sign in as a user first. Your role upgrade happens later during onboarding."
      highlights={[
        {
          icon: "verified_user",
          title: "User-first access",
          description:
            "Every account starts as a plain user before the profile is specialized.",
        },
        {
          icon: "mail",
          title: "Secure password login",
          description: "Use your password when you need to sign in.",
        },
      ]}
    >
      <form
        className="space-y-5 rounded-[1.4rem] border border-border/70 bg-background/80 p-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
            placeholder="name@company.com"
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            {...register("email", { required: "Email address is required" })}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="password"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-primary transition-colors hover:text-primary/80"
            >
              Forgot?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            })}
          />
          {errors.password ? (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
            {...register("rememberMe")}
          />
          Keep me signed in on this device
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_rgba(194,101,42,0.28)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Signing in..." : "Continue"}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        {/* <Link
          href="/verify-otp?type=sign-in"
          className="font-semibold text-primary transition-colors hover:text-primary/80"
        >
          Use email OTP instead
        </Link> */}
        <Link
          href="/register"
          className="font-semibold text-foreground transition-colors hover:text-primary px-4 py-2"
        >
          Create an account
        </Link>
      </div>
    </AuthPageShell>
  );
}
