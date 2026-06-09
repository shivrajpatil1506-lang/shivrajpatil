import { getCompanies } from "@/app/actions/companies";
import { CompaniesClient } from "./client";

export default async function CompaniesPage() {
  const companies = await getCompanies();
  return <CompaniesClient initialData={companies} />;
}
