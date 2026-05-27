"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, User, Home, CreditCard, CalendarDays } from "lucide-react";
import PageHeader from "@/components/shared/PageHeader";
import { useToast } from "@/components/ui/Toast";
import { getCompanies } from "@/app/actions/companies";
import { getSites } from "@/app/actions/sites";
import { createCustomerWithPurchase } from "@/app/actions/customers";
import { PROPERTY_TYPES, PAYMENT_PLANS, GENDERS, INDIAN_STATES } from "@/lib/constants";

type PortalRole = "admin" | "agent" | "accountant";

interface CustomerFormProps {
  role: PortalRole;
  backHref: string;
  successRedirect: string;
}

const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"];

export default function CustomerForm({ role, backHref, successRedirect }: CustomerFormProps) {
  const router = useRouter();
  const { success, error } = useToast();

  // Step tracking
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  // Personal Details
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile1, setMobile1] = useState("");
  const [mobile2, setMobile2] = useState("");
  const [email, setEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  const [gender, setGender] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  // Property Details
  const [companyId, setCompanyId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [floor, setFloor] = useState("");
  const [carpetArea, setCarpetArea] = useState("");
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split("T")[0]);

  // Payment Details
  const [totalAmount, setTotalAmount] = useState("");
  const [bookingAmount, setBookingAmount] = useState("");
  const [paymentPlan, setPaymentPlan] = useState("");
  const [noOfInstalments, setNoOfInstalments] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  
  const [companies, setCompanies] = useState<any[]>([]);
  const [sites, setSites] = useState<any[]>([]);

  React.useEffect(() => {
    getCompanies().then(setCompanies);
    getSites().then(setSites);
  }, []);

  const filteredSites = companyId ? sites.filter(s => s.company_id === companyId) : sites;
  const selectedSite = sites.find(s => s.id === siteId);

  const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide";

  const validateStep1 = () => {
    if (!firstName.trim()) { error("Missing field", "First name is required."); return false; }
    if (!lastName.trim())  { error("Missing field", "Last name is required."); return false; }
    if (!mobile1.trim() || mobile1.length < 10) { error("Invalid mobile", "Enter a valid 10-digit mobile number."); return false; }
    if (!aadhaar.trim() || aadhaar.replace(/\s/g, "").length < 12) { error("Invalid Aadhaar", "Enter a valid 12-digit Aadhaar number."); return false; }
    if (!pan.trim() || pan.length < 10) { error("Invalid PAN", "Enter a valid 10-character PAN number."); return false; }
    return true;
  };

  const validateStep2 = () => {
    if (!companyId)          { error("Missing field", "Please select a company."); return false; }
    if (!siteId)             { error("Missing field", "Please select a site."); return false; }
    if (!propertyType)       { error("Missing field", "Please select a property type."); return false; }
    if (!unitNumber.trim())  { error("Missing field", "Unit number is required."); return false; }
    return true;
  };

  const validateStep3 = () => {
    if (!totalAmount || Number(totalAmount) <= 0)   { error("Invalid amount", "Total property amount is required."); return false; }
    if (!bookingAmount || Number(bookingAmount) <= 0){ error("Invalid amount", "Booking amount is required."); return false; }
    if (Number(bookingAmount) > Number(totalAmount)) { error("Invalid amount", "Booking amount cannot exceed total amount."); return false; }
    if (!paymentPlan)        { error("Missing field", "Please select a payment plan."); return false; }
    if (paymentPlan === "instalment" && !noOfInstalments) { error("Missing field", "Please enter the number of instalments."); return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep3()) return;
    setLoading(true);
    
    const formData = {
      firstName, lastName, middleName: "",
      mobile1, mobile2, email, gender, aadhaar, pan,
      addressLine, city, state, pin,
      companyId, siteId, propertyType, unitNumber, floor, carpetArea, bookingDate,
      totalAmount, bookingAmount, paymentPlan, noOfInstalments, notes
    };

    const res = await createCustomerWithPurchase(formData);
    
    setLoading(false);
    if (res.success) {
      success(
        "Customer Added",
        `${firstName} ${lastName} has been registered for ${selectedSite?.name || "the selected site"}.`
      );
      setTimeout(() => router.push(successRedirect), 1200);
    } else {
      error("Failed to add customer", res.error || "An error occurred");
    }
  };

  const steps = [
    { num: 1, label: "Personal", icon: User },
    { num: 2, label: "Property", icon: Home },
    { num: 3, label: "Payment", icon: CreditCard },
  ];

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Back link */}
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Customers
      </Link>

      <PageHeader title="Add Customer" description="Register a new property buyer" />

      {/* Step Indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isDone = step > s.num;
          const isActive = step === s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  isDone ? "bg-emerald-500 text-white" : isActive ? "bg-primary-500 text-white shadow-md shadow-primary-200" : "bg-neutral-100 text-neutral-400"
                }`}>
                  {isDone ? "✓" : <Icon className="w-4 h-4" />}
                </div>
                <p className={`text-[10px] font-semibold mt-1 uppercase tracking-wide ${isActive ? "text-primary-600" : isDone ? "text-emerald-600" : "text-neutral-400"}`}>{s.label}</p>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all ${step > s.num ? "bg-emerald-400" : "bg-neutral-200"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* ──── STEP 1: Personal Details ──── */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <User className="w-4 h-4 text-primary-500" /> Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>First Name *</label><input className={inputClass} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div><label className={labelClass}>Middle Name</label><input className={inputClass} placeholder="Middle name" /></div>
            <div><label className={labelClass}>Last Name *</label><input className={inputClass} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div><label className={labelClass}>Gender</label>
              <select className={inputClass} value={gender} onChange={e => setGender(e.target.value)}>
                <option value="">Select Gender</option>{GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Primary Mobile *</label><input className={inputClass} placeholder="10-digit mobile" maxLength={10} value={mobile1} onChange={e => setMobile1(e.target.value.replace(/\D/g, ""))} /></div>
            <div><label className={labelClass}>Alternate Mobile</label><input className={inputClass} placeholder="Optional" maxLength={10} value={mobile2} onChange={e => setMobile2(e.target.value.replace(/\D/g, ""))} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Email</label><input type="email" className={inputClass} placeholder="customer@email.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          </div>
          <div className="pt-1 border-t border-neutral-100">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Identity Documents</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className={labelClass}>Aadhaar Number *</label><input className={inputClass} placeholder="XXXX XXXX XXXX" maxLength={14} value={aadhaar} onChange={e => setAadhaar(e.target.value)} /></div>
              <div><label className={labelClass}>PAN Number *</label><input className={inputClass} placeholder="ABCDE1234F" maxLength={10} value={pan} onChange={e => setPan(e.target.value.toUpperCase())} /></div>
            </div>
          </div>
          <div className="pt-1 border-t border-neutral-100">
            <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Current Address</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3"><input className={inputClass} placeholder="Address Line" value={addressLine} onChange={e => setAddressLine(e.target.value)} /></div>
              <div><input className={inputClass} placeholder="City" value={city} onChange={e => setCity(e.target.value)} /></div>
              <div>
                <select className={inputClass} value={state} onChange={e => setState(e.target.value)}>
                  <option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><input className={inputClass} placeholder="PIN Code" maxLength={6} value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ""))} /></div>
            </div>
          </div>
        </div>
      )}

      {/* ──── STEP 2: Property Details ──── */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <Home className="w-4 h-4 text-primary-500" /> Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Company *</label>
              <select className={inputClass} value={companyId} onChange={e => { setCompanyId(e.target.value); setSiteId(""); }}>
                <option value="">Select Company</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Site / Project *</label>
              <select className={inputClass} value={siteId} onChange={e => setSiteId(e.target.value)} disabled={!companyId}>
                <option value="">{companyId ? "Select Site" : "Select company first"}</option>
                {filteredSites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Property Type *</label>
              <select className={inputClass} value={propertyType} onChange={e => setPropertyType(e.target.value)}>
                <option value="">Select Type</option>
                {((selectedSite?.property_types ? selectedSite.property_types.split(',').map((s: string) => s.trim()) : PROPERTY_TYPES) as string[]).map((pt: string) => <option key={pt}>{pt}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Unit Number *</label>
              <input className={inputClass} placeholder="e.g. A-301, B-1204" value={unitNumber} onChange={e => setUnitNumber(e.target.value)} />
            </div>
            <div><label className={labelClass}>Floor</label>
              <input type="number" className={inputClass} placeholder="e.g. 3" min="0" value={floor} onChange={e => setFloor(e.target.value)} />
            </div>
            <div><label className={labelClass}>Carpet Area (sq.ft)</label>
              <input type="number" className={inputClass} placeholder="e.g. 850" value={carpetArea} onChange={e => setCarpetArea(e.target.value)} />
            </div>
            <div><label className={labelClass}>Booking Date</label>
              <input type="date" className={inputClass} value={bookingDate} onChange={e => setBookingDate(e.target.value)} />
            </div>
          </div>
          {selectedSite && (
            <div className="p-3 bg-primary-50 rounded-lg border border-primary-100 text-sm">
              <p className="font-semibold text-primary-800 mb-0.5">{selectedSite.name}</p>
              <p className="text-primary-600 text-xs">{selectedSite.available_units} units available · RERA: {selectedSite.rera_number || "N/A"}</p>
            </div>
          )}
        </div>
      )}

      {/* ──── STEP 3: Payment Plan ──── */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6 space-y-5">
          <h3 className="text-sm font-bold text-neutral-800 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <CreditCard className="w-4 h-4 text-primary-500" /> Payment Plan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Total Property Amount (₹) *</label>
              <input type="number" className={inputClass} placeholder="e.g. 8500000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
            </div>
            <div><label className={labelClass}>Booking Amount (₹) *</label>
              <input type="number" className={inputClass} placeholder="e.g. 500000" value={bookingAmount} onChange={e => setBookingAmount(e.target.value)} />
            </div>
            <div className="md:col-span-2"><label className={labelClass}>Payment Plan *</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-1">
                {PAYMENT_PLANS.map(plan => (
                  <button key={plan} type="button" onClick={() => setPaymentPlan(plan)}
                    className={`px-3 py-2.5 text-sm font-medium rounded-lg border transition-colors capitalize ${
                      paymentPlan === plan ? "bg-primary-500 text-white border-primary-500" : "bg-white border-neutral-200 text-neutral-600 hover:border-primary-300"
                    }`}>
                    {plan.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>
            {paymentPlan === "instalment" && (
              <div><label className={labelClass}>Number of Instalments *</label>
                <input type="number" className={inputClass} placeholder="e.g. 12" min="1" max="120" value={noOfInstalments} onChange={e => setNoOfInstalments(e.target.value)} />
              </div>
            )}
          </div>

          {/* Summary Card */}
          {totalAmount && bookingAmount && (
            <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-xl p-4 border border-primary-100">
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-3">Deal Summary</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-neutral-500">Total Amount</p>
                  <p className="font-bold text-neutral-900 text-sm">₹{Number(totalAmount).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Booking Paid</p>
                  <p className="font-bold text-emerald-700 text-sm">₹{Number(bookingAmount).toLocaleString("en-IN")}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Remaining</p>
                  <p className="font-bold text-red-600 text-sm">₹{(Number(totalAmount) - Number(bookingAmount)).toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>
          )}

          <div><label className={labelClass}>Internal Notes</label>
            <textarea className={inputClass} rows={3} placeholder="Any additional notes about this customer or deal..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-6 pb-6">
        <button
          onClick={() => step > 1 ? setStep(s => s - 1) : router.push(backHref)}
          className="px-6 py-3 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          {step === 1 ? "Cancel" : "← Back"}
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Step {step} of {totalSteps}</span>
          {step < totalSteps ? (
            <button onClick={handleNext} className="px-8 py-3 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm">
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Saving..." : "✓ Add Customer"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
