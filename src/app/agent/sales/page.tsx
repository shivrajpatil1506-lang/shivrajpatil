import { getTransactionsForCurrentUser } from "@/app/actions/transactions";
import { SalesClient } from "./client";

export default async function AgentSalesPage() {
  const txns = await getTransactionsForCurrentUser();
  const sales = txns.filter(t => t.category === "PROPERTY_SALE");
  return <SalesClient initialSales={sales} />;
}
