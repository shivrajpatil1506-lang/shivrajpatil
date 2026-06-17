"use client";

import { create } from "zustand";
import type { Role } from "@/lib/constants";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  company_id?: string;
  assigned_companies?: string[];
};

type AuthStore = {
  user: AuthUser | null;
  currentCompany: { id: string; name: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: AuthUser) => void;
  setCurrentCompany: (company: { id: string; name: string } | null) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
};

// Default mock admin user for development
const defaultUser: AuthUser = {
  id: "admin-001",
  name: "Ganesh Bhosale",
  email: "ganesh@gbinfra.in",
  role: "admin",
  avatar: undefined,
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: defaultUser,
  currentCompany: null,
  isAuthenticated: true,
  isLoading: false,
  setUser: (user) => set({ user, isAuthenticated: true }),
  setCurrentCompany: (company) => set({ currentCompany: company }),
  logout: () => set({ user: null, currentCompany: null, isAuthenticated: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
