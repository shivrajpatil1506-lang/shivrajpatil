"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Building2, MapPin, Users, UserCog, UserCheck,
  IndianRupee, BarChart3, CheckSquare, ClipboardList, Settings,
  ShoppingBag, ChevronLeft, ChevronRight, LogOut,
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
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().setUser(null as any);
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40 transition-transform duration-300 ease-in-out bg-white border-r border-neutral-200",
        sidebarCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
        // Mobile behavior
        "w-[260px]",
        sidebarMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-neutral-200 shrink-0",
        sidebarCollapsed && "justify-center px-2"
      )}>
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-neutral-100 flex items-center justify-center border border-neutral-200">
          <Image src="/logo.png" alt="GB Infra" width={36} height={36} className="object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-neutral-900 font-bold text-lg leading-none" style={{ fontFamily: "var(--font-heading)" }}>
              GB Infra
            </h1>
            <p className="text-neutral-500 text-[10px] mt-0.5">Operations Platform</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
        {navItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "sidebar-active font-semibold"
                  : "text-neutral-800 hover:text-neutral-900 hover:bg-neutral-50",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary-500" : "text-neutral-600 group-hover:text-neutral-800")} />
              {!sidebarCollapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {item.badge}
                </span>
              )}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-neutral-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex mx-2 mb-2 p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors items-center justify-center"
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User */}
      <div className={cn(
        "border-t border-neutral-200 p-3 flex items-center gap-3",
        sidebarCollapsed && "justify-center px-2"
      )}>
        <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-semibold shrink-0">
          {user ? getInitials(user.name) : "GB"}
        </div>
        {!sidebarCollapsed && user && (
          <div className="flex-1 min-w-0 animate-fade-in">
            <p className="text-neutral-900 text-sm font-medium truncate">{user.name}</p>
            <p className="text-neutral-600 text-xs capitalize">{user.role}</p>
          </div>
        )}
        {!sidebarCollapsed && (
          <button onClick={handleLogout} className="text-neutral-500 hover:text-danger-500 transition-colors p-1" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
