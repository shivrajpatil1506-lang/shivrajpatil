import { getEmployees } from "@/app/actions/employees";
import { getCompanies } from "@/app/actions/companies";
import { EmployeesClient } from "./client";

export default async function EmployeesPage() {
  const [employees, companies] = await Promise.all([
    getEmployees(),
    getCompanies()
  ]);
  return <EmployeesClient initialEmployees={employees} companies={companies} />;
}
