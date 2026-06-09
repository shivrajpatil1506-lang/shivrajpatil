import { getSites } from "@/app/actions/sites";
import { getCompanies } from "@/app/actions/companies";
import { SitesClient } from "./client";

export default async function SitesPage() {
  const [sites, companies] = await Promise.all([
    getSites(),
    getCompanies()
  ]);
  return <SitesClient initialSites={sites} companies={companies} />;
}
