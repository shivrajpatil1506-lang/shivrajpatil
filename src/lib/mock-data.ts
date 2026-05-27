// ==========================================
// GB Infra — Mock Data (Pune-based realistic data)
// ==========================================

import type {
  Company, Site, Employee, Customer, Transaction,
  ApprovalRequest, Task, Notification, ActivityItem,
  AdminDashboardKPIs, InstalmentSchedule, CustomerPurchase,
  AgentDashboardKPIs, AccountantDashboardKPIs, HRDashboardKPIs,
} from "./types";

// ---- Companies ----
export const mockCompanies: Company[] = [
  {
    id: "c1",
    name: "GB Developers Pvt. Ltd.",
    short_name: "GB Developers",
    cin: "U45201MH2018PTC123456",
    gstin: "27AABCG1234F1ZP",
    pan: "AABCG1234F",
    reg_address: { line1: "301, Baner Business Bay", line2: "Baner Road", city: "Pune", state: "Maharashtra", pin: "411045" },
    phone_numbers: ["+91 20 2729 1001", "+91 98230 12345"],
    email: "info@gbdevelopers.in",
    website: "https://gbdevelopers.in",
    incorporated_at: "2018-03-15",
    status: "active",
    notes: "Primary residential development subsidiary",
    created_at: "2024-01-10T10:00:00Z",
    updated_at: "2024-06-15T14:30:00Z",
    is_deleted: false,
    active_sites_count: 3,
    employees_count: 18,
  },
  {
    id: "c2",
    name: "GB Commercial Spaces LLP",
    short_name: "GB Commercial",
    cin: "AAP-4521",
    gstin: "27AABFG5678H1ZQ",
    pan: "AABFG5678H",
    reg_address: { line1: "502, Hinjewadi IT Park", line2: "Phase 2", city: "Pune", state: "Maharashtra", pin: "411057" },
    phone_numbers: ["+91 20 2729 2002"],
    email: "contact@gbcommercial.in",
    incorporated_at: "2020-07-22",
    status: "active",
    created_at: "2024-02-20T10:00:00Z",
    updated_at: "2024-08-10T11:00:00Z",
    is_deleted: false,
    active_sites_count: 2,
    employees_count: 12,
  },
  {
    id: "c3",
    name: "GB Township Projects Pvt. Ltd.",
    short_name: "GB Township",
    cin: "U45309MH2021PTC789012",
    gstin: "27AABCG9012J1ZR",
    pan: "AABCG9012J",
    reg_address: { line1: "105, Kothrud Business Center", line2: "Paud Road", city: "Pune", state: "Maharashtra", pin: "411038" },
    phone_numbers: ["+91 20 2729 3003", "+91 88050 67890"],
    email: "hello@gbtownship.in",
    incorporated_at: "2021-11-05",
    status: "active",
    created_at: "2024-03-15T10:00:00Z",
    updated_at: "2024-09-01T09:00:00Z",
    is_deleted: false,
    active_sites_count: 1,
    employees_count: 8,
  },
];

// ---- Sites ----
export const mockSites: Site[] = [
  {
    id: "s1", company_id: "c1", company_name: "GB Developers Pvt. Ltd.",
    name: "GB Serenity Heights", site_code: "GBSH-001",
    site_type: "residential",
    address: { line1: "Survey No. 45/2", line2: "Near Balewadi Stadium", city: "Pune", state: "Maharashtra", pin: "411045" },
    city: "Pune", state: "Maharashtra",
    total_land_area: 25000, land_area_unit: "sqft",
    rera_number: "P52100045678", rera_reg_date: "2023-06-01", rera_expiry_date: "2028-12-31",
    expected_completion: "2027-03-31",
    status: "active",
    property_types: ["2BHK", "3BHK", "4BHK"],
    description: "Premium residential towers with modern amenities in the heart of Balewadi",
    created_at: "2024-01-15T10:00:00Z", updated_at: "2024-10-01T10:00:00Z", is_deleted: false,
    total_units: 120, sold_units: 78, available_units: 42,
  },
  {
    id: "s2", company_id: "c1", company_name: "GB Developers Pvt. Ltd.",
    name: "GB Riverside Residency", site_code: "GBRR-002",
    site_type: "residential",
    city: "Pune", state: "Maharashtra",
    total_land_area: 18000, land_area_unit: "sqft",
    rera_number: "P52100067890",
    status: "active",
    property_types: ["1BHK", "2BHK"],
    description: "Affordable luxury apartments along Mula-Mutha river",
    created_at: "2024-03-20T10:00:00Z", updated_at: "2024-10-15T10:00:00Z", is_deleted: false,
    total_units: 200, sold_units: 145, available_units: 55,
  },
  {
    id: "s3", company_id: "c1", company_name: "GB Developers Pvt. Ltd.",
    name: "GB Green Valley", site_code: "GBGV-003",
    site_type: "residential",
    city: "Pune", state: "Maharashtra",
    total_land_area: 40000, land_area_unit: "sqft",
    rera_number: "P52100089012",
    status: "active",
    property_types: ["1RK", "1BHK", "2BHK", "3BHK"],
    description: "Eco-friendly township project in Hinjewadi",
    created_at: "2024-05-10T10:00:00Z", updated_at: "2024-11-01T10:00:00Z", is_deleted: false,
    total_units: 350, sold_units: 112, available_units: 238,
  },
  {
    id: "s4", company_id: "c2", company_name: "GB Commercial Spaces LLP",
    name: "GB Business Hub", site_code: "GBBH-004",
    site_type: "commercial",
    city: "Pune", state: "Maharashtra",
    total_land_area: 15000, land_area_unit: "sqft",
    status: "active",
    property_types: ["Commercial Shop", "Commercial Office"],
    description: "Premium commercial complex in Hinjewadi Phase 3",
    created_at: "2024-06-01T10:00:00Z", updated_at: "2024-11-15T10:00:00Z", is_deleted: false,
    total_units: 80, sold_units: 35, available_units: 45,
  },
  {
    id: "s5", company_id: "c2", company_name: "GB Commercial Spaces LLP",
    name: "GB Tech Plaza", site_code: "GBTP-005",
    site_type: "commercial",
    city: "Pune", state: "Maharashtra",
    total_land_area: 22000, land_area_unit: "sqft",
    status: "active",
    property_types: ["Commercial Office"],
    description: "IT office spaces near Rajiv Gandhi Infotech Park",
    created_at: "2024-07-15T10:00:00Z", updated_at: "2024-12-01T10:00:00Z", is_deleted: false,
    total_units: 60, sold_units: 22, available_units: 38,
  },
  {
    id: "s6", company_id: "c3", company_name: "GB Township Projects Pvt. Ltd.",
    name: "GB Aangan Township", site_code: "GBAT-006",
    site_type: "mixed",
    city: "Pune", state: "Maharashtra",
    total_land_area: 75000, land_area_unit: "sqft",
    rera_number: "P52100034567",
    status: "active",
    property_types: ["1BHK", "2BHK", "3BHK", "Penthouse", "Commercial Shop"],
    description: "Integrated township with residential and commercial spaces in Wakad",
    created_at: "2024-08-01T10:00:00Z", updated_at: "2025-01-10T10:00:00Z", is_deleted: false,
    total_units: 500, sold_units: 167, available_units: 333,
  },
];

// ---- Employees ----
export const mockEmployees: Employee[] = [
  {
    id: "e1", employee_code: "GBINF-2024-0001", company_id: "c1", company_name: "GB Developers",
    first_name: "Rajesh", last_name: "Patil", full_name: "Rajesh Patil",
    personal_mobile: "9823012345", work_email: "rajesh.patil@gbinfra.in",
    department: "finance_accounting", designation: "Senior Accountant",
    join_date: "2024-01-15", employment_type: "full_time",
    portal_role: "accountant", access_status: "active", status: "active",
    gross_salary: 55000,
    assigned_companies: ["c1", "c2"],
    created_at: "2024-01-15T10:00:00Z", updated_at: "2024-06-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e2", employee_code: "GBINF-2024-0002", company_id: "c1", company_name: "GB Developers",
    first_name: "Priya", last_name: "Sharma", full_name: "Priya Sharma",
    personal_mobile: "9850067890", work_email: "priya.sharma@gbinfra.in",
    department: "marketing_sales", designation: "Senior Sales Executive",
    join_date: "2024-02-01", employment_type: "full_time",
    portal_role: "agent", access_status: "active", status: "active",
    gross_salary: 40000,
    created_at: "2024-02-01T10:00:00Z", updated_at: "2024-07-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e3", employee_code: "GBINF-2024-0003", company_id: "c1", company_name: "GB Developers",
    first_name: "Amit", last_name: "Kulkarni", full_name: "Amit Kulkarni",
    personal_mobile: "9881034567", work_email: "amit.kulkarni@gbinfra.in",
    department: "marketing_sales", designation: "Sales Executive",
    join_date: "2024-03-10", employment_type: "full_time",
    portal_role: "agent", access_status: "active", status: "active",
    gross_salary: 35000,
    created_at: "2024-03-10T10:00:00Z", updated_at: "2024-08-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e4", employee_code: "GBINF-2024-0004", company_id: "c2", company_name: "GB Commercial",
    first_name: "Sneha", last_name: "Deshmukh", full_name: "Sneha Deshmukh",
    personal_mobile: "9922045678", work_email: "sneha.deshmukh@gbinfra.in",
    department: "human_resource", designation: "HR Manager",
    join_date: "2024-01-20", employment_type: "full_time",
    portal_role: "hr", access_status: "active", status: "active",
    gross_salary: 50000,
    created_at: "2024-01-20T10:00:00Z", updated_at: "2024-09-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e5", employee_code: "GBINF-2024-0005", company_id: "c1", company_name: "GB Developers",
    first_name: "Vikram", last_name: "Joshi", full_name: "Vikram Joshi",
    personal_mobile: "9860056789", work_email: "vikram.joshi@gbinfra.in",
    department: "marketing_sales", designation: "Sales Executive",
    join_date: "2024-04-01", employment_type: "full_time",
    portal_role: "agent", access_status: "active", status: "active",
    gross_salary: 32000,
    created_at: "2024-04-01T10:00:00Z", updated_at: "2024-10-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e6", employee_code: "GBINF-2024-0006", company_id: "c2", company_name: "GB Commercial",
    first_name: "Neha", last_name: "Wagh", full_name: "Neha Wagh",
    personal_mobile: "9975067890", work_email: "neha.wagh@gbinfra.in",
    department: "finance_accounting", designation: "Junior Accountant",
    join_date: "2024-05-15", employment_type: "full_time",
    portal_role: "accountant", access_status: "active", status: "active",
    gross_salary: 38000,
    assigned_companies: ["c2", "c3"],
    created_at: "2024-05-15T10:00:00Z", updated_at: "2024-11-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e7", employee_code: "GBINF-2024-0007", company_id: "c3", company_name: "GB Township",
    first_name: "Rohit", last_name: "Gaikwad", full_name: "Rohit Gaikwad",
    personal_mobile: "9890078901", work_email: "rohit.gaikwad@gbinfra.in",
    department: "marketing_sales", designation: "Sales Manager",
    join_date: "2024-06-01", employment_type: "full_time",
    portal_role: "agent", access_status: "active", status: "active",
    gross_salary: 45000,
    created_at: "2024-06-01T10:00:00Z", updated_at: "2024-12-01T10:00:00Z", is_deleted: false,
  },
  {
    id: "e8", employee_code: "GBINF-2024-0008", company_id: "c1", company_name: "GB Developers",
    first_name: "Manish", last_name: "Bhosale", full_name: "Manish Bhosale",
    personal_mobile: "9823089012", work_email: "manish.bhosale@gbinfra.in",
    department: "marketing_sales", designation: "Sales Executive",
    join_date: "2024-07-15", employment_type: "full_time",
    portal_role: "agent", access_status: "active", status: "active",
    gross_salary: 30000,
    created_at: "2024-07-15T10:00:00Z", updated_at: "2025-01-01T10:00:00Z", is_deleted: false,
  },
];

// ---- Customers ----
export const mockCustomers: Customer[] = [
  {
    id: "cust1", first_name: "Sanjay", last_name: "Mehta", full_name: "Sanjay Mehta",
    mobile_1: "9823456789", email: "sanjay.mehta@gmail.com",
    customer_type: "individual", pan_number: "ABCPM1234F",
    added_at: "2024-03-15T10:00:00Z", updated_at: "2024-10-01T10:00:00Z", is_deleted: false,
    site_name: "GB Serenity Heights", company_name_display: "GB Developers", property_type: "3BHK", unit_number: "A-301",
    total_amount: 8500000, received_amount: 5100000, pending_amount: 3400000, payment_status: "active", booking_date: "2024-03-15",
  },
  {
    id: "cust2", first_name: "Anjali", last_name: "Deshpande", full_name: "Anjali Deshpande",
    mobile_1: "9850123456", email: "anjali.deshpande@yahoo.com",
    customer_type: "individual", pan_number: "BCDQD5678G",
    added_at: "2024-04-20T10:00:00Z", updated_at: "2024-11-15T10:00:00Z", is_deleted: false,
    site_name: "GB Serenity Heights", company_name_display: "GB Developers", property_type: "2BHK", unit_number: "B-105",
    total_amount: 5800000, received_amount: 5800000, pending_amount: 0, payment_status: "completed", booking_date: "2024-04-20",
  },
  {
    id: "cust3", first_name: "Rahul", last_name: "Kale", full_name: "Rahul Kale",
    mobile_1: "9881234567", customer_type: "individual", pan_number: "CDEFK9012H",
    added_at: "2024-05-10T10:00:00Z", updated_at: "2024-12-01T10:00:00Z", is_deleted: false,
    site_name: "GB Riverside Residency", company_name_display: "GB Developers", property_type: "1BHK", unit_number: "C-204",
    total_amount: 3200000, received_amount: 1600000, pending_amount: 1600000, payment_status: "active", booking_date: "2024-05-10",
  },
  {
    id: "cust4", first_name: "Pooja", last_name: "Pawar", full_name: "Pooja Pawar",
    mobile_1: "9922345678", customer_type: "individual", pan_number: "DEFGP3456I",
    added_at: "2024-06-01T10:00:00Z", updated_at: "2025-01-10T10:00:00Z", is_deleted: false,
    site_name: "GB Green Valley", company_name_display: "GB Developers", property_type: "2BHK", unit_number: "D-502",
    total_amount: 4500000, received_amount: 900000, pending_amount: 3600000, payment_status: "active", booking_date: "2024-06-01",
  },
  {
    id: "cust5", first_name: "Arun", last_name: "Jadhav", full_name: "Arun Jadhav",
    mobile_1: "9860456789", customer_type: "individual", pan_number: "EFGHJ7890K",
    added_at: "2024-07-15T10:00:00Z", updated_at: "2025-02-01T10:00:00Z", is_deleted: false,
    site_name: "GB Business Hub", company_name_display: "GB Commercial", property_type: "Commercial Shop", unit_number: "S-12",
    total_amount: 12000000, received_amount: 4800000, pending_amount: 7200000, payment_status: "active", booking_date: "2024-07-15",
  },
  {
    id: "cust6", first_name: "Suresh", last_name: "Phadke", full_name: "Suresh Phadke",
    mobile_1: "9975567890", customer_type: "individual",
    added_at: "2024-08-01T10:00:00Z", updated_at: "2025-03-01T10:00:00Z", is_deleted: false,
    site_name: "GB Aangan Township", company_name_display: "GB Township", property_type: "3BHK", unit_number: "T1-801",
    total_amount: 7200000, received_amount: 2160000, pending_amount: 5040000, payment_status: "active", booking_date: "2024-08-01",
  },
  {
    id: "cust7", first_name: "Megha", last_name: "Shirke", full_name: "Megha Shirke",
    mobile_1: "9890678901", customer_type: "individual",
    added_at: "2024-09-10T10:00:00Z", updated_at: "2025-03-15T10:00:00Z", is_deleted: false,
    site_name: "GB Serenity Heights", company_name_display: "GB Developers", property_type: "4BHK", unit_number: "A-1201",
    total_amount: 15000000, received_amount: 6000000, pending_amount: 9000000, payment_status: "active", booking_date: "2024-09-10",
  },
  {
    id: "cust8", first_name: "Deepak", last_name: "Mane", full_name: "Deepak Mane",
    mobile_1: "9823789012", customer_type: "individual",
    added_at: "2024-10-05T10:00:00Z", updated_at: "2025-04-01T10:00:00Z", is_deleted: false,
    site_name: "GB Riverside Residency", company_name_display: "GB Developers", property_type: "2BHK", unit_number: "E-306",
    total_amount: 5500000, received_amount: 2750000, pending_amount: 2750000, payment_status: "active", booking_date: "2024-10-05",
  },
];

// ---- Transactions ----
export const mockTransactions: Transaction[] = [
  { id: "t1", transaction_code: "GBTRX-2024-00001", company_id: "c1", company_name: "GB Developers", site_id: "s1", site_name: "GB Serenity Heights", category: "PROPERTY_SALE", transaction_date: "2024-03-15", amount: 8500000, payment_mode: "NEFT", description: "Property sale - 3BHK A-301", customer_name: "Sanjay Mehta", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-03-15T11:00:00Z", updated_at: "2024-03-15T11:00:00Z", status: "active", is_deleted: false },
  { id: "t2", transaction_code: "GBTRX-2024-00002", company_id: "c1", company_name: "GB Developers", site_id: "s1", site_name: "GB Serenity Heights", category: "BOOKING_AMOUNT", transaction_date: "2024-03-15", amount: 500000, payment_mode: "Cheque", reference_no: "CHQ-456789", description: "Booking amount - 3BHK A-301", customer_name: "Sanjay Mehta", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-03-15T11:30:00Z", updated_at: "2024-03-15T11:30:00Z", status: "active", is_deleted: false },
  { id: "t3", transaction_code: "GBTRX-2024-00003", company_id: "c1", company_name: "GB Developers", site_id: "s1", site_name: "GB Serenity Heights", category: "INSTALMENT_RECEIVED", transaction_date: "2024-04-15", amount: 425000, payment_mode: "NEFT", description: "Instalment #1 - Sanjay Mehta", customer_name: "Sanjay Mehta", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-04-15T10:00:00Z", updated_at: "2024-04-15T10:00:00Z", status: "active", is_deleted: false },
  { id: "t4", transaction_code: "GBTRX-2024-00004", company_id: "c1", company_name: "GB Developers", category: "SALARY", transaction_date: "2024-04-30", amount: 55000, payment_mode: "NEFT", description: "Salary Apr 2024 - Rajesh Patil", employee_name: "Rajesh Patil", employee_id: "e1", pay_period_month: 4, pay_period_year: 2024, added_by: "e1", added_by_name: "Admin", added_at: "2024-04-30T10:00:00Z", updated_at: "2024-04-30T10:00:00Z", status: "active", is_deleted: false },
  { id: "t5", transaction_code: "GBTRX-2024-00005", company_id: "c1", company_name: "GB Developers", site_id: "s1", site_name: "GB Serenity Heights", category: "PURCHASE", transaction_date: "2024-05-10", amount: 2300000, payment_mode: "RTGS", vendor_name: "Ambuja Cements Ltd", invoice_number: "INV-2024-5678", description: "Cement purchase - 500 bags", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-05-10T14:00:00Z", updated_at: "2024-05-10T14:00:00Z", status: "active", is_deleted: false },
  { id: "t6", transaction_code: "GBTRX-2024-00006", company_id: "c2", company_name: "GB Commercial", site_id: "s4", site_name: "GB Business Hub", category: "PROPERTY_SALE", transaction_date: "2024-07-15", amount: 12000000, payment_mode: "RTGS", description: "Commercial shop S-12 full sale", customer_name: "Arun Jadhav", added_by: "e6", added_by_name: "Neha Wagh", added_at: "2024-07-15T10:00:00Z", updated_at: "2024-07-15T10:00:00Z", status: "active", is_deleted: false },
  { id: "t7", transaction_code: "GBTRX-2024-00007", company_id: "c1", company_name: "GB Developers", site_id: "s2", site_name: "GB Riverside Residency", category: "CONTRACTOR_PAYMENT", transaction_date: "2024-06-20", amount: 1500000, payment_mode: "NEFT", vendor_name: "Shree Construction Co.", description: "Foundation work payment", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-06-20T15:00:00Z", updated_at: "2024-06-20T15:00:00Z", status: "active", is_deleted: false },
  { id: "t8", transaction_code: "GBTRX-2024-00008", company_id: "c1", company_name: "GB Developers", site_id: "s1", site_name: "GB Serenity Heights", category: "PETTY_EXPENSE", transaction_date: "2024-07-05", amount: 12500, payment_mode: "Cash", description: "Site visit transport + refreshments", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-07-05T17:00:00Z", updated_at: "2024-07-05T17:00:00Z", status: "active", is_deleted: false },
  { id: "t9", transaction_code: "GBTRX-2024-00009", company_id: "c3", company_name: "GB Township", site_id: "s6", site_name: "GB Aangan Township", category: "PROPERTY_SALE", transaction_date: "2024-08-01", amount: 7200000, payment_mode: "NEFT", description: "3BHK T1-801 sale", customer_name: "Suresh Phadke", added_by: "e6", added_by_name: "Neha Wagh", added_at: "2024-08-01T11:00:00Z", updated_at: "2024-08-01T11:00:00Z", status: "active", is_deleted: false },
  { id: "t10", transaction_code: "GBTRX-2024-00010", company_id: "c1", company_name: "GB Developers", site_id: "s3", site_name: "GB Green Valley", category: "UTILITY_EXPENSE", transaction_date: "2024-08-15", amount: 85000, payment_mode: "NEFT", description: "Electricity bill - Aug 2024", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-08-15T10:00:00Z", updated_at: "2024-08-15T10:00:00Z", status: "active", is_deleted: false },
  { id: "t11", transaction_code: "GBTRX-2024-00011", company_id: "c1", company_name: "GB Developers", site_id: "s1", category: "INSTALMENT_RECEIVED", transaction_date: "2024-09-15", amount: 425000, payment_mode: "UPI", description: "Instalment #6 - Sanjay Mehta", customer_name: "Sanjay Mehta", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-09-15T10:00:00Z", updated_at: "2024-09-15T10:00:00Z", status: "active", is_deleted: false },
  { id: "t12", transaction_code: "GBTRX-2024-00012", company_id: "c2", company_name: "GB Commercial", category: "SALARY", transaction_date: "2024-09-30", amount: 50000, payment_mode: "NEFT", description: "Salary Sep 2024 - Sneha Deshmukh", employee_name: "Sneha Deshmukh", employee_id: "e4", added_by: "e6", added_by_name: "Neha Wagh", added_at: "2024-09-30T10:00:00Z", updated_at: "2024-09-30T10:00:00Z", status: "active", is_deleted: false },
  { id: "t13", transaction_code: "GBTRX-2024-00013", company_id: "c1", company_name: "GB Developers", category: "OTHER_INCOME", transaction_date: "2024-10-01", amount: 150000, payment_mode: "NEFT", description: "Rental income - office space Oct", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-10-01T10:00:00Z", updated_at: "2024-10-01T10:00:00Z", status: "active", is_deleted: false },
  { id: "t14", transaction_code: "GBTRX-2024-00014", company_id: "c1", company_name: "GB Developers", site_id: "s2", site_name: "GB Riverside Residency", category: "PURCHASE", transaction_date: "2024-10-10", amount: 4500000, payment_mode: "RTGS", vendor_name: "Tata Steel Dealers", invoice_number: "INV-2024-8901", description: "Steel TMT bars - 50 tons", added_by: "e1", added_by_name: "Rajesh Patil", added_at: "2024-10-10T14:00:00Z", updated_at: "2024-10-10T14:00:00Z", status: "pending_edit", is_deleted: false },
  { id: "t15", transaction_code: "GBTRX-2024-00015", company_id: "c3", company_name: "GB Township", site_id: "s6", site_name: "GB Aangan Township", category: "CONTRACTOR_PAYMENT", transaction_date: "2024-11-01", amount: 3200000, payment_mode: "RTGS", vendor_name: "Vishwakarma Builders", description: "Structural work - Phase 2", added_by: "e6", added_by_name: "Neha Wagh", added_at: "2024-11-01T10:00:00Z", updated_at: "2024-11-01T10:00:00Z", status: "active", is_deleted: false },
];

// ---- Approval Requests ----
export const mockApprovals: ApprovalRequest[] = [
  {
    id: "apr1", request_code: "GBAPV-2024-00001", request_type: "edit", transaction_id: "t14",
    transaction_code: "GBTRX-2024-00014", requested_by: "e1", requested_by_name: "Rajesh Patil",
    requested_at: "2024-10-12T10:00:00Z", reason: "Incorrect amount entered. Actual invoice amount is ₹45,50,000 instead of ₹45,00,000. Verified with vendor invoice copy.",
    original_data: { amount: 4500000, description: "Steel TMT bars - 50 tons" },
    requested_changes: { amount: 4550000, description: "Steel TMT bars - 50 tons (corrected amount per invoice)" },
    status: "pending", updated_at: "2024-10-12T10:00:00Z",
    original_amount: 4500000, requested_amount: 4550000, transaction_date: "2024-10-10",
  },
  {
    id: "apr2", request_code: "GBAPV-2024-00002", request_type: "delete", transaction_id: "t8",
    transaction_code: "GBTRX-2024-00008", requested_by: "e1", requested_by_name: "Rajesh Patil",
    requested_at: "2024-10-15T14:00:00Z", reason: "Duplicate entry. This petty expense was already recorded in GBTRX-2024-00006.",
    original_data: { amount: 12500, description: "Site visit transport + refreshments" },
    status: "pending", updated_at: "2024-10-15T14:00:00Z",
    original_amount: 12500, transaction_date: "2024-07-05",
  },
  {
    id: "apr3", request_code: "GBAPV-2024-00003", request_type: "edit", transaction_id: "t7",
    transaction_code: "GBTRX-2024-00007", requested_by: "e6", requested_by_name: "Neha Wagh",
    requested_at: "2024-09-20T11:00:00Z", reason: "Payment mode was RTGS not NEFT. Bank reference number needs correction.",
    original_data: { payment_mode: "NEFT", reference_no: "" },
    requested_changes: { payment_mode: "RTGS", reference_no: "RTGS-20240620-78901" },
    status: "approved", reviewed_by: "admin", reviewed_at: "2024-09-21T09:00:00Z", review_notes: "Approved. Verified bank statement.",
    updated_at: "2024-09-21T09:00:00Z",
    original_amount: 1500000, transaction_date: "2024-06-20",
  },
];

// ---- Tasks ----
export const mockTasks: Task[] = [
  { id: "task1", title: "Follow up with Sanjay Mehta for instalment #7", description: "Monthly instalment due on 15th Oct. Contact customer and confirm payment.", assigned_to: "e1", assigned_to_name: "Rajesh Patil", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "high", status: "todo", due_date: "2024-10-14", tags: ["collections", "follow-up"], is_recurring: false, created_at: "2024-10-01T10:00:00Z", updated_at: "2024-10-01T10:00:00Z", is_deleted: false },
  { id: "task2", title: "Prepare quarterly P&L report", description: "Generate Q3 2024 P&L report for all companies and share with Admin for review.", assigned_to: "e1", assigned_to_name: "Rajesh Patil", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "high", status: "in_progress", due_date: "2024-10-20", tags: ["reports", "finance"], is_recurring: true, recurrence_type: "monthly", created_at: "2024-10-05T10:00:00Z", updated_at: "2024-10-10T10:00:00Z", is_deleted: false },
  { id: "task3", title: "Site visit - GB Green Valley Phase 2", description: "Inspect foundation work progress and take photographs for documentation.", assigned_to: "e5", assigned_to_name: "Vikram Joshi", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "medium", status: "todo", due_date: "2024-10-18", tags: ["site-visit"], is_recurring: false, created_at: "2024-10-08T10:00:00Z", updated_at: "2024-10-08T10:00:00Z", is_deleted: false },
  { id: "task4", title: "Update employee records with new PAN details", description: "3 employees have submitted new PAN card details. Update their records.", assigned_to: "e4", assigned_to_name: "Sneha Deshmukh", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "low", status: "review", due_date: "2024-10-25", tags: ["hr", "documents"], is_recurring: false, created_at: "2024-10-10T10:00:00Z", updated_at: "2024-10-15T10:00:00Z", is_deleted: false },
  { id: "task5", title: "Lead follow-up - Kharadi prospects", description: "Follow up with 5 leads from last weekend's exhibition in Kharadi.", assigned_to: "e2", assigned_to_name: "Priya Sharma", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "high", status: "in_progress", due_date: "2024-10-16", tags: ["sales", "leads"], is_recurring: false, created_at: "2024-10-12T10:00:00Z", updated_at: "2024-10-14T10:00:00Z", is_deleted: false },
  { id: "task6", title: "Monthly salary processing", description: "Process October 2024 salary for all employees.", assigned_to: "e1", assigned_to_name: "Rajesh Patil", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "high", status: "todo", due_date: "2024-10-30", tags: ["salary", "monthly"], is_recurring: true, recurrence_type: "monthly", created_at: "2024-10-15T10:00:00Z", updated_at: "2024-10-15T10:00:00Z", is_deleted: false },
  { id: "task7", title: "Organize team building event", description: "Plan a team outing for Diwali celebration.", assigned_to: "e4", assigned_to_name: "Sneha Deshmukh", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "low", status: "done", due_date: "2024-10-25", tags: ["hr", "events"], is_recurring: false, created_at: "2024-10-01T10:00:00Z", updated_at: "2024-10-23T10:00:00Z", completed_at: "2024-10-23T10:00:00Z", is_deleted: false },
  { id: "task8", title: "Verify RERA documents for Green Valley", description: "Cross-check RERA registration renewal documents before submission.", assigned_to: "e6", assigned_to_name: "Neha Wagh", assigned_by: "e4", assigned_by_name: "Sneha Deshmukh", priority: "medium", status: "todo", due_date: "2024-10-22", tags: ["compliance", "documents"], is_recurring: false, created_at: "2024-10-15T10:00:00Z", updated_at: "2024-10-15T10:00:00Z", is_deleted: false },
];

// ---- Notifications ----
export const mockNotifications: Notification[] = [
  { id: "n1", user_id: "admin", type: "approval", title: "New Edit Request", message: "Rajesh Patil has submitted an edit request for GBTRX-2024-00014", link: "/approvals/apr1", is_read: false, created_at: "2024-10-12T10:00:00Z" },
  { id: "n2", user_id: "admin", type: "approval", title: "New Delete Request", message: "Rajesh Patil has submitted a delete request for GBTRX-2024-00008", link: "/approvals/apr2", is_read: false, created_at: "2024-10-15T14:00:00Z" },
  { id: "n3", user_id: "admin", type: "overdue", title: "Instalment Overdue", message: "Pooja Pawar's instalment #3 is overdue by 15 days (₹3,75,000)", link: "/customers/cust4", is_read: true, created_at: "2024-10-16T08:00:00Z" },
  { id: "n4", user_id: "admin", type: "task", title: "Task Overdue", message: "Vikram Joshi's task 'Site visit - GB Green Valley' is overdue", link: "/my-work", is_read: false, created_at: "2024-10-19T08:00:00Z" },
  { id: "n5", user_id: "admin", type: "transaction", title: "Large Transaction", message: "New transaction of ₹45,00,000 recorded by Rajesh Patil", link: "/transactions/t14", is_read: true, created_at: "2024-10-10T14:00:00Z" },
];

// ---- Activity Feed ----
export const mockActivities: ActivityItem[] = [
  { id: "a1", actor_name: "Rajesh Patil", action: "recorded transaction", target: "GBTRX-2024-00014 - ₹45,00,000", timestamp: "2024-10-10T14:00:00Z", type: "transaction" },
  { id: "a2", actor_name: "Rajesh Patil", action: "submitted edit request", target: "GBAPV-2024-00001", timestamp: "2024-10-12T10:00:00Z", type: "approval" },
  { id: "a3", actor_name: "Priya Sharma", action: "registered new customer", target: "Deepak Mane", timestamp: "2024-10-05T10:00:00Z", type: "customer" },
  { id: "a4", actor_name: "Sneha Deshmukh", action: "assigned task", target: "Follow up with Sanjay Mehta", timestamp: "2024-10-01T10:00:00Z", type: "task" },
  { id: "a5", actor_name: "Neha Wagh", action: "recorded transaction", target: "GBTRX-2024-00015 - ₹32,00,000", timestamp: "2024-11-01T10:00:00Z", type: "transaction" },
  { id: "a6", actor_name: "Vikram Joshi", action: "added new sale", target: "GB Serenity Heights - 4BHK A-1201", timestamp: "2024-09-10T10:00:00Z", type: "transaction" },
  { id: "a7", actor_name: "Sneha Deshmukh", action: "completed task", target: "Organize team building event", timestamp: "2024-10-23T10:00:00Z", type: "task" },
  { id: "a8", actor_name: "Amit Kulkarni", action: "registered new customer", target: "Megha Shirke", timestamp: "2024-09-10T10:00:00Z", type: "customer" },
];

// ---- Dashboard KPIs ----
export const mockAdminKPIs: AdminDashboardKPIs = {
  total_revenue: 47850000,
  total_expenses: 12152500,
  net_profit: 35697500,
  total_collections: 26210000,
  outstanding_receivables: 31790000,
  active_sites: 6,
  total_customers: 8,
  total_employees: 8,
  revenue_trend: 12.5,
  expense_trend: -3.2,
  profit_trend: 18.7,
  collection_trend: 8.4,
};

export const mockAgentKPIs: AgentDashboardKPIs = {
  total_sales_count: 12,
  total_sales_value: 68400000,
  my_customers_count: 12,
  deals_this_month: 2,
  sales_trend: 15.0,
  value_trend: 22.3,
};

export const mockAccountantKPIs: AccountantDashboardKPIs = {
  total_income: 35350000,
  total_expenses: 8397500,
  net: 26952500,
  pending_approvals: 2,
  overdue_instalments: 3,
  income_trend: 10.2,
  expense_trend: -5.1,
};

export const mockHRKPIs: HRDashboardKPIs = {
  total_employees: 8,
  total_agents: 4,
  new_hires_this_month: 1,
  salary_paid_this_month: 335000,
  open_tasks: 6,
  overdue_tasks: 2,
};

// ---- Chart Data ----
export const monthlyRevenueExpense = [
  { name: "Jan", revenue: 2500000, expenses: 800000 },
  { name: "Feb", revenue: 3100000, expenses: 950000 },
  { name: "Mar", revenue: 9500000, expenses: 1200000 },
  { name: "Apr", revenue: 4200000, expenses: 1550000 },
  { name: "May", revenue: 3800000, expenses: 2600000 },
  { name: "Jun", revenue: 4100000, expenses: 1800000 },
  { name: "Jul", revenue: 12500000, expenses: 900000 },
  { name: "Aug", revenue: 7800000, expenses: 1285000 },
  { name: "Sep", revenue: 2100000, expenses: 950000 },
  { name: "Oct", revenue: 5200000, expenses: 4750000 },
  { name: "Nov", revenue: 3500000, expenses: 3400000 },
  { name: "Dec", revenue: 2800000, expenses: 600000 },
];

export const cashFlowData = [
  { name: "Jan", net: 1700000 }, { name: "Feb", net: 2150000 },
  { name: "Mar", net: 8300000 }, { name: "Apr", net: 2650000 },
  { name: "May", net: 1200000 }, { name: "Jun", net: 2300000 },
  { name: "Jul", net: 11600000 }, { name: "Aug", net: 6515000 },
  { name: "Sep", net: 1150000 }, { name: "Oct", net: 450000 },
  { name: "Nov", net: 100000 }, { name: "Dec", net: 2200000 },
];

export const categoryBreakdown = [
  { name: "Property Sales", value: 27700000 },
  { name: "Instalments", value: 850000 },
  { name: "Booking Amounts", value: 500000 },
  { name: "Other Income", value: 150000 },
  { name: "Purchases", value: 6800000 },
  { name: "Salaries", value: 105000 },
  { name: "Contractor Payments", value: 4700000 },
  { name: "Petty Expenses", value: 12500 },
  { name: "Utilities", value: 85000 },
];

export const agentPerformance = [
  { name: "Priya Sharma", sales: 18, value: 82000000 },
  { name: "Rohit Gaikwad", sales: 14, value: 63000000 },
  { name: "Amit Kulkarni", sales: 12, value: 58000000 },
  { name: "Vikram Joshi", sales: 10, value: 45000000 },
  { name: "Manish Bhosale", sales: 6, value: 24000000 },
];

export const companyRevenue = [
  { name: "GB Developers", revenue: 28350000 },
  { name: "GB Commercial", revenue: 12000000 },
  { name: "GB Township", revenue: 7200000 },
];

export const instalmentStatus = [
  { name: "GB Serenity Heights", collected: 15200000, pending: 8400000, overdue: 2100000 },
  { name: "GB Riverside Residency", collected: 8750000, pending: 5600000, overdue: 900000 },
  { name: "GB Green Valley", collected: 3200000, pending: 12000000, overdue: 1800000 },
  { name: "GB Business Hub", collected: 4800000, pending: 7200000, overdue: 0 },
  { name: "GB Aangan Township", collected: 5160000, pending: 18000000, overdue: 3200000 },
];

export const monthlySalaryCost = [
  { name: "Jan", cost: 280000 }, { name: "Feb", cost: 295000 },
  { name: "Mar", cost: 310000 }, { name: "Apr", cost: 325000 },
  { name: "May", cost: 335000 }, { name: "Jun", cost: 335000 },
  { name: "Jul", cost: 335000 }, { name: "Aug", cost: 335000 },
  { name: "Sep", cost: 335000 }, { name: "Oct", cost: 335000 },
  { name: "Nov", cost: 340000 }, { name: "Dec", cost: 340000 },
];
