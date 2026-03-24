import { authClient } from "@/lib/auth-client";

export async function userSignUp({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  return authClient.signUp.email({
    name,
    email,
    password,
  });
}

export async function userLogin({
  email,
  password,
  rememberMe = false,
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
}) {
  return authClient.signIn.email({
    email,
    password,
    rememberMe,
    callbackURL: "/",
  });
}

export async function userLoginWithOtp({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  return authClient.signIn.emailOtp({
    email,
    otp,
  });
}

export async function userLogout() {
  return authClient.signOut({});
}

export async function sendVerificationOtp(email: string) {
  return authClient.emailOtp.sendVerificationOtp({
    email,
    type: "email-verification",
  });
}

export async function verifyEmailOtp(email: string, otp: string) {
  return authClient.emailOtp.verifyEmail({
    email,
    otp,
  });
}

export async function requestPasswordReset(email: string) {
  return authClient.emailOtp.requestPasswordReset({
    email,
  });
}

export async function checkVerificationOtp({
  email,
  otp,
  type,
}: {
  email: string;
  otp: string;
  type: "forget-password" | "sign-in" | "email-verification";
}) {
  return authClient.emailOtp.checkVerificationOtp({
    email,
    otp,
    type,
  });
}

export async function resetPasswordWithOtp({
  email,
  otp,
  password,
}: {
  email: string;
  otp: string;
  password: string;
}) {
  return authClient.emailOtp.resetPassword({
    email,
    otp,
    password,
  });
}
