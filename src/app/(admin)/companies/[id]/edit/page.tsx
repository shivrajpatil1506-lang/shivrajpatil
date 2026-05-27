"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Building2, FileText, MapPin, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getCompanyById, updateCompany } from "@/app/actions/companies";

export default function EditCompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "", short_name: "",
    cin: "", gstin: "", pan: "",
    email: "", phone: "", website: "",
    incorporated_at: "",
    status: "active",
    address_line1: "", address_line2: "", city: "Pune", state: "Maharashtra", pin: "",
    notes: ""
  });

  useEffect(() => {
    getCompanyById(id).then(company => {
      if (company) {
        setFormData({
          name: company.name || "",
          short_name: company.short_name || "",
          cin: company.cin || "",
          gstin: company.gstin || "",
          pan: company.pan || "",
          email: company.email || "",
          phone: company.phone_numbers || "",
          website: company.website || "",
          incorporated_at: company.incorporated_at ? new Date(company.incorporated_at).toISOString().split('T')[0] : "",
          status: company.status || "active",
          address_line1: (company.reg_address as any)?.address_line1 || (company.reg_address as any)?.line1 || "",
          address_line2: (company.reg_address as any)?.address_line2 || (company.reg_address as any)?.line2 || "",
          city: (company.reg_address as any)?.city || "Pune",
          state: (company.reg_address as any)?.state || "Maharashtra",
          pin: (company.reg_address as any)?.pin || "",
          notes: company.notes || ""
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const dataToUpdate = {
      name: formData.name,
      short_name: formData.short_name,
      cin: formData.cin,
      gstin: formData.gstin,
      pan: formData.pan,
      email: formData.email,
      phone_numbers: formData.phone,
      website: formData.website,
      incorporated_at: formData.incorporated_at ? new Date(formData.incorporated_at) : null,
      status: formData.status,
      reg_address: {
        line1: formData.address_line1,
        line2: formData.address_line2,
        city: formData.city,
        state: formData.state,
        pin: formData.pin,
      },
      notes: formData.notes,
    };

    try {
      await updateCompany(id, dataToUpdate as any);
      setSaving(false);
      success("Company Updated", `${formData.name} has been updated successfully.`);
      router.push(`/companies/${id}`);
    } catch (err) {
      console.error(err);
      setSaving(false);
      error("Failed to update company", "An error occurred");
    }
  };

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href={`/companies/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Company
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Edit Company</h1>
        <p className="text-neutral-500 text-sm mt-1">Update company details and registration info.</p>
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
          <Link href={`/companies/${id}`} className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
            Cancel
          </Link>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
