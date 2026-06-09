"use client";

import React, { useState } from "react";
import PageHeader from "@/components/shared/PageHeader";
import { createSale } from "@/app/actions/sales";
import { useToast } from "@/components/ui/Toast";
import { useRouter } from "next/navigation";
import { PROPERTY_TYPES, PAYMENT_MODES, INDIAN_STATES } from "@/lib/constants";

export function NewSaleClient({ companies, sites }: { companies: any[], sites: any[] }) {
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer: { firstName: "", middleName: "", lastName: "", fathersName: "", dob: "", mobile1: "", mobile2: "", email: "", aadhaar: "", pan: "", addressLine1: "", addressLine2: "", city: "", state: "", pin: "" },
    property: { companyId: "", siteId: "", propertyType: "", unitNumber: "", floor: "", towerBlock: "", carpetArea: "", builtupArea: "" },
    financial: { totalAmount: "", bookingAmount: "", paymentPlan: "Instalment", numInstalments: "", instalmentFrequency: "Monthly", firstInstalmentDate: "", paymentMode: "Bank Transfer", referenceNo: "" },
    sale: { bookingDate: new Date().toISOString().split("T")[0], agreementDate: "", notes: "" }
  });

  const handleCustomerChange = (e: any) => setFormData(p => ({ ...p, customer: { ...p.customer, [e.target.name]: e.target.value } }));
  const handlePropertyChange = (e: any) => setFormData(p => ({ ...p, property: { ...p.property, [e.target.name]: e.target.value } }));
  const handleFinancialChange = (e: any) => setFormData(p => ({ ...p, financial: { ...p.financial, [e.target.name]: e.target.value } }));
  const handleSaleChange = (e: any) => setFormData(p => ({ ...p, sale: { ...p.sale, [e.target.name]: e.target.value } }));

  const filteredSites = formData.property.companyId ? sites.filter(s => s.company_id === formData.property.companyId) : sites;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const res = await createSale(formData);
    setLoading(false);
    if (res.success) {
      success("Sale Recorded", "Property sale has been created successfully.");
      router.push("/agent/sales");
    } else {
      error("Failed to add sale", res.error);
    }
  };

  const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide";

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <PageHeader title="Add New Sale" description="Register a new property sale" />
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">1</span>
            Customer Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>First Name *</label><input required name="firstName" value={formData.customer.firstName} onChange={handleCustomerChange} className={inputClass} placeholder="Enter first name" /></div>
            <div><label className={labelClass}>Middle Name</label><input name="middleName" value={formData.customer.middleName} onChange={handleCustomerChange} className={inputClass} placeholder="Middle name" /></div>
            <div><label className={labelClass}>Last Name *</label><input required name="lastName" value={formData.customer.lastName} onChange={handleCustomerChange} className={inputClass} placeholder="Enter last name" /></div>
            <div><label className={labelClass}>Father&apos;s Name</label><input name="fathersName" value={formData.customer.fathersName} onChange={handleCustomerChange} className={inputClass} placeholder="Father's name" /></div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={formData.customer.dob} onChange={handleCustomerChange} className={inputClass} /></div>
            <div><label className={labelClass}>Mobile 1 *</label><input required name="mobile1" value={formData.customer.mobile1} onChange={handleCustomerChange} className={inputClass} placeholder="+91 XXXXX XXXXX" /></div>
            <div><label className={labelClass}>Mobile 2</label><input name="mobile2" value={formData.customer.mobile2} onChange={handleCustomerChange} className={inputClass} placeholder="Alternate mobile" /></div>
            <div><label className={labelClass}>Email</label><input type="email" name="email" value={formData.customer.email} onChange={handleCustomerChange} className={inputClass} placeholder="email@example.com" /></div>
            <div><label className={labelClass}>Aadhaar Number *</label><input required name="aadhaar" value={formData.customer.aadhaar} onChange={handleCustomerChange} className={inputClass} placeholder="XXXX XXXX XXXX" /></div>
            <div><label className={labelClass}>PAN Number *</label><input required name="pan" value={formData.customer.pan} onChange={handleCustomerChange} className={inputClass} placeholder="ABCDE1234F" /></div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Address</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="addressLine1" value={formData.customer.addressLine1} onChange={handleCustomerChange} className={inputClass} placeholder="Address Line 1" />
              <input name="addressLine2" value={formData.customer.addressLine2} onChange={handleCustomerChange} className={inputClass} placeholder="Address Line 2" />
              <input name="city" value={formData.customer.city} onChange={handleCustomerChange} className={inputClass} placeholder="City" />
              <select name="state" value={formData.customer.state} onChange={handleCustomerChange} className={inputClass}><option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}</select>
              <input name="pin" value={formData.customer.pin} onChange={handleCustomerChange} className={inputClass} placeholder="PIN Code" />
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</span>
            Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Company *</label>
              <select required name="companyId" className={inputClass} value={formData.property.companyId} onChange={handlePropertyChange}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Site *</label>
              <select required name="siteId" className={inputClass} value={formData.property.siteId} onChange={handlePropertyChange}>
                <option value="">Select Site</option>
                {filteredSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Property Type *</label>
              <select required name="propertyType" value={formData.property.propertyType} onChange={handlePropertyChange} className={inputClass}><option value="">Select Type</option>{PROPERTY_TYPES.map(pt => <option key={pt}>{pt}</option>)}</select>
            </div>
            <div><label className={labelClass}>Unit Number *</label><input required name="unitNumber" value={formData.property.unitNumber} onChange={handlePropertyChange} className={inputClass} placeholder="e.g. A-301" /></div>
            <div><label className={labelClass}>Floor</label><input type="number" name="floor" value={formData.property.floor} onChange={handlePropertyChange} className={inputClass} placeholder="Floor number" /></div>
            <div><label className={labelClass}>Tower / Block</label><input name="towerBlock" value={formData.property.towerBlock} onChange={handlePropertyChange} className={inputClass} placeholder="Tower name" /></div>
            <div><label className={labelClass}>Carpet Area (sqft)</label><input type="number" name="carpetArea" value={formData.property.carpetArea} onChange={handlePropertyChange} className={inputClass} placeholder="Area" /></div>
            <div><label className={labelClass}>Built-up Area (sqft)</label><input type="number" name="builtupArea" value={formData.property.builtupArea} onChange={handlePropertyChange} className={inputClass} placeholder="Area" /></div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-bold">3</span>
            Financial Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Total Agreement Value ₹ *</label><input required type="number" name="totalAmount" value={formData.financial.totalAmount} onChange={handleFinancialChange} className={inputClass} placeholder="Total amount" /></div>
            <div><label className={labelClass}>Booking Amount ₹</label><input type="number" name="bookingAmount" value={formData.financial.bookingAmount} onChange={handleFinancialChange} className={inputClass} placeholder="Booking amount" /></div>
            <div><label className={labelClass}>Payment Plan</label>
              <select name="paymentPlan" value={formData.financial.paymentPlan} onChange={handleFinancialChange} className={inputClass}><option>Down Payment</option><option>Instalment</option><option>Subvention</option><option>Custom</option></select>
            </div>
            <div><label className={labelClass}>Number of Instalments</label><input type="number" name="numInstalments" value={formData.financial.numInstalments} onChange={handleFinancialChange} className={inputClass} placeholder="e.g. 12" /></div>
            <div><label className={labelClass}>Instalment Frequency</label>
              <select name="instalmentFrequency" value={formData.financial.instalmentFrequency} onChange={handleFinancialChange} className={inputClass}><option>Monthly</option><option>Quarterly</option><option>Semi-Annual</option></select>
            </div>
            <div><label className={labelClass}>First Instalment Date</label><input type="date" name="firstInstalmentDate" value={formData.financial.firstInstalmentDate} onChange={handleFinancialChange} className={inputClass} /></div>
            <div><label className={labelClass}>Payment Mode</label>
              <select name="paymentMode" value={formData.financial.paymentMode} onChange={handleFinancialChange} className={inputClass}>{PAYMENT_MODES.map(pm => <option key={pm}>{pm}</option>)}</select>
            </div>
            <div><label className={labelClass}>Reference / Cheque No.</label><input name="referenceNo" value={formData.financial.referenceNo} onChange={handleFinancialChange} className={inputClass} placeholder="Transaction reference" /></div>
          </div>
        </div>

        {/* Sale Meta */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">4</span>
            Sale Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Booking Date</label><input type="date" name="bookingDate" value={formData.sale.bookingDate} onChange={handleSaleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Agreement Date</label><input type="date" name="agreementDate" value={formData.sale.agreementDate} onChange={handleSaleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Agent Name</label><input className={inputClass} value="Priya Sharma" readOnly /></div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Notes</label>
            <textarea name="notes" value={formData.sale.notes} onChange={handleSaleChange} className={inputClass} rows={3} placeholder="Additional notes about this sale..." />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pb-6">
          <button type="button" onClick={() => router.back()} className="px-6 py-3 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-8 py-3 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-60">
            {loading ? "Saving..." : "Submit Sale"}
          </button>
        </div>
      </form>
    </div>
  );
}
