import React from "react";

export default function DashboardLoading() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Dashboard</h1>
          <p className="text-sm text-neutral-500">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((idx) => (
          <div key={idx} className="bg-white rounded-xl border border-neutral-100 p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-100 animate-pulse"></div>
              <div className="w-16 h-6 rounded-full bg-neutral-100 animate-pulse"></div>
            </div>
            <div>
              <div className="w-24 h-4 bg-neutral-100 rounded animate-pulse mb-2"></div>
              <div className="w-32 h-8 bg-neutral-200 rounded animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 lg:col-span-2 h-[380px] animate-pulse flex flex-col">
           <div className="w-48 h-6 bg-neutral-100 rounded mb-6"></div>
           <div className="flex-1 bg-neutral-50 rounded"></div>
        </div>
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 h-[380px] animate-pulse flex flex-col">
           <div className="w-40 h-6 bg-neutral-100 rounded mb-6"></div>
           <div className="flex-1 bg-neutral-50 rounded rounded-full w-48 h-48 mx-auto mt-4"></div>
        </div>
      </div>
      
      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 h-[300px] animate-pulse flex flex-col">
        <div className="w-64 h-6 bg-neutral-100 rounded mb-6"></div>
        <div className="w-full h-10 bg-neutral-50 rounded mb-2"></div>
        <div className="w-full h-10 bg-neutral-50 rounded mb-2"></div>
        <div className="w-full h-10 bg-neutral-50 rounded mb-2"></div>
      </div>
    </div>
  );
}
