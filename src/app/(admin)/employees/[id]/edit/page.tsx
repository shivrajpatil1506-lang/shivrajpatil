"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, User, Briefcase, Phone, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { getCompanies } from "@/app/actions/companies";
import { getEmployeeWithDetails, updateEmployee } from "@/app/actions/employees";
import { DEPARTMENT_LABELS, INDIAN_STATES, EMPLOYMENT_TYPES, GENDERS, BLOOD_GROUPS } from "@/lib/constants";

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    first_name: "", middle_name: "", last_name: "",
    dob: "", gender: "", blood_group: "",
    personal_email: "", work_email: "", personal_mobile: "",
    aadhaar_encrypted: "", pan_number: "",
    addr_line: "", city: "", state: "", pin: "",
    company_id: "", department: "", designation: "",
    employment_type: "full_time", join_date: "", gross_salary: "", status: "",
    em_name: "", em_relation: "", em_mobile: ""
  });

  useEffect(() => {
    getCompanies().then(setCompanies);

    getEmployeeWithDetails(id).then(emp => {
      if (emp) {
        setFormData({
          first_name: emp.first_name || "",
          middle_name: emp.middle_name || "",
          last_name: emp.last_name || "",
          dob: emp.dob ? new Date(emp.dob).toISOString().split('T')[0] : "",
          gender: emp.gender || "",
          blood_group: emp.blood_group || "",
          personal_email: emp.personal_email || "",
          work_email: emp.work_email || "",
          personal_mobile: emp.personal_mobile || "",
          aadhaar_encrypted: emp.aadhaar_encrypted || "",
          pan_number: emp.pan_number || "",
          addr_line: (emp.current_address as any)?.line1 || "",
          city: (emp.current_address as any)?.city || "",
          state: (emp.current_address as any)?.state || "",
          pin: (emp.current_address as any)?.pin || "",
          company_id: emp.company_id || "",
          department: emp.department || "",
          designation: emp.designation || "",
          employment_type: emp.employment_type || "full_time",
          join_date: emp.join_date ? new Date(emp.join_date).toISOString().split('T')[0] : "",
          gross_salary: emp.gross_salary?.toString() || "",
          status: emp.status || "active",
          em_name: (emp.emergency_contact as any)?.name || "",
          em_relation: (emp.emergency_contact as any)?.relationship || "",
          em_mobile: (emp.emergency_contact as any)?.phone || "",
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
      await updateEmployee(id, {
        first_name: formData.first_name,
        middle_name: formData.middle_name,
        last_name: formData.last_name,
        dob: formData.dob ? new Date(formData.dob) : null,
        gender: formData.gender,
        blood_group: formData.blood_group,
        personal_email: formData.personal_email,
        work_email: formData.work_email,
        personal_mobile: formData.personal_mobile,
        aadhaar_encrypted: formData.aadhaar_encrypted,
        pan_number: formData.pan_number,
        company_id: formData.company_id,
        department: formData.department,
        designation: formData.designation,
        employment_type: formData.employment_type,
        join_date: formData.join_date ? new Date(formData.join_date) : undefined,
        gross_salary: formData.gross_salary ? parseFloat(formData.gross_salary) : null,
        status: formData.status,
        emergency_contact: {
          name: formData.em_name,
          relationship: formData.em_relation,
          phone: formData.em_mobile
        } as any,
        current_address: {
          line1: formData.addr_line,
          city: formData.city,
          state: formData.state,
          pin: formData.pin
        } as any
      });
      
      success("Employee Updated", `${formData.first_name} ${formData.last_name} updated successfully.`);
      router.push(`/employees/${id}`);
    } catch (err) {
      console.error(err);
      error("Error", "An unexpected error occurred while updating the employee.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-primary-500 outline-none bg-white";
  const labelClass = "block text-sm font-medium text-neutral-700 mb-1.5";

  if (loading) {
    return <div className="py-24 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
  }

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <Link href={`/employees/${id}`} className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-primary-500 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Employee
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900" style={{ fontFamily: "var(--font-heading)" }}>Edit Employee</h1>
        <p className="text-neutral-500 text-sm mt-1">Update employee information and roles.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <User className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>First Name *</label><input required name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Middle Name</label><input name="middle_name" value={formData.middle_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Last Name *</label><input required name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} className={inputClass}>
                <option value="">Select Gender</option>{GENDERS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Date of Birth</label><input type="date" name="dob" value={formData.dob} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Blood Group</label>
              <select name="blood_group" value={formData.blood_group} onChange={handleChange} className={inputClass}>
                <option value="">Select Blood Group</option>{BLOOD_GROUPS.map(bg => <option key={bg}>{bg}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Primary Mobile *</label><input required name="personal_mobile" value={formData.personal_mobile} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Personal Email</label><input type="email" name="personal_email" value={formData.personal_email} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Aadhaar Number *</label><input required name="aadhaar_encrypted" value={formData.aadhaar_encrypted} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>PAN Number *</label><input required name="pan_number" value={formData.pan_number} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Employment Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Company *</label>
              <select required name="company_id" value={formData.company_id} onChange={handleChange} className={inputClass}>
                <option value="">Select Company</option>{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Department *</label>
              <select required name="department" value={formData.department} onChange={handleChange} className={inputClass}>
                <option value="">Select Department</option>
                {Object.entries(DEPARTMENT_LABELS).map(([key, val]) => <option key={key} value={key}>{val}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Designation *</label><input required name="designation" value={formData.designation} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Employment Type</label>
              <select name="employment_type" value={formData.employment_type} onChange={handleChange} className={inputClass}>
                {EMPLOYMENT_TYPES.map(et => <option key={et} value={et}>{et.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>Date of Joining *</label><input required type="date" name="join_date" value={formData.join_date} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Gross Salary (₹) *</label><input required type="number" name="gross_salary" value={formData.gross_salary} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Work Email</label><input type="email" name="work_email" value={formData.work_email} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputClass}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="resigned">Resigned</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <h2 className="font-semibold text-neutral-800">Current Address</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3"><label className={labelClass}>Address Line</label><input name="addr_line" value={formData.addr_line} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>City</label><input name="city" value={formData.city} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>State</label>
              <select name="state" value={formData.state} onChange={handleChange} className={inputClass}>
                <option value="">Select State</option>{INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={labelClass}>PIN Code</label><input name="pin" value={formData.pin} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>
        
        {/* Emergency Contact */}
        <div className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden">
          <div className="bg-neutral-50/50 px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
            <Phone className="w-5 h-5 text-neutral-500" />
            <h2 className="font-semibold text-neutral-800">Emergency Contact</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div><label className={labelClass}>Contact Name</label><input name="em_name" value={formData.em_name} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Relationship</label><input name="em_relation" value={formData.em_relation} onChange={handleChange} className={inputClass} /></div>
            <div><label className={labelClass}>Mobile Number</label><input name="em_mobile" value={formData.em_mobile} onChange={handleChange} className={inputClass} /></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link href={`/employees/${id}`} className="px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors">
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
