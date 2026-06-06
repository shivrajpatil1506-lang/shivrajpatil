"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { useAuthStore } from "@/stores/auth-store";
import { User, Mail, Briefcase, Phone, MapPin, Edit3 } from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  // In a real app we might fetch more profile details from an action here
  useEffect(() => {
    // Simulate loading for realistic UX
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <PageHeader title="My Profile" description="Manage your personal information and preferences" />
      
      {loading ? (
        <div className="py-24 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800 relative">
            <button className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors text-xs font-medium flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5" /> Edit Cover
            </button>
          </div>
          
          <div className="px-6 sm:px-8 pb-8 relative">
            {/* Avatar */}
            <div className="flex justify-between items-end -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center text-primary-700 text-3xl font-bold shadow-sm relative">
                {user ? getInitials(user.name) : "U"}
                <button className="absolute bottom-0 right-0 bg-neutral-900 text-white p-1.5 rounded-full hover:bg-neutral-800 transition-colors border-2 border-white">
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
              <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
            
            {/* User Info Header */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>
                {user?.name}
              </h2>
              <p className="text-sm text-neutral-500 capitalize">{user?.role} • GB Infra</p>
            </div>

            {/* Profile Form / Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Personal Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user?.name || ""} 
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      defaultValue={user?.email || ""} 
                      disabled
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 outline-none cursor-not-allowed"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="+91 " 
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-neutral-900 border-b border-neutral-100 pb-2">Work Information</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> Job Title
                    </label>
                    <input 
                      type="text" 
                      defaultValue={user?.role || ""} 
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none capitalize"
                    />
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-1.5">
                      <MapPin className="w-3.5 h-3.5" /> Location
                    </label>
                    <input 
                      type="text" 
                      defaultValue="Pune, Maharashtra" 
                      className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
