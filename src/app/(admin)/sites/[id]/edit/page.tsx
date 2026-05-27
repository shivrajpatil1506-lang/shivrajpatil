"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, MapPin, Building, FileText, CheckSquare, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getCompanies } from "@/app/actions/companies";
import { getSiteById, updateSite } from "@/app/actions/sites";

export default function EditSitePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<Awaited<ReturnType<typeof getCompanies>>>([]);

  const [formData, setFormData] = useState({
    company_id: "",
    name: "", site_code: "", site_type: "residential",
    address_line1: "", address_line2: "", city: "Pune", state: "Maharashtra", pin: "",
    total_land_area: "", land_area_unit: "sqft",
    rera_number: "", rera_reg_date: "", rera_expiry_date: "",
    expected_completion: "", status: "active",
    description: "", total_units: ""
  });

  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);

  useEffect(() => {
    getCompanies().then(setCompanies);
    
    getSiteById(id).then(site => {
      if (site) {
        setFormData({
          company_id: site.company_id || "",
          name: site.name || "",
          site_code: site.site_code || "",
          site_type: site.site_type || "residential",
          address_line1: (site.address as any)?.address_line1 || (site.address as any)?.line1 || "",
          address_line2: (site.address as any)?.address_line2 || (site.address as any)?.line2 || "",
          city: site.city || "Pune",
          state: site.state || "Maharashtra",
          pin: (site.address as any)?.pin || "",
          total_land_area: site.total_land_area?.toString() || "",
          land_area_unit: site.land_area_unit || "sqft",
          rera_number: site.rera_number || "",
          rera_reg_date: "",
          rera_expiry_date: "",
          expected_completion: site.expected_completion ? new Date(site.expected_completion).toISOString().split('T')[0] : "",
          status: site.status || "active",
          description: site.description || "",
          total_units: ""
        });
        
        if (site.property_types) {
          setPropertyTypes(site.property_types.split(","));
        }
      }
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company_id) {
      error("Error", "Please select a parent company.");
      return;
    }

    setSaving(true);
    
    try {
      const siteData = {
        company_id: formData.company_id,
        name: formData.name,
        site_code: formData.site_code,
        site_type: formData.site_type,
        city: formData.city,
        state: formData.state,
        total_land_area: formData.total_land_area ? parseFloat(formData.total_land_area) : null,
        land_area_unit: formData.land_area_unit,
        rera_number: formData.rera_number,
        expected_completion: formData.expected_completion ? new Date(formData.expected_completion) : null,
        status: formData.status,
        description: formData.description,
        property_types: propertyTypes.join(","),
        address: {
          line1: formData.address_line1,
          line2: formData.address_line2,
          pin: formData.pin
        } as any,
      };

      await updateSite(id, siteData as any);
      success("Site Updated", `${formData.name} has been updated successfully.`);
      router.push(`/sites/${id}`);
    } catch (err) {
      console.error(err);
      error("Error", "An unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };

  const AVAILABLE_PTYPES = ["1RK", "1BHK", "2BHK", "3BHK", "4BHK", "Penthouse", "Commercial Shop", "Commercial Office"];

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href={`/sites/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Site
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Edit Site</h1>
        <p className="text-neutral-500 text-sm mt-1">Update construction project or property site details.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Site Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Parent Company *</label>
              <select required name="company_id" value={formData.company_id} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="" disabled>Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Site Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. GB Serenity Heights" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Site Code *</label>
              <input required name="site_code" value={formData.site_code} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase" placeholder="e.g. GBSH-001" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Site Type *</label>
              <select required name="site_type" value={formData.site_type} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="active">Active (Under Construction)</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none resize-none" placeholder="Brief description of the project..." />
            </div>
          </div>
        </div>

        {/* Location & Area */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Location & Area</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 1 *</label>
              <input required name="address_line1" value={formData.address_line1} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Survey No., Area" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Address Line 2</label>
              <input name="address_line2" value={formData.address_line2} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Landmark" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">City *</label>
              <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">PIN Code *</label>
              <input required name="pin" value={formData.pin} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Total Land Area *</label>
              <input required name="total_land_area" value={formData.total_land_area} onChange={handleChange} type="number" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" placeholder="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Area Unit</label>
              <select name="land_area_unit" value={formData.land_area_unit} onChange={handleChange} className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="sqft">Sq. Ft.</option>
                <option value="acres">Acres</option>
                <option value="sqmtr">Sq. Mtr.</option>
                <option value="guntha">Guntha</option>
              </select>
            </div>
          </div>
        </div>

        {/* Legal & Inventory */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Compliance & Inventory</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">RERA Number</label>
              <input name="rera_number" value={formData.rera_number} onChange={handleChange} type="text" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none font-mono uppercase" placeholder="P521000..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Expected Completion</label>
              <input name="expected_completion" value={formData.expected_completion} onChange={handleChange} type="date" className="w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="md:col-span-2 mt-2">
              <label className="block text-sm font-medium text-neutral-700 mb-3">Available Property Types</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_PTYPES.map(type => (
                  <button 
                    key={type}
                    type="button"
                    onClick={() => togglePropertyType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                      propertyTypes.includes(type) 
                        ? 'bg-primary-50 border-primary-500 text-primary-700' 
                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-primary-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href={`/sites/${id}`} className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
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
