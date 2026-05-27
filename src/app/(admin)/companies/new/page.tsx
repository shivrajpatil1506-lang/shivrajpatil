"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building2, FileText, MapPin, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createCompany } from "@/app/actions/companies";

export default function NewCompanyPage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", short_name: "",
    cin: "", gstin: "", pan: "",
    email: "", phone: "", website: "",
    status: "active",
    address_line1: "", address_line2: "", city: "Pune", state: "Maharashtra", pin: "",
    notes: "",
    incorporated_at: "",
    is_main_company: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await createCompany(formData);
    
    setLoading(false);
    if (res.success) {
      success("Company Created", `${formData.name} has been added successfully.`);
      router.push("/companies");
    } else {
      error("Failed to create company", res.error || "An error occurred");
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href="/companies" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Companies
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Add New Company</h1>
        <p className="text-neutral-500 text-sm mt-1">Register a new subsidiary or sister company under GB Infra.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Basic Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Legal Company Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. GB Developers Pvt. Ltd." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Short Name *</label>
              <input required name="short_name" value={formData.short_name} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. GB Developers" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email Address</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="contact@company.com" />
            </div>
            <div className="flex items-center gap-3 mt-8">
              <input 
                type="checkbox" 
                id="is_main_company" 
                name="is_main_company" 
                checked={formData.is_main_company} 
                onChange={handleChange}
                className="w-5 h-5 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_main_company" className="text-sm font-medium text-neutral-800 cursor-pointer">
                Is this the Main Company?
                <span className="block text-xs text-neutral-500 font-normal">Check this if this is the root GB Infra company.</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Phone Number</label>
              <input name="phone" value={formData.phone} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="+91 XXXXX XXXXX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Website</label>
              <input name="website" value={formData.website} onChange={handleChange} type="url" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Date of Incorporation</label>
              <input name="incorporated_at" value={formData.incorporated_at} onChange={handleChange} type="date" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Registration & Tax */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Registration & Tax Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">CIN *</label>
              <input required name="cin" value={formData.cin} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase text-sm" placeholder="U45201MH..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">GSTIN *</label>
              <input required name="gstin" value={formData.gstin} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase text-sm" placeholder="27AABC..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">PAN *</label>
              <input required name="pan" value={formData.pan} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase text-sm" placeholder="ABCDE1234F" />
            </div>
          </div>
        </div>

        {/* Registered Address */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Registered Office Address</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 1 *</label>
              <input required name="address_line1" value={formData.address_line1} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Flat, Building, Street" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 2</label>
              <input name="address_line2" value={formData.address_line2} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Area, Landmark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">City *</label>
              <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">State *</label>
              <input required name="state" value={formData.state} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">PIN Code *</label>
              <input required name="pin" value={formData.pin} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href="/companies" className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={loading} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Saving..." : "Save Company"}
          </button>
        </div>

      </form>
    </div>
  );
}
