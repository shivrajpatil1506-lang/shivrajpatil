import { getCompanies } from "@/app/actions/companies";
import { NewVoucherClient } from "./client";

export default async function NewVoucherPage() {
  const companies = await getCompanies();
  return <NewVoucherClient companies={companies} />;
}
