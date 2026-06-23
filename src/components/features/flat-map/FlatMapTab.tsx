"use client";

import React, { useState, useCallback, useTransition } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { getFlatMapData } from "@/app/actions/flat-map";
import { deleteBlock, deleteFloor } from "@/app/actions/flat-map";
import { Block, Flat, Floor, FlatType, FlatMapFilters, DEFAULT_FILTERS } from "./types";
import { ProjectSummaryBar } from "./ProjectSummaryBar";
import { FlatMapToolbar } from "./FlatMapToolbar";
import { BlockCard } from "./BlockCard";
import { BulkCreateForm } from "./BulkCreateForm";
import { FlatTypeManager } from "./FlatTypeManager";
import { FlatDetailPanel } from "./FlatDetailPanel";
import { BlockFormModal } from "./BlockFormModal";
import { FloorFormModal } from "./FloorFormModal";
import { CopyFloorModal } from "./CopyFloorModal";

// ─── Confirm Delete Dialog ────────────────────────────────
function ConfirmDeleteDialog({
  message,
  onConfirm,
  onCancel,
  loading,
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <p className="text-sm text-neutral-700 mb-5">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 py-2.5 text-sm font-medium bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50">
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

type FlatMapState = {
  flatTypes: FlatType[];
  blocks: Block[];
};

interface FlatMapTabProps {
  siteId: string;
  initialData: FlatMapState;
}

export function FlatMapTab({ siteId, initialData }: FlatMapTabProps) {
  const [data, setData] = useState<FlatMapState>(initialData);
  const [filters, setFilters] = useState<FlatMapFilters>(DEFAULT_FILTERS);
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [bulkCreate, setBulkCreate] = useState<{ floorId: string; floorLabel: string; blockId: string; defaultCategory: "new" | "redev" } | null>(null);
  const [selectedFlat, setSelectedFlat] = useState<{ flat: Flat; blockRateNew: number; blockRateRedev: number; blockDefaultCategory: "new" | "redev" } | null>(null);
  const [blockForm, setBlockForm] = useState<Block | null | "new">(null); // "new" | Block (edit) | null
  const [floorForm, setFloorForm] = useState<{ blockId: string; floor?: Floor } | null>(null);
  const [copyFloor, setCopyFloor] = useState<{ floor: Floor; allFloors: Floor[] } | null>(null);
  const [showFlatTypeManager, setShowFlatTypeManager] = useState(false);

  // Confirm delete state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    message: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Refresh data from server
  const refresh = useCallback(() => {
    startTransition(async () => {
      const fresh = await getFlatMapData(siteId);
      setData(fresh as FlatMapState);
    });
  }, [siteId]);

  // Helpers to find block for a flat
  const findBlockForFloor = (floorId: string): Block | undefined => {
    return data.blocks.find(b => b.floors.some(f => f.id === floorId));
  };

  const handleFlatClick = (flat: Flat) => {
    const block = findBlockForFloor(flat.floor_id);
    if (!block) return;
    setSelectedFlat({
      flat,
      blockRateNew: block.rate_new,
      blockRateRedev: block.rate_redev,
      blockDefaultCategory: block.default_category,
    });
  };

  // Block deletion
  const handleDeleteBlock = (block: Block) => {
    const flatCount = block.floors.reduce((s, f) => s + f.flats.length, 0);
    setDeleteConfirm({
      message: `Delete block "${block.name}"? This will permanently remove ${block.floors.length} floor(s) and ${flatCount} flat(s).`,
      onConfirm: async () => {
        await deleteBlock(block.id);
        refresh();
      },
    });
  };

  // Floor deletion
  const handleDeleteFloor = (floor: Floor) => {
    setDeleteConfirm({
      message: `Delete floor "${floor.label}"? This will permanently remove ${floor.flats.length} flat(s).`,
      onConfirm: async () => {
        await deleteFloor(floor.id);
        refresh();
      },
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    await deleteConfirm.onConfirm();
    setDeleting(false);
    setDeleteConfirm(null);
  };

  const isEmpty = data.blocks.length === 0;

  return (
    <div className="animate-fade-in">
      {/* Summary Bar */}
      <ProjectSummaryBar blocks={data.blocks} flatTypes={data.flatTypes} />

      {/* Toolbar */}
      <FlatMapToolbar
        siteId={siteId}
        flatTypes={data.flatTypes}
        filters={filters}
        onFiltersChange={setFilters}
        onManageFlatTypes={() => setShowFlatTypeManager(true)}
      />

      {/* Refresh indicator */}
      {isPending && (
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Refreshing…
        </div>
      )}

      {/* Empty state */}
      {isEmpty && !isPending && (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-neutral-200 rounded-2xl">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">No blocks yet</h3>
          <p className="text-sm text-neutral-400 mb-6 text-center max-w-xs">
            Start by adding a Block (e.g. "Block A"). Then add floors and bulk-create flats.
          </p>
          <button
            onClick={() => setBlockForm("new")}
            className="flex items-center gap-2 px-5 py-3 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add First Block
          </button>
        </div>
      )}

      {/* Block Cards */}
      {!isEmpty && (
        <div className="space-y-4">
          {data.blocks.map(block => (
            <BlockCard
              key={block.id}
              block={block}
              flatTypes={data.flatTypes}
              filters={filters}
              onFlatClick={handleFlatClick}
              onAddFlats={(floorId) => {
                const floor = block.floors.find(f => f.id === floorId);
                if (floor) {
                  setBulkCreate({
                    floorId,
                    floorLabel: floor.label,
                    blockId: block.id,
                    defaultCategory: block.default_category,
                  });
                }
              }}
              onAddFloor={(blockId) => setFloorForm({ blockId })}
              onEditBlock={(b) => setBlockForm(b)}
              onDeleteBlock={handleDeleteBlock}
              onEditFloor={(floor) => setFloorForm({ blockId: block.id, floor })}
              onDeleteFloor={handleDeleteFloor}
              onCopyFloor={(floor) => setCopyFloor({ floor, allFloors: block.floors })}
            />
          ))}

          {/* Add another block */}
          <button
            onClick={() => setBlockForm("new")}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-2xl hover:bg-neutral-50 hover:border-neutral-400 hover:text-neutral-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Block
          </button>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}

      {/* Flat Type Manager */}
      {showFlatTypeManager && (
        <FlatTypeManager
          siteId={siteId}
          flatTypes={data.flatTypes}
          onClose={() => setShowFlatTypeManager(false)}
          onUpdate={refresh}
        />
      )}

      {/* Block Form */}
      {blockForm !== null && (
        <BlockFormModal
          siteId={siteId}
          block={blockForm !== "new" ? {
            id: blockForm.id,
            name: blockForm.name,
            default_category: blockForm.default_category,
            rate_new: blockForm.rate_new,
            rate_redev: blockForm.rate_redev,
          } : undefined}
          onClose={() => setBlockForm(null)}
          onSuccess={() => { setBlockForm(null); refresh(); }}
        />
      )}

      {/* Floor Form */}
      {floorForm !== null && (
        <FloorFormModal
          blockId={floorForm.blockId}
          floor={floorForm.floor}
          onClose={() => setFloorForm(null)}
          onSuccess={() => { setFloorForm(null); refresh(); }}
        />
      )}

      {/* Bulk Create */}
      {bulkCreate !== null && (
        <BulkCreateForm
          floorId={bulkCreate.floorId}
          floorLabel={bulkCreate.floorLabel}
          blockDefaultCategory={bulkCreate.defaultCategory}
          flatTypes={data.flatTypes}
          blockId={bulkCreate.blockId}
          onClose={() => setBulkCreate(null)}
          onSuccess={() => { setBulkCreate(null); refresh(); }}
        />
      )}

      {/* Flat Detail Panel */}
      {selectedFlat !== null && (
        <FlatDetailPanel
          flat={selectedFlat.flat}
          blockRateNew={selectedFlat.blockRateNew}
          blockRateRedev={selectedFlat.blockRateRedev}
          blockDefaultCategory={selectedFlat.blockDefaultCategory}
          flatTypes={data.flatTypes}
          onClose={() => setSelectedFlat(null)}
          onUpdate={() => { setSelectedFlat(null); refresh(); }}
          onDelete={() => { setSelectedFlat(null); refresh(); }}
        />
      )}

      {/* Copy Floor Modal */}
      {copyFloor !== null && (
        <CopyFloorModal
          sourceFloor={copyFloor.floor}
          allFloors={copyFloor.allFloors}
          onClose={() => setCopyFloor(null)}
          onSuccess={() => { setCopyFloor(null); refresh(); }}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirm !== null && (
        <ConfirmDeleteDialog
          message={deleteConfirm.message}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
