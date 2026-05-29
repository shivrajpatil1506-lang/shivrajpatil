"use client";

import React from "react";
import { ArrowLeft, Download, FileText, Table } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ReportViewerProps {
  title: string;
  description: string;
  data: any[];
  backLink: string;
}

export default function ReportViewer({ title, description, data, backLink }: ReportViewerProps) {
  const router = useRouter();

  const handleExportExcel = async () => {
    const { exportToExcel } = await import("@/lib/export-utils");
    exportToExcel(data, title.replace(/\s+/g, '_').toLowerCase());
  };

  const handleExportPDF = async () => {
    const { exportToPDF } = await import("@/lib/export-utils");
    exportToPDF(data, title, title.replace(/\s+/g, '_').toLowerCase());
  };

  if (!data || data.length === 0) {
    return (
      <div className="animate-fade-in max-w-6xl mx-auto">
        <Link href={backLink} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors print:hidden">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </Link>
        <div className="bg-white rounded-xl border border-neutral-100 p-12 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">{title}</h2>
          <p className="text-neutral-500 text-sm">No data available for this report.</p>
        </div>
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <div className="animate-fade-in max-w-7xl mx-auto">
      {/* Navigation (Hidden on Print) */}
      <div className="print:hidden">
        <button onClick={() => router.push(backLink)} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Reports
        </button>
      </div>

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{title}</h1>
          <p className="text-neutral-500 text-sm mt-1">{description}</p>
        </div>
        
        {/* Action Buttons (Hidden on Print) */}
        <div className="flex items-center gap-3 print:hidden">
          <button 
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4 text-red-500" /> Export PDF
          </button>
          <button 
            onClick={handleExportExcel}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <Table className="w-4 h-4 text-white" /> Export Excel
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden print:shadow-none print:border-none print:m-0 print:p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100 print:bg-transparent print:border-neutral-300">
                {headers.map((header) => (
                  <th key={header} className="px-4 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 print:divide-neutral-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-neutral-50/50 transition-colors print:hover:bg-transparent">
                  {headers.map((header, colIndex) => {
                    const cellValue = row[header];
                    // Format styling based on common column types
                    const isAmount = typeof cellValue === 'number' && (header.toLowerCase().includes('amount') || header.toLowerCase().includes('value'));
                    const isStatus = header.toLowerCase() === 'status';

                    return (
                      <td key={`${rowIndex}-${colIndex}`} className="px-4 py-3 text-sm text-neutral-700 whitespace-nowrap">
                        {isAmount ? (
                          <span className="font-medium">₹{cellValue.toLocaleString('en-IN')}</span>
                        ) : isStatus ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium tracking-wide uppercase ${
                            String(cellValue).toLowerCase().includes('completed') || String(cellValue).toLowerCase().includes('active') || String(cellValue).toLowerCase().includes('cleared')
                              ? 'bg-emerald-50 text-emerald-700' 
                              : String(cellValue).toLowerCase().includes('pending')
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-red-50 text-red-700'
                          }`}>
                            {String(cellValue)}
                          </span>
                        ) : (
                          String(cellValue || "—")
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-4 py-3 border-t border-neutral-100 bg-neutral-50 text-xs text-neutral-500 print:hidden">
          Showing {data.length} records generated on {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
