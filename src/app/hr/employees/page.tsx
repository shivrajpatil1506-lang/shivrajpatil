"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { DataTable, ColumnDef } from "@/components/shared/DataTable";
import { FilterBar, FilterConfig } from "@/components/shared/FilterBar";
import { formatDate, getInitials } from "@/lib/utils";
import { DEPARTMENT_LABELS } from "@/lib/constants";
import { getEmployees } from "@/app/actions/employees";
import { getCompanies } from "@/app/actions/companies";

type EmployeeData = Awaited<ReturnType<typeof getEmployees>>[0];

export default function HrEmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [companyId, setCompanyId] = useState("");

  const fetchData = async () => {
    setLoading(true);
    const [empData, compData] = await Promise.all([getEmployees(), getCompanies()]);
    setEmployees(empData);
    setCompanies(compData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return employees.filter(emp => {
      const q = search.toLowerCase();
      const fullName = [emp.first_name, emp.middle_name, emp.last_name].filter(Boolean).join(" ");
      const matchSearch = !q
        || fullName.toLowerCase().includes(q)
        || (emp.employee_code || "").toLowerCase().includes(q)
        || (emp.designation || "").toLowerCase().includes(q)
        || (emp.personal_mobile || "").includes(q);
      const matchDept = !department || emp.department === department;
      const matchStatus = !status || emp.status === status;
      const matchCompany = !companyId || emp.company_id === companyId;
      return matchSearch && matchDept && matchStatus && matchCompany;
    });
  }, [search, department, status, companyId, employees]);

  const hasFilters = !!(search || department || status || companyId);
  const clearFilters = () => { setSearch(""); setDepartment(""); setStatus(""); setCompanyId(""); };

  const filters: FilterConfig[] = [
    {
      key: "company", placeholder: "All Companies", value: companyId, onChange: setCompanyId,
      options: companies.map(c => ({ label: c.short_name || c.name, value: c.id }))
    },
    {
      key: "department", placeholder: "All Departments", value: department, onChange: setDepartment,
      options: Object.entries(DEPARTMENT_LABELS).map(([key, val]) => ({ label: val as string, value: key }))
    },
    {
      key: "status", placeholder: "All Status", value: status, onChange: setStatus,
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Suspended", value: "suspended" },
      ]
    }
  ];

  const columns: ColumnDef<EmployeeData>[] = [
    {
      key: "name", label: "Employee", sortable: true,
      sortValue: (row) => [row.first_name, row.last_name].filter(Boolean).join(" "),
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {getInitials([row.first_name, row.last_name].filter(Boolean).join(" ") || "")}
          </div>
          <span className="font-medium text-neutral-900">
            {[row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ")}
          </span>
        </div>
      )
    },
    { key: "employee_code", label: "ID", sortable: true, render: (row) => <span className="font-mono text-xs">{row.employee_code}</span> },
    { key: "department", label: "Department", sortable: true, sortValue: (row) => DEPARTMENT_LABELS[row.department as keyof typeof DEPARTMENT_LABELS] || row.department, render: (row) => DEPARTMENT_LABELS[row.department as keyof typeof DEPARTMENT_LABELS] || row.department },
    { key: "designation", label: "Designation", sortable: true },
    { key: "company", label: "Company", sortable: true, sortValue: (row) => row.company?.short_name || row.company?.name || "", render: (row) => row.company?.short_name || row.company?.name || "Unknown" },
    { key: "personal_mobile", label: "Mobile", sortable: false, render: (row) => <span className="tabular-nums">{row.personal_mobile}</span> },
    { key: "status", label: "Status", sortable: true, render: (row) => <StatusBadge status={row.status} /> },
    { key: "join_date", label: "Joined", sortable: true, sortValue: (row) => row.join_date ? new Date(row.join_date).getTime() : 0, render: (row) => <span className="tabular-nums">{row.join_date ? formatDate(row.join_date) : 'N/A'}</span> }
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader title="Company Employees" description={`Viewing ${filtered.length} employees`} actions={
        <Link href="/hr/employees/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Add Employee
        </Link>
      } />

      <FilterBar 
        searchQuery={search} 
        onSearchChange={setSearch} 
        filters={filters} 
        hasActiveFilters={hasFilters} 
        onClearFilters={clearFilters} 
      />

      {loading ? (
        <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>
      ) : (
        <DataTable data={filtered} columns={columns} emptyMessage="No employees match your search." />
      )}
    </div>
  );
}
