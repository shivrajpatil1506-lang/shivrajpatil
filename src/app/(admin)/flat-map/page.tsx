import React from "react";
import { getCompanies } from "@/app/actions/companies";
import { getSites } from "@/app/actions/sites";
import { FlatMapPageClient } from "./FlatMapPageClient";

export const metadata = {
  title: "Flat Map - GB Infra",
};

export default async function FlatMapPage() {
  const [companies, sites] = await Promise.all([
    getCompanies(),
    getSites(),
  ]);

  return (
    <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6 animate-fade-in-up">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
          Flat Map
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Visual inventory management for your sites
        </p>
      </div>

      <FlatMapPageClient companies={companies} sites={sites} />
    </div>
  );
}
