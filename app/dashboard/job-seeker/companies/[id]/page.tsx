import { CompanyDetailPage } from "@/components/sections/companies/company-detail-page";

export const metadata = {
  title: "Company Details",
};

export default async function DashboardCompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <CompanyDetailPage companyId={id} />;
}
