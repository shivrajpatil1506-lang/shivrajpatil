"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import type { NavItem } from "@/lib/constants";

type AppShellProps = {
  children: React.ReactNode;
  navItems: NavItem[];
  title: string;
};

export default function AppShell({ children, navItems, title }: AppShellProps) {
  const { sidebarCollapsed, sidebarMobileOpen, setSidebarMobileOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar navItems={navItems} />

      {/* Mobile Overlay */}
      {sidebarMobileOpen && (
        <div 
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-30 lg:hidden animate-in fade-in duration-300" 
          onClick={() => setSidebarMobileOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className="transition-all duration-300 ease-in-out min-h-screen flex flex-col flex-1 w-full lg:w-auto lg:ml-[260px]"
      >
        <Header title={title} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
