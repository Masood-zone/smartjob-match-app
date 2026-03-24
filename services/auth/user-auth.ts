import { authClient } from "@/lib/auth-client";

export async function userSignUp(
  name: string,
  email: string,
  password: string,
  role: "ADMIN" | "EMPLOYER" | "JOB_SEEKER",
) {
  const signUpPayload = {
    name,
    email,
    password,
    role,
    callbackURL: "/",
  };

  const { data, error } = await authClient.signUp.email(signUpPayload, {
    //callbacks
  });
  return { data, error };
}

export async function userLogin(
  email: string,
  password: string,
  rememberMe: boolean = false,
) {
  const { data, error } = await authClient.signIn.email(
    {
      email,
      password,
      callbackURL: "/",
      rememberMe: rememberMe,
    },
    {
      //callbacks
    },
  );
  return { data, error };
}

export async function userLogout() {
  await authClient.signOut();
}
