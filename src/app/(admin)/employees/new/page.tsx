"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/shared/PageHeader";
import { getCompanies } from "@/app/actions/companies";
import { createEmployee } from "@/app/actions/employees";
import { DEPARTMENT_LABELS, INDIAN_STATES, EMPLOYMENT_TYPES, GENDERS, BLOOD_GROUPS } from "@/lib/constants";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

export default function AddEmployeePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [department, setDepartment] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [mobile, setMobile]       = useState("");
  const [company, setCompany]     = useState("");
  const [designation, setDesignation] = useState("");
  const [salary, setSalary]       = useState("");
  const [portalRole, setPortalRole] = useState("agent");
  const [loading, setLoading]     = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  React.useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  const [middleName, setMiddleName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [altMobile, setAltMobile] = useState("");
  const [personalEmail, setPersonalEmail] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");
  
  // Address
  const [addrLine, setAddrLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pin, setPin] = useState("");

  const [employmentType, setEmploymentType] = useState("full_time");
  const [joinDate, setJoinDate] = useState(new Date().toISOString().split("T")[0]);
  const [workEmail, setWorkEmail] = useState("");
  
  // Emergency
  const [emName, setEmName] = useState("");
  const [emRelation, setEmRelation] = useState("");
  const [emMobile, setEmMobile] = useState("");

  const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors";
  const labelClass = "block text-xs font-semibold text-neutral-600 mb-1.5 uppercase tracking-wide";

  const handleSubmit = async () => {
    if (!firstName.trim()) { error("Missing field", "First name is required."); return; }
    if (!lastName.trim())  { error("Missing field", "Last name is required."); return; }
    if (!mobile.trim())    { error("Missing field", "Mobile number is required."); return; }
    if (!company)          { error("Missing field", "Please select a company."); return; }
    if (!department)       { error("Missing field", "Please select a department."); return; }
    if (!designation.trim()){ error("Missing field", "Designation is required."); return; }
    if (!salary)           { error("Missing field", "Gross salary is required."); return; }
    if (!workEmail.trim()) { error("Missing field", "Work email is required for the employee to sign in."); return; }

    setLoading(true);
    
    const formData = {
      company_id: company,
      first_name: firstName,
      middle_name: middleName,
      last_name: lastName,
      dob: dob,
      gender: gender,
      blood_group: bloodGroup,
      personal_email: personalEmail,
      work_email: workEmail,
      personal_mobile: mobile,
      emergency_contact: { name: emName, relationship: emRelation, phone: emMobile },
      current_address: { line1: addrLine, city, state, pin },
      aadhaar_encrypted: aadhaar,
      pan_number: pan,
      department: department,
      designation: designation,
      join_date: joinDate,
      employment_type: employmentType,
      gross_salary: salary,
      portal_role: portalRole,
    };

    const res = await createEmployee(formData);
    
    setLoading(false);
    if (res.success) {
      success("Employee Added", `${firstName} ${lastName} has been registered successfully.`);
      router.push("/employees");
    } else {
      error("Failed to add employee", res.error || "An error occurred");
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href="/employees" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>
      <PageHeader title="Add Employee" description="Register a new employee in the system" />

      <div className="space-y-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">1</span>
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>First Name *</label><input className={inputClass} placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
            <div><label className={labelClass}>Middle Name</label><input className={inputClass} placeholder="Middle name" value={middleName} onChange={e => setMiddleName(e.target.value)} /></div>
            <div><label className={labelClass}>Last Name *</label><input className={inputClass} placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" className={inputClass} value={dob} onChange={e => setDob(e.target.value)} /></div>
            <div><label className={labelClass}>Gender</label>
              <select className={inputClass} value={gender} onChange={e => setGender(e.target.value)}><option value="">Select Gender</option>{GENDERS.map(g => <option key={g}>{g}</option>)}</select>
            </div>
            <div><label className={labelClass}>Blood Group</label>
              <select className={inputClass} value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}><option value="">Select Blood Group</option>{BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}</select>
            </div>
            <div><label className={labelClass}>Personal Mobile *</label><input className={inputClass} placeholder="+91 XXXXX XXXXX" value={mobile} onChange={e => setMobile(e.target.value)} /></div>
            <div><label className={labelClass}>Alternate Mobile</label><input className={inputClass} placeholder="Alternate number" value={altMobile} onChange={e => setAltMobile(e.target.value)} /></div>
            <div><label className={labelClass}>Personal Email</label><input type="email" className={inputClass} placeholder="personal@email.com" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} /></div>
            <div><label className={labelClass}>Aadhaar Number *</label><input className={inputClass} placeholder="XXXX XXXX XXXX" value={aadhaar} onChange={e => setAadhaar(e.target.value)} /></div>
            <div><label className={labelClass}>PAN Number *</label><input className={inputClass} placeholder="ABCDE1234F" value={pan} onChange={e => setPan(e.target.value)} /></div>
          </div>
          <div className="mt-4">
            <label className={labelClass}>Current Address</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2"><input className={inputClass} placeholder="Address Line 1" value={addrLine} onChange={e => setAddrLine(e.target.value)} /></div>
              <div><input className={inputClass} placeholder="City" value={city} onChange={e => setCity(e.target.value)} /></div>
              <div><select className={inputClass} value={state} onChange={e => setState(e.target.value)}><option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}</select></div>
              <div><input className={inputClass} placeholder="PIN Code" value={pin} onChange={e => setPin(e.target.value)} /></div>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold">2</span>
            Employment Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Company *</label>
              <select className={inputClass} value={company} onChange={e => setCompany(e.target.value)}><option value="">Select Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.short_name || c.name}</option>)}</select>
            </div>
            <div><label className={labelClass}>Department *</label>
              <select className={inputClass} value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="">Select Department</option>
                {Object.entries(DEPARTMENT_LABELS).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Designation *</label><input className={inputClass} placeholder="e.g. Sales Executive" value={designation} onChange={e => setDesignation(e.target.value)} /></div>
            <div><label className={labelClass}>Employment Type *</label>
              <select className={inputClass} value={employmentType} onChange={e => setEmploymentType(e.target.value)}>{EMPLOYMENT_TYPES.map(et => <option key={et} value={et}>{et.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}</select>
            </div>
            <div><label className={labelClass}>Date of Joining *</label><input type="date" className={inputClass} value={joinDate} onChange={e => setJoinDate(e.target.value)} /></div>
            <div><label className={labelClass}>Portal Role *</label>
              <select className={inputClass} value={portalRole} onChange={e => setPortalRole(e.target.value)}>
                <option value="agent">Agent (Sales)</option>
                <option value="accountant">Accountant</option>
                <option value="hr">HR</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div><label className={labelClass}>Work Email *</label><input required type="email" className={inputClass} placeholder="name@gbinfra.in" value={workEmail} onChange={e => setWorkEmail(e.target.value)} /></div>
            <div><label className={labelClass}>Gross Salary (₹) *</label><input type="number" className={inputClass} placeholder="Monthly gross" value={salary} onChange={e => setSalary(e.target.value)} /></div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-6">
          <h3 className="text-sm font-bold text-neutral-800 mb-4 flex items-center gap-2" style={{ fontFamily: "var(--font-heading)" }}>
            <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">3</span>
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className={labelClass}>Contact Name</label><input className={inputClass} placeholder="Emergency contact name" value={emName} onChange={e => setEmName(e.target.value)} /></div>
            <div><label className={labelClass}>Relationship</label><input className={inputClass} placeholder="e.g. Father, Spouse" value={emRelation} onChange={e => setEmRelation(e.target.value)} /></div>
            <div><label className={labelClass}>Mobile Number</label><input className={inputClass} placeholder="+91 XXXXX XXXXX" value={emMobile} onChange={e => setEmMobile(e.target.value)} /></div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pb-6">
          <Link href="/employees" className="px-6 py-3 text-sm font-medium border border-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors">Cancel</Link>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving..." : "Add Employee"}
          </button>
        </div>
      </div>
    </div>
  );
}
