"use client";

import { create } from "zustand";

type UIStore = {
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  toggleSidebar: () => void;
  setSidebarMobileOpen: (open: boolean) => void;
  // Dashboard mode
  dashboardMode: "consolidated" | "standalone";
  selectedCompanyId: string | null;
  setDashboardMode: (mode: "consolidated" | "standalone") => void;
  setSelectedCompanyId: (id: string | null) => void;
  // Time period
  timePeriod: "monthly" | "quarterly" | "yearly" | "entire";
  setTimePeriod: (period: "monthly" | "quarterly" | "yearly" | "entire") => void;
};

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  sidebarMobileOpen: false,
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarMobileOpen: (open) => set({ sidebarMobileOpen: open }),

  dashboardMode: "consolidated",
  selectedCompanyId: null,
  setDashboardMode: (mode) => set({ dashboardMode: mode }),
  setSelectedCompanyId: (id) => set({ selectedCompanyId: id }),

  timePeriod: "monthly",
  setTimePeriod: (period) => set({ timePeriod: period }),
}));
