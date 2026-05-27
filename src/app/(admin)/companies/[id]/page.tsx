"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, MapPin, Users, IndianRupee, BarChart3, Phone, Mail, Globe, Calendar } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatDate, formatCurrency } from "@/lib/utils";
import { getCompanyWithDetails } from "@/app/actions/companies";

const tabs = ["Overview", "Sites", "Employees", "Transactions"];

type CompanyDetails = NonNullable<Awaited<ReturnType<typeof getCompanyWithDetails>>>;

export default function CompanyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Overview");
  
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCompanyWithDetails(id).then(data => {
      setCompany(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!company) {
    return <div className="py-24 text-center text-neutral-500">Company not found.</div>;
  }

  const companySites = company.sites || [];
  const companyEmployees = company.employees || [];
  const companyTransactions = company.transactions || [];

  return (
    <div className="animate-fade-in">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center"><Building2 className="w-6 h-6 text-primary-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{company.name}</h1>
          <p className="text-sm text-neutral-500">{company.short_name} • CIN: {company.cin}</p>
        </div>
        <StatusBadge status={company.status} size="md" />
        <Link href={`/companies/${company.id}/edit`} className="ml-auto px-4 py-2 bg-white border border-neutral-200 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
          Edit Company
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors relative whitespace-nowrap", activeTab === tab ? "text-primary-600" : "text-neutral-500 hover:text-neutral-700")}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 mb-3">Company Information</h3>
            {[
              ["GSTIN", company.gstin], ["PAN", company.pan],
              ["Incorporated", company.incorporated_at ? formatDate(company.incorporated_at) : "—"],
            ].map(([label, val]) => (
              <div key={label as string} className="flex justify-between text-sm"><span className="text-neutral-500">{label as string}</span><span className="font-medium text-neutral-900">{val as string || "—"}</span></div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-neutral-900 mb-3">Contact</h3>
            {company.phone_numbers && <p className="flex items-center gap-2 text-sm text-neutral-700"><Phone className="w-4 h-4 text-neutral-400" />{company.phone_numbers}</p>}
            {company.email && <p className="flex items-center gap-2 text-sm text-neutral-700"><Mail className="w-4 h-4 text-neutral-400" />{company.email}</p>}
            {company.website && <p className="flex items-center gap-2 text-sm text-neutral-700"><Globe className="w-4 h-4 text-neutral-400" />{company.website}</p>}
            {company.reg_address && (
              <div className="pt-2">
                <p className="text-xs text-neutral-500 mb-1">Registered Address</p>
                <p className="text-sm text-neutral-700">{(company.reg_address as any).line1}, {(company.reg_address as any).line2}, {(company.reg_address as any).city}, {(company.reg_address as any).state} — {(company.reg_address as any).pin}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "Sites" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {companySites.length === 0 ? <p className="p-8 text-center text-neutral-500">No sites found.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 border-b border-neutral-200">
              {["Site Name", "Code", "Type", "City", "Units", "Status"].map((h) => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {companySites.map((site) => {
                const total = site._count?.units || 0;
                const sold = site.units?.filter(u => u.status === 'sold').length || 0;
                return (
                <tr key={site.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-neutral-900">
                    <Link href={`/sites/${site.id}`} className="hover:text-primary-600 transition-colors">{site.name}</Link>
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600">{site.site_code}</td>
                  <td className="py-3 px-4"><StatusBadge status={site.site_type} /></td>
                  <td className="py-3 px-4 text-neutral-600">{site.city}</td>
                  <td className="py-3 px-4 text-neutral-700">{sold}/{total}</td>
                  <td className="py-3 px-4"><StatusBadge status={site.status} /></td>
                </tr>
              )})}
            </tbody>
          </table>
          )}
        </div>
      )}

      {activeTab === "Employees" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {companyEmployees.length === 0 ? <p className="p-8 text-center text-neutral-500">No employees found.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 border-b border-neutral-200">
              {["Name", "ID", "Department", "Designation", "Mobile", "Status"].map((h) => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {companyEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-neutral-900">{[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}</td>
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600">{emp.employee_code}</td>
                  <td className="py-3 px-4"><StatusBadge status={emp.department.replace("_", " ")} /></td>
                  <td className="py-3 px-4 text-neutral-600">{emp.designation}</td>
                  <td className="py-3 px-4 text-neutral-600">{emp.personal_mobile}</td>
                  <td className="py-3 px-4"><StatusBadge status={emp.access_status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}

      {activeTab === "Transactions" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {companyTransactions.length === 0 ? <p className="p-8 text-center text-neutral-500">No transactions found.</p> : (
          <table className="w-full text-sm">
            <thead><tr className="bg-neutral-50 border-b border-neutral-200">
              {["Txn ID", "Date", "Category", "Description", "Amount", "Status"].map((h) => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
            </tr></thead>
            <tbody>
              {companyTransactions.map((txn) => (
                <tr key={txn.id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-xs text-neutral-600">{txn.transaction_code}</td>
                  <td className="py-3 px-4 text-neutral-600">{formatDate(txn.transaction_date)}</td>
                  <td className="py-3 px-4"><StatusBadge status={txn.category.toLowerCase()} /></td>
                  <td className="py-3 px-4 text-neutral-700 max-w-[200px] truncate">{txn.description}</td>
                  <td className={cn("py-3 px-4 font-semibold tabular-nums", ["INSTALMENT_RECEIVED", "BOOKING_AMOUNT", "PROPERTY_SALE", "OTHER_INCOME"].includes(txn.category) ? "text-emerald-600" : "text-red-600")}>{formatCurrency(txn.amount)}</td>
                  <td className="py-3 px-4"><StatusBadge status={txn.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      )}
    </div>
  );
}
