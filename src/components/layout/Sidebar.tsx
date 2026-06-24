"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, MapPin, Users, UserCog, UserCheck,
  IndianRupee, BarChart3, CheckSquare, ClipboardList, Settings,
  ShoppingBag, LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import type { NavItem } from "@/lib/constants";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Building2, MapPin, Users, UserCog, UserCheck,
  IndianRupee, BarChart3, CheckSquare, ClipboardList, Settings, ShoppingBag,
};

type SidebarProps = {
  navItems: NavItem[];
};

export default function Sidebar({ navItems }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().setUser(null as any);
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40 transition-transform duration-300 ease-in-out bg-sidebar border-r border-border shadow-sm",
        "lg:w-[260px]",
        // Mobile behavior
        "w-[260px]",
        sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Top Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0 bg-neutral-50/50">
        <div className="w-8 h-8 rounded bg-primary-600 flex items-center justify-center shrink-0 shadow-md">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-neutral-900 font-bold text-base leading-none tracking-tight" style={{ fontFamily: "var(--font-heading)" }}>
            GB Infra
          </h1>
          <p className="text-neutral-500 text-[9px] mt-1 font-bold uppercase tracking-[0.2em]">Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden space-y-1">
        <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3 px-3">
          Menu
        </div>
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-600" : "text-neutral-400 group-hover:text-neutral-600")} />
              <span className="truncate">{item.label}</span>
              
              {item.badge && item.badge > 0 && (
                <span className="ml-auto bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Profile Card */}
      <div className="p-4 border-t border-border shrink-0">
        <div 
          onClick={() => { 
            setSidebarMobileOpen(false); 
            router.push('/profile'); 
          }}
          className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-border hover:bg-neutral-100 hover:border-neutral-300 transition-all cursor-pointer group shadow-sm"
        >
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold shrink-0 border border-primary-200">
            {user ? getInitials(user.name) : "U"}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-neutral-900 text-sm font-bold truncate group-hover:text-primary-600 transition-colors">
              {user?.name || "Loading..."}
            </p>
            <p className="text-neutral-500 text-[10px] font-semibold uppercase tracking-wider mt-0.5 truncate">
              {user?.role || "User"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-neutral-400 hover:text-danger-500 hover:bg-danger-50 p-2 rounded-lg transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
