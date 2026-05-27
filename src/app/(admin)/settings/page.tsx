"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { Building2, Users, Bell, Calendar, IndianRupee, FileText, Home, Shield, Download, Palette } from "lucide-react";
import { getCompanies } from "@/app/actions/companies";
import { getEmployees } from "@/app/actions/employees";

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

type CompanyData = Awaited<ReturnType<typeof getCompanies>>[0];
type EmployeeData = Awaited<ReturnType<typeof getEmployees>>[0];

export default function SettingsPage() {
  const [active, setActive] = useState("company");
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCompanies(), getEmployees()]).then(([cData, eData]) => {
      setCompanies(cData);
      setEmployees(eData);
      setLoading(false);
    });
  }, []);

  return (
    <div className="animate-fade-in">
      <PageHeader title="Settings" description="Application configuration and preferences" />
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-56 shrink-0 space-y-1">
          {sections.map(sec => (
            <button key={sec.key} onClick={() => setActive(sec.key)} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left", active === sec.key ? "bg-primary-50 text-primary-700" : "text-neutral-600 hover:bg-neutral-50")}>
              <sec.icon className="w-4 h-4" />{sec.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-neutral-100 shadow-sm p-6 min-h-[400px]">
          {loading ? (
             <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
          ) : active === "company" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Company Profile</h3>
                <button className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">Edit</button>
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
          {!loading && active === "users" && (
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 mb-6" style={{ fontFamily: "var(--font-heading)" }}>User Management</h3>
              <table className="w-full text-sm">
                <thead><tr className="border-b">
                  {["Name", "Email", "Role", "Status", "Actions"].map(h => <th key={h} className="text-left py-2 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
                </tr></thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp.id} className="border-b border-neutral-50">
                      <td className="py-3 font-medium text-neutral-900">{[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}</td>
                      <td className="py-3 text-neutral-600 text-xs">{emp.work_email}</td>
                      <td className="py-3"><StatusBadge status={emp.portal_role} /></td>
                      <td className="py-3"><StatusBadge status={emp.access_status} /></td>
                      <td className="py-3"><button className="text-xs text-primary-600 hover:underline">Manage</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && !["company", "users"].includes(active) && (
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
