"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBlock, updateBlock } from "@/app/actions/flat-map";

interface BlockFormModalProps {
  siteId: string;
  block?: {
    id: string;
    name: string;
    default_category: "new" | "redev";
    rate_new: number;
    rate_redev: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export function BlockFormModal({ siteId, block, onClose, onSuccess }: BlockFormModalProps) {
  const isEdit = !!block;
  const [name, setName] = useState(block?.name ?? "");
  const [category, setCategory] = useState<"new" | "redev">(block?.default_category ?? "new");
  const [rateNew, setRateNew] = useState(block?.rate_new ?? 0);
  const [rateRedev, setRateRedev] = useState(block?.rate_redev ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError("Block name is required."); return; }
    setLoading(true);
    setError(null);

    const data = {
      name: name.trim(),
      default_category: category,
      rate_new: rateNew,
      rate_redev: rateRedev,
    };

    const res = isEdit
      ? await updateBlock(block!.id, data)
      : await createBlock(siteId, data);

    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error ?? "Operation failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">{isEdit ? "Edit Block" : "Add Block"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Block Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Block A, Wing 1"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Default Category</label>
            {isEdit && (
              <p className="text-[10px] text-neutral-400 mb-2">
                ⓘ This sets the default for new flats. Existing flats are unaffected.
              </p>
            )}
            <div className="flex gap-2">
              {(["new", "redev"] as const).map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-medium rounded-xl border transition-all",
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Rate — New (₹/sqft)</label>
              <input
                type="number"
                min={0}
                value={rateNew}
                onChange={e => setRateNew(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Rate — Redev (₹/sqft)</label>
              <input
                type="number"
                min={0}
                value={rateRedev}
                onChange={e => setRateRedev(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !name.trim()} className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Block"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
