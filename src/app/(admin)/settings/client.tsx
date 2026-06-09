"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { Building2, Users, Bell, Calendar, IndianRupee, FileText, Home, Shield, Download, Palette } from "lucide-react";

const sections = [
  { key: "company", label: "Company Profile", icon: Building2 },
  { key: "users", label: "User Management", icon: Users },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "financial", label: "Financial Year", icon: Calendar },
  { key: "transactions", label: "Transaction Settings", icon: IndianRupee },
  { key: "instalments", label: "Instalment Settings", icon: FileText },
  { key: "property", label: "Property Types", icon: Home },
  { key: "security", label: "Audit & Security", icon: Shield },
  { key: "export", label: "Data Export", icon: Download },
  { key: "appearance", label: "Appearance", icon: Palette },
];

export function SettingsClient({ 
  initialCompanies, 
  initialEmployees 
}: { 
  initialCompanies: any[], 
  initialEmployees: any[] 
}) {
  const [active, setActive] = useState("company");
  const [companies] = useState<any[]>(initialCompanies);
  const [employees] = useState<any[]>(initialEmployees);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Application configuration and preferences" />
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-56 shrink-0 space-y-1">
          {sections.map(sec => (
            <button key={sec.key} onClick={() => setActive(sec.key)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left", active === sec.key ? "bg-primary-50 text-primary-700" : "text-neutral-600 hover:bg-neutral-50")}>
              <sec.icon className="w-4 h-4" />{sec.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-neutral-100 shadow-sm p-4 md:p-6 min-h-[400px]">
          {active === "company" && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                <h3 className="text-lg font-semibold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Company Profile</h3>
                <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">Edit Profile</button>
              </div>
              <div className="space-y-4">
                {[["Parent Company", "GB Infra"], ["Registration", "Maharashtra"], ["Financial Year", "April - March"], ["Default Currency", "INR (₹)"], ["Tax Regime", "GST"]].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm py-2 border-b border-neutral-50"><span className="text-neutral-500">{label}</span><span className="font-medium text-neutral-900">{val}</span></div>
                ))}
              </div>
              <h4 className="text-sm font-semibold text-neutral-900 mt-6 mb-4">Subsidiaries</h4>
              <div className="space-y-2">
                {companies.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div><p className="text-sm font-medium text-neutral-900">{c.name}</p><p className="text-xs text-neutral-500">GSTIN: {c.gstin}</p></div>
                    <StatusBadge status={c.status} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {active === "users" && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>User Management</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead><tr className="border-b">
                    {["Name", "Email", "Role", "Status", "Actions"].map(h => <th key={h} className="py-2 px-2 text-xs font-semibold text-neutral-500 uppercase whitespace-nowrap">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {employees.map(emp => (
                      <tr key={emp.id} className="border-b border-neutral-50">
                        <td className="py-3 px-2 font-medium text-neutral-900 whitespace-nowrap">{[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}</td>
                        <td className="py-3 px-2 text-neutral-600 text-xs">{emp.work_email}</td>
                        <td className="py-3 px-2"><StatusBadge status={emp.portal_role} /></td>
                        <td className="py-3 px-2"><StatusBadge status={emp.access_status} /></td>
                        <td className="py-3 px-2"><button className="text-xs text-primary-600 hover:underline font-medium">Manage</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {!["company", "users"].includes(active) && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {React.createElement(sections.find(s => s.key === active)?.icon || Building2, { className: "w-6 h-6 text-neutral-400" })}
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">{sections.find(s => s.key === active)?.label}</h3>
              <p className="text-sm text-neutral-500">Configuration options will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
