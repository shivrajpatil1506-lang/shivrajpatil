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
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    useAuthStore.getState().setUser(null as any);
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40 transition-all duration-300 ease-in-out",
        sidebarCollapsed ? "w-[72px]" : "w-[260px]"
      )}
      style={{ background: "#0A1628" }}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 px-4 h-16 border-b border-white/10 shrink-0",
        sidebarCollapsed && "justify-center px-2"
      )}>
        <div className="w-9 h-9 rounded-lg overflow-hidden shrink-0 bg-white/10 flex items-center justify-center">
          <Image src="/logo.png" alt="GB Infra" width={36} height={36} className="object-contain" />
        </div>
        {!sidebarCollapsed && (
          <div className="animate-fade-in">
            <h1 className="text-white font-bold text-lg leading-none" style={{ fontFamily: "var(--font-heading)" }}>
              GB Infra
            </h1>
            <p className="text-white/40 text-[10px] mt-0.5">Operations Platform</p>
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
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-white/10 text-white border-l-[3px] border-amber-400"
                  : "text-white/60 hover:text-white hover:bg-white/5 border-l-[3px] border-transparent",
                sidebarCollapsed && "justify-center px-2"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-amber-400" : "text-white/50 group-hover:text-white/80")} />
              {!sidebarCollapsed && (
                <span className="animate-fade-in">{item.label}</span>
              )}
              {!sidebarCollapsed && item.badge && item.badge > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
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
        className="mx-2 mb-2 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors flex items-center justify-center"
      >
        {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* User */}
      <div className={cn(
        "border-t border-white/10 p-3 flex items-center gap-3",
        sidebarCollapsed && "justify-center px-2"
      )}>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-semibold shrink-0">
          {user ? getInitials(user.name) : "GB"}
        </div>
        {!sidebarCollapsed && user && (
          <div className="flex-1 min-w-0 animate-fade-in">
            <p className="text-white text-sm font-medium truncate">{user.name}</p>
            <p className="text-white/40 text-xs capitalize">{user.role}</p>
          </div>
        )}
        {!sidebarCollapsed && (
          <button onClick={handleLogout} className="text-white/30 hover:text-white/70 transition-colors p-1" title="Log Out">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}
