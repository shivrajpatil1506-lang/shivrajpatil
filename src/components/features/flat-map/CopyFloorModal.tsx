"use client";

import React, { useState } from "react";
import { X, AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Floor } from "./types";
import { copyFloorToFloors } from "@/app/actions/flat-map";

interface CopyFloorModalProps {
  sourceFloor: Floor;
  allFloors: Floor[]; // all floors in the same block
  onClose: () => void;
  onSuccess: () => void;
}

export function CopyFloorModal({ sourceFloor, allFloors, onClose, onSuccess }: CopyFloorModalProps) {
  const targetFloors = allFloors.filter(f => f.id !== sourceFloor.id);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === targetFloors.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(targetFloors.map(f => f.id)));
    }
  };

  const handleCopy = async () => {
    if (selected.size === 0) {
      setError("Select at least one target floor.");
      return;
    }
    setLoading(true);
    setError(null);
    const res = await copyFloorToFloors(sourceFloor.id, Array.from(selected));
    setLoading(false);
    if (res.success) {
      onSuccess();
    } else {
      setError(res.error ?? "Copy failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-neutral-900">Copy Floor Layout</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Copying <span className="font-medium text-neutral-700">{sourceFloor.label}</span> ({sourceFloor.flats.length} flats)
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-4">
          <p className="text-xs text-neutral-500 mb-3">
            Select target floors. Flat composition will be duplicated with statuses reset to <strong>Unsold</strong>.
          </p>

          {targetFloors.length === 0 ? (
            <p className="text-sm text-neutral-400 text-center py-6">No other floors in this block.</p>
          ) : (
            <>
              <button
                onClick={toggleAll}
                className="text-xs text-primary-600 hover:underline mb-2 block"
              >
                {selected.size === targetFloors.length ? "Deselect all" : "Select all"}
              </button>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {targetFloors.map(floor => (
                  <button
                    key={floor.id}
                    onClick={() => toggle(floor.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all",
                      selected.has(floor.id)
                        ? "border-primary-300 bg-primary-50 text-primary-700"
                        : "border-neutral-200 hover:bg-neutral-50 text-neutral-700"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center shrink-0",
                      selected.has(floor.id)
                        ? "bg-primary-500 border-primary-500"
                        : "border-neutral-300"
                    )}>
                      {selected.has(floor.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{floor.label}</span>
                    <span className="ml-auto text-xs text-neutral-400">{floor.flats.length} flats</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl mt-3">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-4 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={loading || selected.size === 0 || targetFloors.length === 0}
            className="flex-1 py-2.5 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Copying..." : `Copy to ${selected.size} floor${selected.size !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}
