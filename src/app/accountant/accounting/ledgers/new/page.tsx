import { getCompanies } from "@/app/actions/companies";
import { NewLedgerClient } from "./client";

export default async function NewLedgerPage() {
  const companies = await getCompanies();
  return <NewLedgerClient companies={companies} />;
}
