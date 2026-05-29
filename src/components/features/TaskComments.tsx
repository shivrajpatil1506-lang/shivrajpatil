"use client";

import React, { useState, useEffect, useRef } from "react";
import { TaskComment } from "@/lib/types";
import { getComments, addComment, deleteComment } from "@/app/actions/comments";
import { Send, Trash2, MessageSquare } from "lucide-react";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

export default function TaskComments({ 
  taskId, 
  currentUserId,
  isAdminOrHR 
}: { 
  taskId: string;
  currentUserId: string;
  isAdminOrHR: boolean;
}) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { success, error: toastError } = useToast();
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  useEffect(() => {
    if (comments.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const loadComments = async () => {
    const data = await getComments(taskId);
    setComments(data);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;
    
    setSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const optimisticComment: TaskComment = {
      id: tempId,
      task_id: taskId,
      author_id: currentUserId,
      author_name: "Me",
      content: newComment.trim(),
      is_deleted: false,
      created_at: new Date().toISOString(),
    };
    
    setComments(prev => [...prev, optimisticComment]);
    setNewComment("");
    
    const res = await addComment(taskId, optimisticComment.content);
    if (res.success && res.comment) {
      setComments(prev => prev.map(c => c.id === tempId ? (res.comment as TaskComment) : c));
    } else {
      setComments(prev => prev.filter(c => c.id !== tempId));
      toastError("Error", res.error);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    
    const prev = [...comments];
    setComments(prev => prev.filter(c => c.id !== id));
    
    const res = await deleteComment(id);
    if (res.success) {
      success("Deleted", "Comment removed.");
    } else {
      setComments(prev);
      toastError("Error", res.error);
    }
  };

  if (loading) return <div className="animate-pulse h-24 bg-neutral-100 rounded-lg"></div>;

  return (
    <div className="flex flex-col h-full border border-neutral-100 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-neutral-500" />
        <h3 className="text-sm font-semibold text-neutral-700">Comments</h3>
        <span className="text-[10px] font-medium px-1.5 py-0.5 bg-neutral-200 text-neutral-600 rounded-full ml-auto">
          {comments.length}
        </span>
      </div>

      {/* Comment List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4 max-h-[300px]">
        {comments.length === 0 ? (
          <div className="text-center text-sm text-neutral-400 py-6">
            No comments yet. Be the first!
          </div>
        ) : (
          comments.map((c) => {
            const isMe = c.author_id === currentUserId;
            const canDelete = isMe || isAdminOrHR;
            return (
              <div key={c.id} className={cn("flex gap-2 group", isMe ? "flex-row-reverse" : "")}>
                <div 
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0 mt-1",
                    isMe ? "bg-primary-500" : "bg-neutral-400"
                  )}
                  title={c.author_name}
                >
                  {getInitials(c.author_name || "?")}
                </div>
                
                <div className={cn("flex flex-col max-w-[85%]", isMe ? "items-end" : "items-start")}>
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-[10px] font-medium text-neutral-600">
                      {isMe ? "Me" : c.author_name}
                    </span>
                    <span className="text-[9px] text-neutral-400">
                      {formatDate(c.created_at)}
                    </span>
                  </div>
                  
                  <div className="relative group/bubble">
                    <div className={cn(
                      "px-3 py-2 rounded-xl text-sm whitespace-pre-wrap break-words",
                      isMe 
                        ? "bg-primary-50 text-primary-900 rounded-tr-sm border border-primary-100" 
                        : "bg-neutral-50 text-neutral-800 rounded-tl-sm border border-neutral-100"
                    )}>
                      {c.content}
                    </div>
                    
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className={cn(
                          "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover/bubble:opacity-100 p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-all",
                          isMe ? "-left-7" : "-right-7"
                        )}
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 bg-neutral-50 border-t border-neutral-100">
        <form onSubmit={handleSubmit} className="flex items-end gap-2 relative">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Write a comment... (Enter to send)"
            className="flex-1 max-h-32 min-h-[40px] text-sm bg-white border border-neutral-200 rounded-lg px-3 py-2 outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none"
            rows={1}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="h-[40px] w-[40px] flex items-center justify-center bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition-colors shrink-0"
          >
            <Send className="w-4 h-4 ml-[-2px]" />
          </button>
        </form>
      </div>
    </div>
  );
}
