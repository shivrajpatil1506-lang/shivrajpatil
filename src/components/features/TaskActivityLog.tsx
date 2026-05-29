"use client";

import React, { useEffect, useState } from "react";
import { getTaskActivities } from "@/app/actions/tasks";
import { TaskActivity } from "@/lib/types";
import { Activity, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function TaskActivityLog({ taskId }: { taskId: string }) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, [taskId]);

  const loadActivities = async () => {
    const data = await getTaskActivities(taskId);
    setActivities(data);
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse h-24 bg-neutral-100 rounded-lg"></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-neutral-800">
        <Activity className="w-4 h-4 text-neutral-500" />
        <h3 className="text-sm font-semibold">Activity History</h3>
      </div>

      <div className="relative pl-3 border-l-2 border-neutral-100 space-y-4 ml-2">
        {activities.length === 0 ? (
          <div className="text-sm text-neutral-400 py-4 -ml-3">No activity logged yet.</div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute w-2 h-2 rounded-full bg-neutral-300 -left-[17px] top-1.5 border-2 border-white" />
              
              <div className="text-sm text-neutral-700">
                <span className="font-medium text-neutral-900">{act.actor_name || "System"}</span>
                {" "}
                {act.action}
                {act.old_value && act.new_value && (
                  <span className="text-neutral-500">
                    {" "}from <span className="font-medium">"{act.old_value}"</span> to <span className="font-medium">"{act.new_value}"</span>
                  </span>
                )}
                {act.new_value && !act.old_value && (
                  <span className="text-neutral-500">
                    : <span className="italic">"{act.new_value}"</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-[10px] text-neutral-400 mt-0.5">
                <Clock className="w-3 h-3" />
                {formatDate(act.created_at)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
