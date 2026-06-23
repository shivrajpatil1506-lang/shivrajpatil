"use client";

import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { quickCreateCustomer } from "@/app/actions/customers";

interface QuickAddCustomerModalProps {
  onClose: () => void;
  onSuccess: (customer: { id: string; first_name: string; last_name: string; mobile_1: string }) => void;
}

export function QuickAddCustomerModal({ onClose, onSuccess }: QuickAddCustomerModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !mobile.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await quickCreateCustomer({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      mobile_1: mobile.trim(),
    });

    setLoading(false);

    if (res.success && res.customer) {
      onSuccess(res.customer as any);
    } else {
      setError(res.error || "Failed to create customer.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900">Quick Add Customer</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">First Name</label>
              <input
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="e.g. John"
                autoFocus
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Last Name</label>
              <input
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 mb-1.5">Mobile Number</label>
            <input
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2 text-sm font-medium text-neutral-600 border border-neutral-200 rounded-xl hover:bg-neutral-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-2 text-sm font-medium bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors">
              {loading ? "Saving..." : "Add Customer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
