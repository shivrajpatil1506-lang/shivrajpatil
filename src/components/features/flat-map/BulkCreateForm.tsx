"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, AlertCircle, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlatType } from "./types";
import { bulkCreateFlats } from "@/app/actions/flat-map";

interface BulkCreateFormProps {
  floorId: string;
  floorLabel: string;
  blockDefaultCategory: "new" | "redev";
  flatTypes: FlatType[];
  blockId: string; // for uniqueness checking
  onClose: () => void;
  onSuccess: () => void;
}

function incrementFlatNo(base: string, step: number): string {
  const match = base.match(/^(.*?)(\d+)$/);
  if (match) {
    const prefix = match[1];
    const num = parseInt(match[2], 10);
    const padded = String(num + step).padStart(match[2].length, "0");
    return `${prefix}${padded}`;
  }
  return step === 0 ? base : `${base}-${step + 1}`;
}

export function BulkCreateForm({
  floorId,
  floorLabel,
  blockDefaultCategory,
  flatTypes,
  blockId,
  onClose,
  onSuccess,
}: BulkCreateFormProps) {
  const [selectedTypeId, setSelectedTypeId] = useState(flatTypes[0]?.id ?? "");
  const [carpetArea, setCarpetArea] = useState(flatTypes[0]?.default_carpet_area ?? 650);
  const [loadingPct, setLoadingPct] = useState(flatTypes[0]?.default_loading_pct ?? 20);
  const [saleAreaManual, setSaleAreaManual] = useState<number | null>(null); // null = auto
  const [category, setCategory] = useState<"new" | "redev">(blockDefaultCategory);
  const [count, setCount] = useState(4);
  const [startingNo, setStartingNo] = useState("101");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);

  // When flat type changes, update carpet/loading defaults
  useEffect(() => {
    const ft = flatTypes.find(ft => ft.id === selectedTypeId);
    if (ft) {
      setCarpetArea(ft.default_carpet_area);
      setLoadingPct(ft.default_loading_pct);
      setSaleAreaManual(null); // reset override
    }
  }, [selectedTypeId, flatTypes]);

  const autoSaleArea = useMemo(
    () => Math.round(carpetArea * (1 + loadingPct / 100)),
    [carpetArea, loadingPct]
  );
  const effectiveSaleArea = saleAreaManual ?? autoSaleArea;
  const isOverridden = saleAreaManual !== null;

  // Preview flat numbers
  const previewNos = useMemo(() => {
    const nos: string[] = [];
    if (!startingNo || count < 1) return nos;
    nos.push(startingNo);
    for (let i = 1; i < Math.min(count, 20); i++) {
      nos.push(incrementFlatNo(startingNo, i));
    }
    return nos;
  }, [startingNo, count]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (count < 1 || count > 500) {
      setError("Count must be between 1 and 500.");
      return;
    }
    if (carpetArea <= 0 || effectiveSaleArea <= 0) {
      setError("Areas must be greater than 0.");
      return;
    }
    setLoading(true);
    setError(null);
    setConflicts([]);

    const res = await bulkCreateFlats(floorId, {
      flat_type_id: selectedTypeId || null,
      category,
      carpet_area: carpetArea,
      loading_pct: loadingPct,
      sale_area: effectiveSaleArea,
      sale_area_overridden: isOverridden,
      count,
      starting_no: startingNo,
    });

    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error ?? "Failed to create flats.");
      if ("conflicts" in res && res.conflicts) {
        setConflicts(res.conflicts as string[]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-neutral-900 text-lg">Add Flats</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Bulk create flats on <span className="font-medium text-neutral-600">{floorLabel}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {/* Flat Type */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Flat Type</label>
            <select
              value={selectedTypeId}
              onChange={e => setSelectedTypeId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
            >
              <option value="">— Unclassified —</option>
              {flatTypes.map(ft => (
                <option key={ft.id} value={ft.id}>{ft.name}</option>
              ))}
            </select>
          </div>

          {/* Areas Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Carpet Area (sqft)</label>
              <input
                type="number"
                min={1}
                value={carpetArea}
                onChange={e => { setCarpetArea(Number(e.target.value)); setSaleAreaManual(null); }}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Loading %</label>
              <input
                type="number"
                min={0}
                max={200}
                value={loadingPct}
                disabled={isOverridden}
                onChange={e => { setLoadingPct(Number(e.target.value)); setSaleAreaManual(null); }}
                className={cn(
                  "w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400",
                  isOverridden && "bg-neutral-50 text-neutral-400 cursor-not-allowed"
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Sale Area (sqft)
                {isOverridden && (
                  <button
                    type="button"
                    onClick={() => setSaleAreaManual(null)}
                    className="ml-1 text-[10px] text-indigo-500 hover:underline"
                  >↺ Reset</button>
                )}
              </label>
              <input
                type="number"
                min={1}
                value={effectiveSaleArea}
                onChange={e => setSaleAreaManual(Number(e.target.value))}
                className={cn(
                  "w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400",
                  isOverridden
                    ? "border-amber-300 bg-amber-50 font-semibold"
                    : "border-neutral-200"
                )}
              />
              {isOverridden && (
                <p className="text-[10px] text-amber-600 mt-0.5">⚡ Manual override</p>
              )}
              {!isOverridden && (
                <p className="text-[10px] text-neutral-400 mt-0.5">Auto: {carpetArea} × {(1 + loadingPct / 100).toFixed(2)}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Category</label>
            <div className="flex gap-2">
              {(["new", "redev"] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex-1 py-2 text-sm font-medium rounded-lg border transition-all",
                    category === cat
                      ? cat === "new"
                        ? "bg-indigo-500 text-white border-indigo-500"
                        : "bg-orange-500 text-white border-orange-500"
                      : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                  )}
                >
                  {cat === "new" ? "New (Free Sale)" : "Redeveloped"}
                </button>
              ))}
            </div>
          </div>

          {/* Count + Starting No */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Number of Flats</label>
              <input
                type="number"
                min={1}
                max={500}
                value={count}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Starting Flat No.</label>
              <input
                type="text"
                value={startingNo}
                onChange={e => setStartingNo(e.target.value)}
                placeholder="e.g. 101 or 6A"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 font-mono"
              />
            </div>
          </div>

          {/* Live Preview */}
          {previewNos.length > 0 && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Eye className="w-3.5 h-3.5 text-neutral-400" />
                <p className="text-[11px] font-semibold text-neutral-500">Preview — {count} flat{count !== 1 ? "s" : ""} will be created</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {previewNos.map((no, i) => (
                  <span
                    key={i}
                    className={cn(
                      "text-[11px] font-mono px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-700",
                      conflicts.includes(no) && "bg-red-50 border-red-300 text-red-600 font-bold"
                    )}
                  >
                    {no}
                  </span>
                ))}
                {count > 20 && (
                  <span className="text-[11px] text-neutral-400 px-1.5 py-0.5">
                    + {count - 20} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !startingNo || count < 1}
              className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Creating..." : `Create ${count} Flat${count !== 1 ? "s" : ""}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
