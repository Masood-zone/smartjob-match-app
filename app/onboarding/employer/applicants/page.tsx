import { EmployerApplicantsPage } from "@/components/sections/employer/employer-applicants-page";

export const metadata = {
  title: "Employer Applicants",
};

export default function EmployerApplicantsRoutePage({
  searchParams,
}: {
  searchParams?: {
    jobId?: string;
  };
}) {
  return <EmployerApplicantsPage initialJobId={searchParams?.jobId} />;
}
