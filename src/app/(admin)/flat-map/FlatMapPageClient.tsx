"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Company, Site } from "@prisma/client";
import { getFlatMapData, FlatMapData } from "@/app/actions/flat-map";
import { FlatMapTab } from "@/components/features/flat-map/FlatMapTab";
import { Building2, MapPin, ChevronDown } from "lucide-react";

type SiteWithCompany = Site & { company?: { name: string; short_name: string | null } };

export function FlatMapPageClient({
  companies,
  sites,
}: {
  companies: Company[];
  sites: SiteWithCompany[];
}) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("all");
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  
  const [flatMapData, setFlatMapData] = useState<FlatMapData | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter sites based on selected company
  const filteredSites = useMemo(() => {
    if (selectedCompanyId === "all") return sites;
    return sites.filter((s) => s.company_id === selectedCompanyId);
  }, [sites, selectedCompanyId]);

  // Auto-select site if the current one is invalid for the new company filter
  useEffect(() => {
    setFlatMapData(null); // Clear data when company/sites change
    if (filteredSites.length > 0) {
      if (!selectedSiteId || !filteredSites.find((s) => s.id === selectedSiteId)) {
        setSelectedSiteId(filteredSites[0].id);
      }
    } else {
      setSelectedSiteId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSites]);

  // Fetch Flat Map data when a site is selected
  useEffect(() => {
    if (selectedSiteId) {
      setLoading(true);
      getFlatMapData(selectedSiteId)
        .then((data) => {
          setFlatMapData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else {
      setFlatMapData(null);
    }
  }, [selectedSiteId]);

  return (
    <div className="flex flex-col gap-6">
      {/* Selection Header */}
      <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.05)] p-5 animate-fade-in-up flex flex-col md:flex-row gap-5 items-end">
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Company</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
            >
              <option value="all">All Companies</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Site</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
            >
              <option value="" disabled>Select a site...</option>
              {filteredSites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Flat Map Content */}
      <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
        {!selectedSiteId ? (
          <div className="py-20 text-center border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50/50">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3">
              <MapPin className="w-6 h-6 text-neutral-400" />
            </div>
            <h3 className="text-sm font-medium text-neutral-900">No Site Selected</h3>
            <p className="text-xs text-neutral-500 mt-1">Select a site above to view its flat map inventory</p>
          </div>
        ) : loading ? (
          <div className="py-20 flex flex-col items-center gap-3 bg-white rounded-xl border border-border shadow-sm">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            <p className="text-sm text-neutral-400">Loading flat map…</p>
          </div>
        ) : flatMapData ? (
          <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
            <FlatMapTab key={selectedSiteId} siteId={selectedSiteId} initialData={flatMapData as any} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
