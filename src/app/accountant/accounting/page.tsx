import React from "react";
import PageHeader from "@/components/shared/PageHeader";
import Link from "next/link";
import { FolderTree, FilePlus, Scale, Settings } from "lucide-react";

export default function AccountingHubPage() {
  const links = [
    {
      title: "Chart of Accounts",
      description: "Manage Groups and Ledgers",
      icon: <FolderTree className="w-8 h-8 text-blue-500" />,
      href: "/accountant/accounting/groups",
      color: "border-blue-100 hover:border-blue-300 hover:bg-blue-50"
    },
    {
      title: "Voucher Entry",
      description: "Record Receipts, Payments, Sales, etc.",
      icon: <FilePlus className="w-8 h-8 text-emerald-500" />,
      href: "/accountant/accounting/vouchers/new",
      color: "border-emerald-100 hover:border-emerald-300 hover:bg-emerald-50"
    },
    {
      title: "Trial Balance",
      description: "View ledger balances and verify accuracy",
      icon: <Scale className="w-8 h-8 text-purple-500" />,
      href: "/accountant/accounting/reports/trial-balance",
      color: "border-purple-100 hover:border-purple-300 hover:bg-purple-50"
    },
    {
      title: "Accounting Setup",
      description: "Manage Financial Years and initialize data",
      icon: <Settings className="w-8 h-8 text-neutral-500" />,
      href: "/accountant/accounting/settings",
      color: "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
    }
  ];

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <PageHeader title="Double-Entry Accounting" description="Manage the complete financial ledger system." />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {links.map((link, i) => (
          <Link key={i} href={link.href}>
            <div className={`p-6 bg-white rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4 ${link.color}`}>
              <div className="p-3 bg-white rounded-lg shadow-sm border border-neutral-100">
                {link.icon}
              </div>
              <div>
                <h3 className="font-bold text-lg text-neutral-900">{link.title}</h3>
                <p className="text-neutral-500 text-sm mt-1">{link.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
