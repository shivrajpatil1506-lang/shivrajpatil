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
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar navItems={navItems} />

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
          sidebarCollapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <Header title={title} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
