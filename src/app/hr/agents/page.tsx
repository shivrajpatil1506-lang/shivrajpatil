import { getCompanies } from "@/app/actions/companies";
import { getAgents } from "@/app/actions/employees";
import { AgentsClient } from "./client";

export default async function HrAgentsPage() {
  const [aData, cData] = await Promise.all([getAgents(), getCompanies()]);
  
  const agentsWithMockData = aData.map((a, i) => ({
    ...a,
    totalSales: [18, 12, 10, 6][i] || 3,
    totalValue: [82000000, 58000000, 45000000, 24000000][i] || 15000000,
    thisMonth: [3, 2, 1, 1][i] || 0,
  }));
  
  return <AgentsClient initialAgents={agentsWithMockData} companies={cData} />;
}
