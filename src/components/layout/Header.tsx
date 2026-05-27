"use client";

import React, { useState } from "react";
import { Bell, Search, Menu, X, ChevronDown } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { useUIStore } from "@/stores/ui-store";
import { formatDistanceToNow } from "date-fns";
import { getNotifications, markNotificationRead } from "@/app/actions/notifications";
import { useRouter, usePathname } from "next/navigation";

type HeaderProps = {
  title: string;
};

export default function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const { setSidebarMobileOpen } = useUIStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  React.useEffect(() => {
    getNotifications().then(data => setNotifications(data));
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg hover:bg-neutral-100 text-neutral-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
          {title}
        </h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="p-2.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors">
          <Search className="w-[18px] h-[18px]" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
            className="p-2.5 rounded-lg hover:bg-neutral-100 text-neutral-500 transition-colors relative"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full mt-2 w-[380px] bg-white rounded-xl shadow-lg border border-neutral-200 z-50 animate-fade-in overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                  <h3 className="font-semibold text-sm text-neutral-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-xs text-primary-500 hover:underline cursor-pointer font-medium">Mark all read</button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-neutral-500">No notifications</div>
                  ) : (
                    notifications.map((notif: any) => (
                      <div 
                        key={notif.id} 
                        onClick={() => {
                          if (!notif.is_read) {
                            markNotificationRead(notif.id);
                            setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
                          }
                        }}
                        className={cn(
                          "p-4 border-b border-neutral-50 hover:bg-neutral-50 transition-colors cursor-pointer",
                          !notif.is_read ? "bg-primary-50/30" : ""
                        )}
                      >
                        <div className="flex gap-3">
                          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", "bg-primary-100 text-primary-600")}>
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className={cn("text-sm text-neutral-900 mb-0.5", !notif.is_read && "font-semibold")}>{notif.title}</p>
                            <p className="text-xs text-neutral-500 line-clamp-2">{notif.message}</p>
                            <p className="text-[10px] text-neutral-400 mt-2">{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</p>
                          </div>
                          {!notif.is_read && <div className="w-2 h-2 bg-primary-500 rounded-full mt-1.5" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2.5 border-t border-neutral-100 text-center">
                  <span className="text-xs text-primary-500 hover:underline cursor-pointer font-medium">View All Notifications</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Separator */}
        <div className="w-px h-8 bg-neutral-200 mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-semibold">
              {user ? getInitials(user.name) : "U"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-neutral-900 leading-none">{user?.name}</p>
              <p className="text-[10px] text-neutral-400 capitalize mt-0.5">{user?.role}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-neutral-200 z-50 animate-fade-in overflow-hidden py-1">
                <div className="px-3 py-2 border-b border-neutral-100">
                  <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                  <p className="text-xs text-neutral-500">{user?.email}</p>
                </div>
                <button className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">Profile</button>
                <button className="w-full px-3 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 transition-colors">Settings</button>
                <div className="border-t border-neutral-100" />
                <button 
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    useAuthStore.getState().logout();
                    router.push("/login");
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
