import type { SearchParams } from "next/dist/server/request/search-params";

import { ResetPasswordForm } from "./reset-password-form";

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const email =
    typeof searchParams.email === "string" ? searchParams.email : "";
  const otp = typeof searchParams.otp === "string" ? searchParams.otp : "";

  return <ResetPasswordForm email={email} otp={otp} />;
}
