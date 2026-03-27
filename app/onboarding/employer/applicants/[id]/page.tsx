import { EmployerApplicantDetailPage } from "@/components/sections/employer/employer-applicant-detail-page";

export const metadata = {
  title: "Applicant Detail",
};

export default async function EmployerApplicantDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EmployerApplicantDetailPage applicationId={id} />;
}
