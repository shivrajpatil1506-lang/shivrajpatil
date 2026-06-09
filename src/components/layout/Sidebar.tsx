"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  // Sidebar is now fixed on desktop, so sidebarCollapsed is effectively false. 
  // We keep the mobile toggle logic.
  const { sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();
  const sidebarCollapsed = false; // Forced false as per user request to remove collapse button

  const handleLogout = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border shrink-0">
        <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center border border-primary-200 shrink-0">
          <Building2 className="w-4 h-4 text-primary-700" />
        </div>
        <div className="animate-fade-in">
          <h1 className="text-neutral-900 font-bold text-base leading-none" style={{ fontFamily: "var(--font-heading)" }}>
            GB Infra
          </h1>
          <p className="text-neutral-500 text-[10px] mt-0.5 uppercase tracking-wider">Platform</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto overflow-x-hidden space-y-0.5">
        <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2 px-2">
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
                "flex items-center gap-3 px-2 py-2 rounded-md text-sm font-medium transition-colors group relative",
                isActive
                  ? "bg-primary-50 text-primary-700"
                  : "text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-600" : "text-neutral-500 group-hover:text-neutral-700")} />
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

      {/* Bottom User Profile */}
      <div 
        className="border-t border-border p-3 flex items-center gap-3 hover:bg-neutral-50 transition-colors cursor-pointer shrink-0 group relative"
        onClick={() => { 
          setSidebarMobileOpen(false); 
          router.push('/profile'); 
        }}
      >
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold shrink-0 border border-primary-200">
          {user ? getInitials(user.name) : "GB"}
        </div>
        
        {user && (
          <div className="flex-1 min-w-0">
            <p className="text-neutral-900 text-sm font-semibold truncate group-hover:text-primary-600 transition-colors">
              {user.name}
            </p>
            <p className="text-neutral-500 text-[11px] uppercase tracking-wider">
              {user.role}
            </p>
          </div>
        )}
        
        <button
          onClick={handleLogout}
          className="text-neutral-400 hover:text-danger-500 hover:bg-danger-50 p-1.5 rounded-md transition-colors"
          title="Log Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
