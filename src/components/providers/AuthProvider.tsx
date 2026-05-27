"use client";

import React, { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/auth-store";
import type { AuthUser } from "@/lib/auth";

export default function AuthProvider({ 
  children, 
  user 
}: { 
  children: React.ReactNode, 
  user: AuthUser | null 
}) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      if (user) {
        useAuthStore.getState().setUser({
          id: user.employee_id || user.uid,
          name: user.name,
          email: user.email,
          role: user.role,
        });
      } else {
        useAuthStore.getState().logout();
      }
      initialized.current = true;
    }
  }, [user]);

  return <>{children}</>;
}
