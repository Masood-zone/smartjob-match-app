import { VerifyOtpForm } from "./verify-otp-form";

export default function VerifyOtpPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const email =
    typeof searchParams.email === "string" ? searchParams.email : "";
  const type =
    searchParams.type === "sign-in" ||
    searchParams.type === "forget-password" ||
    searchParams.type === "email-verification"
      ? searchParams.type
      : "email-verification";

  return <VerifyOtpForm email={email} type={type} />;
}
