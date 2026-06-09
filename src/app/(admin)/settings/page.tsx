import { getCompanies } from "@/app/actions/companies";
import { getEmployees } from "@/app/actions/employees";
import { SettingsClient } from "./client";

export default async function SettingsPage() {
  const [companies, employees] = await Promise.all([
    getCompanies(),
    getEmployees()
  ]);
  
  return <SettingsClient initialCompanies={companies} initialEmployees={employees} />;
}
