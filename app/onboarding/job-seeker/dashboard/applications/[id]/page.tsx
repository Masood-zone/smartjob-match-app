import { JobSeekerApplicationStatusPage } from "@/components/sections/job-seeker/job-seeker-application-status-page";

export const metadata = {
  title: "Application Detail",
};

export default async function JobSeekerApplicationDetailRoutePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <JobSeekerApplicationStatusPage applicationId={id} />;
}
