"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, Users, FileDigit, Landmark, Globe } from "lucide-react";

const masterTabs = [
  { name: "Account Groups", href: "/accounting/masters/groups", icon: FolderTree },
  { name: "Ledgers", href: "/accounting/masters/ledgers", icon: Users },
  { name: "Voucher Types", href: "/accounting/masters/voucher-types", icon: FileDigit },
  { name: "Cost Centres", href: "/accounting/masters/cost-centres", icon: Landmark },
  { name: "Currencies", href: "/accounting/masters/currencies", icon: Globe },
];

export default function MastersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col md:flex-row gap-6">
      
      {/* Side Menu */}
      <div className="w-full md:w-64 flex-shrink-0">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm sticky top-24">
          <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-800">Master Data</h3>
          </div>
          <nav className="flex flex-col py-2" aria-label="Masters Navigation">
            {masterTabs.map((tab) => {
              const isActive = pathname === tab.href;
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors
                    ${isActive 
                      ? "text-emerald-700 bg-emerald-50 border-r-2 border-emerald-500" 
                      : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border-r-2 border-transparent"
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-500" : "text-neutral-400"}`} />
                  {tab.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
          {children}
        </div>
      </div>

    </div>
  );
}
