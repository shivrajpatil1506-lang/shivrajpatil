"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Database, FileText, BarChart3, Settings } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/accounting", icon: LayoutDashboard },
  { name: "Masters", href: "/accounting/masters/groups", icon: Database }, // Groups, Ledgers, etc.
  { name: "Vouchers", href: "/accounting/vouchers", icon: FileText },
  { name: "Reports", href: "/accounting/reports", icon: BarChart3 },
  { name: "Settings", href: "/accounting/settings", icon: Settings },
];

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // TODO: Fetch Company and FY context from global state or cookies
  const [activeCompany, setActiveCompany] = useState("Default Company");
  const [activeFY, setActiveFY] = useState("2024-25");

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] animate-fade-in bg-neutral-50/50">
      
      {/* Context Selector Bar */}
      <div className="bg-white border-b border-neutral-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-md text-sm font-medium border border-emerald-100 flex flex-col">
            <span className="text-xs text-emerald-500 uppercase tracking-wider">Company</span>
            {activeCompany}
          </div>
          <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium border border-blue-100 flex flex-col">
            <span className="text-xs text-blue-500 uppercase tracking-wider">Financial Year</span>
            {activeFY}
          </div>
        </div>
        <div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 underline">Change Context</button>
        </div>
      </div>

      {/* Secondary Navigation (Tabs) */}
      <div className="bg-white border-b border-neutral-200 px-6">
        <nav className="flex gap-1" aria-label="Tabs">
          {navItems.map((item) => {
            // Very simple active check
            const isActive = 
              item.href === "/accounting" 
                ? pathname === "/accounting"
                : item.name === "Masters" 
                  ? pathname.startsWith("/accounting/masters")
                  : pathname.startsWith(item.href);

            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center gap-2 py-4 px-4 text-sm font-medium border-b-2 transition-colors
                  ${isActive 
                    ? "border-emerald-500 text-emerald-600 bg-emerald-50/50" 
                    : "border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50"
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  );
}
