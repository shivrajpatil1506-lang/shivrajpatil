import { getCompanies } from "@/app/actions/companies";
import { getSites } from "@/app/actions/sites";
import { getCustomers } from "@/app/actions/customers";
import { AddTransactionClient } from "./client";

export default async function AddTransactionPage() {
  const [companies, sites, customers] = await Promise.all([
    getCompanies(),
    getSites(),
    getCustomers(),
  ]);

  return <AddTransactionClient companies={companies} sites={sites} customers={customers} />;
}
