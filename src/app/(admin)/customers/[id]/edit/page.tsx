"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getCustomerWithDetails, updateCustomer } from "@/app/actions/customers";
import { GENDERS, INDIAN_STATES } from "@/lib/constants";

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", middleName: "", lastName: "",
    mobile1: "", mobile2: "", email: "",
    aadhaar: "", pan: "", gender: "", dob: "",
    fathersName: "",
    addressLine: "", city: "", state: "", pin: ""
  });

  useEffect(() => {
    getCustomerWithDetails(id).then(cust => {
      if (cust) {
        setFormData({
          firstName: cust.first_name || "",
          middleName: cust.middle_name || "",
          lastName: cust.last_name || "",
          mobile1: cust.mobile_1 || "",
          mobile2: cust.mobile_2 || "",
          email: cust.email || "",
          aadhaar: cust.aadhaar_encrypted || "",
          pan: cust.pan_number || "",
          gender: cust.gender || "",
          dob: cust.dob ? new Date(cust.dob).toISOString().split('T')[0] : "",
          fathersName: cust.fathers_name || "",
          addressLine: (cust.current_address as any)?.addressLine || (cust.current_address as any)?.line1 || "",
          city: (cust.current_address as any)?.city || "",
          state: (cust.current_address as any)?.state || "",
          pin: (cust.current_address as any)?.pin || ""
        });
      }
      setLoading(false);
    });
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await updateCustomer(id, {
        first_name: formData.firstName,
        middle_name: formData.middleName,
        last_name: formData.lastName,
        mobile_1: formData.mobile1,
        mobile_2: formData.mobile2,
        email: formData.email,
        aadhaar_encrypted: formData.aadhaar,
        pan_number: formData.pan,
        gender: formData.gender,
        dob: formData.dob ? new Date(formData.dob) : null,
        fathers_name: formData.fathersName,
        current_address: {
          addressLine: formData.addressLine,
          city: formData.city,
          state: formData.state,
          pin: formData.pin
        } as any
      });
      
      success("Customer Updated", `${formData.firstName} ${formData.lastName} updated successfully.`);
      router.push(`/customers/${id}`);
    } catch (err) {
      console.error(err);
      error("Error", "An unexpected error occurred while updating the customer.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none";
  const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href={`/customers/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customer
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Edit Customer Profile</h1>
        <p className="text-neutral-500 text-sm mt-1">Update personal and contact information.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>First Name *</label><input required name="firstName" value={formData.firstName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Middle Name</label><input name="middleName" value={formData.middleName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Last Name *</label><input required name="lastName" value={formData.lastName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={`${inputClass} bg-white`}>
                <option value="">Select Gender</option>{GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Father's Name</label><input name="fathersName" value={formData.fathersName} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Primary Mobile *</label><input required name="mobile1" value={formData.mobile1} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Alternate Mobile</label><input name="mobile2" value={formData.mobile2} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Aadhaar Number *</label><input required name="aadhaar" value={formData.aadhaar} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>PAN Number *</label><input required name="pan" value={formData.pan} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <h2 className="font-semibold text-neutral-800">Current Address</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3"><label className={labelClass}>Address Line</label><input name="addressLine" value={formData.addressLine} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>City</label><input name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>State</label>
              <select name="state" value={formData.state} onChange={handleChange} className={`${inputClass} bg-white`}>
                <option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>PIN Code</label><input name="pin" value={formData.pin} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href={`/customers/${id}`} className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
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
