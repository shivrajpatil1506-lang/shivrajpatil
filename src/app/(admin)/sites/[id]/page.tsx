"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Home, Users as UsersIcon } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import { cn, formatDate } from "@/lib/utils";
import { getSiteWithDetails } from "@/app/actions/sites";

const tabs = ["Overview", "Units", "Customers"];


type SiteDetails = NonNullable<Awaited<ReturnType<typeof getSiteWithDetails>>>;

export default function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState("Overview");
  const [site, setSite] = useState<SiteDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteWithDetails(id).then(data => {
      setSite(data);
      setLoading(false);
    });
  }, [id]);


  const unitStats = useMemo(() => {
    if (!site?.units) return {};
    const stats: Record<string, { total: number, sold: number }> = {};
    site.units.forEach(u => {
      const pt = u.property_type || "Unspecified";
      if (!stats[pt]) stats[pt] = { total: 0, sold: 0 };
      stats[pt].total++;
      if (u.status === "sold") stats[pt].sold++;
    });
    return stats;
  }, [site]);

  if (loading) {
    return <div className="py-24 flex justify-center"><div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (!site) {
    return <div className="py-24 text-center text-neutral-500">Site not found.</div>;
  }

  const siteCustomers = site.purchases?.map(p => ({
    id: p.customer.id,
    full_name: [p.customer.first_name, p.customer.middle_name, p.customer.last_name].filter(Boolean).join(" "),
    mobile_1: p.customer.mobile_1,
    property_type: p.unit?.property_type || "N/A",
    unit_number: p.unit?.unit_number || "N/A",
    payment_status: p.status
  })) || [];

  const totalUnits = site.units?.length || 0;
  const soldUnits = site.units?.filter(u => u.status === 'sold').length || 0;
  const availableUnits = totalUnits - soldUnits;

  return (
    <div className="animate-fade-in">
      <Link href="/sites" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors"><ArrowLeft className="w-4 h-4" /> Back to Sites</Link>
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center"><MapPin className="w-6 h-6 text-purple-600" /></div>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>{site.name}</h1>
          <p className="text-sm text-neutral-500">{site.company?.short_name || site.company?.name || "Unknown Company"} • {site.site_code}</p>
        </div>
        <StatusBadge status={site.status} size="md" />
        <Link href={`/sites/${site.id}/edit`} className="ml-auto px-4 py-2 bg-white border border-neutral-200 text-sm font-medium text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors shadow-sm">
          Edit Site
        </Link>
      </div>
      <div className="flex gap-1 border-b border-neutral-200 mb-6">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={cn("px-4 py-2.5 text-sm font-medium transition-colors relative", activeTab === tab ? "text-primary-600" : "text-neutral-500 hover:text-neutral-700")}>
            {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />}
          </button>
        ))}
      </div>
      {activeTab === "Overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Site Information</h3>
            <div className="space-y-3">
              {[["Type", <StatusBadge key="t" status={site.site_type} />], ["City", site.city], ["State", site.state], ["Land Area", site.total_land_area ? `${site.total_land_area?.toLocaleString()} ${site.land_area_unit}` : "—"], ["RERA No.", site.rera_number || "—"], ["Expected Completion", site.expected_completion ? formatDate(site.expected_completion) : "—"]].map(([label, val]) => (
                <div key={String(label)} className="flex justify-between text-sm"><span className="text-neutral-500">{String(label)}</span><span className="font-medium text-neutral-900">{val as any || "—"}</span></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
            <h3 className="font-semibold text-neutral-900 mb-4">Description</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{site.description || "No description provided."}</p>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[["Total Units", totalUnits, "text-neutral-900"], ["Sold", soldUnits, "text-emerald-600"], ["Available", availableUnits, "text-blue-600"]].map(([label, val, color]) => (
                <div key={String(label)} className="text-center p-3 bg-neutral-50 rounded-lg">
                  <p className={cn("text-2xl font-bold", color as string)}>{String(val)}</p>
                  <p className="text-[10px] text-neutral-500 uppercase mt-1">{String(label)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === "Units" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.keys(unitStats).length === 0 ? <p className="col-span-full py-8 text-center text-neutral-500">No units configured.</p> : null}
          {Object.entries(unitStats).map(([pt, stats]) => {
            return (
              <div key={pt} className="bg-white rounded-xl border border-neutral-100 shadow-sm p-5 text-center">
                <Home className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <p className="font-semibold text-neutral-900 text-sm">{pt}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">{stats.total}</p>
                <p className="text-xs text-neutral-500">total units</p>
                <div className="flex justify-center gap-4 mt-3 text-xs">
                  <span className="text-emerald-600 font-medium">{stats.sold} sold</span>
                  <span className="text-blue-600 font-medium">{stats.total - stats.sold} available</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {activeTab === "Customers" && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {siteCustomers.length === 0 ? <p className="p-8 text-center text-neutral-500">No customers for this site yet.</p> : (
            <table className="w-full text-sm">
              <thead><tr className="bg-neutral-50 border-b">{["Name", "Mobile", "Property", "Unit", "Status"].map(h => <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-neutral-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{siteCustomers.map((c, i) => (
                <tr key={`${c.id}-${i}`} className="border-b border-neutral-50 hover:bg-neutral-50/50">
                  <td className="py-3 px-4 font-medium text-neutral-900">{c.full_name}</td>
                  <td className="py-3 px-4 text-neutral-600">{c.mobile_1}</td>
                  <td className="py-3 px-4">{c.property_type}</td>
                  <td className="py-3 px-4 font-mono text-xs">{c.unit_number}</td>
                  <td className="py-3 px-4"><StatusBadge status={c.payment_status || "active"} /></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

