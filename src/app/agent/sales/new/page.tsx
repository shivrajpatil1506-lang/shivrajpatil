import { getCompanies } from "@/app/actions/companies";
import { getSites } from "@/app/actions/sites";
import { NewSaleClient } from "./client";

export default async function AddSalePage() {
  const [companies, sites] = await Promise.all([getCompanies(), getSites()]);
  return <NewSaleClient companies={companies} sites={sites} />;
}
