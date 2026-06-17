"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { generateMonthlyPayroll } from "@/app/actions/hr/payroll";
import { useToast } from "@/components/ui/Toast";
import { PlayCircle, CheckCircle } from "lucide-react";

export default function PayrollAutomationPage() {
  const { currentCompany } = useAuthStore();
  const { success, error } = useToast();
  
  const currentDate = new Date();
  const [month, setMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
  const [year, setYear] = useState<number>(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{count: number, message: string} | null>(null);

  const handleGenerate = async () => {
    if (!currentCompany) return;
    
    // Confirm dialog
    if (!window.confirm(`Are you sure you want to generate salary transactions for all active employees for ${month}/${year}?`)) {
      return;
    }

    setLoading(true);
    setResult(null);

    const res = await generateMonthlyPayroll(currentCompany.id, month, year);
    
    if (res.success) {
      success(res.message!);
      setResult({ count: res.count!, message: res.message! });
    } else {
      error(res.error || "Failed to generate payroll");
    }
    
    setLoading(false);
  };

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = [
    currentDate.getFullYear() - 1,
    currentDate.getFullYear(),
    currentDate.getFullYear() + 1,
  ];

  if (!currentCompany) {
    return <div className="p-8 text-center text-gray-500">Please select a company first.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payroll Automation</h1>
        <p className="text-gray-500 mt-1">Automatically generate monthly salary transactions for all active employees.</p>
      </div>

      <div className="w-full max-w-2xl mx-auto shadow-sm bg-white rounded-lg border border-gray-200">
        <div className="border-b bg-gray-50 px-6 py-4 rounded-t-lg">
          <h3 className="text-lg font-semibold flex items-center">
            <PlayCircle className="w-5 h-5 mr-2 text-primary-600" />
            Run Payroll Batch
          </h3>
          <p className="text-sm text-gray-500 mt-1">Select the month and year to generate salary entries.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payroll Month</label>
              <select 
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                disabled={loading}
              >
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Payroll Year</label>
              <select 
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2 border"
                disabled={loading}
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  This will create an accounting transaction under the category <strong>SALARY</strong> for each employee whose Gross Salary is greater than zero. The transaction date will be set to the last day of the selected month.
                </p>
              </div>
            </div>
          </div>

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-800">Payroll Generated Successfully</h4>
                <p className="text-sm text-green-700 mt-1">{result.message}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end rounded-b-lg">
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Salary Transactions"}
          </button>
        </div>
      </div>
    </div>
  );
}
