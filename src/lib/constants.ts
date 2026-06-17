// ==========================================
// GB Infra — Application Constants
// ==========================================

export const APP_NAME = "GB Infra";
export const APP_DESCRIPTION = "Financial & Operational Management Platform";

// ---- Roles ----
export const ROLES = {
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  AGENT: "agent",
  HR: "hr",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ---- Departments ----
export const DEPARTMENTS = {
  MARKETING_SALES: "marketing_sales",
  HUMAN_RESOURCE: "human_resource",
  FINANCE_ACCOUNTING: "finance_accounting",
} as const;

export const DEPARTMENT_LABELS: Record<string, string> = {
  marketing_sales: "Marketing & Sales",
  human_resource: "Human Resource",
  finance_accounting: "Finance & Accounting",
};

// ---- Transaction Categories ----
export const TRANSACTION_CATEGORIES = {
  // Income
  INSTALMENT_RECEIVED: "INSTALMENT_RECEIVED",
  BOOKING_AMOUNT: "BOOKING_AMOUNT",
  PROPERTY_SALE: "PROPERTY_SALE",
  OTHER_INCOME: "OTHER_INCOME",
  // Expense
  SALARY: "SALARY",
  PURCHASE: "PURCHASE",
  PETTY_EXPENSE: "PETTY_EXPENSE",
  CONTRACTOR_PAYMENT: "CONTRACTOR_PAYMENT",
  UTILITY_EXPENSE: "UTILITY_EXPENSE",
  OTHER_EXPENSE: "OTHER_EXPENSE",
  // Transfer
  INTER_COMPANY_TRANSFER: "INTER_COMPANY_TRANSFER",
} as const;

export const INCOME_CATEGORIES = [
  "INSTALMENT_RECEIVED",
  "BOOKING_AMOUNT",
  "PROPERTY_SALE",
  "OTHER_INCOME",
] as const;

export const EXPENSE_CATEGORIES = [
  "SALARY",
  "PURCHASE",
  "PETTY_EXPENSE",
  "CONTRACTOR_PAYMENT",
  "UTILITY_EXPENSE",
  "OTHER_EXPENSE",
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  INSTALMENT_RECEIVED: "Instalment Received",
  BOOKING_AMOUNT: "Booking Amount",
  PROPERTY_SALE: "Property Sale",
  OTHER_INCOME: "Other Income",
  SALARY: "Salary",
  PURCHASE: "Purchase",
  PETTY_EXPENSE: "Petty Expense",
  CONTRACTOR_PAYMENT: "Contractor Payment",
  UTILITY_EXPENSE: "Utility Expense",
  OTHER_EXPENSE: "Other Expense",
  INTER_COMPANY_TRANSFER: "Inter-Company Transfer",
};

export const CATEGORY_COLORS: Record<string, string> = {
  INSTALMENT_RECEIVED: "#22C55E",
  BOOKING_AMOUNT: "#3B82F6",
  PROPERTY_SALE: "#2563EB",
  OTHER_INCOME: "#06B6D4",
  SALARY: "#F59E0B",
  PURCHASE: "#EF4444",
  PETTY_EXPENSE: "#F97316",
  CONTRACTOR_PAYMENT: "#8B5CF6",
  UTILITY_EXPENSE: "#EC4899",
  OTHER_EXPENSE: "#6B7280",
  INTER_COMPANY_TRANSFER: "#14B8A6",
};

// ---- Payment Modes ----
export const PAYMENT_MODES = [
  "Cash",
  "Cheque",
  "NEFT",
  "RTGS",
  "UPI",
  "DD",
] as const;

// ---- Property Types ----
export const PROPERTY_TYPES = [
  "1RK",
  "1BHK",
  "2BHK",
  "3BHK",
  "4BHK",
  "Penthouse",
  "Commercial Shop",
  "Commercial Office",
] as const;

// ---- Site Status ----
export const SITE_STATUSES = [
  "active",
  "completed",
  "on_hold",
  "cancelled",
] as const;

export const SITE_STATUS_LABELS: Record<string, string> = {
  active: "Active",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
};

// ---- Site Types ----
export const SITE_TYPES = ["residential", "commercial", "mixed"] as const;

// ---- Unit Status ----
export const UNIT_STATUSES = [
  "available",
  "booked",
  "sold",
  "hold",
] as const;

// ---- Instalment Status ----
export const INSTALMENT_STATUSES = [
  "pending",
  "paid",
  "partially_paid",
  "overdue",
  "waived",
] as const;

// ---- Approval Status ----
export const APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "awaiting_info",
] as const;

// ---- Task Status ----
export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "review",
  "done",
] as const;

export const TASK_STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
};

// ---- Task Priority ----
export const TASK_PRIORITIES = ["high", "medium", "low"] as const;

export const PRIORITY_COLORS: Record<string, string> = {
  high: "text-red-600 bg-red-50",
  medium: "text-amber-600 bg-amber-50",
  low: "text-emerald-600 bg-emerald-50",
};

// ---- Employment Type ----
export const EMPLOYMENT_TYPES = [
  "full_time",
  "part_time",
  "contract",
] as const;

// ---- Customer Types ----
export const CUSTOMER_TYPES = ["individual", "company", "huf"] as const;

// ---- Payment Plan Types ----
export const PAYMENT_PLANS = [
  "down_payment",
  "instalment",
  "subvention",
  "custom",
] as const;

// ---- Gender Options ----
export const GENDERS = ["Male", "Female", "Other"] as const;

// ---- Blood Groups ----
export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

// ---- Indian States ----
export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu & Kashmir",
  "Ladakh",
] as const;

// ---- Navigation ----
export type NavItem = {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
};

export const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Companies", href: "/companies", icon: "Building2" },
  { label: "Sites", href: "/sites", icon: "MapPin" },
  { label: "Customers", href: "/customers", icon: "Users" },
  { label: "Employees", href: "/employees", icon: "UserCog" },
  { label: "Agents", href: "/agents", icon: "UserCheck" },
  { label: "Transactions", href: "/transactions", icon: "IndianRupee" },
  { label: "Accounting", href: "/accounting", icon: "BookOpen" },
  { label: "Reports", href: "/reports", icon: "BarChart3" },
  { label: "Approvals", href: "/approvals", icon: "CheckSquare" },
  { label: "My Work", href: "/my-work", icon: "ClipboardList" },
  { label: "Settings", href: "/settings", icon: "Settings" },
];

export const AGENT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/agent/dashboard", icon: "LayoutDashboard" },
  { label: "My Sales", href: "/agent/sales", icon: "ShoppingBag" },
  { label: "My Customers", href: "/agent/customers", icon: "Users" },
  { label: "My Work", href: "/agent/my-work", icon: "ClipboardList" },
];

export const ACCOUNTANT_NAV: NavItem[] = [
  { label: "Dashboard", href: "/accountant/dashboard", icon: "LayoutDashboard" },
  { label: "Transactions", href: "/accountant/transactions", icon: "IndianRupee" },
  { label: "Double-Entry Bookkeeping", href: "/accountant/accounting", icon: "BookOpen" },
  { label: "Bank Reconciliation", href: "/accountant/accounting/reconciliation", icon: "CheckSquare" },
  { label: "Customers", href: "/accountant/customers", icon: "Users" },
  { label: "Reports", href: "/accountant/reports", icon: "BarChart3" },
  { label: "My Work", href: "/accountant/my-work", icon: "ClipboardList" },
];

export const HR_NAV: NavItem[] = [
  { label: "Dashboard", href: "/hr/dashboard", icon: "LayoutDashboard" },
  { label: "Employees", href: "/hr/employees", icon: "UserCog" },
  { label: "Agents", href: "/hr/agents", icon: "UserCheck" },
  { label: "Salary Transactions", href: "/hr/salary", icon: "IndianRupee" },
  { label: "Payroll Automation", href: "/hr/payroll", icon: "CheckSquare" },
  { label: "My Work", href: "/hr/my-work", icon: "ClipboardList" },
];

// ---- Chart Colors ----
export const CHART_COLORS = [
  "#2563EB",
  "#F59E0B",
  "#22C55E",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
];

// ---- Time Period Filters ----
export const TIME_PERIODS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "yearly", label: "Yearly" },
  { value: "entire", label: "Entire Period" },
] as const;
