"use client";

import React, { useState, useEffect } from "react";
import { TaskChecklistItem } from "@/lib/types";
import { getChecklists, addChecklistItem, toggleChecklistItem, deleteChecklistItem, updateChecklistItemTitle, reorderChecklist } from "@/app/actions/checklist";
import { Plus, X, GripVertical, CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

function SortableItem({ 
  item, 
  onToggle, 
  onDelete, 
  onUpdateTitle,
  canEdit 
}: { 
  item: TaskChecklistItem; 
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  canEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled: !canEdit });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(item.title);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 group p-1.5 -mx-1.5 rounded-lg hover:bg-neutral-50 transition-colors",
        isDragging && "opacity-50 bg-neutral-100 shadow-sm"
      )}
    >
      {canEdit && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500 p-0.5">
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      )}
      
      <button 
        onClick={() => onToggle(item.id)} 
        disabled={!canEdit}
        className={cn(
          "shrink-0", 
          item.is_done ? "text-emerald-500" : "text-neutral-300 hover:text-neutral-400"
        )}
      >
        {item.is_done ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>

      {isEditing && canEdit ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            setIsEditing(false);
            if (title.trim() !== item.title) {
              onUpdateTitle(item.id, title);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setIsEditing(false);
              if (title.trim() !== item.title) {
                onUpdateTitle(item.id, title);
              }
            } else if (e.key === "Escape") {
              setIsEditing(false);
              setTitle(item.title);
            }
          }}
          className="flex-1 text-sm bg-white border border-primary-500 rounded px-1.5 py-0.5 outline-none"
        />
      ) : (
        <span 
          onClick={() => { if (canEdit) setIsEditing(true); }}
          className={cn(
            "flex-1 text-sm cursor-text",
            item.is_done ? "text-neutral-400 line-through" : "text-neutral-700"
          )}
        >
          {item.title}
        </span>
      )}

      {canEdit && (
        <button
          onClick={() => onDelete(item.id)}
          className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-500 rounded transition-all shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default function TaskChecklist({ taskId, canEdit = true }: { taskId: string, canEdit?: boolean }) {
  const [items, setItems] = useState<TaskChecklistItem[]>([]);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();
  }, [taskId]);

  const loadItems = async () => {
    const data = await getChecklists(taskId);
    setItems(data);
    setLoading(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const reordered = arrayMove(items, oldIndex, newIndex).map((item, idx) => ({
        ...item,
        sort_order: idx,
      }));
      
      setItems(reordered);
      await reorderChecklist(reordered.map(i => ({ id: i.id, sort_order: i.sort_order })));
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !canEdit) return;
    
    const tempId = `temp-${Date.now()}`;
    const newItem = {
      id: tempId,
      task_id: taskId,
      title: newItemTitle.trim(),
      is_done: false,
      sort_order: items.length,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setItems([...items, newItem]);
    setNewItemTitle("");
    
    const res = await addChecklistItem(taskId, newItem.title);
    if (res.success && res.item) {
      setItems(prev => prev.map(i => i.id === tempId ? (res.item as TaskChecklistItem) : i));
    } else {
      setItems(prev => prev.filter(i => i.id !== tempId));
    }
  };

  const handleToggle = async (id: string) => {
    if (!canEdit) return;
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_done: !i.is_done } : i));
    await toggleChecklistItem(id);
  };

  const handleDelete = async (id: string) => {
    if (!canEdit) return;
    setItems(prev => prev.filter(i => i.id !== id));
    await deleteChecklistItem(id);
  };

  const handleUpdateTitle = async (id: string, title: string) => {
    if (!canEdit) return;
    if (!title.trim()) {
      handleDelete(id);
      return;
    }
    setItems(prev => prev.map(i => i.id === id ? { ...i, title } : i));
    await updateChecklistItemTitle(id, title);
  };

  if (loading) return <div className="animate-pulse h-20 bg-neutral-100 rounded-lg"></div>;

  const doneCount = items.filter(i => i.is_done).length;
  const progress = items.length > 0 ? (doneCount / items.length) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-neutral-800">Subtasks</h3>
        {items.length > 0 && (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div 
                className={cn("h-full rounded-full transition-all duration-300", progress === 100 ? "bg-emerald-500" : "bg-primary-500")} 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <span className="text-[10px] font-medium text-neutral-500 shrink-0">{doneCount}/{items.length}</span>
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <div className="space-y-0.5">
            {items.map((item) => (
              <SortableItem 
                key={item.id} 
                item={item} 
                onToggle={handleToggle}
                onDelete={handleDelete}
                onUpdateTitle={handleUpdateTitle}
                canEdit={canEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {canEdit && (
        <form onSubmit={handleAdd} className="flex items-center gap-2 mt-2">
          <Plus className="w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Add subtask..."
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 outline-none placeholder:text-neutral-400"
          />
        </form>
      )}
    </div>
  );
}
