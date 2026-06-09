import { getCompanies } from "@/app/actions/companies";
import { NewEmployeeClient } from "./client";

export default async function AddEmployeePage() {
  const companies = await getCompanies();
  return <NewEmployeeClient companies={companies} />;
}
