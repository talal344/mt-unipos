"use client";

export interface POSCounter {
  id: string;
  name: string;
  assignedCashierName: string;
  assignedCashierEmail: string;
  openingFloat: number;
  status: "Active" | "Closed" | "Unassigned";
  startedAt: string;
  notes?: string;
  collectedCashDeduction?: number;
}

export interface POSShift {
  id: string;
  counterId: string;
  cashierName: string;
  cashierEmail: string;
  openingFloat: number;
  startTime: string;
  endTime?: string;
  status: "Open" | "Closed";
  closingCash?: number;
  expectedCash?: number;
  discrepancy?: number;
  notes?: string;
}

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { queueSyncKey, getQueuedItems, dequeueItem, STORE_SYNC_KEYS, STORE_RECEIPTS } from "@/lib/offline-sync";


// Types
export interface DemoMessage {
  sender: "Client" | "Admin";
  message: string;
  date: string;
}

export interface DemoRequest {
  id: string;
  ticketNumber: string;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  country: string;
  assignedSoftware?: "POS" | "HRMS";
  businessType: string;
  date: string;
  status: "Pending" | "Reviewed" | "Under Review" | "Approved" | "Rejected" | "Converted";
  // Approval fields
  trialDays?: number;
  trialEndsAt?: string;
  approvedAt?: string;
  convertedAt?: string;
  demoEmail?: string;
  demoPassword?: string;
  // Rejection fields
  rejectedReason?: string;
  rejectedAt?: string;
  // Messaging
  messages: DemoMessage[];
}

export interface TenantPreset {
  id: string;
  label: string;
  email: string;
  pass: string;
  role: "Owner" | "Manager" | "Cashier" | "Accountant" | "Warehouse Staff";
}

export interface Tenant {
  id: string;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  businessType: string;
  plan: "Starter" | "Professional" | "Enterprise";
  billingCycle: "monthly" | "yearly";
  status: "Active" | "Trial" | "Suspended" | "Expired";
  signupDate: string;
  branches: string[];
  usersCount: number;
  monthlyRevenue: number;
  defaultCurrency?: string;
  credentialPresets?: TenantPreset[];
  isTrial?: boolean;
  trialDays?: number;
  trialEndsAt?: string;
  connectivityPlan?: "offline-only" | "online-only" | "hybrid";
  licenseExpiresAt?: string;
  assignedSoftware?: "POS" | "HRMS";
}

// ─── HRMS DATA MODELS ────────────────────────────────────────────────────────
export interface HREmployee {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  personalEmail?: string;
  tempPassword?: string;
  phone: string;
  cnic?: string;
  department: string;
  subDepartment?: string;
  designation: string;
  joiningDate: string;
  employmentType: "Full-time" | "Part-time" | "Contract" | "Daily Wager";
  basicSalary: number;
  bankName?: string;
  accountNumber?: string;
  jazzCashNo?: string;
  status: "Active" | "On Leave" | "Terminated";
  avatar?: string;
  reportsTo?: string;
  reportingDesignation?: string;
}

export interface HRAttendance {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // e.g. "09:00 AM"
  checkOut?: string; // e.g. "06:00 PM"
  status: "Present" | "Late" | "Absent" | "Half Day" | "On Leave";
  overtimeHours: number;
  lateMinutes: number;
}

export interface HRLeave {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "Casual" | "Sick" | "Annual" | "Maternity" | "Unpaid";
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  appliedOn: string;
  approvedBy?: string;
}

export interface HRPayrollItem {
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: "Paid" | "Pending";
}

export interface HRPayrollBatch {
  id: string;
  month: string; // e.g. "2026-08"
  processedDate: string;
  totalEmployees: number;
  totalGross: number;
  totalDeductions: number;
  totalNet: number;
  status: "Draft" | "Approved" | "Paid";
  items: HRPayrollItem[];
}

export interface HRJobOpening {
  id: string;
  title: string;
  department: string;
  vacancies: number;
  status: "Open" | "Closed";
  applicantsCount: number;
  postedDate: string;
}

export interface HRAppraisal {
  id: string;
  employeeId: string;
  employeeName: string;
  reviewPeriod: string;
  rating: number; // 1-5
  comments: string;
  status: "Completed" | "Pending";
  date: string;
}

export interface HRLoanRepayment {
  installmentNo: number;
  month: string; // e.g. "2026-08"
  amount: number;
  status: "Pending" | "Deducted" | "Waived";
  deductedAt?: string;
  payrollBatchId?: string;
}

export interface HRLoan {
  id: string;
  loanCode: string;
  employeeId: string;
  employeeName: string;
  employeeCode?: string;
  department: string;
  designation: string;
  type: "Salary Advance" | "Personal Loan" | "Emergency Aid" | "Equipment / Laptop Loan" | "Education / Certification";
  principalAmount: number;
  tenureMonths: number;
  monthlyInstallment: number;
  disbursedAmount: number;
  totalRepaid: number;
  remainingBalance: number;
  reason: string;
  disbursementDate: string;
  startDeductionMonth: string; // e.g. "2026-08"
  status: "Pending Approval" | "Active" | "Completed" | "Rejected";
  approvedBy?: string;
  approvedAt?: string;
  repayments: HRLoanRepayment[];
  notes?: string;
}

export interface HRDepartment {
  id: string;
  name: string;
  code: string;
  headOfDepartment?: string;
  description?: string;
  subDepartments?: string[];
}

export interface HRDesignation {
  id: string;
  title: string;
  rank: number; // 1 = Highest (Director), 10 = Lowest (Intern)
  grade: string;
}

export interface HRShift {
  id: string;
  name: string;
  type?: "Fixed" | "Flexible";
  startTime: string;
  endTime: string;
  requiredHours?: number;
  graceMinutes: number;
  workDays: string[];
}

export interface HRCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedPosition: string;
  department: string;
  subDepartment?: string;
  cnic?: string;
  proposedSalary: number;
  bankName?: string;
  accountNumber?: string;
  stage: "Applied" | "Screening" | "Interview" | "Offered" | "Hired" | "Rejected";
  onboardingStage?: "Pending IT Provisioning" | "Pending Finance Confirmation" | "Fully Active Employee";
  generatedEmployeeCode?: string;
  assignedShift?: string;
  workEmail?: string;
  tempPassword?: string;
  itProvisionedAt?: string;
  financeConfirmedAt?: string;
  assignedToITUserId?: string;
  assignedToITUserName?: string;
  itTaskAssignedAt?: string;
  itTaskTimeline?: { action: string; actor: string; timestamp: string }[];
  appliedDate: string;
}

export interface HRMSTicketReply {
  id: string;
  senderName: string;
  senderRole: string;
  senderEmail: string;
  message: string;
  createdAt: string;
}

export interface HRMSTicket {
  id: string;
  ticketNumber: string;
  creatorName: string;
  creatorEmail: string;
  creatorDepartment: string;
  targetDepartment: "IT" | "HR" | "Finance" | "Admin";
  category: string;
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  replies?: HRMSTicketReply[];
}

// ─── PERMANENT SEED TENANTS ───────────────────────────────────────────────────
// These tenants are ALWAYS guaranteed to exist regardless of browser clear.
// Add your real clients here. They are seeded from code — not from localStorage.
// ─────────────────────────────────────────────────────────────────────────────
const PERMANENT_SEED_TENANTS: Tenant[] = [];


export interface SaaSInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  paidAmount?: number;
  remainingBalance?: number;
  currency?: "PKR" | "USD" | string;
  date: string;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue" | "Partial" | "Pending";
  plan: string;
  paymentMethod?: string;
  notes?: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  businessName: string;
  subject: string;
  description: string;
  category: "Billing" | "Technical" | "POS Terminal" | "Inventory" | "Suggestion" | "Feature Request" | "Problem";
  priority: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  date: string;
  replies: Array<{
    sender: "Client" | "Admin";
    message: string;
    date: string;
  }>;
  ticketNumber?: string;
  softwareRequestData?: {
    name: string;
    businessNature: string;
    features: string;
    requestedAt: string;
  };
}

export interface ProductVariant {
  name: string;
  price: number;
}

export interface ProductAddon {
  name: string;
  price: number;
}

export interface RecipeIngredient {
  productId: string;
  qty: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  status: "Present" | "Absent" | "Half-Day" | "Late";
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  month: string; // e.g. "2026-07"
  baseSalary: number;
  deductions: number;
  bonuses: number;
  netPay: number;
  status: "Paid" | "Pending";
  paidAt?: string;
}

export interface StockTransfer {
  id: string;
  fromBranch: string;
  toBranch: string;
  date: string;
  items: Array<{ productId: string; qty: number; productName: string }>;
  status: "In-Transit" | "Completed" | "Cancelled";
  receivedAt?: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  brand: string;
  costPrice: number;
  salePrice: number;
  wholesalePrice: number;
  taxRate: number;
  stock: number;
  minStock: number;
  unit: string;
  variant?: string;
  expiryDate?: string;
  batchNumber?: string;
  image?: string;
  variants?: ProductVariant[];
  addons?: ProductAddon[];
  ingredients?: RecipeIngredient[];
}

// FIFO Batch Tracking
export interface ProductBatch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate?: string;
  purchasedAt: string;      // ISO — FIFO sort key (oldest first)
  costPrice: number;
  salePrice: number;        // sale price locked at time of purchase
  initialQty: number;
  remainingQty: number;
}

export interface BatchConsumption {
  batchId: string;
  batchNumber: string;
  qty: number;
  costPrice: number;
  salePrice: number;        // sale price from that specific batch
  expiryDate?: string;
}

export interface Customer {
  id: string;
  customerNo?: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  cnic?: string;
  loyaltyPoints: number;
  creditBalance: number;
  walletBalance?: number;
  dueRecoveryHistory: Array<{ date: string; amount: number }>;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  mobile: string;
  email: string;
  dueAmount: number;
  purchaseHistory: Array<{ date: string; orderId: string; total: number }>;
}

export interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  items: Array<{
    productId: string;
    productName: string;
    costPrice: number;
    qty: number;
    subtotal: number;
  }>;
  total: number;
  status: "Pending" | "Received";
}

export interface SaleTransaction {
  id: string;
  receiptNumber: string;
  date: string;
  branch: string;
  cashierName: string;
  counterId?: string;
  customerName: string;
  customerNo?: string;
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    qty: number;
    subtotal: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  isCredit?: boolean;
  status: "Completed" | "Returned" | "Refunded" | "Dues_Recovery";
  notes?: string;
  redeemLoyalty?: boolean;
  loyaltyPointsEarned?: number;
  loyaltyPointsBalance?: number;
  splitPayments?: Record<string, number>;
  receivedAmount?: number;
  changeReturned?: number;
  previousCreditBalance?: number;
  totalCreditBalance?: number;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface Employee {
  id: string;
  name: string;
  role: "Owner" | "Manager" | "Cashier" | "Accountant" | "Warehouse Staff" | "HR";
  email: string;
  password: string;
  salary: number;
  phone?: string;
  joinDate?: string;
  status: "Active" | "Inactive";
  attendance: { [date: string]: "Present" | "Absent" | "Late" | "Leave" };
  permissions: string[];
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  guestsCount: number;
  bookingTime: string;
  notes?: string;
  status: "Confirmed" | "Arrived" | "Cancelled";
}

export interface BusinessSettings {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  taxNumber: string;
  logoUrl?: string;
  receiptFooter: string;
  defaultTaxRate: number;
  defaultCurrency: string;
  lowStockAlert: number;
  receiptHeader: string;
  allowCreditSales: boolean;
  loyaltyPointsPerAmount: number;
  loyaltyRedeemThreshold: number;
  loyaltyRedeemValue: number;
}

export interface TableBillItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  taxRate: number;
  subtotal: number;
  notes?: string;
  isDispatched?: boolean;
  selectedVariant?: string;
  selectedAddons?: string[];
}

export interface RestaurantTable {
  id: string;
  number: string;
  capacity: number;
  status: "Free" | "Occupied" | "Reserved";
  activeOrderId?: string;
  waiterName?: string;
  currentBill?: TableBillItem[];
  hall?: string;
  vip?: boolean;
  guests?: number;
  // Delivery & Takeaway fields
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  riderName?: string;
}

export interface KitchenTicket {
  id: string;
  tableNumber: string;
  orderTime: string;
  status: "Pending" | "Cooking" | "Ready";
  section?: string;
  items: Array<{ name: string; qty: number; notes?: string; variant?: string; addons?: string[] }>;
}

export interface AccountLedger {
  code: string;
  name: string;
  type: "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";
  balance: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debits: Array<{ accountCode: string; amount: number }>;
  credits: Array<{ accountCode: string; amount: number }>;
}

interface GlobalContextType {
  // SaaS Admin State
  demoRequests: DemoRequest[];
  tenants: Tenant[];
  saasInvoices: SaaSInvoice[];
  supportTickets: SupportTicket[];
  addDemoRequest: (req: Omit<DemoRequest, "id" | "ticketNumber" | "date" | "status" | "messages">) => string;
  updateDemoStatus: (id: string, status: DemoRequest["status"]) => void;
  approveDemoRequest: (id: string, trialDays: number, customDealAmount?: number, customCurrency?: "PKR" | "USD") => void;
  convertDemoToActivePaid: (id: string, options: {
    amount: number;
    currency: "PKR" | "USD";
    plan: string;
    billingCycle: "monthly" | "yearly";
    durationDays: number;
    paymentMethod: string;
    notes?: string;
  }) => void;
  rejectDemoRequest: (id: string, reason: string) => void;
  addDemoMessage: (ticketNumber: string, message: string, sender: "Client" | "Admin") => void;
  deleteDemoRequest: (id: string) => void;
  registerTenant: (tenant: Omit<Tenant, "id" | "signupDate" | "status" | "usersCount" | "monthlyRevenue" | "branches"> & { id?: string; customDealAmount?: number; customCurrency?: "PKR" | "USD" }) => string;
  updateTenantStatus: (id: string, status: Tenant["status"]) => void;
  deleteTenant: (id: string) => Promise<void>;
  setTenantCurrency: (id: string, currency: string) => void;
  addTenantCredential: (tenantId: string, cred: Omit<TenantPreset, "id">) => void;
  updateTenantCredential: (tenantId: string, credId: string, updated: Partial<Omit<TenantPreset, "id">>) => void;
  deleteTenantCredential: (tenantId: string, credId: string) => void;
  addSaasInvoice: (inv: Omit<SaaSInvoice, "id" | "date" | "dueDate">) => void;
  updateSaasInvoiceStatus: (id: string, status: "Paid" | "Unpaid") => void;
  deleteSaasInvoice: (id: string) => void;
  updateSaasInvoice: (id: string, updates: Partial<SaaSInvoice>) => void;
  replyToTicket: (ticketId: string, message: string, sender: "Client" | "Admin") => void;
  createNewTicket: (subject: string, description: string, category: SupportTicket["category"], priority: SupportTicket["priority"]) => SupportTicket;
  createPublicSupportTicket: (name: string, email: string, subject: string, message: string) => SupportTicket;
  updateSupportTicket: (ticketId: string, updates: Partial<SupportTicket>) => void;
  deleteSupportTicket: (ticketId: string) => void;
  deleteSupportTicketReply: (ticketId: string, replyIndex: number) => void;

  // Authentication State
  currentUser: {
    name: string;
    role: "Owner" | "Manager" | "Cashier" | "Accountant" | "Warehouse Staff" | "SuperAdmin";
    email: string;
    businessName?: string;
    tenantId?: string;
    assignedSoftware?: "POS" | "HRMS";
  } | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<any>>;
  localReceiptsDirHandle: any;
  setLocalReceiptsDirHandle: React.Dispatch<React.SetStateAction<any>>;
  logout: () => void;

  // Active Client Tenant Databases
  currentBranch: string;
  setCurrentBranch: (branch: string) => void;
  products: Product[];
  addProduct: (prod: Omit<Product, "id">) => void;
  addProductsBulk: (prods: Omit<Product, "id">[]) => void;
  mergeProductsBulk: (
    newProds: Omit<Product, "id">[],
    updates: { id: string; stock: number; costPrice: number; salePrice: number; additionalStock: number }[]
  ) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProductsBulk: (ids: string[]) => void;
  
  customers: Customer[];
  addCustomer: (cust: Omit<Customer, "id" | "loyaltyPoints" | "creditBalance" | "dueRecoveryHistory">) => void;
  updateCustomer: (id: string, cust: Partial<Omit<Customer, "id" | "loyaltyPoints" | "creditBalance" | "dueRecoveryHistory">>) => void;
  deleteCustomer: (id: string) => void;
  updateCustomerBalance: (id: string, dueAmountChange: number) => void;
  updateCustomerWalletBalance: (id: string, amountChange: number) => void;
  settleDuesWithWallet: (id: string, amountToSettle?: number) => SaleTransaction | undefined;
  recordDueRecovery: (id: string, amount: number, paymentMethod?: string, counterId?: string) => SaleTransaction | undefined;

  suppliers: Supplier[];
  addSupplier: (supp: Omit<Supplier, "id" | "dueAmount" | "purchaseHistory">) => void;
  updateSupplier: (id: string, supp: Partial<Omit<Supplier, "id" | "dueAmount" | "purchaseHistory">>) => void;
  deleteSupplier: (id: string) => void;
  recordSupplierPayment: (id: string, amount: number) => void;

  purchaseOrders: PurchaseOrder[];
  createPurchaseOrder: (po: Omit<PurchaseOrder, "id" | "date" | "status">) => void;
  receiveGoods: (id: string, batchData?: Array<{ productId: string; batchNumber: string; expiryDate?: string; salePrice: number }>) => void;

  // FIFO Batch Management
  batches: ProductBatch[];
  addBatch: (batch: Omit<ProductBatch, "id">) => void;
  previewFIFO: (productId: string, qty: number) => BatchConsumption[];
  getProductBatches: (productId: string) => ProductBatch[];

  posCounters: POSCounter[];
  assignCounterCashier: (counterId: string, cashierName: string, openingFloat: number) => void;
  collectCounterCash: (counterId: string, collectedAmount: number) => void;
  closeCounterSession: (counterId: string, closingCash: number) => void;
  posShifts: POSShift[];
  startPOSShift: (counterId: string, openingFloat: number) => POSShift;
  closePOSShift: (shiftId: string, actualClosingCash: number, notes?: string) => void;
  sales: SaleTransaction[];
  addSale: (sale: Omit<SaleTransaction, "id" | "receiptNumber" | "date">) => SaleTransaction;
  
  expenses: Expense[];
  addExpense: (exp: Omit<Expense, "id" | "date">) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, "id" | "attendance">) => void;
  updateEmployee: (id: string, emp: Partial<Omit<Employee, "id" | "attendance">>) => void;
  deleteEmployee: (id: string) => void;
  markAttendance: (empId: string, date: string, status: "Present" | "Absent" | "Late" | "Leave") => void;
  processSalary: (empId: string, amount: number) => void;

  attendanceRecords: AttendanceRecord[];
  addAttendanceRecord: (record: Omit<AttendanceRecord, "id">) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;

  payrollRecords: PayrollRecord[];
  addPayrollRecord: (record: Omit<PayrollRecord, "id">) => void;
  updatePayrollRecord: (id: string, updates: Partial<PayrollRecord>) => void;

  stockTransfers: StockTransfer[];
  createStockTransfer: (transfer: Omit<StockTransfer, "id">) => void;
  updateStockTransfer: (id: string, updates: Partial<StockTransfer>) => void;

  // Business Settings
  businessSettings: BusinessSettings;
  updateBusinessSettings: (s: Partial<BusinessSettings>) => void;

  // Restaurant State
  tables: RestaurantTable[];
  addTable: (table: Omit<RestaurantTable, "id" | "status">) => string;
  updateTableBase: (id: string, updates: Partial<RestaurantTable>) => void;
  deleteTable: (id: string) => void;
  kitchenTickets: KitchenTicket[];
  updateTableStatus: (id: string, status: RestaurantTable["status"], activeOrderId?: string, waiter?: string) => void;
  updateTableBill: (id: string, bill: TableBillItem[]) => void;
  dispatchKitchenTicket: (tableNumber: string, items: Array<{ name: string; qty: number; notes?: string }>) => void;
  completeKitchenTicket: (id: string) => void;
  clearKitchenTicket: (id: string) => void;
  clearTableKitchenTickets: (tableNumber: string) => void;

  // Accounting State
  accounts: AccountLedger[];
  journalEntries: JournalEntry[];
  addJournalEntry: (desc: string, debits: Array<{ accountCode: string; amount: number }>, credits: Array<{ accountCode: string; amount: number }>) => void;

  // Global Configs
  currencySymbol: string;
  setCurrencySymbol: (curr: string) => void;
  salesTaxRate: number;
  setSalesTaxRate: (rate: number) => void;
  isOffline: boolean;

  isOnlineOnlyBlocked: boolean;

  // HRMS Dedicated System State
  hrEmployees: HREmployee[];
  hrAttendance: HRAttendance[];
  hrLeaves: HRLeave[];
  hrPayrolls: HRPayrollBatch[];
  hrJobs: HRJobOpening[];
  hrAppraisals: HRAppraisal[];
  hrDepartments: HRDepartment[];
  hrDesignations: HRDesignation[];
  hrShifts: HRShift[];
  hrCandidates: HRCandidate[];
  hrLoans: HRLoan[];

  addHREmployee: (emp: Omit<HREmployee, "id">) => void;
  updateHREmployee: (id: string, emp: Partial<HREmployee>) => void;
  deleteHREmployee: (id: string) => void;
  recordHRAttendance: (attendance: Omit<HRAttendance, "id">) => void;
  updateHRAttendance: (id: string, updates: Partial<HRAttendance>) => void;
  submitHRLeave: (leave: Omit<HRLeave, "id" | "status" | "appliedOn">) => void;
  updateHRLeaveStatus: (id: string, status: HRLeave["status"], approvedBy?: string) => void;
  processHRPayroll: (month: string, items: HRPayrollItem[]) => HRPayrollBatch;
  addHRJobOpening: (job: Omit<HRJobOpening, "id" | "applicantsCount" | "postedDate">) => void;
  updateHRJobOpening: (id: string, updates: Partial<HRJobOpening>) => void;
  addHRAppraisal: (appraisal: Omit<HRAppraisal, "id" | "date">) => void;

  // HR Loans & Advances Handlers
  applyHRLoan: (loan: Omit<HRLoan, "id" | "loanCode" | "totalRepaid" | "remainingBalance" | "repayments">) => HRLoan;
  updateHRLoanStatus: (id: string, status: HRLoan["status"], approvedBy?: string) => void;
  recordLoanManualRepayment: (loanId: string, amount: number, notes?: string) => void;
  deleteHRLoan: (id: string) => void;

  // HRMS Settings & Recruitment Handlers
  addHRDepartment: (dept: Omit<HRDepartment, "id">) => void;
  updateHRDepartment: (id: string, updates: Partial<HRDepartment>) => void;
  deleteHRDepartment: (id: string) => void;

  addHRDesignation: (desg: Omit<HRDesignation, "id">) => void;
  updateHRDesignation: (id: string, updates: Partial<HRDesignation>) => void;
  deleteHRDesignation: (id: string) => void;

  addHRShift: (shift: Omit<HRShift, "id">) => void;
  updateHRShift: (id: string, updates: Partial<HRShift>) => void;
  deleteHRShift: (id: string) => void;

  addHRCandidate: (cand: Omit<HRCandidate, "id" | "appliedDate">) => void;
  updateHRCandidate: (id: string, updates: Partial<HRCandidate>) => void;
  deleteHRCandidate: (id: string) => void;
  provisionITCredentials: (candidateId: string, workEmail: string, tempPassword: string, customEmployeeCode?: string) => void;
  assignITTaskToSubordinate: (candidateId: string, subordinateEmpId: string, subordinateName: string) => void;
  confirmFinanceAndActivateEmployee: (candidateId: string) => void;
  provisionExecutiveDirectly: (execData: {
    name: string;
    email: string;
    phone: string;
    cnic?: string;
    department: string;
    subDepartment?: string;
    designation: string;
    basicSalary: number;
    bankName?: string;
    accountNumber?: string;
    tempPassword?: string;
  }) => HREmployee;
  clearAllHRMSData: () => void;

  // HRMS Internal Helpdesk Ticketing System
  hrmsTickets: HRMSTicket[];
  createHRMSTicket: (ticket: Omit<HRMSTicket, "id" | "ticketNumber" | "createdAt" | "updatedAt" | "replies">) => void;
  updateHRMSTicket: (id: string, updates: Partial<HRMSTicket>) => void;
  updateHRMSTicketStatus: (id: string, status: HRMSTicket["status"], assignedTo?: string) => void;
  deleteHRMSTicket: (id: string) => void;
  addHRMSTicketReply: (ticketId: string, message: string) => void;
}

// ─── HRMS DEMO SEED DATA ──────────────────────────────────────────────────────
export function generateNextEmployeeCode(businessName: string, count: number): string {
  if (!businessName) return `EMP-${(count + 1).toString().padStart(4, "0")}`;
  const words = businessName.trim().split(/\s+/).filter(Boolean);
  let prefix = "";
  if (words.length === 1) {
    prefix = words[0].substring(0, 3).toUpperCase();
  } else {
    prefix = words.map((w) => w[0]).join("").toUpperCase();
  }
  const cleanPrefix = prefix.replace(/[^A-Z]/g, "") || "EMP";
  const numStr = (count + 1).toString().padStart(4, "0");
  return `${cleanPrefix}-${numStr}`;
}

export function getNextGlobalTenantSeq(existingTenants: { id?: string }[] = []): number {
  let maxSeq = 0;
  for (const t of existingTenants) {
    if (!t?.id) continue;
    const match = t.id.match(/-(\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num < 1000 && num > maxSeq) {
        maxSeq = num;
      }
    }
  }
  return maxSeq + 1;
}

export function generateTenantId(businessName: string, existingTenants: { id?: string; businessName?: string }[] = []): string {
  const cleanName = (businessName || "").replace(/[^a-zA-Z0-9\s]/g, " ").trim();
  const words = cleanName.split(/\s+/).filter(Boolean);
  let prefix = "";

  if (words.length >= 2) {
    prefix = words.map(w => w[0]).join("").toUpperCase();
  } else if (words.length === 1) {
    prefix = words[0].substring(0, Math.min(3, words[0].length)).toUpperCase();
  }

  prefix = prefix.replace(/[^A-Z0-9]/g, "") || "TEN";
  if (prefix.length > 5) {
    prefix = prefix.substring(0, 5);
  }

  let nextSeq = getNextGlobalTenantSeq(existingTenants);
  const usedNumbers = new Set<number>();
  for (const t of existingTenants) {
    if (!t?.id) continue;
    const m = t.id.match(/-(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (!isNaN(n)) usedNumbers.add(n);
    }
  }

  while (usedNumbers.has(nextSeq)) {
    nextSeq++;
  }

  return `${prefix}-${nextSeq.toString().padStart(3, "0")}`;
}

export const generateActiveTenantId = generateTenantId;

export function calculateDesignationRankAndGrade(title: string): { rank: number; grade: string } {
  const t = title.toLowerCase().trim();
  if (t.includes("director") && !t.includes("assistant") && !t.includes("asst")) return { rank: 1, grade: "EXEC-1" };
  if (t.includes("assistant director") || t.includes("asst director")) return { rank: 2, grade: "EXEC-2" };
  if (t.includes("manager") && !t.includes("assistant") && !t.includes("asst")) return { rank: 3, grade: "M-1" };
  if (t.includes("assistant manager") || t.includes("asst manager")) return { rank: 4, grade: "M-2" };
  if (t.includes("supervisor") && !t.includes("assistant") && !t.includes("asst")) return { rank: 5, grade: "SUP-1" };
  if (t.includes("assistant supervisor") || t.includes("asst supervisor")) return { rank: 6, grade: "SUP-2" };
  if (t.includes("team lead") || t.includes("lead") || t.includes("head")) return { rank: 7, grade: "TL-1" };
  if (t.includes("senior") || t.includes("officer") || t.includes("specialist")) return { rank: 8, grade: "E-1" };
  if (t.includes("intern")) return { rank: 10, grade: "INT-1" };
  return { rank: 9, grade: "E-2" };
}

export function getHeadOfDepartment(deptName: string, employees: HREmployee[], designations: HRDesignation[]): string {
  const deptEmps = employees.filter((e) => e.department === deptName && e.status === "Active");
  if (deptEmps.length === 0) return "Unassigned";

  // Rank each employee based on designation
  const ranked = deptEmps.map((emp) => {
    const desg = designations.find((d) => d.title.toLowerCase() === emp.designation.toLowerCase());
    const rankInfo = desg && desg.rank ? { rank: desg.rank, grade: desg.grade } : calculateDesignationRankAndGrade(emp.designation);
    return {
      emp,
      rank: rankInfo.rank
    };
  });

  // Sort by rank ascending (1 = highest rank, e.g. Director/Manager)
  ranked.sort((a, b) => a.rank - b.rank);
  const top = ranked[0];
  return `${top.emp.name} (${top.emp.designation})`;
}

const SEED_HR_DEPARTMENTS: HRDepartment[] = [
  { id: "DEPT-1", name: "Human Resources", code: "HR", headOfDepartment: "Ayesha Malik", description: "Talent acquisition, employee welfare, payroll, and compliance.", subDepartments: ["Talent Acquisition & ATS", "Employee Relations & Payroll", "Compliance & HR Ops"] },
  { id: "DEPT-2", name: "Accounts & Finance", code: "FIN", headOfDepartment: "Muhammad Bilal", description: "Financial ledgers, salary disbursements, and tax reporting.", subDepartments: ["Accounts Payable (AP)", "Accounts Receivable (AR)", "Taxation & Audit"] },
  { id: "DEPT-3", name: "Operation Department", code: "OPD", headOfDepartment: "Mian Talal", description: "Core operational workflows, medical billing, and production units.", subDepartments: ["Accounts Receivable (AR)", "Medical Billing", "Provider Credentialing", "Prior Authorization", "Production Unit", "Spinning Unit"] },
  { id: "DEPT-4", name: "IT & Software Operations", code: "IT", headOfDepartment: "Mian Talal", description: "System infrastructure, employee credentials, and software development.", subDepartments: ["Software Engineering", "Cloud Infrastructure & DevOps", "IT Support"] },
  { id: "DEPT-5", name: "Sales & Retail", code: "SLS", headOfDepartment: "Waqas Ali", description: "Store counters, checkout lanes, and customer sales.", subDepartments: ["Retail Counters", "Corporate B2B Sales", "E-Commerce Ops"] },
  { id: "DEPT-6", name: "Inventory & Warehouse", code: "WH", headOfDepartment: "Zainab Fatima", description: "Stock transfers, supplier receipts, and batch management.", subDepartments: ["Inbound Receiving", "Outbound Dispatch", "Stock Audit"] }
];

const SEED_HR_DESIGNATIONS: HRDesignation[] = [
  { id: "DESG-1", title: "Director", rank: 1, grade: "EXEC-1" },
  { id: "DESG-2", title: "Assistant Director", rank: 2, grade: "EXEC-2" },
  { id: "DESG-3", title: "Manager", rank: 3, grade: "M-1" },
  { id: "DESG-4", title: "Assistant Manager", rank: 4, grade: "M-2" },
  { id: "DESG-5", title: "Supervisor", rank: 5, grade: "SUP-1" },
  { id: "DESG-6", title: "Assistant Supervisor", rank: 6, grade: "SUP-2" },
  { id: "DESG-7", title: "Team Lead", rank: 7, grade: "TL-1" },
  { id: "DESG-8", title: "Senior Officer / Specialist", rank: 8, grade: "E-1" },
  { id: "DESG-9", title: "Employee / Associate", rank: 9, grade: "E-2" },
  { id: "DESG-10", title: "Intern", rank: 10, grade: "INT-1" }
];

const SEED_HR_SHIFTS: HRShift[] = [
  { id: "SHF-1", name: "Morning General Shift", type: "Fixed", startTime: "09:00 AM", endTime: "05:00 PM", requiredHours: 8, graceMinutes: 15, workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "SHF-2", name: "Evening Shift", type: "Fixed", startTime: "02:00 PM", endTime: "10:00 PM", requiredHours: 8, graceMinutes: 15, workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "SHF-3", name: "Night Shift", type: "Fixed", startTime: "10:00 PM", endTime: "06:00 AM", requiredHours: 8, graceMinutes: 15, workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] },
  { id: "SHF-4", name: "Flexible Work Shift", type: "Flexible", startTime: "Flexible Check-In", endTime: "8 Hours After Check-In", requiredHours: 8, graceMinutes: 30, workDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }
];

const SEED_HR_CANDIDATES: HRCandidate[] = [];
const SEED_HR_EMPLOYEES: HREmployee[] = [];
const SEED_HR_ATTENDANCE: HRAttendance[] = [];
const SEED_HR_LEAVES: HRLeave[] = [];
const SEED_HR_PAYROLLS: HRPayrollBatch[] = [];
const SEED_HR_JOBS: HRJobOpening[] = [];
const SEED_HR_APPRAISALS: HRAppraisal[] = [];
const SEED_HR_LOANS: HRLoan[] = [];

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // --- Supabase Realtime & Offline-First Sync Engine ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mergeCollectionsData = (localArr: any[], cloudArr: any[]) => {
      if (!Array.isArray(localArr)) localArr = [];
      if (!Array.isArray(cloudArr)) cloudArr = [];

      if (localArr.length === 0) return cloudArr;
      if (cloudArr.length === 0) return localArr;

      const map = new Map<string, any>();

      // Cloud items first
      cloudArr.forEach(item => {
        if (!item) return;
        const key = item.id || item.receiptNumber || item.code || item.customerNo || (typeof item === 'object' ? JSON.stringify(item) : String(item));
        map.set(String(key), item);
      });

      // Local items override / append unique entries
      localArr.forEach(item => {
        if (!item) return;
        const key = item.id || item.receiptNumber || item.code || item.customerNo || (typeof item === 'object' ? JSON.stringify(item) : String(item));
        const keyStr = String(key);
        if (!map.has(keyStr)) {
          map.set(keyStr, item);
        } else {
          map.set(keyStr, { ...map.get(keyStr), ...item });
        }
      });

      return Array.from(map.values());
    };

    const originalSetItem = window.localStorage.setItem;

    window.localStorage.setItem = function(key: string, value: string) {
      originalSetItem.apply(this, arguments as any);

      if (!key.startsWith("unipos_")) return;
      if (key === "unipos_current_user") return;

      try {
        const globalKeys = ["unipos_tenants", "unipos_demos", "unipos_invoices", "unipos_tickets", "unipos_blacklisted_tenants"];
        const isGlobalKey = globalKeys.includes(key);

        let parsedData: any;
        try {
          parsedData = JSON.parse(value);
        } catch {
          parsedData = value;
        }

        if (!isGlobalKey) {
          const lastUnderscore = key.lastIndexOf('_');
          if (lastUnderscore === -1) return;
          const possibleTenantId = key.substring(lastUnderscore + 1);
          const collection = key.substring(0, lastUnderscore);

          // Check if tenant has offline-only connectivity plan
          const localTenantsRaw = localStorage.getItem("unipos_tenants");
          if (localTenantsRaw) {
            try {
              const parsedTenants: Tenant[] = JSON.parse(localTenantsRaw);
              const targetTenant = parsedTenants.find(t => t.id === possibleTenantId);
              if (targetTenant?.connectivityPlan === "offline-only") return;
            } catch {}
          }

          queueSyncKey(key).then(async () => {
            if (!navigator.onLine) return;

            // SAFETY GUARD: Never overwrite non-empty cloud collections with an empty array []
            if (Array.isArray(parsedData) && parsedData.length === 0) {
              const { data: existing } = await supabase
                .from('unipos_collections')
                .select('data')
                .eq('tenant_id', possibleTenantId)
                .eq('collection', collection)
                .maybeSingle();

              if (existing && Array.isArray(existing.data) && existing.data.length > 0) {
                console.warn(`[SAFETY GUARD] Blocked empty array overwrite for ${collection} on tenant ${possibleTenantId}`);
                return;
              }
            }

            const { error } = await supabase.from('unipos_collections').upsert({
              tenant_id: possibleTenantId,
              collection: collection,
              item_id: 'all',
              data: parsedData,
              updated_at: new Date().toISOString()
            });

            if (!error) dequeueItem(STORE_SYNC_KEYS, key);
          });
        } else {
          // Global key (e.g. unipos_tenants)
          queueSyncKey(key).then(async () => {
            if (!navigator.onLine) return;
            const { error } = await supabase.from('unipos_global').upsert({
              key: key,
              value: parsedData,
              updated_at: new Date().toISOString()
            });
            if (!error) dequeueItem(STORE_SYNC_KEYS, key);
          });
        }
      } catch (e) {
        queueSyncKey(key);
      }
    };

    // Pull down & merge data from Supabase Cloud
    const syncFromSupabase = async () => {
      let changed = false;
      try {
        // 0. Receipt images queue
        const pendingReceipts = await getQueuedItems(STORE_RECEIPTS);
        for (const receipt of pendingReceipts) {
          const { error } = await supabase.storage.from('receipts').upload(receipt.filePath, receipt.blob, {
            contentType: 'image/jpeg',
            upsert: true
          });
          if (!error) await dequeueItem(STORE_RECEIPTS, receipt.id);
        }

        // 1. Process local offline queue
        const pendingSyncs = await getQueuedItems(STORE_SYNC_KEYS);
        const pendingKeySet = new Set(pendingSyncs.map(i => i.key));

        for (const item of pendingSyncs) {
          const val = window.localStorage.getItem(item.key);
          if (val) {
            window.localStorage.setItem(item.key, val);
          }
          await dequeueItem(STORE_SYNC_KEYS, item.key);
        }

        // 2. Global Data (Tenants, Demos, etc.)
        const { data: globalData } = await supabase.from('unipos_global').select('*');
        if (globalData) {
          let blacklisted: string[] = [];
          try {
            blacklisted = JSON.parse(window.localStorage.getItem("unipos_blacklisted_tenants") || "[]");
          } catch {}

          const tenantsRow = globalData.find(row => row.key === 'unipos_tenants');
          if (tenantsRow && Array.isArray(tenantsRow.value)) {
            const cleanCloud = tenantsRow.value.filter((t: any) => !blacklisted.includes(t.id));
            const localTenants = window.localStorage.getItem('unipos_tenants');
            let localParsed: any[] = [];
            try { localParsed = localTenants ? JSON.parse(localTenants) : []; } catch {}

            const mergedTenants = mergeCollectionsData(localParsed, cleanCloud);
            const mergedStr = JSON.stringify(mergedTenants);
            if (mergedStr !== localTenants) {
              originalSetItem.call(window.localStorage, 'unipos_tenants', mergedStr);
              changed = true;
            }
          }

          globalData.forEach(row => {
            if (row.key === 'unipos_tenants') return;
            if (pendingKeySet.has(row.key)) return;
            const current = window.localStorage.getItem(row.key);
            const incoming = JSON.stringify(row.value);

            if (current) {
              try {
                const localParsed = JSON.parse(current);
                const incomingParsed = row.value;
                if (Array.isArray(localParsed) && Array.isArray(incomingParsed)) {
                  if (incomingParsed.length < localParsed.length) return;
                }
              } catch(e) {}
            }

            if (current !== incoming) {
              originalSetItem.call(window.localStorage, row.key, incoming);
              changed = true;
            }
          });
        }

        // 3. Tenant Collections Data
        const savedUser = window.localStorage.getItem("unipos_current_user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user?.tenantId) {
            const { data: tenantData } = await supabase
              .from('unipos_collections')
              .select('*')
              .eq('tenant_id', user.tenantId);

            if (tenantData) {
              for (const row of tenantData) {
                const localKey = `${row.collection}_${row.tenant_id}`;
                if (pendingKeySet.has(localKey)) continue;

                const current = window.localStorage.getItem(localKey);
                let localParsed: any = null;
                if (current) {
                  try { localParsed = JSON.parse(current); } catch {}
                }

                const cloudParsed = row.data;

                if (Array.isArray(cloudParsed)) {
                  const merged = mergeCollectionsData(localParsed || [], cloudParsed);
                  const mergedStr = JSON.stringify(merged);
                  if (mergedStr !== current) {
                    originalSetItem.call(window.localStorage, localKey, mergedStr);
                    changed = true;

                    // If local merged array contains items that Cloud did not have, push back to Cloud
                    if (merged.length > cloudParsed.length) {
                      supabase.from('unipos_collections').upsert({
                        tenant_id: row.tenant_id,
                        collection: row.collection,
                        item_id: 'all',
                        data: merged,
                        updated_at: new Date().toISOString()
                      });
                    }
                  }
                } else if (cloudParsed && typeof cloudParsed === 'object') {
                  const incomingStr = JSON.stringify(cloudParsed);
                  if (incomingStr !== current) {
                    originalSetItem.call(window.localStorage, localKey, incomingStr);
                    changed = true;
                  }
                }
              }
            }
          }
        }

        if (changed) {
          window.dispatchEvent(new Event('unipos_sync_updated'));
        }
      } catch (e) {
        console.error("Failed to fetch from Supabase:", e);
      }
    };

    syncFromSupabase();

    // Supabase Realtime Channel
    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "unipos_global" }, () => syncFromSupabase())
      .on("postgres_changes", { event: "*", schema: "public", table: "unipos_collections" }, () => syncFromSupabase())
      .subscribe();

    // Fast 3-second heartbeat polling fallback for rock-solid mobile sync
    const pollInterval = setInterval(() => {
      syncFromSupabase();
    }, 3000);

    const handleFocus = () => syncFromSupabase();
    window.addEventListener('online', syncFromSupabase);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    return () => {
      window.localStorage.setItem = originalSetItem;
      window.removeEventListener('online', syncFromSupabase);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  // SaaS Admin States
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [saasInvoices, setSaasInvoices] = useState<SaaSInvoice[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  
  // HRMS Dedicated System State
  const [hrEmployees, setHrEmployees] = useState<HREmployee[]>([]);
  const [hrAttendance, setHrAttendance] = useState<HRAttendance[]>([]);
  const [hrLeaves, setHrLeaves] = useState<HRLeave[]>([]);
  const [hrPayrolls, setHrPayrolls] = useState<HRPayrollBatch[]>([]);
  const [hrJobs, setHrJobs] = useState<HRJobOpening[]>([]);
  const [hrAppraisals, setHrAppraisals] = useState<HRAppraisal[]>([]);
  const [hrDepartments, setHrDepartments] = useState<HRDepartment[]>([]);
  const [hrDesignations, setHrDesignations] = useState<HRDesignation[]>([]);
  const [hrShifts, setHrShifts] = useState<HRShift[]>([]);
  const [hrCandidates, setHrCandidates] = useState<HRCandidate[]>([]);
  const [hrLoans, setHrLoans] = useState<HRLoan[]>([]);

  // Authenticated State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localReceiptsDirHandle, setLocalReceiptsDirHandle] = useState<any>(null);

  const saveTenantData = (key: string, data: any) => {
    if (currentUser?.tenantId) {
      const fullKey = `${key}_${currentUser.tenantId}`;
      localStorage.setItem(fullKey, JSON.stringify(data));
      
      if (typeof window !== "undefined") {
        try {
          queueSyncKey(fullKey);
        } catch (e) {}

        if (navigator.onLine && supabase && currentUser.tenantId) {
          (async () => {
            try {
              const { error } = await supabase.from('unipos_collections').upsert({
                tenant_id: currentUser.tenantId,
                collection: key,
                item_id: 'all',
                data: data,
                updated_at: new Date().toISOString()
              });
              if (!error) await dequeueItem(STORE_SYNC_KEYS, fullKey);
            } catch (err) {}
          })();
        }
      }
    }
  };

  // ─── STRICT TENANT ISOLATION ───────────────────────────────────────────────
  // ONLY reads data for the exact tenant. No cross-tenant fallback scanning.
  // This prevents data leakage between tenants.
  const getTenantData = (key: string, tenantId: string) => {
    if (!tenantId) return null;
    const saved = localStorage.getItem(`${key}_${tenantId}`);
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      if (!Array.isArray(parsed) && parsed && Object.keys(parsed).length > 0) return parsed;
    } catch (e) {}
    return null;
  };

  // Keep alias for any remaining references
  const getTenantDataWithFallback = getTenantData;


  // Client Tenant States
  const [currentBranch, setCurrentBranch] = useState("Main Branch");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);  // FIFO batch ledger
  const [posCounters, setPosCounters] = useState<POSCounter[]>([
    {
      id: "counter-1",
      name: "Main Counter",
      assignedCashierName: "Mian Talal (Owner / Active User)",
      assignedCashierEmail: "owner@unipos.com",
      openingFloat: 0,
      status: "Active",
      startedAt: new Date().toISOString()
    },
    {
      id: "counter-2",
      name: "Counter 2 (Secondary)",
      assignedCashierName: "Unassigned",
      assignedCashierEmail: "",
      openingFloat: 0,
      status: "Unassigned",
      startedAt: new Date().toISOString()
    },
    {
      id: "counter-3",
      name: "Counter 3 (Express)",
      assignedCashierName: "Unassigned",
      assignedCashierEmail: "",
      openingFloat: 0,
      status: "Unassigned",
      startedAt: new Date().toISOString()
    }
  ]);

  const [posShifts, setPosShifts] = useState<POSShift[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hrmsTickets, setHrmsTickets] = useState<HRMSTicket[]>([]);
  const [businessSettings, setBusinessSettings] = useState<BusinessSettings>({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    country: "Pakistan",
    taxNumber: "",
    receiptFooter: "Thank you for shopping! Powered by MT UniPOS.",
    receiptHeader: "MT UniPOS ERP",
    defaultTaxRate: 0,
    defaultCurrency: "PKR",
    lowStockAlert: 10,
    allowCreditSales: true,
    loyaltyPointsPerAmount: 50,
    loyaltyRedeemThreshold: 1000,
    loyaltyRedeemValue: 100,
  });

  // Restaurant states
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [kitchenTickets, setKitchenTickets] = useState<KitchenTicket[]>([]);

  // Accounting states
  const [accounts, setAccounts] = useState<AccountLedger[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);

  // Globally dynamic configurations
  const [currencySymbol, setCurrencySymbol] = useState("PKR");
  const [salesTaxRate, setSalesTaxRate] = useState(0);

  // Auto-restore persisted local receipts DirectoryHandle from IndexedDB across page reloads
  useEffect(() => {
    async function restoreDirHandle() {
      try {
        const { getDirHandleFromIDB } = await import("@/lib/dir-handle-db");
        const handle = await getDirHandleFromIDB();
        if (handle) {
          setLocalReceiptsDirHandle(handle);
        }
      } catch (e) {
        console.error("Error restoring dir handle from IDB:", e);
      }
    }
    restoreDirHandle();
  }, []);

  // Reactively sync active currencySymbol to logged-in tenant's configured defaultCurrency
  useEffect(() => {
    if (currentUser?.tenantId) {
      const tenant = tenants.find(t => t.id === currentUser.tenantId);
      if (tenant?.defaultCurrency) {
        setCurrencySymbol(tenant.defaultCurrency);
      }
    } else {
      setCurrencySymbol("PKR"); // Default all currency in PKR
    }
  }, [currentUser, tenants]);



  // Pre-seed mock data on first load
  useEffect(() => {
    const handleStateRefresh = () => {
      try {
        let blacklisted: string[] = [];
        try {
          blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
        } catch {}

        const d = localStorage.getItem("unipos_demos");
        if (d) setDemoRequests(JSON.parse(d));
        
        const t = localStorage.getItem("unipos_tenants");
        if (t) {
          const parsed: Tenant[] = JSON.parse(t);
          const clean = parsed.filter(item => !blacklisted.includes(item.id)).map(item => {
            const isHRMS = item.assignedSoftware === "HRMS" || (item.businessType && item.businessType.includes("HRMS"));
            return {
              ...item,
              assignedSoftware: isHRMS ? ("HRMS" as const) : (item.assignedSoftware || ("POS" as const))
            };
          });
          setTenants(clean);
        }
        
        const i = localStorage.getItem("unipos_saas_invoices");
        if (i) setSaasInvoices(JSON.parse(i));
        
        const st = localStorage.getItem("unipos_support_tickets");
        if (st) setSupportTickets(JSON.parse(st));

        // Re-hydrate active tenant React state from synced localStorage
        const savedUserRaw = localStorage.getItem("unipos_current_user");
        if (savedUserRaw) {
          const u = JSON.parse(savedUserRaw);
          if (u?.tenantId) {
            const tid = u.tenantId;
            const p = localStorage.getItem("unipos_products_" + tid);
            if (p) try { setProducts(JSON.parse(p)); } catch {}

            const c = localStorage.getItem("unipos_customers_" + tid);
            if (c) try { setCustomers(JSON.parse(c)); } catch {}

            const sup = localStorage.getItem("unipos_suppliers_" + tid);
            if (sup) try { setSuppliers(JSON.parse(sup)); } catch {}

            const po = localStorage.getItem("unipos_pos_" + tid);
            if (po) try { setPurchaseOrders(JSON.parse(po)); } catch {}

            const s = localStorage.getItem("unipos_sales_" + tid);
            if (s) try { setSales(JSON.parse(s)); } catch {}

            const exp = localStorage.getItem("unipos_expenses_" + tid);
            if (exp) try { setExpenses(JSON.parse(exp)); } catch {}

            const emp = localStorage.getItem("unipos_employees_" + tid);
            if (emp) try { setEmployees(JSON.parse(emp)); } catch {}

            const acc = localStorage.getItem("unipos_accounts_" + tid);
            if (acc) try { setAccounts(JSON.parse(acc)); } catch {}

            const set = localStorage.getItem("unipos_settings_" + tid);
            if (set) try { setBusinessSettings(JSON.parse(set)); } catch {}
          }
        }
      } catch(e) {}
    };

    window.addEventListener('unipos_sync_updated', handleStateRefresh);
    return () => window.removeEventListener('unipos_sync_updated', handleStateRefresh);
  }, []);

  useEffect(() => {
    // 1. Load SaaS Demo Requests
    const savedDemos = localStorage.getItem("unipos_demos");
    if (savedDemos) {
      // Migrate old records that may be missing ticketNumber or messages
      const parsed: DemoRequest[] = JSON.parse(savedDemos);
      const migrated = parsed.map((r, i) => ({
        ...r,
        ticketNumber: r.ticketNumber || `TKT-LEGACY-${String(i + 1).padStart(2, '0')}`,
        messages: r.messages || [],
      }));
      setDemoRequests(migrated);
      // Re-save migrated data so next load is clean
      if (migrated.some((r, i) => !parsed[i].ticketNumber || !parsed[i].messages)) {
        localStorage.setItem("unipos_demos", JSON.stringify(migrated));
      }
    } else {
      const initDemos: DemoRequest[] = [];
      localStorage.setItem("unipos_demos", JSON.stringify(initDemos));
      setDemoRequests(initDemos);
    }

    // 2. Load Tenants & Blacklist
    let blacklistedTenants: string[] = [];
    try {
      blacklistedTenants = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
    } catch {}

    const savedTenants = localStorage.getItem("unipos_tenants");
    let currentTenants: Tenant[] = [];
    if (savedTenants) {
      currentTenants = JSON.parse(savedTenants);
    }

    // Filter out blacklisted / deleted tenants strictly
    currentTenants = currentTenants.filter(t => !blacklistedTenants.includes(t.id));

    // ── PERMANENT SEED INJECTION (ONLY NON-DELETED) ──────────────────────────
    let seedChanged = false;
    for (const seed of PERMANENT_SEED_TENANTS) {
      if (blacklistedTenants.includes(seed.id)) continue; // NEVER RE-INJECT DELETED TENANTS!
      const alreadyExists = currentTenants.some(t => t.id === seed.id);
      if (!alreadyExists) {
        currentTenants = [seed, ...currentTenants];
        seedChanged = true;
      }
    }
    if (seedChanged || !savedTenants) {
      // FIX: Use originalSetItem to prevent wiping Supabase with empty array on first load race-condition!
      const originalSetItem = window.localStorage.setItem.name === 'setItem' ? window.localStorage.setItem : Object.getPrototypeOf(window.localStorage).setItem;
      
      if (typeof originalSetItem === 'function') {
        originalSetItem.call(window.localStorage, "unipos_tenants", JSON.stringify(currentTenants));
      }
    }
    // ─────────────────────────────────────────────────────────────────────────


    // MIGRATION: Ensure all Approved demos have a corresponding Tenant so they can log in (Skip duplicates)
    const savedDemosForMigration = localStorage.getItem("unipos_demos");
    if (savedDemosForMigration) {
      const parsedDemos: DemoRequest[] = JSON.parse(savedDemosForMigration);
      let tenantsChanged = false;
      parsedDemos.filter(d => d.status === "Approved").forEach(req => {
        const exists = currentTenants.some(t => 
          (t.email && t.email.trim().toLowerCase() === (req.demoEmail || req.email || "").trim().toLowerCase()) ||
          (t.businessName && t.businessName.trim().toLowerCase() === (req.businessName || "").trim().toLowerCase()) ||
          t.credentialPresets?.some(c => (c.email || "").trim().toLowerCase() === (req.demoEmail || "").trim().toLowerCase())
        );
        if (!exists && req.demoEmail && req.demoPassword) {
          tenantsChanged = true;
          const assignedSoftware = (req.assignedSoftware === "HRMS" || (req.businessType && req.businessType.includes("HRMS"))) ? "HRMS" : "POS";
          const newId = generateTenantId(req.businessName, currentTenants);
          currentTenants.push({
            id: newId,
            businessName: req.businessName,
            ownerName: req.name,
            email: req.demoEmail,
            phone: req.phone || "",
            businessType: req.businessType || (assignedSoftware === "HRMS" ? "HRMS Enterprise" : "Super Markets"),
            assignedSoftware,
            plan: "Professional",
            billingCycle: "monthly",
            signupDate: req.approvedAt?.split("T")[0] || new Date().toISOString().split("T")[0],
            status: "Trial",
            usersCount: 1,
            monthlyRevenue: 0,
            branches: ["Main Branch"],
            defaultCurrency: "PKR",
            credentialPresets: [
              { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Demo Owner", email: req.demoEmail, pass: req.demoPassword, role: "Owner" }
            ],
            isTrial: true,
            trialDays: req.trialDays || 14,
            trialEndsAt: req.trialEndsAt?.split("T")[0]
          });
        }
      });
      if (tenantsChanged) {
        localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));
      }
    }

    // Automatic Deduplication: Remove any duplicate tenants matching Email or Business Name
    const uniqueTenantsList: Tenant[] = [];
    const seenEmails = new Set<string>();
    const seenBusinesses = new Set<string>();

    for (const t of currentTenants) {
      const eKey = (t.email || "").trim().toLowerCase();
      const bKey = (t.businessName || "").trim().toLowerCase();

      const isDupEmail = eKey && seenEmails.has(eKey);
      const isDupBiz = bKey && seenBusinesses.has(bKey);

      if (!isDupEmail && !isDupBiz) {
        if (eKey) seenEmails.add(eKey);
        if (bKey) seenBusinesses.add(bKey);
        uniqueTenantsList.push(t);
      }
    }

    if (uniqueTenantsList.length !== currentTenants.length) {
      currentTenants = uniqueTenantsList;
      localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));
    }

    // ── LEGACY TENANT ID NORMALIZATION ───────────────────────────────────────
    // Normalizes all existing tenants to INITIALS-001 / INITIALS-002 format seamlessly
    let legacyTenantsMigrated = false;
    const normalizedTenants: Tenant[] = [];
    const legacyIdMap: Record<string, string> = {};
    const seenNumbers = new Set<string>();
    const ALL_STORAGE_KEYS = [
      "unipos_products", "unipos_customers", "unipos_suppliers", "unipos_sales",
      "unipos_expenses", "unipos_employees", "unipos_settings", "unipos_pos",
      "unipos_batches", "unipos_tables", "unipos_kitchen", "unipos_accounts",
      "unipos_journal", "unipos_attendance", "unipos_payroll", "unipos_transfers",
      "unipos_counters", "unipos_hr_employees", "unipos_hr_attendance", "unipos_hr_leaves",
      "unipos_hr_payrolls", "unipos_hr_jobs", "unipos_hr_candidates", "unipos_hr_appraisals",
      "unipos_hr_departments", "unipos_hr_designations", "unipos_hr_shifts"
    ];

    for (const t of currentTenants) {
      const match = t.id.match(/^([A-Z0-9]+)-(\d{3})$/);
      const isLegacyPrefix = t.id.startsWith("TEN-") || t.id.startsWith("DEMO-");
      const numPart = match ? match[2] : null;
      const isDuplicateNumber = numPart ? seenNumbers.has(numPart) : true;

      if (!match || isLegacyPrefix || isDuplicateNumber) {
        const newId = generateTenantId(t.businessName, normalizedTenants);
        legacyIdMap[t.id] = newId;
        legacyTenantsMigrated = true;
        const newNumMatch = newId.match(/-(\d{3})$/);
        if (newNumMatch) seenNumbers.add(newNumMatch[1]);
        normalizedTenants.push({ ...t, id: newId });
      } else {
        if (numPart) seenNumbers.add(numPart);
        normalizedTenants.push(t);
      }
    }

    if (legacyTenantsMigrated) {
      currentTenants = normalizedTenants;
      localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));

      // Remap local storage tenant dataset keys
      Object.entries(legacyIdMap).forEach(([oldId, newId]) => {
        ALL_STORAGE_KEYS.forEach((keyPrefix) => {
          const oldData = localStorage.getItem(`${keyPrefix}_${oldId}`);
          if (oldData) {
            localStorage.setItem(`${keyPrefix}_${newId}`, oldData);
            localStorage.removeItem(`${keyPrefix}_${oldId}`);
          }
        });
      });

      // Migrate invoices
      const rawInvs = localStorage.getItem("unipos_invoices");
      if (rawInvs) {
        try {
          const parsedInvs: SaaSInvoice[] = JSON.parse(rawInvs);
          const updatedInvs = parsedInvs.map(inv => {
            if (legacyIdMap[inv.tenantId]) {
              return { ...inv, tenantId: legacyIdMap[inv.tenantId] };
            }
            return inv;
          });
          localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));
        } catch {}
      }

      // Migrate tickets
      const rawTickets = localStorage.getItem("unipos_tickets");
      if (rawTickets) {
        try {
          const parsedTickets: SupportTicket[] = JSON.parse(rawTickets);
          const updatedTickets = parsedTickets.map(ticket => {
            if (legacyIdMap[ticket.tenantId]) {
              return { ...ticket, tenantId: legacyIdMap[ticket.tenantId] };
            }
            return ticket;
          });
          localStorage.setItem("unipos_tickets", JSON.stringify(updatedTickets));
        } catch {}
      }

      // Migrate active logged in session user
      const rawUser = localStorage.getItem("unipos_current_user");
      if (rawUser) {
        try {
          const parsedUser = JSON.parse(rawUser);
          if (parsedUser?.tenantId && legacyIdMap[parsedUser.tenantId]) {
            parsedUser.tenantId = legacyIdMap[parsedUser.tenantId];
            localStorage.setItem("unipos_current_user", JSON.stringify(parsedUser));
          }
        } catch {}
      }

      try {
        supabase.from('unipos_global').upsert({ key: 'unipos_tenants', value: currentTenants }).then(() => {});
      } catch {}
    }

    // Auto-Sync: Mark Demo Requests as "Converted" if a matching tenant is already Active
    if (savedDemos) {
      try {
        const parsedDemos: DemoRequest[] = JSON.parse(savedDemos);
        let demosSyncChanged = false;
        const syncedDemos = parsedDemos.map((d) => {
          const isConvertedActive = currentTenants.some(
            (t) =>
              t.status === "Active" &&
              ((t.email && d.email && t.email.trim().toLowerCase() === d.email.trim().toLowerCase()) ||
               (t.businessName && d.businessName && t.businessName.trim().toLowerCase() === d.businessName.trim().toLowerCase()))
          );
          if (isConvertedActive && d.status !== "Converted") {
            demosSyncChanged = true;
            return { ...d, status: "Converted" as const };
          }
          return d;
        });
        if (demosSyncChanged) {
          setDemoRequests(syncedDemos);
          localStorage.setItem("unipos_demos", JSON.stringify(syncedDemos));
        }
      } catch (e) {}
    }

    // Check for expired trials in loaded tenants
    let trialsExpired = false;
    const nowTime = new Date();
    currentTenants = currentTenants.map(t => {
      if (t.status === "Trial" && t.trialEndsAt) {
        const trialEnd = new Date(t.trialEndsAt + "T23:59:59");
        if (trialEnd < nowTime) {
          trialsExpired = true;
          return { ...t, status: "Expired" as const };
        }
      }
      return t;
    });
    if (trialsExpired) {
      localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));
    }
    
    setTenants(currentTenants);



    // 3. Load Invoices
    const savedInvoices = localStorage.getItem("unipos_invoices");
    let currentInvoices: SaaSInvoice[] = [];
    if (savedInvoices) {
      currentInvoices = JSON.parse(savedInvoices);
      let invoicesChanged = false;
      currentInvoices = currentInvoices.map(inv => {
        const tenant = currentTenants.find(t => t.id === inv.tenantId);
        const isTrialTenant = tenant?.status === "Trial" || tenant?.isTrial;
        const isDemoClientName = inv.tenantName.toLowerCase() === "demo";
        const isTrialPlan = inv.plan.toLowerCase().includes("trial");

        if (isTrialTenant || isDemoClientName || isTrialPlan) {
          if (inv.amount !== 0 || inv.plan !== "Trial") {
            invoicesChanged = true;
            return {
              ...inv,
              amount: 0,
              plan: "Trial",
              status: "Paid" as const
            };
          }
        }
        return inv;
      });
      if (invoicesChanged) {
        localStorage.setItem("unipos_invoices", JSON.stringify(currentInvoices));
      }
      setSaasInvoices(currentInvoices);
    } else {
      const initInvoices: SaaSInvoice[] = [];
      localStorage.setItem("unipos_invoices", JSON.stringify(initInvoices));
      setSaasInvoices(initInvoices);
    }

    // 4. Load Tickets
    const savedTickets = localStorage.getItem("unipos_tickets");
    if (savedTickets) setSupportTickets(JSON.parse(savedTickets));
    else {
      const initTickets: SupportTicket[] = [];
      localStorage.setItem("unipos_tickets", JSON.stringify(initTickets));
      setSupportTickets(initTickets);
    }

    // 14. Load Session User
    const savedUser = localStorage.getItem("unipos_current_user");
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

  }, []);

  // Global Active Session Expiration / Suspension Security Guard
  useEffect(() => {
    if (currentUser && currentUser.role !== "SuperAdmin" && currentUser.tenantId) {
      const tenant = tenants.find(t => t.id === currentUser.tenantId);
      if (tenant) {
        const isTrialExpired = tenant.status === "Trial" && tenant.trialEndsAt && new Date(tenant.trialEndsAt + "T23:59:59") < new Date();
        if (tenant.status === "Suspended" || tenant.status === "Expired" || isTrialExpired) {
          localStorage.removeItem("unipos_current_user");
          setCurrentUser(null);
          window.location.href = `/login?expired=true&tenantName=${encodeURIComponent(tenant.businessName)}`;
        }
      }
    }
  }, [currentUser, tenants]);

  // Tenant Specific Data Load
  useEffect(() => {
    if (!currentUser?.tenantId) {
      // Clear data if no user is logged in
      setProducts([]);
      setCustomers([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setSales([]);
      setExpenses([]);
      setEmployees([]);
      setTables([]);
      setKitchenTickets([]);
      setAccounts([]);
      return;
    }

    const isPrimaryDemo = currentUser.tenantId === "AFS-101";

    // 0. Load Business Settings for Active Tenant
    const savedSettings = localStorage.getItem("unipos_settings_" + currentUser.tenantId);
    const tenantRecord = tenants.find(t => t.id === currentUser.tenantId);
    const realBusinessName = currentUser.businessName && currentUser.businessName !== "Unknown" && currentUser.businessName !== "My Business"
      ? currentUser.businessName
      : (tenantRecord?.businessName || (isPrimaryDemo ? "Al-Fatah Superstore" : "MT STORE"));

    if (savedSettings) {
      try {
        const parsed: BusinessSettings = JSON.parse(savedSettings);
        // Aggressively clean up any stale legacy default data if this is NOT the AFS-101 demo store
        if (!isPrimaryDemo) {
          let dirty = false;
          if (parsed.businessName === "Al-Fatah Superstore" || !parsed.businessName) {
            parsed.businessName = realBusinessName;
            dirty = true;
          }
          if (parsed.ownerName === "Mian Talal") {
            parsed.ownerName = tenantRecord?.ownerName || currentUser?.name || "Store Owner";
            dirty = true;
          }
          if (parsed.phone === "+92 321 5550100") {
            parsed.phone = tenantRecord?.phone || "";
            dirty = true;
          }
          if (parsed.email === "talal@alfatah.com") {
            parsed.email = tenantRecord?.email || currentUser?.email || "";
            dirty = true;
          }
          if (parsed.address === "Gulberg III, Main Boulevard") {
            parsed.address = "";
            dirty = true;
          }
          if (parsed.taxNumber === "NTN-1234567-8") {
            parsed.taxNumber = "";
            dirty = true;
          }
          if (dirty) {
            saveTenantData("unipos_settings", parsed);
          }
        }
        setBusinessSettings(parsed);
      } catch (e) {}
    } else {
      const initSettings: BusinessSettings = {
        businessName: realBusinessName,
        ownerName: tenantRecord?.ownerName || currentUser?.name || (isPrimaryDemo ? "Mian Talal" : "Owner"),
        phone: tenantRecord?.phone || (isPrimaryDemo ? "+92 321 5550100" : ""),
        email: tenantRecord?.email || currentUser?.email || (isPrimaryDemo ? "talal@alfatah.com" : ""),
        address: isPrimaryDemo ? "Gulberg III, Main Boulevard" : "",
        city: isPrimaryDemo ? "Lahore" : "",
        country: "Pakistan",
        taxNumber: isPrimaryDemo ? "NTN-1234567-8" : "",
        receiptHeader: realBusinessName,
        receiptFooter: "Thank you for shopping! Powered by MT UniPOS.",
        defaultTaxRate: 0,
        defaultCurrency: tenantRecord?.defaultCurrency || "PKR",
        lowStockAlert: 10,
        allowCreditSales: true,
        loyaltyPointsPerAmount: 50,
        loyaltyRedeemThreshold: 1000,
        loyaltyRedeemValue: 100,
        logoUrl: "",
      };
      saveTenantData("unipos_settings", initSettings);
      setBusinessSettings(initSettings);
    }

    // 4.5 Load POS Counters Shard State
    const savedCounters = getTenantData("unipos_counters", currentUser.tenantId);
    if (savedCounters && savedCounters.length > 0) {
      setPosCounters(savedCounters);
    }

    // 5. Load Products (with SKU and Barcodes)
    const savedProducts = getTenantData("unipos_products", currentUser.tenantId);
    if (savedProducts && savedProducts.length > 0) {
      const parsed: Product[] = savedProducts;
      const seenIds = new Set<string>();
      const sanitized = parsed.map(p => {
        let id = p.id;
        if (!id || seenIds.has(id)) {
          let newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
          while (seenIds.has(newId) || parsed.some(x => x.id === newId)) {
            newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          id = newId;
        }
        seenIds.add(id);

        let salePrice = p.salePrice;
        // Auto-correct: If Suger 5kg was corrupted from 1050 to 180 by legacy code, restore it to 1050
        if ((p.name.toLowerCase().includes("suger") || p.name.toLowerCase().includes("sugar")) && p.costPrice === 750 && salePrice === 180) {
          salePrice = 1050;
        }

        return { ...p, id, salePrice };
      });
      setProducts(sanitized);
      saveTenantData("unipos_products", sanitized);
    } else if (isPrimaryDemo) {
      // Demo seed data ONLY for the primary demo account (AFS-101)
      const initProducts: Product[] = [
        { id: "P-1001", sku: "GROC-MILK-001", barcode: "888123456789", name: "Nestle Milkpak 1L", category: "Grocery", brand: "Nestle", costPrice: 240, salePrice: 280, wholesalePrice: 255, taxRate: 0, stock: 120, minStock: 25, unit: "Pcs", image: "" },
        { id: "P-1002", sku: "PHAR-PAN-002", barcode: "501112233445", name: "Panadol 500mg Tablet (10x10)", category: "Pharmacy", brand: "GSK", costPrice: 320, salePrice: 400, wholesalePrice: 350, taxRate: 0, stock: 85, minStock: 15, unit: "Box", expiryDate: "2027-12-15", batchNumber: "PAN-B992", image: "" },
        { id: "P-1003", sku: "REST-BURG-003", barcode: "400123", name: "Crispy Zinger Burger", category: "Food & Beverage", brand: "In-House", costPrice: 290, salePrice: 490, wholesalePrice: 450, taxRate: 0, stock: 999, minStock: 0, unit: "Portion", image: "" },
        { id: "P-1004", sku: "ELEC-CHARG-004", barcode: "690123456789", name: "Anker USB-C Charger 20W", category: "Electronics", brand: "Anker", costPrice: 1800, salePrice: 2600, wholesalePrice: 2200, taxRate: 0, stock: 14, minStock: 5, unit: "Pcs", image: "" },
        { id: "P-1005", sku: "CLOT-SHIRT-005", barcode: "740112233", name: "Classic Polo Shirt - Navy Blue", category: "Clothing", brand: "Outfitters", costPrice: 1200, salePrice: 2200, wholesalePrice: 1800, taxRate: 0, stock: 45, minStock: 10, unit: "Pcs", variant: "Medium", image: "" },
        { id: "P-1006", sku: "PHAR-AUG-006", barcode: "502324221122", name: "Augmentin Syrup 156.25mg", category: "Pharmacy", brand: "GSK", costPrice: 180, salePrice: 220, wholesalePrice: 200, taxRate: 0, stock: 4, minStock: 10, unit: "Bottle", expiryDate: "2026-08-30", batchNumber: "AUG-B344" },
        { id: "P-1007", sku: "GROC-SUG-007", barcode: "888999000111", name: "Suger", category: "Grocery", brand: "Local", costPrice: 150, salePrice: 180, wholesalePrice: 165, taxRate: 0, stock: 50, minStock: 10, unit: "Pcs", image: "" }
      ];
      saveTenantData("unipos_products", initProducts);
      setProducts(initProducts);
    } else {
      // New tenant: fresh empty products list
      setProducts([]);
    }

    // 6. Load Customers
    const savedCustomers = getTenantData("unipos_customers", currentUser.tenantId);
    if (savedCustomers && savedCustomers.length > 0) {
      const parsed: Customer[] = savedCustomers;
      const seenNos = new Set<string>();
      parsed.forEach(c => {
        if (c.customerNo && c.customerNo !== "N/A") seenNos.add(c.customerNo);
      });
      const sanitized = parsed.map(c => {
        if (c.name === "Walk-in Customer") {
          return { ...c, customerNo: "N/A" };
        }
        if (!c.customerNo || c.customerNo === "N/A") {
          let num = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
          while (seenNos.has(num)) {
            num = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
          }
          seenNos.add(num);
          return { ...c, customerNo: num };
        }
        return c;
      });
      setCustomers(sanitized);
      saveTenantData("unipos_customers", sanitized);
    } else if (isPrimaryDemo) {
      // Demo seed data ONLY for the primary demo account (AFS-101)
      const initCustomers: Customer[] = [
        { id: "C-201", customerNo: "CUST-7294", name: "Talal Ahmad", mobile: "03215550100", email: "talal@example.com", address: "DHA Phase 5, Lahore", cnic: "35201-1234567-9", loyaltyPoints: 450, creditBalance: 3200, dueRecoveryHistory: [{ date: "2026-05-15", amount: 1500 }] },
        { id: "C-202", customerNo: "CUST-3829", name: "Sarah Khan", mobile: "03009876543", email: "sarah@example.com", address: "Gulberg III, Lahore", loyaltyPoints: 120, creditBalance: 0, dueRecoveryHistory: [] },
        { id: "C-203", customerNo: "N/A", name: "Walk-in Customer", mobile: "00000000000", email: "walkin@unipos.com", address: "N/A", loyaltyPoints: 0, creditBalance: 0, dueRecoveryHistory: [] },
        { id: "C-5510", customerNo: "CUST-6679", name: "Wajahat", mobile: "03396399895", email: "wajahat@customer.com", address: "Faisalabad", loyaltyPoints: 84, creditBalance: 0, walletBalance: 900, dueRecoveryHistory: [] }
      ];
      saveTenantData("unipos_customers", initCustomers);
      setCustomers(initCustomers);
    } else {
      // New tenant: only walk-in customer as default, no demo data
      const initCustomers: Customer[] = [
        { id: "C-001", customerNo: "N/A", name: "Walk-in Customer", mobile: "00000000000", email: "walkin@unipos.com", address: "N/A", loyaltyPoints: 0, creditBalance: 0, dueRecoveryHistory: [] }
      ];
      saveTenantData("unipos_customers", initCustomers);
      setCustomers(initCustomers);
    }

    // 7. Load Suppliers
    const savedSuppliers = getTenantData("unipos_suppliers", currentUser.tenantId);
    if (savedSuppliers && savedSuppliers.length > 0) setSuppliers(savedSuppliers);
    else if (isPrimaryDemo) {
      const initSuppliers: Supplier[] = [
        { id: "S-301", name: "Nestle Distribution Lahore", company: "Nestle Pakistan", mobile: "042111363636", email: "orders@nestle.com.pk", dueAmount: 45000, purchaseHistory: [{ date: "2026-05-20", orderId: "PO-991", total: 45000 }] },
        { id: "S-302", name: "GSK Pharma Allied", company: "GSK Pakistan", mobile: "02135678901", email: "order@gsk.com", dueAmount: 18200, purchaseHistory: [{ date: "2026-05-24", orderId: "PO-995", total: 18200 }] }
      ];
      saveTenantData("unipos_suppliers", initSuppliers);
      setSuppliers(initSuppliers);
    } else {
      setSuppliers([]);
    }

    // 7.5 Load Purchase Orders
    const savedPOs = getTenantData("unipos_pos", currentUser.tenantId);
    if (savedPOs && savedPOs.length > 0) setPurchaseOrders(savedPOs);
    else if (isPrimaryDemo) {
      const initPOs: PurchaseOrder[] = [
        {
          id: "PO-995",
          supplierId: "S-302",
          supplierName: "GSK Pharma Allied",
          date: "2026-05-24",
          items: [
            { productId: "P-1002", productName: "Panadol 500mg Tablet (10x10)", costPrice: 320, qty: 50, subtotal: 16000 }
          ],
          total: 16000,
          status: "Pending"
        }
      ];
      saveTenantData("unipos_pos", initPOs);
      setPurchaseOrders(initPOs);
    } else {
      setPurchaseOrders([]);
    }

    // 7b. Load FIFO Batches
    const savedBatches = getTenantData("unipos_batches", currentUser.tenantId);
    if (savedBatches && savedBatches.length > 0) setBatches(savedBatches);
    else setBatches([]);

    // 8. Load Sales History
    const savedSales = getTenantData("unipos_sales", currentUser.tenantId);
    if (savedSales && savedSales.length > 0) setSales(savedSales);
    else if (isPrimaryDemo) {
      const initSales: SaleTransaction[] = [
        {
          id: "S-5001",
          receiptNumber: "MT-TXN-10001",
          date: "2026-06-01T09:30:00+05:00",
          branch: "Main Branch",
          cashierName: "Hassan Cashier",
          customerName: "Talal Ahmad",
          items: [
            { productId: "P-1001", productName: "Nestle Milkpak 1L", price: 280, qty: 5, subtotal: 1400 },
            { productId: "P-1005", productName: "Classic Polo Shirt - Navy Blue", price: 2200, qty: 1, subtotal: 2200 }
          ],
          subtotal: 3600,
          discount: 100,
          tax: 595,
          total: 4095,
          paymentMethod: "Card",
          status: "Completed"
        },
        {
          id: "S-5002",
          receiptNumber: "MT-TXN-10002",
          date: "2026-06-01T10:15:00+05:00",
          branch: "Main Branch",
          cashierName: "Hassan Cashier",
          customerName: "Walk-in Customer",
          items: [
            { productId: "P-1002", productName: "Panadol 500mg Tablet (10x10)", price: 400, qty: 2, subtotal: 800 }
          ],
          subtotal: 800,
          discount: 0,
          tax: 0,
          total: 800,
          paymentMethod: "Cash",
          status: "Completed"
        }
      ];
      saveTenantData("unipos_sales", initSales);
      setSales(initSales);
    } else {
      setSales([]);
    }

    // Auto sync customer wallet balances from return sales & wallet payment history
    try {
      const allSales: SaleTransaction[] = Array.isArray(savedSales) ? savedSales : (typeof savedSales === "string" ? JSON.parse(savedSales) : []);
      const allCusts: Customer[] = Array.isArray(savedCustomers) ? savedCustomers : (typeof savedCustomers === "string" ? JSON.parse(savedCustomers) : []);
      if (allSales.length > 0 && allCusts.length > 0) {
        let dirty = false;
        const syncedCusts = allCusts.map((c: Customer) => {
          if (c.id === "C-203" || c.name === "Walk-in Customer") return c;

          let computedWalletFromSales = 0;
          allSales.forEach((s: SaleTransaction) => {
            const isMatch = (s.customerName || "").toLowerCase().trim() === (c.name || "").toLowerCase().trim() || (c.customerNo && c.customerNo !== "N/A" && s.customerNo === c.customerNo);
            if (!isMatch) return;

            const isReturn = s.status === "Returned" || s.status === "Refunded";
            const isWallet = s.paymentMethod === "Store Wallet Credit" || s.paymentMethod === "Wallet";

            if (isWallet) {
              if (isReturn) computedWalletFromSales += s.total;
              else computedWalletFromSales -= s.total;
            } else if (s.splitPayments) {
              const splitAmt = s.splitPayments["Store Wallet Credit"] || s.splitPayments["Wallet"] || 0;
              if (splitAmt > 0) {
                if (isReturn) computedWalletFromSales += splitAmt;
                else computedWalletFromSales -= splitAmt;
              }
            }
          });

          let finalWallet = Math.max(0, c.walletBalance || 0, computedWalletFromSales);
          let finalCredit = c.creditBalance;
          if (finalCredit < 0) {
            finalWallet += Math.abs(finalCredit);
            finalCredit = 0;
          }

          if (finalWallet !== c.walletBalance || finalCredit !== c.creditBalance) {
            dirty = true;
            return {
              ...c,
              creditBalance: finalCredit,
              walletBalance: finalWallet
            };
          }
          return c;
        });

        if (dirty) {
          setCustomers(syncedCusts);
          saveTenantData("unipos_customers", syncedCusts);
        }
      }
    } catch (e) {
      console.error("Wallet auto-sync error:", e);
    }

    // 9. Load Expenses
    const savedExpenses = localStorage.getItem("unipos_expenses_" + currentUser.tenantId);
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
    else if (isPrimaryDemo) {
      const initExpenses: Expense[] = [
        { id: "E-601", category: "Electricity Utility", amount: 48000, date: "2026-05-25", description: "Monthly warehouse and storefront electricity bill", paymentMethod: "Bank Transfer" },
        { id: "E-602", category: "Office Stationary", amount: 2400, date: "2026-05-28", description: "Purchased thermal printer rolls and cash book ledger", paymentMethod: "Cash" }
      ];
      saveTenantData("unipos_expenses", initExpenses);
      setExpenses(initExpenses);
    } else { setExpenses([]); }

    // 10. Load Employees
    const savedEmployees = localStorage.getItem("unipos_employees_" + currentUser.tenantId);
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));
    else if (isPrimaryDemo) {
      const initEmployees: Employee[] = [
        { id: "EMP-01", name: "Kashif Shah", role: "Manager", email: "kashif@alfatah.com", password: "password123", status: "Active", salary: 75000, attendance: {}, permissions: ["Dashboard", "POS", "Customers", "Products", "Inventory", "Purchases", "Expenses", "Payroll", "Reports", "AI Analytics"] },
        { id: "EMP-02", name: "Hassan Cashier", role: "Cashier", email: "hassan@alfatah.com", password: "password123", status: "Active", salary: 35000, attendance: {}, permissions: ["POS", "Customers", "Reports (Basic)"] },
        { id: "EMP-03", name: "Kamran Chef", role: "Warehouse Staff", email: "kamran@alfatah.com", password: "password123", status: "Active", salary: 40000, attendance: {}, permissions: ["Products", "Inventory", "Purchases"] }
      ];
      saveTenantData("unipos_employees", initEmployees);
      setEmployees(initEmployees);
    } else { setEmployees([]); }

    // 11. Load Restaurant Tables
    const savedTables = localStorage.getItem("unipos_tables_" + currentUser.tenantId);
    if (savedTables && JSON.parse(savedTables).length > 0) {
      setTables(JSON.parse(savedTables));
    } else if (isPrimaryDemo) {
      const initTables: RestaurantTable[] = [
        { id: "T-01", number: "Table 1", capacity: 2, status: "Free", hall: "Main Hall" },
        { id: "T-02", number: "Table 2", capacity: 4, status: "Occupied", activeOrderId: "S-5003", waiterName: "Nabeel Waiter", hall: "Main Hall" },
        { id: "T-03", number: "Table 3", capacity: 8, status: "Reserved", hall: "Main Hall" },
        { id: "T-04", number: "Table 4", capacity: 4, status: "Free", hall: "Main Hall" },
        { id: "P-01", number: "Patio 1", capacity: 2, status: "Free", hall: "Patio" },
        { id: "P-02", number: "Patio 2", capacity: 4, status: "Free", hall: "Patio" },
        { id: "V-01", number: "VIP 1", capacity: 6, status: "Free", hall: "VIP Lounge", vip: true }
      ];
      saveTenantData("unipos_tables", initTables);
      setTables(initTables);
    } else {
      setTables([]);
    }

    // 12. Load Kitchen Tickets
    const savedKitchen = localStorage.getItem("unipos_kitchen_" + currentUser.tenantId);
    if (savedKitchen) setKitchenTickets(JSON.parse(savedKitchen));
    else if (isPrimaryDemo) {
      const initKitchen: KitchenTicket[] = [
        { id: "K-101", tableNumber: "Table 2 (4-Seater)", orderTime: "2026-06-01T10:30:00+05:00", status: "Cooking", items: [{ name: "Crispy Zinger Burger", qty: 2, notes: "Extra spicy sauce, no onions" }] }
      ];
      saveTenantData("unipos_kitchen", initKitchen);
      setKitchenTickets(initKitchen);
    } else { setKitchenTickets([]); }

    // 13. Load Accounting Ledgers
    const defaultInitAccounts: AccountLedger[] = [
      { code: "1001", name: "Main Cash Box / Till", type: "Asset", balance: 0 },
      { code: "1002", name: "Bank Current Account", type: "Asset", balance: 0 },
      { code: "1003", name: "Product Stock Valuation", type: "Asset", balance: 0 },
      { code: "1004", name: "Accounts Receivable (Customer Due)", type: "Asset", balance: 0 },
      { code: "2001", name: "Accounts Payable (Supplier Debt)", type: "Liability", balance: 0 },
      { code: "2002", name: "Sales Tax Payable", type: "Liability", balance: 0 },
      { code: "2003", name: "Customer Wallet Payable", type: "Liability", balance: 0 },
      { code: "3001", name: "Owner Capital & Retained Earnings", type: "Equity", balance: 0 },
      { code: "4001", name: "POS & Retail Sales Revenue", type: "Revenue", balance: 0 },
      { code: "5001", name: "Cost of Goods Sold (COGS)", type: "Expense", balance: 0 },
      { code: "5002", name: "Operating & Utility Expenses", type: "Expense", balance: 0 }
    ];

    const savedAccounts = localStorage.getItem("unipos_accounts_" + currentUser.tenantId);
    if (savedAccounts) {
      try {
        const parsed: AccountLedger[] = JSON.parse(savedAccounts);
        if (parsed && parsed.length > 0) {
          setAccounts(parsed);
        } else {
          saveTenantData("unipos_accounts", defaultInitAccounts);
          setAccounts(defaultInitAccounts);
        }
      } catch {
        saveTenantData("unipos_accounts", defaultInitAccounts);
        setAccounts(defaultInitAccounts);
      }
    } else {
      saveTenantData("unipos_accounts", defaultInitAccounts);
      setAccounts(defaultInitAccounts);
    }

    // 13. Load HRMS Datasets with Strict Demo Data Filtering & Purging
    if (currentUser?.tenantId) {
      let savedHrEmployees = getTenantData("unipos_hr_employees", currentUser.tenantId);
      if (savedHrEmployees && savedHrEmployees.some((e: any) => e.employeeCode === "EMP-001" || e.name === "Waqas Ali" || e.name === "Ayesha Malik")) {
        savedHrEmployees = [];
        saveTenantData("unipos_hr_employees", []);
      }
      setHrEmployees(savedHrEmployees || []);

      let savedHrAttendance = getTenantData("unipos_hr_attendance", currentUser.tenantId);
      if (savedHrAttendance && savedHrAttendance.some((a: any) => a.id === "HRA-1" || a.employeeName === "Waqas Ali" || a.employeeName === "Ayesha Malik")) {
        savedHrAttendance = [];
        saveTenantData("unipos_hr_attendance", []);
      }
      setHrAttendance(savedHrAttendance || []);

      let savedHrLeaves = getTenantData("unipos_hr_leaves", currentUser.tenantId);
      if (savedHrLeaves && savedHrLeaves.some((l: any) => l.id === "HRL-1" || l.employeeName === "Ayesha Malik")) {
        savedHrLeaves = [];
        saveTenantData("unipos_hr_leaves", []);
      }
      setHrLeaves(savedHrLeaves || []);

      let savedHrPayrolls = getTenantData("unipos_hr_payrolls", currentUser.tenantId);
      if (savedHrPayrolls && savedHrPayrolls.some((p: any) => p.id === "HRPAY-2026-07" || p.items?.some((i: any) => i.employeeName === "Waqas Ali"))) {
        savedHrPayrolls = [];
        saveTenantData("unipos_hr_payrolls", []);
      }
      setHrPayrolls(savedHrPayrolls || []);

      let savedHrJobs = getTenantData("unipos_hr_jobs", currentUser.tenantId);
      if (savedHrJobs && savedHrJobs.some((j: any) => j.id === "HRJ-1" || j.title === "Assistant Store Manager")) {
        savedHrJobs = [];
        saveTenantData("unipos_hr_jobs", []);
      }
      setHrJobs(savedHrJobs || []);

      let savedHrAppraisals = getTenantData("unipos_hr_appraisals", currentUser.tenantId);
      if (savedHrAppraisals && savedHrAppraisals.some((a: any) => a.id === "HRA-1" || a.employeeName === "Waqas Ali")) {
        savedHrAppraisals = [];
        saveTenantData("unipos_hr_appraisals", []);
      }
      setHrAppraisals(savedHrAppraisals || []);

      const savedHrDepts = getTenantData("unipos_hr_departments", currentUser.tenantId);
      if (savedHrDepts && savedHrDepts.length > 0) setHrDepartments(savedHrDepts);
      else {
        setHrDepartments(SEED_HR_DEPARTMENTS);
        saveTenantData("unipos_hr_departments", SEED_HR_DEPARTMENTS);
      }

      const savedHrDesgs = getTenantData("unipos_hr_designations", currentUser.tenantId);
      if (savedHrDesgs && savedHrDesgs.length > 0) setHrDesignations(savedHrDesgs);
      else {
        setHrDesignations(SEED_HR_DESIGNATIONS);
        saveTenantData("unipos_hr_designations", SEED_HR_DESIGNATIONS);
      }

      const savedHrShifts = getTenantData("unipos_hr_shifts", currentUser.tenantId);
      if (savedHrShifts && savedHrShifts.length > 0) setHrShifts(savedHrShifts);
      else {
        setHrShifts(SEED_HR_SHIFTS);
        saveTenantData("unipos_hr_shifts", SEED_HR_SHIFTS);
      }

      let savedHrCands = getTenantData("unipos_hr_candidates", currentUser.tenantId);
      if (savedHrCands && savedHrCands.some((c: any) => c.id === "CND-101" || c.name === "Usman Raza")) {
        savedHrCands = [];
        saveTenantData("unipos_hr_candidates", []);
      }
      setHrCandidates(savedHrCands || []);

      const savedHrmsTickets = getTenantData("unipos_hrms_tickets", currentUser.tenantId);
      setHrmsTickets(savedHrmsTickets || []);

      const savedHrLoans = getTenantData("unipos_hr_loans", currentUser.tenantId);
      setHrLoans(savedHrLoans || []);
    }

  }, [currentUser?.tenantId]);

  const createHRMSTicket = (ticket: Omit<HRMSTicket, "id" | "ticketNumber" | "createdAt" | "updatedAt" | "replies">) => {
    const nowStr = new Date().toISOString();
    const count = hrmsTickets.length + 1;
    const ticketNumber = `TKT-${1000 + count}`;
    const newTicket: HRMSTicket = {
      ...ticket,
      id: `HRTKT-${Math.floor(1000 + Math.random() * 9000)}`,
      ticketNumber,
      createdAt: nowStr,
      updatedAt: nowStr,
      replies: []
    };
    const updated = [newTicket, ...hrmsTickets];
    setHrmsTickets(updated);
    saveTenantData("unipos_hrms_tickets", updated);
  };

  const updateHRMSTicket = (id: string, updates: Partial<HRMSTicket>) => {
    const nowStr = new Date().toISOString();
    const updated = hrmsTickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updates,
          updatedAt: nowStr
        };
      }
      return t;
    });
    setHrmsTickets(updated);
    saveTenantData("unipos_hrms_tickets", updated);
  };

  const updateHRMSTicketStatus = (id: string, status: HRMSTicket["status"], assignedTo?: string) => {
    const nowStr = new Date().toISOString();
    const updated = hrmsTickets.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          assignedTo: assignedTo || t.assignedTo,
          updatedAt: nowStr
        };
      }
      return t;
    });
    setHrmsTickets(updated);
    saveTenantData("unipos_hrms_tickets", updated);
  };

  const deleteHRMSTicket = (id: string) => {
    const updated = hrmsTickets.filter(t => t.id !== id);
    setHrmsTickets(updated);
    saveTenantData("unipos_hrms_tickets", updated);
  };

  const addHRMSTicketReply = (ticketId: string, message: string) => {
    const nowStr = new Date().toISOString();
    const reply: HRMSTicketReply = {
      id: `RPL-${Math.floor(1000 + Math.random() * 9000)}`,
      senderName: currentUser?.name || "User",
      senderRole: currentUser?.role || "Staff",
      senderEmail: currentUser?.email || "user@company.com",
      message,
      createdAt: nowStr
    };

    const updated = hrmsTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          updatedAt: nowStr,
          replies: [...(t.replies || []), reply]
        };
      }
      return t;
    });

    setHrmsTickets(updated);
    saveTenantData("unipos_hrms_tickets", updated);
  };


  // ── Strict Multi-Tenant Duplicate Verification Helper ─────────────────────
  const checkTenantDuplicate = (
    newBusinessName: string,
    newEmail: string,
    newPhone: string,
    excludeTenantId?: string
  ) => {
    const normEmail = (newEmail || "").trim().toLowerCase();
    const normBusiness = (newBusinessName || "").trim().toLowerCase();
    const cleanPhone = (newPhone || "").replace(/\D/g, "");

    for (const t of tenants) {
      if (excludeTenantId && t.id === excludeTenantId) continue;

      // 1. Check Email Match
      const tEmail = (t.email || "").trim().toLowerCase();
      const hasPresetEmail = t.credentialPresets?.some(c => (c.email || "").trim().toLowerCase() === normEmail);
      if ((normEmail && tEmail === normEmail) || hasPresetEmail) {
        return {
          isDuplicate: true,
          field: "Email Address",
          value: newEmail,
          message: `⚠️ Duplicate Trial Blocked: Email address '${newEmail}' is ALREADY REGISTERED to Tenant '${t.businessName}' (${t.id})!`
        };
      }

      // 2. Check Business Name Match
      const tBusiness = (t.businessName || "").trim().toLowerCase();
      if (normBusiness && tBusiness === normBusiness) {
        return {
          isDuplicate: true,
          field: "Business Name",
          value: newBusinessName,
          message: `⚠️ Duplicate Trial Blocked: Business Name '${newBusinessName}' is ALREADY REGISTERED to Tenant ID '${t.id}'!`
        };
      }

      // 3. Check Phone Match
      const tPhone = (t.phone || "").replace(/\D/g, "");
      if (cleanPhone && cleanPhone.length >= 7 && tPhone && tPhone === cleanPhone) {
        return {
          isDuplicate: true,
          field: "Phone Number",
          value: newPhone,
          message: `⚠️ Duplicate Trial Blocked: Phone number '${newPhone}' is ALREADY REGISTERED to Tenant '${t.businessName}' (${t.id})!`
        };
      }
    }

    return { isDuplicate: false, field: "", value: "", message: "" };
  };

  // SaaS Website & Admin Actions
  const addDemoRequest = (req: Omit<DemoRequest, "id" | "ticketNumber" | "date" | "status" | "messages">) => {
    // 1. Check if already registered in Tenants
    const dupCheck = checkTenantDuplicate(req.businessName, req.email, req.phone || "");
    if (dupCheck.isDuplicate) {
      throw new Error(dupCheck.message);
    }

    // 2. Check if already submitted in Demo Requests (Pending or Approved)
    const normEmail = (req.email || "").trim().toLowerCase();
    const normBusiness = (req.businessName || "").trim().toLowerCase();
    const cleanPhone = (req.phone || "").replace(/\D/g, "");

    const pendingDup = demoRequests.find(d => {
      if (d.status === "Rejected") return false;
      const dEmail = (d.email || "").trim().toLowerCase();
      const dBusiness = (d.businessName || "").trim().toLowerCase();
      const dPhone = (d.phone || "").replace(/\D/g, "");

      if (normEmail && dEmail === normEmail) return true;
      if (normBusiness && dBusiness === normBusiness) return true;
      if (cleanPhone && cleanPhone.length >= 7 && dPhone && dPhone === cleanPhone) return true;
      return false;
    });

    if (pendingDup) {
      const matchField = (pendingDup.email || "").trim().toLowerCase() === normEmail
        ? `Email '${req.email}'`
        : ((pendingDup.businessName || "").trim().toLowerCase() === normBusiness
          ? `Business Name '${req.businessName}'`
          : `Phone Number '${req.phone}'`);
      throw new Error(`⚠️ Demo Request Blocked: A trial demo request matching ${matchField} already exists! (Ticket: ${pendingDup.ticketNumber})`);
    }

    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`;
    const newReq: DemoRequest = {
      ...req,
      id: `DEMO-${Math.floor(100 + Math.random() * 900)}`,
      ticketNumber,
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
      messages: []
    };
    const updated = [newReq, ...demoRequests];
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));
    return ticketNumber;
  };

  const updateDemoStatus = (id: string, status: DemoRequest["status"]) => {
    const updated = demoRequests.map(r => r.id === id ? { ...r, status } : r);
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));
  };

  const approveDemoRequest = (id: string, trialDays: number, customDealAmount?: number, customCurrency?: "PKR" | "USD") => {
    const req = demoRequests.find(r => r.id === id);
    if (!req) return;

    // Strict duplicate check before approving & creating trial tenant
    const dupCheck = checkTenantDuplicate(req.businessName, req.email, req.phone || "");
    if (dupCheck.isDuplicate) {
      throw new Error(dupCheck.message);
    }

    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const demoEmail = req.email;
    const demoPassword = `Demo@${Math.floor(1000 + Math.random() * 9000)}`;

    const updated = demoRequests.map(r =>
      r.id === id ? {
        ...r,
        status: "Approved" as const,
        trialDays,
        trialEndsAt: trialEnd.toISOString(),
        approvedAt: now.toISOString(),
        demoEmail,
        demoPassword,
        messages: [
          ...(r.messages || []),
          { sender: "Admin" as const, message: `Your demo account has been approved for ${trialDays} days. Login credentials have been generated. Trial ends on ${trialEnd.toLocaleDateString()}.`, date: now.toISOString() }
        ]
      } : r
    );
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));

    // Also auto-register a Trial Tenant so the user can actually log in
    const dealCurrency = customCurrency || "PKR";
    const isHRMSDemo = (req.assignedSoftware === "HRMS") || (req.businessType && req.businessType.includes("HRMS"));
    const assignedSoftware: "POS" | "HRMS" = isHRMSDemo ? "HRMS" : "POS";
    const tenantId = generateTenantId(req.businessName, tenants);

    const newTenant: Tenant = {
      id: tenantId,
      businessName: req.businessName,
      ownerName: req.name,
      email: demoEmail,
      phone: req.phone || "",
      businessType: req.businessType || (isHRMSDemo ? "HRMS Enterprise" : "Super Markets"),
      assignedSoftware,
      plan: "Professional",
      billingCycle: "monthly",
      signupDate: now.toISOString().split("T")[0],
      status: "Trial",
      usersCount: 1,
      monthlyRevenue: 0,
      branches: ["Main Branch"],
      defaultCurrency: dealCurrency,
      credentialPresets: [
        { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Demo Owner", email: demoEmail, pass: demoPassword, role: "Owner" }
      ],
      isTrial: true,
      trialDays: trialDays,
      trialEndsAt: trialEnd.toISOString().split("T")[0],
    };
    
    setTenants(prev => {
      const updatedTenants = [newTenant, ...prev];
      localStorage.setItem("unipos_tenants", JSON.stringify(updatedTenants));
      return updatedTenants;
    });

    // Auto generate onboarding SaaS Invoice (Custom rate if specified)
    const dealPrice = customDealAmount !== undefined ? customDealAmount : 0;
    const newInvoice: SaaSInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      amount: dealPrice,
      currency: dealCurrency,
      paidAmount: dealPrice === 0 ? 0 : 0,
      remainingBalance: dealPrice,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: dealPrice === 0 ? "Paid" : "Unpaid",
      plan: dealPrice === 0 ? "Trial Access (0 PKR)" : `Negotiated Plan (${dealCurrency} ${dealPrice.toLocaleString()})`,
      paymentMethod: dealPrice === 0 ? "Free Trial" : "Pending Payment",
      notes: `Demo account approved for ${trialDays} days trial.`
    };
    setSaasInvoices(prev => {
      const updatedInvs = [newInvoice, ...prev];
      localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));
      return updatedInvs;
    });
  };

  const convertDemoToActivePaid = (id: string, options: {
    amount: number;
    currency: "PKR" | "USD";
    plan: string;
    billingCycle: "monthly" | "yearly";
    durationDays: number;
    paymentMethod: string;
    notes?: string;
  }) => {
    const req = demoRequests.find(r => r.id === id);
    if (!req) return;

    const now = new Date();
    const expiryDate = new Date(now.getTime() + options.durationDays * 24 * 60 * 60 * 1000);
    const expiryStr = expiryDate.toISOString().split("T")[0];

    // 1. Mark Demo Request as "Converted"
    const updatedDemos = demoRequests.map(r =>
      r.id === id ? {
        ...r,
        status: "Converted" as const,
        convertedAt: now.toISOString(),
        messages: [
          ...(r.messages || []),
          { sender: "Admin" as const, message: `Account converted to FULLY ACTIVE Paid Client under ${options.plan} (${options.currency} ${options.amount.toLocaleString()}). Subscription valid until ${expiryStr}.`, date: now.toISOString() }
        ]
      } : r
    );
    setDemoRequests(updatedDemos);
    localStorage.setItem("unipos_demos", JSON.stringify(updatedDemos));

    // 2. Find or Register Tenant
    const existingTenant = tenants.find(t => (t.email && req.email && t.email.toLowerCase() === req.email.toLowerCase()) || (t.businessName && req.businessName && t.businessName.toLowerCase() === req.businessName.toLowerCase()));
    let targetTenantId = existingTenant?.id;

    if (existingTenant) {
      // Upgrade existing tenant to Active Paid - KEEP SAME PERMANENT TENANT ID!
      targetTenantId = existingTenant.id;
      const updatedTenants = tenants.map(t =>
        t.id === existingTenant.id ? {
          ...t,
          status: "Active" as const,
          isTrial: false,
          plan: options.plan as any,
          billingCycle: options.billingCycle,
          defaultCurrency: options.currency,
          trialEndsAt: expiryStr,
        } : t
      );
      setTenants(updatedTenants);
      localStorage.setItem("unipos_tenants", JSON.stringify(updatedTenants));
    } else {
      // Create new active tenant with format: Business Initials + '-' + 001
      const demoEmail = req.email;
      const demoPassword = `Pass@${Math.floor(1000 + Math.random() * 9000)}`;
      targetTenantId = generateTenantId(req.businessName, tenants);
      const isHRMS = req.assignedSoftware === "HRMS" || (req.businessType && req.businessType.includes("HRMS"));
      const newTenant: Tenant = {
        id: targetTenantId,
        businessName: req.businessName,
        ownerName: req.name,
        email: demoEmail,
        phone: req.phone || "",
        businessType: req.businessType || (isHRMS ? "HRMS Enterprise" : "Super Markets"),
        assignedSoftware: isHRMS ? "HRMS" : "POS",
        plan: options.plan as any,
        billingCycle: options.billingCycle,
        signupDate: now.toISOString().split("T")[0],
        status: "Active",
        usersCount: 1,
        monthlyRevenue: 0,
        branches: ["Main Branch"],
        defaultCurrency: options.currency,
        credentialPresets: [
          { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Owner (Full ERP)", email: demoEmail, pass: demoPassword, role: "Owner" }
        ],
        isTrial: false,
        trialEndsAt: expiryStr,
      };
      setTenants(prev => {
        const next = [newTenant, ...prev];
        localStorage.setItem("unipos_tenants", JSON.stringify(next));
        return next;
      });
    }

    // 3. Issue Cleared Paid SaaS Invoice
    const newInvoice: SaaSInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: targetTenantId,
      tenantName: req.businessName,
      amount: options.amount,
      currency: options.currency,
      paidAmount: options.amount,
      remainingBalance: 0,
      date: now.toISOString().split("T")[0],
      dueDate: now.toISOString().split("T")[0],
      status: "Paid",
      plan: `${options.plan} (${options.billingCycle})`,
      paymentMethod: options.paymentMethod,
      notes: options.notes || `Demo Account converted to Paid Client (${options.durationDays} Days Duration). Payment Received & Cleared.`
    };

    setSaasInvoices(prev => {
      const next = [newInvoice, ...prev];
      localStorage.setItem("unipos_invoices", JSON.stringify(next));
      return next;
    });

    // Supabase Cloud Sync
    try {
      supabase.from('unipos_global').upsert({ key: 'unipos_demos', value: updatedDemos }).then(() => {});
      supabase.from('unipos_global').upsert({ key: 'unipos_tenants', value: tenants }).then(() => {});
      supabase.from('unipos_global').upsert({ key: 'unipos_invoices', value: saasInvoices }).then(() => {});
    } catch {}

    // 4. Automated Resend API Email Dispatch to Client
    if (req.email) {
      try {
        const paidAmt = options.amount;
        const remBal = 0;
        const cur = options.currency;
        const bCycle = options.billingCycle === "yearly" ? "Annual" : "Monthly";
        const pMethod = options.paymentMethod || "Bank Transfer (Meezan / HBL)";
        const ownerPass = existingTenant?.credentialPresets?.[0]?.pass || "owner123";

        fetch("/api/send-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            to: req.email,
            invoiceId: newInvoice.id,
            tenantId: targetTenantId,
            businessName: req.businessName,
            ownerName: req.name,
            password: ownerPass,
            amount: newInvoice.amount,
            paidAmount: paidAmt,
            remainingBalance: remBal,
            currency: cur,
            plan: newInvoice.plan,
            billingCycle: bCycle,
            paymentMethod: pMethod
          }),
        }).then(async res => {
          const data = await res.json();
          try {
            const rawLogs = localStorage.getItem("unipos_email_logs");
            const existingLogs = rawLogs ? JSON.parse(rawLogs) : [];
            const logId = `EML-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const newLogEntry = {
              id: logId,
              to: req.email,
              businessName: req.businessName,
              tenantId: targetTenantId,
              ownerName: req.name,
              subject: `[MT UniPOS] Official SaaS Billing & Account Setup: ${req.businessName}`,
              plan: newInvoice.plan,
              billingCycle: bCycle,
              amount: newInvoice.amount,
              paidAmount: paidAmt,
              remainingBalance: remBal,
              currency: cur,
              paymentMethod: pMethod,
              sentAt: new Date().toISOString(),
              status: data?.success ? "Delivered" : "Queued",
              password: ownerPass,
              notes: "Automated activation email sent upon demo conversion."
            };
            localStorage.setItem("unipos_email_logs", JSON.stringify([newLogEntry, ...existingLogs]));
          } catch {}
        }).catch(err => console.warn("Resend email dispatch error:", err));
      } catch (e) {
        console.warn("Email API call exception:", e);
      }
    }
  };

  const rejectDemoRequest = (id: string, reason: string) => {
    const now = new Date();
    const updated = demoRequests.map(r =>
      r.id === id ? {
        ...r,
        status: "Rejected" as const,
        rejectedReason: reason,
        rejectedAt: now.toISOString(),
        messages: [
          ...(r.messages || []),
          { sender: "Admin" as const, message: `Your demo request has been rejected. Reason: ${reason}`, date: now.toISOString() }
        ]
      } : r
    );
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));
  };

  const deleteDemoRequest = (id: string) => {
    const updated = demoRequests.filter(r => r.id !== id);
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));
  };

  const addDemoMessage = (ticketNumber: string, message: string, sender: "Client" | "Admin") => {
    const now = new Date();
    const updated = demoRequests.map(r =>
      r.ticketNumber === ticketNumber ? {
        ...r,
        messages: [...(r.messages || []), { sender, message, date: now.toISOString() }]
      } : r
    );
    setDemoRequests(updated);
    localStorage.setItem("unipos_demos", JSON.stringify(updated));

    // If client sends a message, mirror it into the SaaS support ticket queue
    if (sender === "Client") {
      const req = demoRequests.find(r => r.ticketNumber === ticketNumber);
      if (req) {
        const existingTicketId = `DEMO-TCK-${ticketNumber}`;
        setSupportTickets(prev => {
          const existing = prev.find(t => t.id === existingTicketId);
          let next: typeof prev;
          if (existing) {
            // Append reply to existing ticket
            next = prev.map(t => t.id === existingTicketId ? {
              ...t,
              status: "Open" as const,
              replies: [...t.replies, { sender: "Client" as const, message, date: now.toISOString() }]
            } : t);
          } else {
            // Create a new support ticket for this demo requester
            const newTicket: SupportTicket = {
              id: existingTicketId,
              tenantId: `DEMO-${req.id}`,
              businessName: `${req.businessName} (Demo Lead — ${ticketNumber})`,
              subject: `Demo Enquiry from ${req.name}`,
              description: message,
              category: "Technical",
              priority: "Medium",
              status: "Open",
              date: now.toISOString().split("T")[0],
              replies: [{ sender: "Client" as const, message, date: now.toISOString() }]
            };
            next = [newTicket, ...prev];
          }
          localStorage.setItem("unipos_tickets", JSON.stringify(next));
          return next;
        });
      }
    }
  };


  const registerTenant = (tenant: Omit<Tenant, "id" | "signupDate" | "status" | "usersCount" | "monthlyRevenue" | "branches"> & { id?: string; customDealAmount?: number; customCurrency?: "PKR" | "USD" }) => {
    let finalId = tenant.id;
    if (!finalId) {
      finalId = generateTenantId(tenant.businessName, tenants);
    } else {
      // Ensure uniqueness
      while (tenants.some(t => t.id === finalId)) {
        finalId = generateTenantId(tenant.businessName, tenants);
      }
    }

    const signupDateStr = new Date().toISOString().split("T")[0];
    const statusVal = tenant.isTrial ? "Trial" : "Pending Payment";
    let trialEndsAtVal = undefined;
    if (tenant.isTrial && tenant.trialDays) {
      const trialEnd = new Date(Date.now() + tenant.trialDays * 24 * 60 * 60 * 1000);
      trialEndsAtVal = trialEnd.toISOString().split("T")[0];
    }

    const dealCurrency = tenant.customCurrency || tenant.defaultCurrency || "PKR";
    const isHRMSTenant = tenant.assignedSoftware === "HRMS" || (tenant.businessType && tenant.businessType.includes("HRMS"));
    const assignedSoftware: "POS" | "HRMS" = isHRMSTenant ? "HRMS" : (tenant.assignedSoftware || "POS");

    const newTenant: Tenant = {
      ...tenant,
      id: finalId,
      assignedSoftware,
      signupDate: signupDateStr,
      status: statusVal as any,
      trialEndsAt: trialEndsAtVal,
      usersCount: 1,
      monthlyRevenue: 0,
      branches: ["Main Branch"],
      defaultCurrency: dealCurrency,
      credentialPresets: [
        { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Owner (Full ERP)", email: tenant.email, pass: "owner123", role: "Owner" }
      ]
    };
    const updated = [newTenant, ...tenants];
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));

    // Auto generate onboarding SaaS Invoice (Custom deal amount if provided)
    const isYearly = tenant.billingCycle === "yearly";
    let baseAmountPKR = 25000; // Professional Plan
    if (tenant.plan === "Starter") baseAmountPKR = 15000;
    if (tenant.plan === "Enterprise") baseAmountPKR = 45000;
    
    const calculatedAmount = tenant.isTrial ? 0 : (isYearly ? baseAmountPKR * 10 : baseAmountPKR);
    const finalAmount = tenant.customDealAmount !== undefined ? tenant.customDealAmount : calculatedAmount;

    const newInvoice: SaaSInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      amount: finalAmount,
      currency: dealCurrency,
      paidAmount: tenant.isTrial ? 0 : 0,
      remainingBalance: tenant.isTrial ? 0 : finalAmount,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: tenant.isTrial ? "Paid" : "Unpaid",
      plan: tenant.isTrial ? "Trial Access (0 PKR)" : `${tenant.plan} ${tenant.billingCycle}`,
      paymentMethod: tenant.isTrial ? "Free Trial (0 PKR)" : "Pending SuperAdmin Payment Confirmation",
      notes: tenant.isTrial ? "Trial system active." : "Client invoice generated. Enter received payment to activate tenant."
    };
    const updatedInvs = [newInvoice, ...saasInvoices];
    setSaasInvoices(updatedInvs);
    localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));

    // Immediate Supabase Cloud Persistence
    try {
      supabase.from('unipos_global').upsert({ key: 'unipos_tenants', value: updated }).then(() => {});
      supabase.from('unipos_global').upsert({ key: 'unipos_invoices', value: updatedInvs }).then(() => {});
    } catch {}

    return finalId;
  };

  const updateTenantStatus = async (id: string, status: Tenant["status"]) => {
    const targetTenant = tenants.find(t => t.id === id);
    if (!targetTenant) return;

    // Rule: Tenant ID NEVER changes before or after payment/trial/activation.
    const updated = tenants.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          isTrial: status === "Active" ? false : t.isTrial
        };
      }
      return t;
    });

    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));

    let blacklisted: string[] = [];
    try {
      blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
    } catch {}

    if (status === "Active" || status === "Trial") {
      if (blacklisted.includes(id)) {
        blacklisted = blacklisted.filter(b => b !== id);
        localStorage.setItem("unipos_blacklisted_tenants", JSON.stringify(blacklisted));
        try {
          await supabase.from('unipos_global').upsert({
            key: 'unipos_blacklisted_tenants',
            value: blacklisted
          });
        } catch {}
      }
    } else if ((status as string) === "Suspended" || (status as string) === "Inactive" || status === "Expired") {
      const activeOfflineTenant = localStorage.getItem("unipos_offline_activated_tenant");
      if (activeOfflineTenant === id) {
        localStorage.removeItem("unipos_offline_activated_system");
        localStorage.removeItem("unipos_offline_activated_tenant");
      }
      if (currentUser?.tenantId === id) {
        setCurrentUser(null);
        localStorage.removeItem("unipos_current_user");
      }
    }

    try {
      await supabase.from('unipos_global').upsert({
        key: 'unipos_tenants',
        value: updated
      });
    } catch {}
  };

  // ─── ALL localStorage keys that store per-tenant data ───────────────────────
  const TENANT_DATA_KEYS = [
    "unipos_products", "unipos_customers", "unipos_suppliers", "unipos_sales",
    "unipos_expenses", "unipos_employees", "unipos_settings", "unipos_pos",
    "unipos_batches", "unipos_tables", "unipos_kitchen", "unipos_accounts",
    "unipos_journal", "unipos_attendance", "unipos_payroll", "unipos_transfers",
    "unipos_counters", "unipos_folders_init"
  ];

  const deleteTenant = async (id: string) => {
    // 0. Add to blacklisted / revoked tenant registry
    let blacklisted: string[] = [];
    try {
      blacklisted = JSON.parse(localStorage.getItem("unipos_blacklisted_tenants") || "[]");
    } catch {}
    if (!blacklisted.includes(id)) {
      blacklisted.push(id);
      localStorage.setItem("unipos_blacklisted_tenants", JSON.stringify(blacklisted));
    }

    // 1. Remove from tenant list
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));

    // 2. Immediate session & offline activation revocation
    const activeOfflineTenant = localStorage.getItem("unipos_offline_activated_tenant");
    if (activeOfflineTenant === id) {
      localStorage.removeItem("unipos_offline_activated_system");
      localStorage.removeItem("unipos_offline_activated_tenant");
    }
    if (currentUser?.tenantId === id) {
      setCurrentUser(null);
      localStorage.removeItem("unipos_current_user");
    }

    // 3. Remove all linked invoices
    const updatedInvs = saasInvoices.filter(i => i.tenantId !== id);
    setSaasInvoices(updatedInvs);
    localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));

    // 4. Wipe ALL tenant-specific localStorage keys
    TENANT_DATA_KEYS.forEach(key => {
      localStorage.removeItem(`${key}_${id}`);
    });
    // Also sweep any remaining keys with this tenant suffix that may exist
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.endsWith(`_${id}`)) keysToRemove.push(k);
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));

    // 5. Delete from Supabase unipos_collections & sync updated tenants & blacklist
    try {
      await supabase.from('unipos_collections').delete().eq('tenant_id', id);
      await supabase.from('unipos_global').upsert({
        key: 'unipos_blacklisted_tenants',
        value: blacklisted
      });
      await supabase.from('unipos_global').upsert({
        key: 'unipos_tenants',
        value: updated
      });
    } catch (e) {
      console.warn('Supabase tenant data delete failed:', e);
    }
  };

  const setTenantCurrency = (id: string, currency: string) => {
    const updated = tenants.map(t => t.id === id ? { ...t, defaultCurrency: currency } : t);
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));

    if (currentUser?.tenantId === id) {
      setCurrencySymbol(currency);
    }
  };

  const addTenantCredential = (tenantId: string, cred: Omit<TenantPreset, "id">) => {
    const newCred: TenantPreset = {
      ...cred,
      id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          credentialPresets: [...(t.credentialPresets || []), newCred]
        };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));
  };

  const updateTenantCredential = (tenantId: string, credId: string, updatedCred: Partial<Omit<TenantPreset, "id">>) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          credentialPresets: (t.credentialPresets || []).map(c => c.id === credId ? { ...c, ...updatedCred } : c)
        };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));
  };

  const deleteTenantCredential = (tenantId: string, credId: string) => {
    const updated = tenants.map(t => {
      if (t.id === tenantId) {
        return {
          ...t,
          credentialPresets: (t.credentialPresets || []).filter(c => c.id !== credId)
        };
      }
      return t;
    });
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));
  };

  const addSaasInvoice = (inv: Omit<SaaSInvoice, "id" | "date" | "dueDate">) => {
    const newInv: SaaSInvoice = {
      ...inv,
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    };
    const updated = [newInv, ...saasInvoices];
    setSaasInvoices(updated);
    localStorage.setItem("unipos_invoices", JSON.stringify(updated));
  };

  const updateSaasInvoiceStatus = (id: string, status: "Paid" | "Unpaid") => {
    const updated = saasInvoices.map(i => i.id === id ? { ...i, status } : i);
    setSaasInvoices(updated);
    localStorage.setItem("unipos_invoices", JSON.stringify(updated));
  };

  const deleteSaasInvoice = (id: string) => {
    const updated = saasInvoices.filter(i => i.id !== id);
    setSaasInvoices(updated);
    localStorage.setItem("unipos_invoices", JSON.stringify(updated));
  };

  const updateSaasInvoice = (id: string, updates: Partial<SaaSInvoice>) => {
    const updated = saasInvoices.map(i => i.id === id ? { ...i, ...updates } : i);
    setSaasInvoices(updated);
    localStorage.setItem("unipos_invoices", JSON.stringify(updated));
  };

  const replyToTicket = (ticketId: string, message: string, sender: "Client" | "Admin") => {
    const updated = supportTickets.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: sender === "Admin" ? ("In Progress" as const) : ("Open" as const),
          replies: [...t.replies, { sender, message, date: new Date().toISOString().split("T")[0] }]
        };
      }
      return t;
    });
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
  };

  const createNewTicket = (subject: string, description: string, category: SupportTicket["category"], priority: SupportTicket["priority"]) => {
    const newId = `TCK-${Math.floor(5000 + Math.random() * 5000)}`;
    const newTicket: SupportTicket = {
      id: newId,
      ticketNumber: newId,
      tenantId: currentUser?.tenantId || "AFS-101",
      businessName: currentUser?.businessName || "My Business",
      subject,
      description,
      category,
      priority,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      replies: [{ sender: "Client", message: description, date: new Date().toISOString().split("T")[0] }]
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
    return newTicket;
  };

  const createPublicSupportTicket = (name: string, email: string, subject: string, message: string) => {
    const newId = `TCK-${Math.floor(5000 + Math.random() * 5000)}`;
    const newTicket: SupportTicket = {
      id: newId,
      ticketNumber: newId,
      tenantId: "PUBLIC",
      businessName: `${name} (${email})`,
      subject,
      description: message,
      category: "Technical",
      priority: "Medium",
      status: "Open",
      date: new Date().toISOString().split("T")[0],
      replies: [{ sender: "Client", message: message, date: new Date().toISOString().split("T")[0] }]
    };
    const updated = [newTicket, ...supportTickets];
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
    return newTicket;
  };

  const updateSupportTicket = (ticketId: string, updates: Partial<SupportTicket>) => {
    const updated = supportTickets.map(t => t.id === ticketId ? { ...t, ...updates } : t);
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
  };

  const deleteSupportTicket = (ticketId: string) => {
    const updated = supportTickets.filter(t => t.id !== ticketId);
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
  };

  const deleteSupportTicketReply = (ticketId: string, replyIndex: number) => {
    const updated = supportTickets.map(t => {
      if (t.id === ticketId) {
        const replies = t.replies.filter((_, idx) => idx !== replyIndex);
        return { ...t, replies };
      }
      return t;
    });
    setSupportTickets(updated);
    localStorage.setItem("unipos_tickets", JSON.stringify(updated));
  };

  const logout = () => {
    localStorage.removeItem("unipos_current_user");
    setCurrentUser(null);
  };

  // Client Tenant Inventory Actions
  const addProduct = (prod: Omit<Product, "id">) => {
    let newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    while (products.some(p => p.id === newId)) {
      newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    const newProd: Product = {
      ...prod,
      id: newId
    };
    const updated = [...products, newProd];
    setProducts(updated);
    saveTenantData("unipos_products", updated);

    // Accounting COGS & Stock Asset Adjustments
    addJournalEntry(
      `Product Stock Initialized: ${newProd.name}`,
      [{ accountCode: "1003", amount: newProd.costPrice * newProd.stock }],
      [{ accountCode: "3001", amount: newProd.costPrice * newProd.stock }]
    );
  };

  const addProductsBulk = (prods: Omit<Product, "id">[]) => {
    const newProds: Product[] = [];
    prods.forEach(prod => {
      let newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      while (products.some(p => p.id === newId) || newProds.some(p => p.id === newId)) {
        newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      newProds.push({ ...prod, id: newId });
    });
    
    // Update products in state and localStorage
    const updatedProducts = [...products, ...newProds];
    setProducts(updatedProducts);
    saveTenantData("unipos_products", updatedProducts);

    // Add accounting entries for all products in one go
    const newJournalEntries: JournalEntry[] = [];
    
    setAccounts(prevAccounts => {
      let currentAccounts = [...prevAccounts];
      
      newProds.forEach(newProd => {
        const entryId = `JV-${Math.floor(1000 + Math.random() * 9000)}`;
        const debits = [{ accountCode: "1003", amount: newProd.costPrice * newProd.stock }];
        const credits = [{ accountCode: "3001", amount: newProd.costPrice * newProd.stock }];
        
        newJournalEntries.push({
          id: entryId,
          date: new Date().toISOString(),
          description: `Product Stock Initialized: ${newProd.name}`,
          debits,
          credits
        });

        currentAccounts = currentAccounts.map(acc => {
          let balance = acc.balance;
          const debitMatch = debits.find(d => d.accountCode === acc.code);
          const creditMatch = credits.find(c => c.accountCode === acc.code);
          if (acc.type === "Asset" || acc.type === "Expense") {
            if (debitMatch) balance += debitMatch.amount;
            if (creditMatch) balance -= creditMatch.amount;
          } else {
            if (creditMatch) balance += creditMatch.amount;
            if (debitMatch) balance -= debitMatch.amount;
          }
          return { ...acc, balance };
        });
      });

      saveTenantData("unipos_accounts", currentAccounts);
      return currentAccounts;
    });

    setJournalEntries(prev => [...newJournalEntries, ...prev]);
  };

  const mergeProductsBulk = (
    newProds: Omit<Product, "id">[],
    updates: { id: string; stock: number; costPrice: number; salePrice: number; additionalStock: number }[]
  ) => {
    // 1. Generate unique IDs for new products
    const newProdsWithId: Product[] = [];
    newProds.forEach(prod => {
      let newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      while (products.some(p => p.id === newId) || newProdsWithId.some(p => p.id === newId)) {
        newId = `P-${Math.floor(1000 + Math.random() * 9000)}`;
      }
      newProdsWithId.push({ ...prod, id: newId });
    });

    // 2. Update existing products list
    const updatedProducts = products.map(p => {
      const match = updates.find(u => u.id === p.id);
      if (match) {
        return {
          ...p,
          stock: match.stock,
          costPrice: match.costPrice,
          salePrice: match.salePrice
        };
      }
      return p;
    });

    // Append new products
    const finalProductsList = [...updatedProducts, ...newProdsWithId];
    setProducts(finalProductsList);
    saveTenantData("unipos_products", finalProductsList);

    // 3. Post Journal Entries
    const newJournalEntries: JournalEntry[] = [];
    
    setAccounts(prevAccounts => {
      let currentAccounts = [...prevAccounts];

      // New products
      newProdsWithId.forEach(newProd => {
        const entryId = `JV-${Math.floor(1000 + Math.random() * 9000)}`;
        const amount = newProd.costPrice * newProd.stock;
        const debits = [{ accountCode: "1003", amount }];
        const credits = [{ accountCode: "3001", amount }];
        
        newJournalEntries.push({
          id: entryId,
          date: new Date().toISOString(),
          description: `Product Stock Initialized: ${newProd.name}`,
          debits,
          credits
        });

        currentAccounts = currentAccounts.map(acc => {
          let balance = acc.balance;
          const debitMatch = debits.find(d => d.accountCode === acc.code);
          const creditMatch = credits.find(c => c.accountCode === acc.code);
          if (acc.type === "Asset" || acc.type === "Expense") {
            if (debitMatch) balance += debitMatch.amount;
            if (creditMatch) balance -= creditMatch.amount;
          } else {
            if (creditMatch) balance += creditMatch.amount;
            if (debitMatch) balance -= debitMatch.amount;
          }
          return { ...acc, balance };
        });
      });

      // Merges
      updates.forEach(upd => {
        if (upd.additionalStock > 0) {
          const entryId = `JV-${Math.floor(1000 + Math.random() * 9000)}`;
          const amount = upd.costPrice * upd.additionalStock;
          const debits = [{ accountCode: "1003", amount }];
          const credits = [{ accountCode: "3001", amount }];
          
          const matchName = products.find(p => p.id === upd.id)?.name || "Merged Product";
          newJournalEntries.push({
            id: entryId,
            date: new Date().toISOString(),
            description: `Product Stock Merged (Bulk Upload): ${matchName} (+${upd.additionalStock})`,
            debits,
            credits
          });

          currentAccounts = currentAccounts.map(acc => {
            let balance = acc.balance;
            const debitMatch = debits.find(d => d.accountCode === acc.code);
            const creditMatch = credits.find(c => c.accountCode === acc.code);
            if (acc.type === "Asset" || acc.type === "Expense") {
              if (debitMatch) balance += debitMatch.amount;
              if (creditMatch) balance -= creditMatch.amount;
            } else {
              if (creditMatch) balance += creditMatch.amount;
              if (debitMatch) balance -= debitMatch.amount;
            }
            return { ...acc, balance };
          });
        }
      });

      saveTenantData("unipos_accounts", currentAccounts);
      return currentAccounts;
    });

    setJournalEntries(prev => [...newJournalEntries, ...prev]);
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    const updated = products.map(p => p.id === id ? { ...p, ...prod } : p);
    setProducts(updated);
    saveTenantData("unipos_products", updated);
  };

  const deleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    saveTenantData("unipos_products", updated);
  };

  const deleteProductsBulk = (ids: string[]) => {
    const updated = products.filter(p => !ids.includes(p.id));
    setProducts(updated);
    saveTenantData("unipos_products", updated);
  };

  // Client Tenant CRM Actions
  const addCustomer = (cust: Omit<Customer, "id" | "loyaltyPoints" | "creditBalance" | "dueRecoveryHistory">) => {
    let customerNo = cust.customerNo;
    if (!customerNo && cust.name !== "Walk-in Customer") {
      const seenNos = new Set(customers.map(c => c.customerNo).filter(Boolean) as string[]);
      customerNo = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      while (seenNos.has(customerNo)) {
        customerNo = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
      }
    }
    const newCust: Customer = {
      ...cust,
      customerNo: customerNo || "N/A",
      id: `C-${Math.floor(5000 + Math.random() * 5000)}`,
      loyaltyPoints: 0,
      creditBalance: 0,
      dueRecoveryHistory: []
    };
    const updated = [...customers, newCust];
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);
  };

  const updateCustomer = (id: string, cust: Partial<Omit<Customer, "id" | "loyaltyPoints" | "creditBalance" | "dueRecoveryHistory">>) => {
    const updated = customers.map(c => c.id === id ? { ...c, ...cust } : c);
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);
  };

  const deleteCustomer = (id: string) => {
    const updated = customers.filter(c => c.id !== id);
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);
  };

  const updateCustomerBalance = (id: string, dueAmountChange: number) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          creditBalance: c.creditBalance + dueAmountChange,
          loyaltyPoints: c.loyaltyPoints + (dueAmountChange > 0 ? Math.floor(dueAmountChange / 10) : 0)
        };
      }
      return c;
    });
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);
  };

  const updateCustomerWalletBalance = (id: string, amountChange: number) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          walletBalance: Math.max(0, (c.walletBalance || 0) + amountChange)
        };
      }
      return c;
    });
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);
  };

  const settleDuesWithWallet = (id: string, amountToSettle?: number): SaleTransaction | undefined => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return undefined;

    const availableWallet = cust.walletBalance || 0;
    const pendingDues = cust.creditBalance || 0;

    if (availableWallet <= 0 || pendingDues <= 0) return undefined;

    const settleAmount = Math.min(amountToSettle || pendingDues, availableWallet, pendingDues);
    if (settleAmount <= 0) return undefined;

    // Deduct from wallet balance
    const updatedCusts = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          walletBalance: Math.max(0, (c.walletBalance || 0) - settleAmount)
        };
      }
      return c;
    });
    setCustomers(updatedCusts);
    saveTenantData("unipos_customers", updatedCusts);

    // Record due recovery via Store Wallet Balance
    return recordDueRecovery(id, settleAmount, "Store Wallet Balance");
  };

  const recordDueRecovery = (id: string, amount: number, paymentMethod?: string, counterId?: string): SaleTransaction | undefined => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return undefined;

    const previousDue = cust.creditBalance;
    const remainingDue = Math.max(0, previousDue - amount);

    const updatedCusts = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          creditBalance: remainingDue,
          dueRecoveryHistory: [...(c.dueRecoveryHistory || []), { date: new Date().toISOString().split("T")[0], amount }]
        };
      }
      return c;
    });
    setCustomers(updatedCusts);
    saveTenantData("unipos_customers", updatedCusts);

    // Apply FIFO credit settlement across customer's credit sales
    let remainingPayment = amount;
    const custSales = sales
      .filter(s => s.customerName === cust.name && (s.paymentMethod === "On Credit" || s.isCredit))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (custSales.length > 0) {
      const updatedSales = sales.map(s => {
        if (s.customerName === cust.name && (s.paymentMethod === "On Credit" || s.isCredit) && remainingPayment > 0) {
          const currentDue = (s as any).dueAmount !== undefined ? (s as any).dueAmount : s.total;
          if (currentDue > 0) {
            const settled = Math.min(currentDue, remainingPayment);
            remainingPayment -= settled;
            return {
              ...s,
              dueAmount: currentDue - settled,
              notes: (s.notes ? s.notes + " | " : "") + `Recovered ${settled}`
            };
          }
        }
        return s;
      });
      setSales(updatedSales);
      saveTenantData("unipos_sales", updatedSales);
    }

    // Generate Dues Recovery Receipt Transaction
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const isUserAssignedToCounter = (c: POSCounter, user: any) => {
      if (!c || !user) return false;
      if (c.assignedCashierEmail && user.email && c.assignedCashierEmail.toLowerCase() === user.email.toLowerCase()) return true;
      const cleanAssigned = (c.assignedCashierName || "").replace(/\s*\([^)]*\)/, "").trim().toLowerCase();
      const cleanUser = (user.name || "").replace(/\s*\([^)]*\)/, "").trim().toLowerCase();
      return cleanAssigned && cleanUser && (cleanAssigned === cleanUser || cleanAssigned.includes(cleanUser) || cleanUser.includes(cleanAssigned));
    };

    const activeCounter = posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser));
    const targetCounterName = counterId || activeCounter?.name || "Main Counter";

    const recTxn: SaleTransaction = {
      id: `S-REC-${Math.floor(1000 + Math.random() * 9000)}`,
      receiptNumber: `REC-TXN-${dd}${mm}${yy}${hh}${min}`,
      date: now.toISOString(),
      branch: currentBranch,
      counterId: targetCounterName,
      cashierName: currentUser?.name || activeCounter?.assignedCashierName || "Cashier",
      customerName: cust.name,
      customerNo: cust.customerNo,
      items: [{
        productId: "MISC-REC",
        productName: "Customer Credit Due Recovery Payment",
        price: amount,
        qty: 1,
        subtotal: amount
      }],
      subtotal: amount,
      discount: 0,
      tax: 0,
      total: amount,
      paymentMethod: paymentMethod || "Cash",
      previousCreditBalance: previousDue,
      totalCreditBalance: remainingDue,
      receivedAmount: amount,
      status: "Dues_Recovery" as any,
      notes: `Dues clear payment for ${cust.name}`
    };

    const newSalesList = [recTxn, ...sales];
    setSales(newSalesList);
    saveTenantData("unipos_sales", newSalesList);

    // Live Double Entry Accounting
    const accountCode = (paymentMethod === "Bank Transfer" || paymentMethod === "Card" || paymentMethod === "EasyPaisa / JazzCash") ? "1002" : "1001";
    addJournalEntry(
      `Customer Credit Recovery payment received (${cust.name}) - ${paymentMethod || "Cash"}`,
      [{ accountCode, amount }],
      [{ accountCode: "1004", amount }]  // Credit Accounts Receivable
    );

    return recTxn;
  };

  // Supplier Actions
  const addSupplier = (supp: Omit<Supplier, "id" | "dueAmount" | "purchaseHistory">) => {
    const newSupp: Supplier = {
      ...supp,
      id: `S-${Math.floor(300 + Math.random() * 700)}`,
      dueAmount: 0,
      purchaseHistory: []
    };
    const updated = [...suppliers, newSupp];
    setSuppliers(updated);
    saveTenantData("unipos_suppliers", updated);
  };

  const recordSupplierPayment = (id: string, amount: number) => {
    const updated = suppliers.map(s => {
      if (s.id === id) {
        return {
          ...s,
          dueAmount: Math.max(0, s.dueAmount - amount)
        };
      }
      return s;
    });
    setSuppliers(updated);
    saveTenantData("unipos_suppliers", updated);

    // Live Double Entry Accounting
    addJournalEntry(
      `Supplier Debt Payment disbursed`,
      [{ accountCode: "2001", amount }], // Debit Accounts Payable
      [{ accountCode: "1001", amount }]  // Credit Cash
    );
  };

  const updateSupplier = (id: string, supp: Partial<Omit<Supplier, "id" | "dueAmount" | "purchaseHistory">>) => {
    const updated = suppliers.map(s => s.id === id ? { ...s, ...supp } : s);
    setSuppliers(updated);
    saveTenantData("unipos_suppliers", updated);
  };

  const deleteSupplier = (id: string) => {
    const updated = suppliers.filter(s => s.id !== id);
    setSuppliers(updated);
    saveTenantData("unipos_suppliers", updated);
  };

  // Staff / Employee CRUD
  const addEmployee = (emp: Omit<Employee, "id" | "attendance">) => {
    const newEmp: Employee = {
      ...emp,
      id: `EMP-${Math.floor(100 + Math.random() * 900)}`,
      attendance: {}
    };
    const updated = [...employees, newEmp];
    setEmployees(updated);
    saveTenantData("unipos_employees", updated);
  };

  const updateEmployee = (id: string, emp: Partial<Omit<Employee, "id" | "attendance">>) => {
    const updated = employees.map(e => e.id === id ? { ...e, ...emp } : e);
    setEmployees(updated);
    saveTenantData("unipos_employees", updated);
  };

  const deleteEmployee = (id: string) => {
    const updated = employees.filter(e => e.id !== id);
    setEmployees(updated);
    saveTenantData("unipos_employees", updated);
  };

  // Attendance & Payroll
  const addAttendanceRecord = (record: Omit<AttendanceRecord, "id">) => {
    const newRecord: AttendanceRecord = { ...record, id: `ATT-${Math.floor(1000 + Math.random() * 9000)}` };
    const updated = [...attendanceRecords, newRecord];
    setAttendanceRecords(updated);
    saveTenantData("unipos_attendance", updated);
  };

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    const updated = attendanceRecords.map(r => r.id === id ? { ...r, ...updates } : r);
    setAttendanceRecords(updated);
    saveTenantData("unipos_attendance", updated);
  };

  const addPayrollRecord = (record: Omit<PayrollRecord, "id">) => {
    const newRecord: PayrollRecord = { ...record, id: `PAY-${Math.floor(1000 + Math.random() * 9000)}` };
    const updated = [...payrollRecords, newRecord];
    setPayrollRecords(updated);
    saveTenantData("unipos_payroll", updated);
  };

  const updatePayrollRecord = (id: string, updates: Partial<PayrollRecord>) => {
    const updated = payrollRecords.map(r => r.id === id ? { ...r, ...updates } : r);
    setPayrollRecords(updated);
    saveTenantData("unipos_payroll", updated);
  };

  // Stock Transfers
  const createStockTransfer = (transfer: Omit<StockTransfer, "id">) => {
    const newTransfer: StockTransfer = { ...transfer, id: `TRN-${Math.floor(1000 + Math.random() * 9000)}` };
    const updated = [...stockTransfers, newTransfer];
    setStockTransfers(updated);
    saveTenantData("unipos_transfers", updated);
  };

  const updateStockTransfer = (id: string, updates: Partial<StockTransfer>) => {
    const updated = stockTransfers.map(t => t.id === id ? { ...t, ...updates } : t);
    setStockTransfers(updated);
    saveTenantData("unipos_transfers", updated);
  };

  // Business Settings
  const updateBusinessSettings = (s: Partial<BusinessSettings>) => {
    const updated = { ...businessSettings, ...s };
    setBusinessSettings(updated);
    saveTenantData("unipos_settings", updated);

    if (currentUser?.tenantId) {
      setTenants(prev => {
        const next = prev.map(t => {
          if (t.id === currentUser.tenantId) {
            return {
              ...t,
              businessName: updated.businessName || t.businessName,
              ownerName: updated.ownerName || t.ownerName,
              phone: updated.phone || t.phone,
              email: updated.email || t.email,
            };
          }
          return t;
        });
        localStorage.setItem("unipos_tenants", JSON.stringify(next));
        return next;
      });
    }
  };

  // Advanced ERP: Purchases & Good Receive Notes (GRN)
  const createPurchaseOrder = (po: Omit<PurchaseOrder, "id" | "date" | "status">) => {
    const newPo: PurchaseOrder = {
      ...po,
      id: `PO-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0],
      status: "Pending"
    };
    const updated = [...purchaseOrders, newPo];
    setPurchaseOrders(updated);
    saveTenantData("unipos_pos", updated);
  };

  // ── FIFO Batch Functions ─────────────────────────────────────────────────────

  const addBatch = (batch: Omit<ProductBatch, "id">) => {
    const newBatch: ProductBatch = {
      ...batch,
      id: `BAT-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`
    };
    const updated = [...batches, newBatch];
    setBatches(updated);
    saveTenantData("unipos_batches", updated);
    return newBatch;
  };

  const previewFIFO = (productId: string, qty: number): BatchConsumption[] => {
    // Sort batches FIFO: oldest purchasedAt first
    const available = batches
      .filter(b => b.productId === productId && b.remainingQty > 0)
      .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());

    const result: BatchConsumption[] = [];
    let remaining = qty;

    for (const batch of available) {
      if (remaining <= 0) break;
      const consumed = Math.min(batch.remainingQty, remaining);
      result.push({
        batchId: batch.id,
        batchNumber: batch.batchNumber,
        qty: consumed,
        costPrice: batch.costPrice,
        salePrice: batch.salePrice,
        expiryDate: batch.expiryDate
      });
      remaining -= consumed;
    }

    return result;
  };

  const getProductBatches = (productId: string): ProductBatch[] => {
    return batches
      .filter(b => b.productId === productId)
      .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());
  };

  const receiveGoods = (id: string, batchData?: Array<{ productId: string; batchNumber: string; expiryDate?: string; salePrice: number }>) => {
    const po = purchaseOrders.find(p => p.id === id);
    if (!po) return;

    const updatedPOs = purchaseOrders.map(p => {
      if (p.id !== id) return p;
      return { ...p, status: "Received" as const };
    });

    // 2. Increment products inventory sharded stock
    const updatedProds = products.map(p => {
      const poItem = po.items.find(item => item.productId === p.id);
      if (poItem) {
        return {
          ...p,
          stock: p.stock + poItem.qty
        };
      }
      return p;
    });
    setProducts(updatedProds);
    saveTenantData("unipos_products", updatedProds);

    // 3. Create FIFO batches for each received item
    const now = new Date().toISOString();
    const newBatches = [...batches];
    po.items.forEach(item => {
      const batchInfo = batchData?.find(b => b.productId === item.productId);
      const product = products.find(p => p.id === item.productId);
      const newBatch: ProductBatch = {
        id: `BAT-${Date.now().toString().slice(-6)}-${Math.floor(10 + Math.random() * 90)}`,
        productId: item.productId,
        batchNumber: batchInfo?.batchNumber || `BTH-${po.id.split("-")[1] || "AUTO"}`,
        expiryDate: batchInfo?.expiryDate,
        purchasedAt: now,
        costPrice: item.costPrice,
        salePrice: batchInfo?.salePrice || product?.salePrice || item.costPrice * 1.3,
        initialQty: item.qty,
        remainingQty: item.qty
      };
      newBatches.push(newBatch);
    });
    setBatches(newBatches);
    saveTenantData("unipos_batches", newBatches);

    // 4. Update Supplier Accounts Payable balances
    const updatedSuppliers = suppliers.map(s => {
      if (s.id === po.supplierId) {
        return {
          ...s,
          dueAmount: s.dueAmount + po.total,
          purchaseHistory: [...s.purchaseHistory, { date: new Date().toISOString().split("T")[0], orderId: po.id, total: po.total }]
        };
      }
      return s;
    });
    setSuppliers(updatedSuppliers);
    saveTenantData("unipos_suppliers", updatedSuppliers);

    // 5. Double Entry Accounting Journal Voucher
    addJournalEntry(
      `Stock GRN received for ${po.supplierName} (PO: ${po.id})`,
      [{ accountCode: "1003", amount: po.total }], // Debit Stock asset
      [{ accountCode: "2001", amount: po.total }]  // Credit Accounts Payable
    );

    setPurchaseOrders(updatedPOs);
    saveTenantData("unipos_pos", updatedPOs);
  };

  // Complete Retail & Wholesale Sales Engine with Live Inventory Reduction & Double-Entry Accounting Sync
  const assignCounterCashier = (counterId: string, cashierName: string, openingFloat: number) => {
    const updated = posCounters.map(c => {
      if (c.id === counterId || c.name.toLowerCase().includes(counterId.toLowerCase())) {
        return {
          ...c,
          assignedCashierName: cashierName,
          openingFloat: Number(openingFloat) || 0,
          status: "Active" as const,
          startedAt: new Date().toISOString(),
          collectedCashDeduction: 0
        };
      }
      return c;
    });
    // If custom counter name passed
    const exists = updated.some(c => c.id === counterId || c.name.toLowerCase().includes(counterId.toLowerCase()));
    if (!exists) {
      updated.push({
        id: `counter-${Date.now()}`,
        name: counterId,
        assignedCashierName: cashierName,
        assignedCashierEmail: "",
        openingFloat: Number(openingFloat) || 0,
        status: "Active",
        startedAt: new Date().toISOString(),
        collectedCashDeduction: 0
      });
    }
    setPosCounters(updated);
    saveTenantData("unipos_counters", updated);
  };

  const collectCounterCash = (counterId: string, collectedAmount: number) => {
    const updated = posCounters.map(c => {
      if (c.id === counterId || c.name.toLowerCase().includes(counterId.toLowerCase())) {
        return {
          ...c,
          collectedCashDeduction: (c.collectedCashDeduction || 0) + Number(collectedAmount),
        };
      }
      return c;
    });
    setPosCounters(updated);
    saveTenantData("unipos_counters", updated);
  };

  const closeCounterSession = (counterId: string, closingCash: number) => {
    const updated = posCounters.map(c => {
      if (c.id === counterId || c.name.toLowerCase().includes(counterId.toLowerCase())) {
        return {
          ...c,
          status: "Closed" as const,
          assignedCashierName: "Unassigned",
          assignedCashierEmail: "",
          openingFloat: 0,
          notes: `Closed with ${closingCash} cash`
        };
      }
      return c;
    });
    setPosCounters(updated);
    saveTenantData("unipos_counters", updated);
  };

  const startPOSShift = (counterId: string, openingFloat: number): POSShift => {
    const newShift: POSShift = {
      id: `SHIFT-${Date.now()}`,
      counterId: counterId || "Counter 1",
      cashierName: currentUser?.name || "Cashier",
      cashierEmail: currentUser?.email || "cashier@store.com",
      openingFloat: Number(openingFloat) || 0,
      startTime: new Date().toISOString(),
      status: "Open"
    };
    const updated = [newShift, ...posShifts];
    setPosShifts(updated);
    saveTenantData("unipos_shifts", updated);
    return newShift;
  };

  const closePOSShift = (shiftId: string, actualClosingCash: number, notes?: string) => {
    let closedCounterId = "";
    let closedCashierName = "";

    const updatedShifts = posShifts.map(s => {
      if (s.id === shiftId) {
        closedCounterId = s.counterId;
        closedCashierName = s.cashierName;
        return {
          ...s,
          status: "Closed" as const,
          endTime: new Date().toISOString(),
          closingCash: actualClosingCash,
          notes: notes || ""
        };
      }
      return s;
    });
    setPosShifts(updatedShifts);
    saveTenantData("unipos_shifts", updatedShifts);

    // Auto-update counter status to Closed / Offline
    if (closedCounterId || closedCashierName) {
      const updatedCounters = posCounters.map(c => {
        const matchesCounter = closedCounterId && (c.id.toLowerCase() === closedCounterId.toLowerCase() || c.name.toLowerCase().includes(closedCounterId.toLowerCase()));
        const matchesCashier = closedCashierName && c.assignedCashierName && c.assignedCashierName.toLowerCase().includes(closedCashierName.toLowerCase().replace(/\s*\([^)]*\)/, "").trim());

        if (matchesCounter || matchesCashier) {
          return {
            ...c,
            status: "Closed" as const,
            notes: `Shift closed & cashier checked out at ${new Date().toLocaleTimeString()}`
          };
        }
        return c;
      });
      setPosCounters(updatedCounters);
      saveTenantData("unipos_counters", updatedCounters);
    }
  };

  const addSale = (sale: Omit<SaleTransaction, "id" | "receiptNumber" | "date">) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const receiptNumber = (sale as any).receiptNumber || `MT-TXN-${dd}${mm}${yy}${hh}${min}`;
    const matchCust = customers.find(c => c.name === sale.customerName);
    const customerNo = matchCust?.customerNo || "N/A";

    const newSale: SaleTransaction = {
      ...sale,
      id: `S-${Math.floor(5000 + Math.random() * 5000)}`,
      receiptNumber,
      date: new Date().toISOString(),
      customerNo
    };

    // 2. Adjust products inventory & compute COGS
    const isReturn = sale.status === "Returned" || sale.status === "Refunded";
    const isDuesRecovery = (sale as any).status === "Dues_Recovery";
    let totalCogs = 0;

    if (!isDuesRecovery) {
      const updatedProducts = [...products];

      sale.items.forEach(cartItem => {
        const pIdx = updatedProducts.findIndex(p => p.id === cartItem.productId);
        if (pIdx === -1) return;
        const p = updatedProducts[pIdx];

        totalCogs += p.costPrice * cartItem.qty;

        if (isReturn) {
          // RETURN SALE: RESTORE / ADD stock back to inventory (+)
          if (p.ingredients && p.ingredients.length > 0) {
            p.ingredients.forEach(ing => {
              const ingIdx = updatedProducts.findIndex(ip => ip.id === ing.productId);
              if (ingIdx !== -1) {
                updatedProducts[ingIdx] = {
                  ...updatedProducts[ingIdx],
                  stock: updatedProducts[ingIdx].stock + (ing.qty * cartItem.qty)
                };
              }
            });
          } else {
            updatedProducts[pIdx] = {
              ...p,
              stock: p.stock + cartItem.qty
            };
          }
        } else {
          // NORMAL SALE: DEDUCT stock from inventory (-)
          if (p.ingredients && p.ingredients.length > 0) {
            p.ingredients.forEach(ing => {
              const ingIdx = updatedProducts.findIndex(ip => ip.id === ing.productId);
              if (ingIdx !== -1) {
                updatedProducts[ingIdx] = {
                  ...updatedProducts[ingIdx],
                  stock: Math.max(0, updatedProducts[ingIdx].stock - (ing.qty * cartItem.qty))
                };
              }
            });
          } else {
            updatedProducts[pIdx] = {
              ...p,
              stock: Math.max(0, p.stock - cartItem.qty)
            };
          }
        }
      });

      setProducts(updatedProducts);
      saveTenantData("unipos_products", updatedProducts);

      // 2b. Consume or Restore FIFO batches
      const updatedBatches = [...batches];
      sale.items.forEach(cartItem => {
        if (isReturn) {
          // Restore batch stock
          const matchBatch = updatedBatches.find(b => b.productId === cartItem.productId);
          if (matchBatch) {
            const idx = updatedBatches.findIndex(b => b.id === matchBatch.id);
            if (idx !== -1) {
              updatedBatches[idx] = { ...updatedBatches[idx], remainingQty: updatedBatches[idx].remainingQty + cartItem.qty };
            }
          }
        } else {
          // Consume FIFO batch
          let remaining = cartItem.qty;
          const available = updatedBatches
            .filter(b => b.productId === cartItem.productId && b.remainingQty > 0)
            .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());

          for (const batch of available) {
            if (remaining <= 0) break;
            const idx = updatedBatches.findIndex(b => b.id === batch.id);
            if (idx !== -1) continue;
            const consumed = Math.min(updatedBatches[idx].remainingQty, remaining);
            updatedBatches[idx] = { ...updatedBatches[idx], remainingQty: updatedBatches[idx].remainingQty - consumed };
            remaining -= consumed;
          }
        }
      });
      setBatches(updatedBatches);
      saveTenantData("unipos_batches", updatedBatches);
    }


    // 3. Accumulate loyalty points & credit/wallet balance for customer
    if (matchCust && matchCust.id !== "C-203") {
      const addedPoints = isReturn ? 0 : Math.floor(sale.total / 50);
      const deductPoints = sale.redeemLoyalty ? 1000 : 0;
      
      // If payment is "On Credit" or split payment contains "On Credit", add to customer creditBalance (Accounts Receivable)
      let creditChange = 0;
      if (sale.paymentMethod === "On Credit" && sale.customerName !== "Walk-in Customer") {
        creditChange = sale.total;
      } else if (sale.splitPayments && sale.customerName !== "Walk-in Customer") {
        creditChange = sale.splitPayments["On Credit"] || 0;
      }

      // If return sale with "Store Wallet Credit", add (+) to walletBalance
      // If payment method is "Store Wallet Credit", deduct (-) from walletBalance
      let walletChange = 0;
      const isWalletPayment = sale.paymentMethod === "Store Wallet Credit" || sale.paymentMethod === "Wallet";
      if (isWalletPayment && sale.customerName !== "Walk-in Customer") {
        if (isReturn) {
          walletChange = sale.total;
        } else {
          walletChange = -sale.total;
        }
      } else if (sale.splitPayments && sale.customerName !== "Walk-in Customer") {
        const walletAmt = sale.splitPayments["Store Wallet Credit"] || sale.splitPayments["Wallet"] || 0;
        if (walletAmt > 0) {
          if (isReturn) {
            walletChange = walletAmt;
          } else {
            walletChange = -walletAmt;
          }
        }
      }

      const prevCredit = matchCust.creditBalance || 0;
      const newCredit = Math.max(0, prevCredit + creditChange);
      newSale.previousCreditBalance = prevCredit;
      newSale.totalCreditBalance = newCredit;
      newSale.loyaltyPointsEarned = addedPoints;
      newSale.loyaltyPointsBalance = Math.max(0, matchCust.loyaltyPoints + addedPoints - deductPoints);
      newSale.redeemLoyalty = sale.redeemLoyalty;

      const updatedCusts = customers.map(c => {
        if (c.id === matchCust.id || c.name.toLowerCase().trim() === matchCust.name.toLowerCase().trim() || (c.customerNo && c.customerNo === matchCust.customerNo)) {
          const finalPoints = Math.max(0, c.loyaltyPoints + addedPoints - deductPoints);
          const finalWallet = Math.max(0, (c.walletBalance || 0) + walletChange);
          return {
            ...c,
            loyaltyPoints: finalPoints,
            creditBalance: newCredit,
            walletBalance: finalWallet
          };
        }
        return c;
      });
      setCustomers(updatedCusts);
      saveTenantData("unipos_customers", updatedCusts);
    }

    // 1. Save Sale record (with attached credit statement balances)
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveTenantData("unipos_sales", updatedSales);

    // 4. Fire Double-Entry Accounting Journal Vouchers
    if (isReturn) {
      // ── RETURN SALE ACCOUNTING ─────────────────────────────────────────────
      // The returned sale REVERSES revenue — it is NOT new income.
      //
      // Scenario A: Cash Refund
      //   Dr. Sales Returns & Allowances (4001)  ← Revenue reduced
      //   Cr. Cash (1001)                         ← Cash paid out
      //
      // Scenario B: Store Wallet Credit
      //   Dr. Sales Returns & Allowances (4001)  ← Revenue reduced
      //   Cr. Customer Wallet Payable (2003)      ← Liability: we OWE customer
      //
      // COGS Reversal (stock is returned, cost is reversed):
      //   Dr. Inventory Asset (1003)              ← Stock comes back
      //   Cr. COGS (5001)                         ← Expense reduced

      const isWalletReturn = sale.paymentMethod === "Store Wallet Credit" || sale.paymentMethod === "Wallet";
      const creditAccount = isWalletReturn ? "2003" : "1001"; // Wallet Liability OR Cash

      addJournalEntry(
        `Sales Return receipt ${receiptNumber}`,
        [{ accountCode: "4001", amount: sale.total }],  // Debit: Sales Returns (reduces revenue)
        [{ accountCode: creditAccount, amount: sale.total }] // Credit: Cash out OR Wallet Liability
      );

      // COGS Reversal — inventory is restored so cost goes back
      if (totalCogs > 0) {
        addJournalEntry(
          `COGS Reversal for return ${receiptNumber}`,
          [{ accountCode: "1003", amount: totalCogs }], // Debit: Inventory Asset (stock restored)
          [{ accountCode: "5001", amount: totalCogs }]  // Credit: COGS (expense reduced)
        );
      }

    } else {
      // ── NORMAL SALE ACCOUNTING ─────────────────────────────────────────────
      // Cash/Bank/Receivables Debit, Sales Revenue Credit
      const debits: Array<{ accountCode: string; amount: number }> = [];
      if (sale.splitPayments) {
        Object.entries(sale.splitPayments).forEach(([method, amt]) => {
          if ((amt as number) > 0) {
            let accountCode = "1002";
            if (method === "Cash") accountCode = "1001";
            else if (method === "On Credit") accountCode = "1004";
            else if (method === "Store Wallet Credit" || method === "Wallet") accountCode = "2003";
            debits.push({ accountCode, amount: amt as number });
          }
        });
      } else {
        let paymentAccount = "1002";
        if (sale.paymentMethod === "Cash") paymentAccount = "1001";
        else if (sale.paymentMethod === "On Credit") paymentAccount = "1004";
        else if (sale.paymentMethod === "Store Wallet Credit" || sale.paymentMethod === "Wallet") paymentAccount = "2003";
        debits.push({ accountCode: paymentAccount, amount: sale.total });
      }

      addJournalEntry(
        `Sales Checkout receipt ${receiptNumber}`,
        debits,
        [
          { accountCode: "4001", amount: sale.subtotal - sale.discount }, // Revenue Credit
          { accountCode: "2001", amount: sale.tax }                        // Tax Payable
        ]
      );

      // COGS Debit, Stock Valuation Credit
      addJournalEntry(
        `Inventory Cost matching receipt ${receiptNumber}`,
        [{ accountCode: "5001", amount: totalCogs }], // COGS Expense Debit
        [{ accountCode: "1003", amount: totalCogs }]  // Product Asset Credit
      );
    }

    return newSale;
  };

  // Expense Management
  const addExpense = (exp: Omit<Expense, "id" | "date">) => {
    const newExp: Expense = {
      ...exp,
      id: `E-${Math.floor(600 + Math.random() * 400)}`,
      date: new Date().toISOString().split("T")[0]
    };
    const updated = [newExp, ...expenses];
    setExpenses(updated);
    saveTenantData("unipos_expenses", updated);

    // Double Entry Accounting
    addJournalEntry(
      `Expense Paid: ${exp.category}`,
      [{ accountCode: "5003", amount: exp.amount }], // Debit Expense account
      [{ accountCode: "1001", amount: exp.amount }]  // Credit Cash account
    );
  };

  // Payroll Attendance log
  const markAttendance = (empId: string, date: string, status: "Present" | "Absent" | "Late" | "Leave") => {
    const updated = employees.map(emp => {
      if (emp.id === empId) {
        return {
          ...emp,
          attendance: { ...emp.attendance, [date]: status }
        };
      }
      return emp;
    });
    setEmployees(updated);
    saveTenantData("unipos_employees", updated);
  };

  const processSalary = (empId: string, amount: number) => {
    // Live Double Entry Accounting
    addJournalEntry(
      `Disbursed monthly employee payroll salary`,
      [{ accountCode: "5003", amount }], // Debit Operational Payroll Expense
      [{ accountCode: "1002", amount }]  // Credit Bank account
    );
  };

  // Restaurant Management
  // --- TABLE CRUD ---
  const addTable = (t: Omit<RestaurantTable, "id" | "status">) => {
    const newId = `T-${Date.now()}`;
    const newTable: RestaurantTable = { ...t, id: newId, status: "Free" };
    setTables(prev => {
      const next = [...prev, newTable];
      saveTenantData("unipos_tables", next);
      return next;
    });
    return newId;
  };

  const updateTableBase = (id: string, updates: Partial<RestaurantTable>) => {
    setTables(prev => {
      const next = prev.map(t => t.id === id ? { ...t, ...updates } : t);
      saveTenantData("unipos_tables", next);
      return next;
    });
  };

  const deleteTable = (id: string) => {
    const next = tables.filter(t => t.id !== id);
    setTables(next);
    saveTenantData("unipos_tables", next);
  };

  const updateTableStatus = (id: string, status: RestaurantTable["status"], activeOrderId?: string, waiter?: string) => {
    setTables(prev => {
      const updated = prev.map(t => {
        if (t.id === id) {
          return { 
            ...t, 
            status, 
            activeOrderId: status === "Free" ? undefined : activeOrderId, 
            waiterName: status === "Free" ? undefined : waiter,
            currentBill: status === "Free" ? [] : t.currentBill 
          };
        }
        return t;
      });
      saveTenantData("unipos_tables", updated);
      return updated;
    });
  };

  const updateTableBill = (id: string, bill: TableBillItem[]) => {
    setTables(prev => {
      const updated = prev.map(t => {
        if (t.id === id) return { ...t, currentBill: bill };
        return t;
      });
      saveTenantData("unipos_tables", updated);
      return updated;
    });
  };

  const dispatchKitchenTicket = (tableNumber: string, items: Array<{ name: string; qty: number; notes?: string }>) => {
    const newTicket: KitchenTicket = {
      id: `K-${Math.floor(100 + Math.random() * 900)}`,
      tableNumber,
      orderTime: new Date().toISOString(),
      status: "Pending",
      items
    };
    const updated = [...kitchenTickets, newTicket];
    setKitchenTickets(updated);
    saveTenantData("unipos_kitchen", updated);
  };

  const completeKitchenTicket = (id: string) => {
    const updated = kitchenTickets.map(t => t.id === id ? { ...t, status: "Ready" as const } : t);
    setKitchenTickets(updated);
    saveTenantData("unipos_kitchen", updated);
  };

  const clearKitchenTicket = (id: string) => {
    const updated = kitchenTickets.filter(t => t.id !== id);
    setKitchenTickets(updated);
    saveTenantData("unipos_kitchen", updated);
  };

  const clearTableKitchenTickets = (tableNumber: string) => {
    const updated = kitchenTickets.filter(t => t.tableNumber !== tableNumber);
    setKitchenTickets(updated);
    saveTenantData("unipos_kitchen", updated);
  };

  // Central Double-Entry Ledger System (PostgreSQL transaction logic emulation)
  const addJournalEntry = (desc: string, debits: Array<{ accountCode: string; amount: number }>, credits: Array<{ accountCode: string; amount: number }>) => {
    const entryId = `JV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEntry: JournalEntry = {
      id: entryId,
      date: new Date().toISOString(),
      description: desc,
      debits,
      credits
    };

    // Update balances in general ledger codes
    const updatedAccounts = accounts.map(acc => {
      let balance = acc.balance;
      const debitMatch = debits.find(d => d.accountCode === acc.code);
      const creditMatch = credits.find(c => c.accountCode === acc.code);

      // Rule of Accounts:
      // Assets / Expenses: Debit increases (+), Credit decreases (-)
      // Liabilities / Equity / Revenue: Credit increases (+), Debit decreases (-)
      if (acc.type === "Asset" || acc.type === "Expense") {
        if (debitMatch) balance += debitMatch.amount;
        if (creditMatch) balance -= creditMatch.amount;
      } else {
        if (creditMatch) balance += creditMatch.amount;
        if (debitMatch) balance -= debitMatch.amount;
      }

      return { ...acc, balance };
    });

    setAccounts(updatedAccounts);
    setJournalEntries(prev => [newEntry, ...prev]);
    saveTenantData("unipos_accounts", updatedAccounts);
  };


  // HRMS Action Handlers
  const addHREmployee = (emp: Omit<HREmployee, "id">) => {
    const newEmp: HREmployee = {
      ...emp,
      id: `HRE-${Math.floor(100 + Math.random() * 900)}`
    };
    const updated = [newEmp, ...hrEmployees];
    setHrEmployees(updated);
    saveTenantData("unipos_hr_employees", updated);
  };

  const updateHREmployee = (id: string, emp: Partial<HREmployee>) => {
    const updated = hrEmployees.map(e => e.id === id ? { ...e, ...emp } : e);
    setHrEmployees(updated);
    saveTenantData("unipos_hr_employees", updated);
  };

  const deleteHREmployee = (id: string) => {
    const updated = hrEmployees.filter(e => e.id !== id);
    setHrEmployees(updated);
    saveTenantData("unipos_hr_employees", updated);
  };

  const recordHRAttendance = (attendance: Omit<HRAttendance, "id">) => {
    const newAtt: HRAttendance = {
      ...attendance,
      id: `HRA-${Math.floor(1000 + Math.random() * 9000)}`
    };
    const updated = [newAtt, ...hrAttendance];
    setHrAttendance(updated);
    saveTenantData("unipos_hr_attendance", updated);
  };

  const updateHRAttendance = (id: string, updates: Partial<HRAttendance>) => {
    const updated = hrAttendance.map(a => a.id === id ? { ...a, ...updates } : a);
    setHrAttendance(updated);
    saveTenantData("unipos_hr_attendance", updated);
  };

  const submitHRLeave = (leave: Omit<HRLeave, "id" | "status" | "appliedOn">) => {
    const newLeave: HRLeave = {
      ...leave,
      id: `HRL-${Math.floor(100 + Math.random() * 900)}`,
      status: "Pending",
      appliedOn: new Date().toISOString().split("T")[0]
    };
    const updated = [newLeave, ...hrLeaves];
    setHrLeaves(updated);
    saveTenantData("unipos_hr_leaves", updated);
  };

  const updateHRLeaveStatus = (id: string, status: HRLeave["status"], approvedBy?: string) => {
    const updated = hrLeaves.map(l => l.id === id ? { ...l, status, approvedBy: approvedBy || "SuperAdmin / HR" } : l);
    setHrLeaves(updated);
    saveTenantData("unipos_hr_leaves", updated);
  };

  const processHRPayroll = (month: string, items: HRPayrollItem[]) => {
    const totalGross = items.reduce((a, b) => a + b.basicSalary + b.allowances, 0);
    const totalDeductions = items.reduce((a, b) => a + b.deductions, 0);
    const totalNet = totalGross - totalDeductions;

    const newBatch: HRPayrollBatch = {
      id: `HRPAY-${month}`,
      month,
      processedDate: new Date().toISOString().split("T")[0],
      totalEmployees: items.length,
      totalGross,
      totalDeductions,
      totalNet,
      status: "Paid",
      items
    };

    const updated = [newBatch, ...hrPayrolls.filter(b => b.month !== month)];
    setHrPayrolls(updated);
    saveTenantData("unipos_hr_payrolls", updated);

    // Auto-update active loan repayments for this month
    const updatedLoans = hrLoans.map(loan => {
      if (loan.status !== "Active") return loan;
      const empInPayroll = items.some(item => item.employeeId === loan.employeeId);
      if (!empInPayroll) return loan;

      let loanUpdated = false;
      let addedRepayment = 0;
      const updatedRepayments = loan.repayments.map(rep => {
        if (rep.month === month && rep.status === "Pending") {
          loanUpdated = true;
          addedRepayment += rep.amount;
          return {
            ...rep,
            status: "Deducted" as const,
            deductedAt: new Date().toISOString(),
            payrollBatchId: `HRPAY-${month}`
          };
        }
        return rep;
      });

      if (loanUpdated) {
        const newTotalRepaid = loan.totalRepaid + addedRepayment;
        const newRemaining = Math.max(0, loan.principalAmount - newTotalRepaid);
        return {
          ...loan,
          totalRepaid: newTotalRepaid,
          remainingBalance: newRemaining,
          status: newRemaining <= 0 ? ("Completed" as const) : ("Active" as const),
          repayments: updatedRepayments
        };
      }
      return loan;
    });

    setHrLoans(updatedLoans);
    saveTenantData("unipos_hr_loans", updatedLoans);

    return newBatch;
  };

  const applyHRLoan = (loanData: Omit<HRLoan, "id" | "loanCode" | "totalRepaid" | "remainingBalance" | "repayments">) => {
    const repayments: HRLoanRepayment[] = [];
    const [sYear, sMonth] = loanData.startDeductionMonth.split("-").map(Number);
    let currY = sYear || new Date().getFullYear();
    let currM = sMonth || (new Date().getMonth() + 1);

    for (let i = 1; i <= loanData.tenureMonths; i++) {
      const mStr = `${currY}-${String(currM).padStart(2, "0")}`;
      repayments.push({
        installmentNo: i,
        month: mStr,
        amount: loanData.monthlyInstallment,
        status: "Pending"
      });
      currM++;
      if (currM > 12) {
        currM = 1;
        currY++;
      }
    }

    const newLoan: HRLoan = {
      ...loanData,
      id: `LOAN-${Date.now()}`,
      loanCode: `LN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      totalRepaid: 0,
      remainingBalance: loanData.principalAmount,
      repayments
    };

    const updated = [newLoan, ...hrLoans];
    setHrLoans(updated);
    saveTenantData("unipos_hr_loans", updated);
    return newLoan;
  };

  const updateHRLoanStatus = (id: string, status: HRLoan["status"], approvedBy?: string) => {
    const updated = hrLoans.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status,
          approvedBy: approvedBy || (status === "Active" ? "HR & Finance Director" : l.approvedBy),
          approvedAt: status === "Active" ? new Date().toISOString().split("T")[0] : l.approvedAt
        };
      }
      return l;
    });
    setHrLoans(updated);
    saveTenantData("unipos_hr_loans", updated);
  };

  const recordLoanManualRepayment = (loanId: string, amount: number, notes?: string) => {
    const updated = hrLoans.map(l => {
      if (l.id === loanId) {
        const newTotalRepaid = l.totalRepaid + amount;
        const newRemaining = Math.max(0, l.principalAmount - newTotalRepaid);
        let remAmount = amount;
        const updatedRepayments = l.repayments.map(rep => {
          if (rep.status === "Pending" && remAmount >= rep.amount) {
            remAmount -= rep.amount;
            return {
              ...rep,
              status: "Deducted" as const,
              deductedAt: new Date().toISOString(),
              payrollBatchId: "MANUAL-SETTLEMENT"
            };
          }
          return rep;
        });

        return {
          ...l,
          totalRepaid: newTotalRepaid,
          remainingBalance: newRemaining,
          status: newRemaining <= 0 ? ("Completed" as const) : ("Active" as const),
          repayments: updatedRepayments,
          notes: notes ? (l.notes ? `${l.notes} | ${notes}` : notes) : l.notes
        };
      }
      return l;
    });
    setHrLoans(updated);
    saveTenantData("unipos_hr_loans", updated);
  };

  const deleteHRLoan = (id: string) => {
    const updated = hrLoans.filter(l => l.id !== id);
    setHrLoans(updated);
    saveTenantData("unipos_hr_loans", updated);
  };

  const addHRJobOpening = (job: Omit<HRJobOpening, "id" | "applicantsCount" | "postedDate">) => {
    const newJob: HRJobOpening = {
      ...job,
      id: `HRJ-${Math.floor(100 + Math.random() * 900)}`,
      applicantsCount: 0,
      postedDate: new Date().toISOString().split("T")[0]
    };
    const updated = [newJob, ...hrJobs];
    setHrJobs(updated);
    saveTenantData("unipos_hr_jobs", updated);
  };

  // ── HRMS Settings & Recruitment Action Handlers ──
  const addHRDepartment = (dept: Omit<HRDepartment, "id">) => {
    const newDept: HRDepartment = {
      ...dept,
      id: `DEPT-${Math.floor(100 + Math.random() * 900)}`
    };
    const updated = [newDept, ...hrDepartments];
    setHrDepartments(updated);
    saveTenantData("unipos_hr_departments", updated);
  };

  const updateHRDepartment = (id: string, updates: Partial<HRDepartment>) => {
    const updated = hrDepartments.map(d => d.id === id ? { ...d, ...updates } : d);
    setHrDepartments(updated);
    saveTenantData("unipos_hr_departments", updated);
  };

  const deleteHRDepartment = (id: string) => {
    const updated = hrDepartments.filter(d => d.id !== id);
    setHrDepartments(updated);
    saveTenantData("unipos_hr_departments", updated);
  };

  const addHRDesignation = (desg: Omit<HRDesignation, "id">) => {
    const newDesg: HRDesignation = {
      ...desg,
      id: `DESG-${Math.floor(100 + Math.random() * 900)}`
    };
    const updated = [newDesg, ...hrDesignations];
    setHrDesignations(updated);
    saveTenantData("unipos_hr_designations", updated);
  };

  const updateHRDesignation = (id: string, updates: Partial<HRDesignation>) => {
    const updated = hrDesignations.map(d => d.id === id ? { ...d, ...updates } : d);
    setHrDesignations(updated);
    saveTenantData("unipos_hr_designations", updated);
  };

  const deleteHRDesignation = (id: string) => {
    const updated = hrDesignations.filter(d => d.id !== id);
    setHrDesignations(updated);
    saveTenantData("unipos_hr_designations", updated);
  };

  const addHRShift = (shift: Omit<HRShift, "id">) => {
    const newShift: HRShift = {
      ...shift,
      id: `SHF-${Math.floor(100 + Math.random() * 900)}`
    };
    const updated = [newShift, ...hrShifts];
    setHrShifts(updated);
    saveTenantData("unipos_hr_shifts", updated);
  };

  const updateHRShift = (id: string, updates: Partial<HRShift>) => {
    const updated = hrShifts.map(s => s.id === id ? { ...s, ...updates } : s);
    setHrShifts(updated);
    saveTenantData("unipos_hr_shifts", updated);
  };

  const deleteHRShift = (id: string) => {
    const updated = hrShifts.filter(s => s.id !== id);
    setHrShifts(updated);
    saveTenantData("unipos_hr_shifts", updated);
  };

  const addHRCandidate = (cand: Omit<HRCandidate, "id" | "appliedDate">) => {
    const newCand: HRCandidate = {
      ...cand,
      id: `CND-${Math.floor(100 + Math.random() * 900)}`,
      appliedDate: new Date().toISOString().split("T")[0],
      onboardingStage: cand.stage === "Hired" ? "Pending IT Provisioning" : undefined
    };
    const updated = [newCand, ...hrCandidates];
    setHrCandidates(updated);
    saveTenantData("unipos_hr_candidates", updated);
  };

  const updateHRCandidate = (id: string, updates: Partial<HRCandidate>) => {
    const updated = hrCandidates.map(c => {
      if (c.id === id) {
        const next = { ...c, ...updates };
        if (updates.stage && updates.stage !== "Hired") {
          next.onboardingStage = undefined;
        } else if (updates.stage === "Hired" && !next.onboardingStage) {
          next.onboardingStage = "Pending IT Provisioning";
        }
        return next;
      }
      return c;
    });
    setHrCandidates(updated);
    saveTenantData("unipos_hr_candidates", updated);
  };

  const deleteHRCandidate = (id: string) => {
    const updated = hrCandidates.filter(c => c.id !== id);
    setHrCandidates(updated);
    saveTenantData("unipos_hr_candidates", updated);
  };

  // Step 2: IT Department Provisioning Action
  const provisionITCredentials = (candidateId: string, workEmail: string, tempPassword: string, customEmployeeCode?: string) => {
    const bName = currentUser?.businessName || businessSettings?.businessName || "MT Software";
    const autoCode = customEmployeeCode?.trim() || generateNextEmployeeCode(bName, hrEmployees.length);
    const nowStr = new Date().toISOString();

    const updatedCands = hrCandidates.map(c => {
      if (c.id === candidateId) {
        return {
          ...c,
          stage: "Hired" as const,
          onboardingStage: "Pending Finance Confirmation" as const,
          generatedEmployeeCode: autoCode,
          workEmail,
          tempPassword,
          itProvisionedAt: nowStr
        };
      }
      return c;
    });

    setHrCandidates(updatedCands);
    saveTenantData("unipos_hr_candidates", updatedCands);

    // Register credential preset for login
    if (tempPassword && workEmail && currentUser?.tenantId) {
      const activeTenantId = currentUser.tenantId;
      const targetCand = hrCandidates.find((c) => c.id === candidateId);
      setTenants((prevTenants) => {
        const nextTenants = prevTenants.map((t) => {
          if (t.id === activeTenantId) {
            const existingPresets = t.credentialPresets || [];
            const newPreset = {
              id: `CRED-STAFF-${Math.floor(1000 + Math.random() * 9000)}`,
              label: `${targetCand?.name || 'Staff'} (${targetCand?.appliedPosition || 'Employee'})`,
              email: workEmail.trim().toLowerCase(),
              pass: tempPassword,
              role: "Cashier" as const
            };
            const filtered = existingPresets.filter((p) => p.email.toLowerCase() !== workEmail.trim().toLowerCase());
            return { ...t, credentialPresets: [newPreset, ...filtered] };
          }
          return t;
        });
        localStorage.setItem("unipos_tenants", JSON.stringify(nextTenants));
        return nextTenants;
      });
    }
  };

  const assignITTaskToSubordinate = (candidateId: string, subordinateEmpId: string, subordinateName: string) => {
    const nowStr = new Date().toISOString();
    const updatedCands = hrCandidates.map(c => {
      if (c.id === candidateId) {
        const timeline = c.itTaskTimeline || [
          { action: "Onboarding Request Created by HR", actor: "HR System", timestamp: c.appliedDate || nowStr }
        ];
        const newTimeline = [
          ...timeline,
          { action: `IT HOD Delegated Task to Subordinate (${subordinateName})`, actor: currentUser?.name || "IT HOD", timestamp: nowStr }
        ];
        return {
          ...c,
          assignedToITUserId: subordinateEmpId,
          assignedToITUserName: subordinateName,
          itTaskAssignedAt: nowStr,
          itTaskTimeline: newTimeline
        };
      }
      return c;
    });

    setHrCandidates(updatedCands);
    saveTenantData("unipos_hr_candidates", updatedCands);
  };

  // Step 3: Finance Department Confirmation & Active Directory Activation Action
  const confirmFinanceAndActivateEmployee = (candidateId: string) => {
    const candidate = hrCandidates.find(c => c.id === candidateId);
    if (!candidate) return;

    const bName = currentUser?.businessName || businessSettings?.businessName || "MT Software";
    const finalEmpCode = candidate.generatedEmployeeCode || generateNextEmployeeCode(bName, hrEmployees.length);

    // 1. Create Active HREmployee
    const newEmp: HREmployee = {
      id: `HRE-${Math.floor(100 + Math.random() * 900)}`,
      employeeCode: finalEmpCode,
      name: candidate.name,
      email: candidate.workEmail || candidate.email,
      phone: candidate.phone,
      cnic: candidate.cnic || "35202-0000000-0",
      department: candidate.department,
      subDepartment: candidate.subDepartment,
      designation: candidate.appliedPosition,
      joiningDate: new Date().toISOString().split("T")[0],
      employmentType: "Full-time",
      basicSalary: candidate.proposedSalary,
      bankName: candidate.bankName || "Meezan Bank Ltd",
      accountNumber: candidate.accountNumber || "01020304050607",
      status: "Active"
    };

    const updatedEmps = [newEmp, ...hrEmployees];
    setHrEmployees(updatedEmps);
    saveTenantData("unipos_hr_employees", updatedEmps);

    // 2. Mark Candidate as Fully Active
    const updatedCands = hrCandidates.map(c =>
      c.id === candidateId ? {
        ...c,
        onboardingStage: "Fully Active Employee" as const,
        financeConfirmedAt: new Date().toISOString()
      } : c
    );
    setHrCandidates(updatedCands);
    saveTenantData("unipos_hr_candidates", updatedCands);
  };

  // Direct Owner Executive Provisioning Action (For Directors & Department Managers Bootstrap)
  const provisionExecutiveDirectly = (execData: {
    name: string;
    email: string;
    phone: string;
    cnic?: string;
    department: string;
    subDepartment?: string;
    designation: string;
    basicSalary: number;
    bankName?: string;
    accountNumber?: string;
    tempPassword?: string;
  }) => {
    const bName = currentUser?.businessName || businessSettings?.businessName || "MT Software";
    const autoCode = generateNextEmployeeCode(bName, hrEmployees.length);

    const newEmp: HREmployee = {
      id: `HRE-${Math.floor(100 + Math.random() * 900)}`,
      employeeCode: autoCode,
      name: execData.name,
      email: execData.email,
      tempPassword: execData.tempPassword,
      phone: execData.phone,
      cnic: execData.cnic || "35201-0000000-0",
      department: execData.department,
      subDepartment: execData.subDepartment,
      designation: execData.designation,
      joiningDate: new Date().toISOString().split("T")[0],
      employmentType: "Full-time",
      basicSalary: execData.basicSalary,
      bankName: execData.bankName || "Meezan Bank Ltd",
      accountNumber: execData.accountNumber || "01020304050607",
      status: "Active"
    };

    const updatedEmps = [newEmp, ...hrEmployees];
    setHrEmployees(updatedEmps);
    saveTenantData("unipos_hr_employees", updatedEmps);

    // Automatically register System Credential Preset for Login Access
    if (execData.tempPassword && currentUser?.tenantId) {
      const activeTenantId = currentUser.tenantId;
      setTenants((prevTenants) => {
        const nextTenants = prevTenants.map((t) => {
          if (t.id === activeTenantId) {
            const existingPresets = t.credentialPresets || [];
            const newPreset = {
              id: `CRED-EXEC-${Math.floor(1000 + Math.random() * 9000)}`,
              label: `${execData.name} (${execData.designation})`,
              email: execData.email.trim().toLowerCase(),
              pass: execData.tempPassword || "",
              role: (execData.designation.includes("Director") || execData.designation.includes("Manager")) ? "Owner" as const : "Manager" as const
            };
            const filtered = existingPresets.filter((p) => p.email.toLowerCase() !== execData.email.trim().toLowerCase());
            return { ...t, credentialPresets: [newPreset, ...filtered] };
          }
          return t;
        });
        localStorage.setItem("unipos_tenants", JSON.stringify(nextTenants));
        return nextTenants;
      });
    }

    return newEmp;
  };

  const updateHRJobOpening = (id: string, updates: Partial<HRJobOpening>) => {
    const updated = hrJobs.map(j => j.id === id ? { ...j, ...updates } : j);
    setHrJobs(updated);
    saveTenantData("unipos_hr_jobs", updated);
  };

  const addHRAppraisal = (appraisal: Omit<HRAppraisal, "id" | "date">) => {
    const newApp: HRAppraisal = {
      ...appraisal,
      id: `HRA-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split("T")[0]
    };
    const updated = [newApp, ...hrAppraisals];
    setHrAppraisals(updated);
    saveTenantData("unipos_hr_appraisals", updated);
  };

  const clearAllHRMSData = () => {
    setHrEmployees([]);
    setHrAttendance([]);
    setHrLeaves([]);
    setHrPayrolls([]);
    setHrJobs([]);
    setHrCandidates([]);
    setHrAppraisals([]);

    saveTenantData("unipos_hr_employees", []);
    saveTenantData("unipos_hr_attendance", []);
    saveTenantData("unipos_hr_leaves", []);
    saveTenantData("unipos_hr_payrolls", []);
    saveTenantData("unipos_hr_jobs", []);
    saveTenantData("unipos_hr_candidates", []);
    saveTenantData("unipos_hr_appraisals", []);
  };

  // Check if current logged in user belongs to an online-only tenant while offline
  const currentTenantObj = tenants.find(t => t.id === currentUser?.tenantId);
  const isOnlineOnlyBlocked = Boolean(
    isOffline && currentTenantObj?.connectivityPlan === "online-only"
  );

  return (
    <GlobalContext.Provider
      value={{
        demoRequests,
        tenants,
        saasInvoices,
        supportTickets,
        addDemoRequest,
        updateDemoStatus,
        approveDemoRequest,
        convertDemoToActivePaid,
        rejectDemoRequest,
        addDemoMessage,
        deleteDemoRequest,
        registerTenant,
        updateTenantStatus,
        deleteTenant,
        setTenantCurrency,
        addTenantCredential,
        updateTenantCredential,
        deleteTenantCredential,
        addSaasInvoice,
        updateSaasInvoiceStatus,
        deleteSaasInvoice,
        updateSaasInvoice,
        replyToTicket,
        createNewTicket,
        createPublicSupportTicket,
        updateSupportTicket,
        deleteSupportTicket,
        deleteSupportTicketReply,
        
        currentUser,
        setCurrentUser,
        localReceiptsDirHandle,
        setLocalReceiptsDirHandle,
        logout,

        // HRMS State & Handlers
        hrEmployees,
        hrAttendance,
        hrLeaves,
        hrPayrolls,
        hrJobs,
        hrAppraisals,
        addHREmployee,
        updateHREmployee,
        deleteHREmployee,
        recordHRAttendance,
        updateHRAttendance,
        submitHRLeave,
        updateHRLeaveStatus,
        processHRPayroll,
        addHRJobOpening,
        updateHRJobOpening,
        addHRAppraisal,

        // HR Loans & Advances
        hrLoans,
        applyHRLoan,
        updateHRLoanStatus,
        recordLoanManualRepayment,
        deleteHRLoan,

        hrDepartments,
        hrDesignations,
        hrShifts,
        hrCandidates,
        addHRDepartment,
        updateHRDepartment,
        deleteHRDepartment,
        addHRDesignation,
        updateHRDesignation,
        deleteHRDesignation,
        addHRShift,
        updateHRShift,
        deleteHRShift,
        addHRCandidate,
        updateHRCandidate,
        deleteHRCandidate,
        provisionITCredentials,
        assignITTaskToSubordinate,
        confirmFinanceAndActivateEmployee,
        provisionExecutiveDirectly,
        clearAllHRMSData,

        hrmsTickets,
        createHRMSTicket,
        updateHRMSTicket,
        updateHRMSTicketStatus,
        deleteHRMSTicket,
        addHRMSTicketReply,

        currentBranch,
        setCurrentBranch,
        products,
        addProduct,
        addProductsBulk,
        mergeProductsBulk,
        updateProduct,
        deleteProduct,
        deleteProductsBulk,
        customers,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        updateCustomerBalance,
        updateCustomerWalletBalance,
        settleDuesWithWallet,
        recordDueRecovery,
        suppliers,
        addSupplier,
        recordSupplierPayment,
        updateSupplier,
        deleteSupplier,
        purchaseOrders,
        createPurchaseOrder,
        receiveGoods,
        batches,
        addBatch,
        previewFIFO,
        getProductBatches,
        sales,
        posCounters,
        assignCounterCashier,
        collectCounterCash,
        closeCounterSession,
        posShifts,
        startPOSShift,
        closePOSShift,
        addSale,
        expenses,
        addExpense,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        markAttendance,
        processSalary,
        attendanceRecords,
        addAttendanceRecord,
        updateAttendanceRecord,
        payrollRecords,
        addPayrollRecord,
        updatePayrollRecord,
        stockTransfers,
        createStockTransfer,
        updateStockTransfer,
        businessSettings,
        updateBusinessSettings,

        tables,
        addTable,
        updateTableBase,
        deleteTable,
        kitchenTickets,
        updateTableStatus,
        updateTableBill,
        dispatchKitchenTicket,
        completeKitchenTicket,
        clearKitchenTicket,
        clearTableKitchenTickets,

        accounts,
        journalEntries,
        addJournalEntry,

        currencySymbol,
        setCurrencySymbol,
        salesTaxRate,
        setSalesTaxRate,
        isOffline,

        isOnlineOnlyBlocked,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalContext() {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error("useGlobalContext must be used within a GlobalProvider");
  }
  return context;
}
