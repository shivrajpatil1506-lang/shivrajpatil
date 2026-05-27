import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AccountantLayoutClient from "./AccountantLayoutClient";

export default async function AccountantLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== "accountant") {
    redirect("/");
  }

  return <AccountantLayoutClient>{children}</AccountantLayoutClient>;
}
