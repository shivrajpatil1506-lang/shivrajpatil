// ==========================================
// GB Infra — TypeScript Type Definitions
// ==========================================

// ---- Common Types ----
export type Address = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pin: string;
};

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  message?: string;
};

export type PaginationMeta = {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
};

// ---- Company ----
export type Company = {
  id: string;
  parent_id?: string;
  name: string;
  short_name?: string;
  cin?: string;
  gstin?: string;
  pan?: string;
  reg_address?: Address;
  corr_address?: Address;
  phone_numbers?: string[];
  email?: string;
  website?: string;
  incorporated_at?: string;
  logo_url?: string;
  status: "active" | "inactive";
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
  is_deleted: boolean;
  // Computed
  active_sites_count?: number;
  employees_count?: number;
};

// ---- Site ----
export type Site = {
  id: string;
  company_id: string;
  company_name?: string;
  name: string;
  site_code: string;
  site_type: "residential" | "commercial" | "mixed";
  address?: Address;
  city?: string;
  state?: string;
  total_land_area?: number;
  land_area_unit?: string;
  rera_number?: string;
  rera_reg_date?: string;
  rera_expiry_date?: string;
  expected_completion?: string;
  actual_completion?: string;
  status: "active" | "completed" | "on_hold" | "cancelled";
  property_types?: string[];
  description?: string;
  image_urls?: string[];
  created_by?: string;
  created_at: string;
  updated_by?: string;
  updated_at: string;
  is_deleted: boolean;
  // Computed
  total_units?: number;
  sold_units?: number;
  available_units?: number;
};

export type SiteUnit = {
  id: string;
  site_id: string;
  unit_number: string;
  floor_number?: number;
  tower_block?: string;
  property_type: string;
  carpet_area?: number;
  builtup_area?: number;
  base_price_sqft?: number;
  total_price?: number;
  status: "available" | "booked" | "sold" | "hold";
  customer_id?: string;
  created_at: string;
  updated_at: string;
};

// ---- Employee ----
export type Employee = {
  id: string;
  employee_code: string;
  company_id: string;
  company_name?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name?: string;
  dob?: string;
  gender?: string;
  blood_group?: string;
  personal_email?: string;
  work_email?: string;
  personal_mobile: string;
  emergency_contact?: {
    name: string;
    relation: string;
    mobile: string;
  };
  current_address?: Address;
  permanent_address?: Address;
  aadhaar_encrypted?: string;
  pan_number?: string;
  bank_details?: {
    account_no: string;
    bank_name: string;
    branch: string;
    ifsc: string;
  };
  department: "marketing_sales" | "human_resource" | "finance_accounting";
  designation?: string;
  join_date: string;
  employment_type: "full_time" | "part_time" | "contract";
  reporting_manager?: string;
  gross_salary?: number;
  salary_structure?: {
    basic: number;
    hra: number;
    ta: number;
    other_allowances: number;
  };
  portal_role: "admin" | "accountant" | "agent" | "hr";
  auth_uid?: string;
  access_status: "active" | "suspended" | "inactive";
  assigned_companies?: string[];
  photo_url?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
};

// ---- Customer ----
export type Customer = {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  full_name?: string;
  fathers_name?: string;
  dob?: string;
  gender?: string;
  customer_type: "individual" | "company" | "huf";
  company_name?: string;
  mobile_1: string;
  mobile_2?: string;
  email?: string;
  current_address?: Address;
  permanent_address?: Address;
  aadhaar_encrypted?: string;
  pan_number?: string;
  passport_number?: string;
  voter_id?: string;
  photo_url?: string;
  notes?: string;
  added_by?: string;
  added_by_name?: string;
  added_at: string;
  updated_at: string;
  is_deleted: boolean;
  // Computed from purchases
  site_name?: string;
  company_name_display?: string;
  property_type?: string;
  unit_number?: string;
  total_amount?: number;
  received_amount?: number;
  pending_amount?: number;
  payment_status?: "active" | "completed" | "defaulted";
  booking_date?: string;
};

// ---- Customer Purchase ----
export type CustomerPurchase = {
  id: string;
  customer_id: string;
  company_id: string;
  site_id: string;
  unit_id?: string;
  booking_date: string;
  agreement_date?: string;
  possession_date?: string;
  registration_date?: string;
  agent_id?: string;
  agent_name?: string;
  payment_plan: "down_payment" | "instalment" | "subvention" | "custom";
  total_agreement_value: number;
  booking_amount?: number;
  stamp_duty?: number;
  total_payable?: number;
  num_instalments: number;
  instalment_frequency?: string;
  first_instalment_date?: string;
  status: "active" | "completed" | "cancelled";
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined
  site_name?: string;
  company_name?: string;
  unit_number?: string;
  property_type?: string;
};

// ---- Instalment ----
export type InstalmentSchedule = {
  id: string;
  purchase_id: string;
  customer_id: string;
  instalment_number: number;
  due_date: string;
  amount_due: number;
  amount_received: number;
  payment_date?: string;
  receipt_number?: string;
  payment_mode?: string;
  transaction_id?: string;
  status: "pending" | "paid" | "partially_paid" | "overdue" | "waived";
  notes?: string;
  updated_at: string;
};

// ---- Transaction ----
export type Transaction = {
  id: string;
  transaction_code: string;
  company_id: string;
  company_name?: string;
  site_id?: string;
  site_name?: string;
  category: string;
  sub_category?: string;
  transaction_date: string;
  amount: number;
  payment_mode: string;
  reference_no?: string;
  bank_name?: string;
  description?: string;
  document_url?: string;
  notes?: string;
  customer_id?: string;
  customer_name?: string;
  employee_id?: string;
  employee_name?: string;
  instalment_id?: string;
  vendor_name?: string;
  vendor_mobile?: string;
  invoice_number?: string;
  invoice_date?: string;
  pay_period_month?: number;
  pay_period_year?: number;
  salary_breakdown?: {
    basic: number;
    hra: number;
    ta: number;
    other_allowances: number;
    deductions?: number;
    net: number;
  };
  added_by: string;
  added_by_name?: string;
  added_at: string;
  updated_by?: string;
  updated_at: string;
  status: "active" | "pending_edit" | "pending_delete" | "deleted";
  is_deleted: boolean;
};

// ---- Approval Request ----
export type ApprovalRequest = {
  id: string;
  request_code: string;
  request_type: "edit" | "delete";
  transaction_id: string;
  transaction_code?: string;
  requested_by: string;
  requested_by_name?: string;
  requested_at: string;
  reason: string;
  original_data: Record<string, unknown>;
  requested_changes?: Record<string, unknown>;
  status: "pending" | "approved" | "rejected" | "awaiting_info";
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  clarification_note?: string;
  clarification_reply?: string;
  updated_at: string;
  // Joined
  original_amount?: number;
  requested_amount?: number;
  transaction_date?: string;
};

// ---- Task ----
export type Task = {
  id: string;
  title: string;
  description?: string;
  assigned_to: string;
  assigned_to_name?: string;
  assigned_to_avatar?: string;
  assigned_by: string;
  assigned_by_name?: string;
  priority: "high" | "medium" | "low";
  status: "todo" | "in_progress" | "review" | "done";
  due_date?: string;
  due_time?: string;
  tags?: string[];
  company_id?: string;
  site_id?: string;
  is_recurring: boolean;
  recurrence_type?: "daily" | "weekly" | "monthly";
  recurrence_parent_id?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  is_deleted: boolean;
};

export type TaskComment = {
  id: string;
  task_id: string;
  author_id: string;
  author_name?: string;
  author_avatar?: string;
  content: string;
  created_at: string;
};

// ---- Notification ----
export type Notification = {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
};

// ---- Audit Log ----
export type AuditLog = {
  id: string;
  actor_id?: string;
  actor_name?: string;
  actor_email?: string;
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
};

// ---- Dashboard KPIs ----
export type AdminDashboardKPIs = {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  total_collections: number;
  outstanding_receivables: number;
  active_sites: number;
  total_customers: number;
  total_employees: number;
  revenue_trend: number;
  expense_trend: number;
  profit_trend: number;
  collection_trend: number;
};

export type AgentDashboardKPIs = {
  total_sales_count: number;
  total_sales_value: number;
  my_customers_count: number;
  deals_this_month: number;
  sales_trend: number;
  value_trend: number;
};

export type AccountantDashboardKPIs = {
  total_income: number;
  total_expenses: number;
  net: number;
  pending_approvals: number;
  overdue_instalments: number;
  income_trend: number;
  expense_trend: number;
};

export type HRDashboardKPIs = {
  total_employees: number;
  total_agents: number;
  new_hires_this_month: number;
  salary_paid_this_month: number;
  open_tasks: number;
  overdue_tasks: number;
};

// ---- Chart Data ----
export type ChartDataPoint = {
  name: string;
  value: number;
  [key: string]: string | number;
};

// ---- Activity Feed ----
export type ActivityItem = {
  id: string;
  actor_name: string;
  action: string;
  target: string;
  timestamp: string;
  type: "transaction" | "approval" | "task" | "customer" | "employee";
};
