"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthPageShell } from "@/components/sections/auth/auth-page-shell";
import { userSignUp } from "@/services/auth/user-auth";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const onSubmit = async (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      setError("confirmPassword", {
        type: "validate",
        message: "Passwords do not match",
      });
      return;
    }

    const { error } = await userSignUp({
      name: values.name,
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error(error.message || "Unable to create account");
      return;
    }

    toast.success("Account created successfully");
    router.push("/login");
  };

  return (
    <AuthPageShell
      eyebrow="Create account"
      title="Create your Qualify account"
      description="Sign up as a user first. Profile type upgrades will happen later during onboarding."
      highlights={[
        {
          icon: "shield",
          title: "User-first signup",
          description:
            "Authentication creates a plain user account before profile specialization begins.",
        },
        {
          icon: "fact_check",
          title: "Upgrade your account",
          description:
            "Immediately you register with us you will have the opportunity to now upgrade your account towards becoming a Job seeker or an Employer",
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
            htmlFor="name"
          >
            Full name
          </label>
          <input
            id="name"
            placeholder="Your full name"
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            {...register("name", { required: "Full name is required" })}
          />
          {errors.name ? (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          ) : null}
        </div>

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
            className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
            {...register("email", {
              required: "Email address is required",
            })}
          />
          {errors.email ? (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              className="w-full rounded-2xl border border-border/70 bg-background px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
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

          <div className="space-y-2">
            <label
              className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground"
              htmlFor="confirmPassword"
            >
              Confirm password
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
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground shadow-[0_16px_36px_rgba(194,101,42,0.28)] transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <Link
          href="/login"
          className="font-semibold text-primary transition-colors hover:text-primary/80 px-4 py-2"
        >
          Already have an account? Login
        </Link>
      </div>
    </AuthPageShell>
  );
}
