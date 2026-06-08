import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 text-neutral-500">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        <p className="text-sm font-medium" style={{ fontFamily: "var(--font-heading)" }}>Loading dashboard metrics...</p>
      </div>
    </div>
  );
}
