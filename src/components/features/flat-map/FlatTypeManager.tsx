"use client";

import React, { useState } from "react";
import { X, Plus, Trash2, Pencil, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlatType } from "./types";
import { createFlatType, updateFlatType, deleteFlatType } from "@/app/actions/flat-map";

interface FlatTypeManagerProps {
  siteId: string;
  flatTypes: FlatType[];
  onClose: () => void;
  onUpdate: () => void;
}

const PRESET_COLORS = [
  "#6366F1", "#0EA5E9", "#10B981", "#F59E0B",
  "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6",
];

type EditState = { id: string; name: string; carpet: number; loading: number; color: string } | null;

export function FlatTypeManager({ siteId, flatTypes, onClose, onUpdate }: FlatTypeManagerProps) {
  const [editState, setEditState] = useState<EditState>(null);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCarpet, setNewCarpet] = useState(650);
  const [newLoading, setNewLoading] = useState(20);
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setLoadingId("new");
    setError(null);
    const res = await createFlatType(siteId, {
      name: newName.trim(),
      default_carpet_area: newCarpet,
      default_loading_pct: newLoading,
      color_tag: newColor,
    });
    setLoadingId(null);
    if (res.success) {
      setAdding(false);
      setNewName("");
      onUpdate();
    } else {
      setError(res.error ?? "Failed to create flat type.");
    }
  };

  const handleUpdate = async () => {
    if (!editState) return;
    setLoadingId(editState.id);
    setError(null);
    const res = await updateFlatType(editState.id, {
      name: editState.name,
      default_carpet_area: editState.carpet,
      default_loading_pct: editState.loading,
      color_tag: editState.color,
    });
    setLoadingId(null);
    if (res.success) {
      setEditState(null);
      onUpdate();
    } else {
      setError(res.error ?? "Failed to update.");
    }
  };

  const handleDelete = async (id: string) => {
    setLoadingId(id);
    setError(null);
    const res = await deleteFlatType(id);
    setLoadingId(null);
    if (res.success) {
      onUpdate();
    } else {
      setError(res.error ?? "Cannot delete.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <div>
            <h2 className="font-bold text-neutral-900 text-lg">Manage Flat Types</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Define types with default carpet area & loading %</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-2">
          {/* Table */}
          <div className="rounded-xl border border-neutral-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["Type", "Carpet (sqft)", "Loading %", "Color", ""].map(h => (
                    <th key={h} className="text-left py-2.5 px-3 text-[10px] font-semibold text-neutral-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {flatTypes.map(ft => (
                  <tr key={ft.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                    {editState?.id === ft.id ? (
                      <>
                        <td className="py-2 px-3">
                          <input
                            value={editState.name}
                            onChange={e => setEditState({ ...editState, name: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={editState.carpet}
                            onChange={e => setEditState({ ...editState, carpet: Number(e.target.value) })}
                            className="w-20 px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            value={editState.loading}
                            onChange={e => setEditState({ ...editState, loading: Number(e.target.value) })}
                            className="w-16 px-2 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1 flex-wrap">
                            {PRESET_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditState({ ...editState, color: c })}
                                className={cn("w-5 h-5 rounded-full border-2 transition-all", editState.color === c ? "border-neutral-800 scale-110" : "border-transparent")}
                                style={{ backgroundColor: c }}
                              />
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex gap-1">
                            <button
                              onClick={handleUpdate}
                              disabled={loadingId === ft.id}
                              className="px-2 py-1 text-[10px] font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditState(null)}
                              className="px-2 py-1 text-[10px] font-medium text-neutral-500 hover:bg-neutral-100 rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ft.color_tag ?? "#94A3B8" }} />
                            <span className="font-medium text-neutral-800">{ft.name}</span>
                            {ft.is_system_default && <span className="text-[9px] text-neutral-400 bg-neutral-100 px-1 py-0.5 rounded">default</span>}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 tabular-nums">{ft.default_carpet_area}</td>
                        <td className="py-2.5 px-3 text-neutral-600 tabular-nums">{ft.default_loading_pct}%</td>
                        <td className="py-2.5 px-3">
                          <span className="w-4 h-4 rounded-full inline-block" style={{ backgroundColor: ft.color_tag ?? "#94A3B8" }} />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditState({ id: ft.id, name: ft.name, carpet: ft.default_carpet_area, loading: ft.default_loading_pct, color: ft.color_tag ?? PRESET_COLORS[0] })}
                              className="p-1 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(ft.id)}
                              disabled={loadingId === ft.id}
                              className="p-1 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New */}
          {adding ? (
            <div className="border border-neutral-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-neutral-700">New Flat Type</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Name</label>
                  <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Studio"
                    className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Carpet (sqft)</label>
                  <input type="number" min={1} value={newCarpet} onChange={e => setNewCarpet(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Loading %</label>
                  <input type="number" min={0} value={newLoading} onChange={e => setNewLoading(Number(e.target.value))} className="w-full px-2.5 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-400" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-500 mb-1">Color</label>
                <div className="flex gap-2">
                  {PRESET_COLORS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewColor(c)}
                      className={cn("w-6 h-6 rounded-full border-2 transition-all", newColor === c ? "border-neutral-800 scale-110" : "border-transparent")}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={!newName.trim() || loadingId === "new"} className="px-4 py-1.5 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50">
                  {loadingId === "new" ? "Adding..." : "Add Type"}
                </button>
                <button onClick={() => { setAdding(false); setError(null); }} className="px-4 py-1.5 text-sm text-neutral-500 hover:bg-neutral-100 rounded-lg">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Flat Type
            </button>
          )}

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-4">
          <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
