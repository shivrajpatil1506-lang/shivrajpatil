"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, CreditCard, Briefcase, Building2, Calendar, Edit } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { getEmployeeWithDetails } from "@/app/actions/employees";

const tabs = ["Profile", "Tasks", "Salary History"];

type EmployeeDetails = NonNullable<Awaited<ReturnType<typeof getEmployeeWithDetails>>>;

export default function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Profile");
  const [emp, setEmp] = useState<EmployeeDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmployeeWithDetails(id).then(data => {
      setEmp(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!emp) {
    return <div className="py-24 text-center text-neutral-500">Employee not found.</div>;
  }

  const empTasks = (emp as any).tasks_assigned || [];
  const empSalary = (emp as any).transactions || [];

  return (
    <div className="animate-fade-in">
      <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
          {getInitials([emp.first_name, emp.last_name].filter(Boolean).join(" ") || "")}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{[emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")}</h1>
          <p className="text-sm text-neutral-500">{emp.designation} · {DEPARTMENT_LABELS[emp.department as keyof typeof DEPARTMENT_LABELS] || emp.department} · {(emp as any).company?.short_name || (emp as any).company?.name || "Unknown Company"}</p>
        </div>
        <StatusBadge status={emp.access_status} size="md" />
        <Link href={`/employees/${emp.id}/edit`} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors">
          <Edit className="w-4 h-4" /> Edit
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          ["Employee Code", emp.employee_code, "font-mono text-xs"],
          ["Role", emp.portal_role.toUpperCase(), ""],
          ["Gross Salary", formatCurrency(emp.gross_salary || 0), "text-emerald-700"],
          ["Joined", emp.join_date ? formatDate(emp.join_date) : "—", ""],
        ].map(([label, val, extra]) => (
          <div key={String(label)} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-4">
            <p className="text-xs text-neutral-500 mb-1">{String(label)}</p>
            <p className={cn("font-semibold text-neutral-900 text-sm", extra as string)}>{String(val)}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors relative", activeTab === tab ? "text-primary-600" : "text-neutral-500 hover:text-neutral-700")}>
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "Profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 text-sm mb-4">Personal Information</h3>
            <div className="space-y-3">
              {[
                [<User key="u" className="w-4 h-4 text-neutral-400" />, "Full Name", [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ")],
                [<Phone key="p" className="w-4 h-4 text-neutral-400" />, "Mobile", emp.personal_mobile],
                [<Mail key="m" className="w-4 h-4 text-neutral-400" />, "Work Email", emp.work_email],
                [<CreditCard key="e" className="w-4 h-4 text-neutral-400" />, "Employee ID", emp.employee_code],
                [<Calendar key="d" className="w-4 h-4 text-neutral-400" />, "Date of Joining", emp.join_date ? formatDate(emp.join_date) : "—"],
                [<Briefcase key="t" className="w-4 h-4 text-neutral-400" />, "Employment Type", emp.employment_type?.replace("_", " ")],
              ].map(([icon, label, val]) => (
                <div key={String(label)} className="flex items-center gap-3 text-sm py-2 border-b border-neutral-50">
                  {icon}
                  <span className="text-neutral-500 w-32 shrink-0">{String(label)}</span>
                  <span className="font-medium text-neutral-900">{String(val) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 text-sm mb-4">Work Details</h3>
            <div className="space-y-3">
              {[
                [<Building2 key="c" className="w-4 h-4 text-neutral-400" />, "Company", (emp as any).company?.name || "Unknown"],
                [<Briefcase key="dep" className="w-4 h-4 text-neutral-400" />, "Department", DEPARTMENT_LABELS[emp.department as keyof typeof DEPARTMENT_LABELS] || emp.department],
                [<User key="des" className="w-4 h-4 text-neutral-400" />, "Designation", emp.designation],
                [<CreditCard key="r" className="w-4 h-4 text-neutral-400" />, "Portal Role", emp.portal_role?.toUpperCase()],
                [<CreditCard key="s" className="w-4 h-4 text-neutral-400" />, "Salary (Gross)", formatCurrency(emp.gross_salary || 0)],
              ].map(([icon, label, val]) => (
                <div key={String(label)} className="flex items-center gap-3 text-sm py-2 border-b border-neutral-50">
                  {icon}
                  <span className="text-neutral-500 w-32 shrink-0">{String(label)}</span>
                  <span className="font-medium text-neutral-900">{String(val) || "—"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === "Tasks" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {empTasks.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No tasks assigned to this employee.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-neutral-50 border-b">
                {["Task", "Priority", "Status", "Due Date"].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {empTasks.map((task: any) => (
                  <tr key={task.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-medium text-neutral-900">{task.title}</td>
                    <td className="py-3 px-4">
                      <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", task.priority === "high" ? "bg-red-50 text-red-700" : task.priority === "medium" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700")}>{task.priority}</span>
                    </td>
                    <td className="py-3 px-4"><StatusBadge status={task.status} /></td>
                    <td className="py-3 px-4 text-neutral-500 tabular-nums text-xs">{task.due_date ? formatDate(task.due_date) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Salary History Tab */}
      {activeTab === "Salary History" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {empSalary.length === 0 ? (
            <p className="p-8 text-center text-sm text-neutral-500">No salary records found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead><tr className="bg-neutral-50 border-b">
                {["Txn ID", "Date", "Amount", "Mode", "Period", "Status"].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}
              </tr></thead>
              <tbody>
                {empSalary.map((txn: any) => (
                  <tr key={txn.id} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                    <td className="py-3 px-4 font-mono text-xs text-neutral-600">{txn.transaction_code}</td>
                    <td className="py-3 px-4 tabular-nums text-xs text-neutral-600">{formatDate(txn.transaction_date)}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-700 tabular-nums">{formatCurrency(txn.amount)}</td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">{txn.payment_mode}</td>
                    <td className="py-3 px-4 text-neutral-600 text-xs">{txn.pay_period_month && txn.pay_period_year ? `${["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][txn.pay_period_month]} ${txn.pay_period_year}` : "—"}</td>
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
