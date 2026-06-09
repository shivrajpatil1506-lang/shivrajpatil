import { getCompanies } from "@/app/actions/companies";
import { GroupsClient } from "./client";

export default async function ChartOfAccountsPage() {
  const companies = await getCompanies();
  return <GroupsClient companies={companies} />;
}
