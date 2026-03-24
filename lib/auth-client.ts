import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

const authBaseURL = process.env.NEXT_PUBLIC_AUTH_BASE_URL || "";
const emailOtpPlugin = emailOTPClient();

export const authClient = createAuthClient({
  baseURL: authBaseURL,
  plugins: [emailOtpPlugin],
});

export const { signIn, signUp, signOut, useSession } = authClient;
