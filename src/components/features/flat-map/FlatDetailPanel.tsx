"use client";

import React, { useState, useEffect } from "react";
import { X, AlertCircle, Trash2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Flat, FlatType, FlatStatus, FlatCategory, FLAT_STATUS_CONFIG, FLAT_CATEGORY_CONFIG } from "./types";
import { updateFlat, deleteFlat } from "@/app/actions/flat-map";
import { getCustomersForSelect } from "@/app/actions/customers";
import { QuickAddCustomerModal } from "./QuickAddCustomerModal";

interface FlatDetailPanelProps {
  flat: Flat;
  blockRateNew: number;
  blockRateRedev: number;
  blockDefaultCategory: FlatCategory;
  flatTypes: FlatType[];
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export function FlatDetailPanel({
  flat,
  blockRateNew,
  blockRateRedev,
  blockDefaultCategory,
  flatTypes,
  onClose,
  onUpdate,
  onDelete,
}: FlatDetailPanelProps) {
  const [no, setNo] = useState(flat.no);
  const [typeId, setTypeId] = useState(flat.flat_type_id ?? "");
  const [category, setCategory] = useState<FlatCategory>(flat.category);
  const [status, setStatus] = useState<FlatStatus>(flat.status);
  const [carpetArea, setCarpetArea] = useState(flat.carpet_area);
  const [loadingPct, setLoadingPct] = useState(flat.loading_pct);
  const [saleAreaManual, setSaleAreaManual] = useState<number | null>(
    flat.sale_area_overridden ? flat.sale_area : null
  );
  const [facing, setFacing] = useState(flat.facing ?? "");
  const [notes, setNotes] = useState(flat.notes ?? "");
  const [customerId, setCustomerId] = useState(flat.customer_id ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [customers, setCustomers] = useState<{ id: string; first_name: string; last_name: string; mobile_1: string }[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);

  useEffect(() => {
    async function loadCustomers() {
      setLoadingCustomers(true);
      const list = await getCustomersForSelect();
      setCustomers(list);
      setLoadingCustomers(false);
    }
    loadCustomers();
  }, []);

  useEffect(() => {
    if (status === "unsold") {
      setCustomerId("");
    }
  }, [status]);

  const autoSaleArea = Math.round(carpetArea * (1 + loadingPct / 100));
  const effectiveSaleArea = saleAreaManual ?? autoSaleArea;
  const isOverridden = saleAreaManual !== null;

  const rate = category === "redev" ? blockRateRedev : blockRateNew;
  const computedValue = effectiveSaleArea * rate;

  function fmtCr(n: number) {
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
    if (n >= 1e5) return `₹${(n / 1e5).toFixed(1)} L`;
    return `₹${n.toLocaleString("en-IN")}`;
  }

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const res = await updateFlat(flat.id, {
      no: no.trim(),
      flat_type_id: typeId || null,
      category,
      status,
      carpet_area: carpetArea,
      loading_pct: loadingPct,
      sale_area: effectiveSaleArea,
      sale_area_overridden: isOverridden,
      facing: facing.trim() || null,
      notes: notes.trim() || null,
      customer_id: customerId || null,
    });
    setSaving(false);
    if (res.success) {
      onUpdate();
    } else {
      setError(res.error ?? "Failed to save.");
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    const res = await deleteFlat(flat.id);
    setDeleting(false);
    if (res.success) {
      onDelete();
    } else {
      setError(res.error ?? "Failed to delete.");
    }
  };

  const statuses: FlatStatus[] = ["unsold", "booked", "hold", "sold"];
  const isDifferentFromDefault = category !== blockDefaultCategory;

  return (
    <>
      <div 
        className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-[80] animate-in fade-in duration-200" 
        onClick={onClose} 
      />
      <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-[90] animate-in slide-in-from-right duration-300 flex flex-col border-l border-neutral-100">
        {/* Header */}
          <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-neutral-100 z-10">
            <div>
              <h2 className="font-bold text-neutral-900">Flat {flat.no}</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Edit flat details</p>
            </div>
            <div className="flex items-center gap-2">
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete flat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-red-600 font-medium">Delete?</span>
                  <button onClick={handleDelete} disabled={deleting} className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50">
                    {deleting ? "..." : "Yes"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="px-2 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg">
                    No
                  </button>
                </div>
              )}
              <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>
          </div>

          <div className="px-5 py-4 space-y-4">
            {/* Flat No + Type */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Flat Number</label>
                <input
                  value={no}
                  onChange={e => setNo(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Flat Type</label>
                <select
                  value={typeId}
                  onChange={e => setTypeId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                >
                  <option value="">— Unclassified —</option>
                  {flatTypes.map(ft => (
                    <option key={ft.id} value={ft.id}>{ft.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Status</label>
              <div className="grid grid-cols-4 gap-1.5">
                {statuses.map(s => {
                  const cfg = FLAT_STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "py-2 text-xs font-medium rounded-lg border transition-all",
                        status === s
                          ? `${cfg.bg} ${cfg.border} ${cfg.text} ring-2 ring-offset-1 ring-current`
                          : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Customer Selection */}
            {status !== "unsold" && (
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Assigned Customer</label>
                <select
                  value={customerId}
                  onChange={e => {
                    if (e.target.value === "ADD_NEW") {
                      setShowAddCustomer(true);
                    } else {
                      setCustomerId(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 bg-white"
                  disabled={loadingCustomers}
                >
                  <option value="">— Select a Customer —</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.first_name} {c.last_name} ({c.mobile_1})</option>
                  ))}
                  <option value="ADD_NEW" className="font-semibold text-primary-600">+ Add New Customer</option>
                </select>
              </div>
            )}

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">
                Category
                {isDifferentFromDefault && (
                  <span className="ml-1.5 text-[10px] text-amber-600 font-normal">Overridden from block default</span>
                )}
                {!isDifferentFromDefault && (
                  <span className="ml-1.5 text-[10px] text-neutral-400 font-normal">Block default: {blockDefaultCategory === "new" ? "New" : "Redev"}</span>
                )}
              </label>
              <div className="flex gap-2">
                {(["new", "redev"] as FlatCategory[]).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-lg border transition-all",
                      category === cat
                        ? cat === "new"
                          ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                    )}
                  >
                    {cat === "new" ? "New" : "Redev"}
                  </button>
                ))}
              </div>
            </div>

            {/* Areas */}
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Areas</label>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1">Carpet (sqft)</p>
                  <input
                    type="number"
                    min={1}
                    value={carpetArea}
                    onChange={e => { setCarpetArea(Number(e.target.value)); if (!isOverridden) setSaleAreaManual(null); }}
                    className="w-full px-2.5 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 mb-1">Loading %</p>
                  <input
                    type="number"
                    min={0}
                    value={loadingPct}
                    disabled={isOverridden}
                    onChange={e => { setLoadingPct(Number(e.target.value)); setSaleAreaManual(null); }}
                    className={cn(
                      "w-full px-2.5 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400",
                      isOverridden && "bg-neutral-50 text-neutral-400 cursor-not-allowed"
                    )}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] text-neutral-400">Sale Area (sqft)</p>
                    {isOverridden && (
                      <button
                        type="button"
                        onClick={() => setSaleAreaManual(null)}
                        className="text-[9px] text-indigo-500 hover:underline flex items-center gap-0.5"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        Reset
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={effectiveSaleArea}
                    onChange={e => setSaleAreaManual(Number(e.target.value))}
                    className={cn(
                      "w-full px-2.5 py-2 text-sm border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400",
                      isOverridden ? "border-amber-300 bg-amber-50" : "border-neutral-200"
                    )}
                  />
                </div>
              </div>
              {isOverridden && (
                <p className="text-[10px] text-amber-600 mt-1">⚡ Sale area manually overridden. Auto-calc: {autoSaleArea} sqft.</p>
              )}
            </div>

            {/* Value preview */}
            <div className="bg-neutral-50 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-neutral-400">Computed Value</p>
                <p className="text-lg font-bold text-neutral-900">{fmtCr(computedValue)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-neutral-400">Rate Applied</p>
                <p className="text-sm font-semibold text-neutral-600">₹{rate.toLocaleString("en-IN")}/sqft</p>
                <p className="text-[10px] text-neutral-400 capitalize">{category} rate</p>
              </div>
            </div>

            {/* Facing + Notes */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Facing (optional)</label>
                <input
                  value={facing}
                  onChange={e => setFacing(e.target.value)}
                  placeholder="North, Sea-facing…"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Notes (optional)</label>
                <input
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Corner unit, parking…"
                  className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white border-t border-neutral-100 px-5 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || deleting || !no.trim()}
              className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {showAddCustomer && (
            <QuickAddCustomerModal
              onClose={() => setShowAddCustomer(false)}
              onSuccess={(newCustomer) => {
                setCustomers(prev => [...prev, newCustomer]);
                setCustomerId(newCustomer.id);
                setShowAddCustomer(false);
              }}
            />
          )}
        </div>
    </>
  );
}
