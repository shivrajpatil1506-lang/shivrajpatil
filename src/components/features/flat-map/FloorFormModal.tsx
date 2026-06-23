"use client";

import React, { useState } from "react";
import { X, AlertCircle, Layers, FileDigit } from "lucide-react";
import { createFloor, updateFloor, bulkCreateFloors } from "@/app/actions/flat-map";
import { cn } from "@/lib/utils";

interface FloorFormModalProps {
  blockId: string;
  floor?: { id: string; label: string };
  onClose: () => void;
  onSuccess: () => void;
}

export function FloorFormModal({ blockId, floor, onClose, onSuccess }: FloorFormModalProps) {
  const isEdit = !!floor;
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [label, setLabel] = useState(floor?.label ?? "");
  const [count, setCount] = useState<number | "">("");
  const [startNumber, setStartNumber] = useState<number | "">(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let res;
    if (mode === "single") {
      if (!label.trim()) { setError("Floor label is required."); setLoading(false); return; }
      res = isEdit
        ? await updateFloor(floor!.id, { label: label.trim() })
        : await createFloor(blockId, { label: label.trim() });
    } else {
      if (!count || count <= 0) { setError("Please enter a valid number of floors."); setLoading(false); return; }
      if (!startNumber || startNumber <= 0) { setError("Starting number must be at least 1."); setLoading(false); return; }
      res = await bulkCreateFloors(blockId, count, startNumber);
    }

    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error ?? "Operation failed.");
    }
  };

  const isFormValid = mode === "single" 
    ? !!label.trim() 
    : (typeof count === "number" && count > 0 && typeof startNumber === "number" && startNumber > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">{isEdit ? "Edit Floor" : "Add Floor"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          {!isEdit && (
            <div className="flex bg-neutral-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", mode === "single" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
              >
                Single Floor
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={cn("flex-1 py-1.5 text-xs font-medium rounded-md transition-all", mode === "bulk" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
              >
                Multiple Floors
              </button>
            </div>
          )}

          {mode === "single" ? (
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Floor Label</label>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="e.g. Floor 6, Ground, Podium"
                autoFocus
                className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <p className="text-[10px] text-neutral-400 mt-1">Free text — use any naming convention (Floor 1, Ground, Terrace, etc.)</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Number of Floors</label>
                <div className="relative">
                  <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={count}
                    onChange={e => setCount(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="e.g. 10"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Starting Number</label>
                <div className="relative">
                  <FileDigit className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="number"
                    min="1"
                    value={startNumber}
                    onChange={e => setStartNumber(e.target.value ? parseInt(e.target.value) : "")}
                    placeholder="e.g. 1"
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-400"
                  />
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-neutral-400">
                  This will generate {count || 0} floors automatically labeled: <br />
                  <span className="font-medium text-neutral-500">Floor {startNumber || 1}</span> to <span className="font-medium text-neutral-500">Floor {(Number(startNumber) || 1) + (Number(count) || 0) - 1}</span>
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !isFormValid} className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : isEdit ? "Save" : mode === "bulk" ? "Generate Floors" : "Add Floor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
