import { getTransactions } from "@/app/actions/transactions";
import { SalaryClient } from "./client";

export default async function HrSalaryPage() {
  const transactions = await getTransactions();
  return <SalaryClient initialTransactions={transactions} />;
}
