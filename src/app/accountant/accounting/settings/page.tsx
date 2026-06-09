import { getCompanies } from "@/app/actions/companies";
import { AccountingSettingsClient } from "./client";

export default async function AccountingSettingsPage() {
  const companies = await getCompanies();
  return <AccountingSettingsClient companies={companies} />;
}
