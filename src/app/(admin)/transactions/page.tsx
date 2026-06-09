import { getTransactions } from "@/app/actions/transactions";
import { getCompanies } from "@/app/actions/companies";
import { TransactionsClient } from "./client";

export default async function TransactionsPage() {
  const [transactions, companies] = await Promise.all([
    getTransactions(),
    getCompanies()
  ]);
  return <TransactionsClient initialTransactions={transactions} companies={companies} />;
}
