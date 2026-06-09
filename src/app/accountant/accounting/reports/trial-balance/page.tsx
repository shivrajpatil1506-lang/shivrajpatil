import { getCompanies } from "@/app/actions/companies";
import { TrialBalanceClient } from "./client";

export default async function TrialBalancePage() {
  const companies = await getCompanies();
  return <TrialBalanceClient companies={companies} />;
}
