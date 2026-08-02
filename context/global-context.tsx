"use client";

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
  businessType: string;
  date: string;
  status: "Pending" | "Reviewed" | "Under Review" | "Approved" | "Rejected";
  // Approval fields
  trialDays?: number;
  trialEndsAt?: string;
  approvedAt?: string;
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
}

export interface SaaSInvoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "Paid" | "Unpaid" | "Overdue";
  plan: string;
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
  status: "Completed" | "Returned" | "Refunded";
  notes?: string;
  redeemLoyalty?: boolean;
  loyaltyPointsEarned?: number;
  loyaltyPointsBalance?: number;
  splitPayments?: Record<string, number>;
  receivedAmount?: number;
  changeReturned?: number;
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
  approveDemoRequest: (id: string, trialDays: number) => void;
  rejectDemoRequest: (id: string, reason: string) => void;
  addDemoMessage: (ticketNumber: string, message: string, sender: "Client" | "Admin") => void;
  deleteDemoRequest: (id: string) => void;
  registerTenant: (tenant: Omit<Tenant, "id" | "signupDate" | "status" | "usersCount" | "monthlyRevenue" | "branches"> & { id?: string }) => string;
  updateTenantStatus: (id: string, status: Tenant["status"]) => void;
  deleteTenant: (id: string) => void;
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
  recordDueRecovery: (id: string, amount: number) => void;

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
}

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

  // --- Supabase Offline-First Sync Injection ---
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalSetItem = window.localStorage.setItem;
    
    window.localStorage.setItem = function(key: string, value: string) {
      originalSetItem.apply(this, arguments as any);
      
      // Do not sync non-unipos keys or local session states
      if (!key.startsWith("unipos_")) return;
      if (key === "unipos_current_user") return;

      try {
        const parts = key.split('_');
        const possibleTenantId = parts[parts.length - 1];
        
        let parsedData;
        try {
          parsedData = JSON.parse(value);
        } catch {
          parsedData = value; // Fallback
        }
        
        // Immediately queue it to prevent data loss if page reloads before upsert finishes
        queueSyncKey(key).then(() => {
          if (!navigator.onLine) return;

          if (possibleTenantId.startsWith('T-') || possibleTenantId.startsWith('AFS-') || possibleTenantId.startsWith('DEMO-')) {
            const collection = key.replace('_' + possibleTenantId, '');
            supabase.from('unipos_collections').upsert({
              tenant_id: possibleTenantId,
              collection: collection,
              item_id: 'all',
              data: parsedData
            }).then(({error}) => { 
              if (!error) dequeueItem(STORE_SYNC_KEYS, key); 
            });
          } else {
            supabase.from('unipos_global').upsert({
              key: key,
              value: parsedData
            }).then(({error}) => { 
              if (!error) dequeueItem(STORE_SYNC_KEYS, key); 
            });
          }
        });
      } catch (e) {
        // Queue key if sync failed entirely
        queueSyncKey(key);
      }
    };
    
    // Initial fetch to sync from Supabase
    const syncFromSupabase = async () => {
      let changed = false;
      try {
        // 0. Process queued receipt images
        const pendingReceipts = await getQueuedItems(STORE_RECEIPTS);
        for (const receipt of pendingReceipts) {
          const { error } = await supabase.storage.from('receipts').upload(receipt.filePath, receipt.blob, {
            contentType: 'image/jpeg',
            upsert: true
          });
          if (!error) {
            await dequeueItem(STORE_RECEIPTS, receipt.id);
          }
        }

        // 1. Process local offline queue first
        const pendingSyncs = await getQueuedItems(STORE_SYNC_KEYS);
        const pendingKeySet = new Set(pendingSyncs.map(i => i.key));
        
        for (const item of pendingSyncs) {
          const val = window.localStorage.getItem(item.key);
          if (val) {
            // Trigger the patched setItem to push to Supabase
            window.localStorage.setItem(item.key, val);
          }
          await dequeueItem(STORE_SYNC_KEYS, item.key);
        }

        // 2. Pull down global data
        const { data: globalData } = await supabase.from('unipos_global').select('*');
        if (globalData) {
          globalData.forEach(row => {
            if (pendingKeySet.has(row.key)) return; // Skip if we just pushed it
            const current = window.localStorage.getItem(row.key);
            const incoming = JSON.stringify(row.value);
            
            // Safety check: never overwrite local data with Supabase empty arrays/objects
            // This prevents stale empty Supabase rows from wiping local data
            if (current) {
              try {
                const localParsed = JSON.parse(current);
                const incomingParsed = row.value;
                
                // If both are arrays and Supabase has FEWER items, local wins
                if (Array.isArray(localParsed) && Array.isArray(incomingParsed)) {
                  if (incomingParsed.length < localParsed.length) return;
                  // If same length, do deep compare to detect real changes
                  if (incomingParsed.length === localParsed.length) {
                    const sameContent = JSON.stringify(localParsed) === JSON.stringify(incomingParsed);
                    if (sameContent) return;
                  }
                }
              } catch(e) {}
            }
            
            // Deep compare instead of simple string equality to ignore key reordering
            let isDifferent = current !== incoming;
            if (isDifferent && current) {
              try {
                isDifferent = JSON.stringify(JSON.parse(current)) !== JSON.stringify(JSON.parse(incoming));
              } catch(e) {}
            }
            
            if (isDifferent) {
              originalSetItem.call(window.localStorage, row.key, incoming);
              changed = true;
            }
          });
        }
        
        const savedUser = window.localStorage.getItem("unipos_current_user");
        if (savedUser) {
          const user = JSON.parse(savedUser);
          if (user?.tenantId) {
            const { data: tenantData } = await supabase.from('unipos_collections').select('*').eq('tenant_id', user.tenantId);
            if (tenantData) {
              tenantData.forEach(row => {
                const localKey = `${row.collection}_${row.tenant_id}`;
                if (pendingKeySet.has(localKey)) return; // Skip if we just pushed it
                const current = window.localStorage.getItem(localKey);
                const incoming = JSON.stringify(row.data);
                
                // Deep compare instead of simple string equality to ignore key reordering
                let isDifferent = current !== incoming;
                if (isDifferent && current) {
                  try {
                    isDifferent = JSON.stringify(JSON.parse(current)) !== JSON.stringify(JSON.parse(incoming));
                  } catch(e) {}
                }
                
                if (isDifferent) {
                  originalSetItem.call(window.localStorage, localKey, incoming);
                  changed = true;
                }
              });
            }
          }
        }
        
        if (changed) {
          console.log("Supabase downloaded new data. Updating state...");
          window.dispatchEvent(new Event('unipos_sync_updated'));
        }
      } catch (e) {
        console.error("Failed to fetch from Supabase:", e);
      }
    };
    
    syncFromSupabase();

    // Supabase Realtime Sync
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unipos_global" },
        () => syncFromSupabase()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "unipos_collections" },
        () => syncFromSupabase()
      )
      .subscribe();

    // Also sync whenever the internet comes back online
    window.addEventListener('online', syncFromSupabase);

    return () => {
      window.localStorage.setItem = originalSetItem;
      window.removeEventListener('online', syncFromSupabase);
      supabase.removeChannel(channel);
    };
  }, []);
  // SaaS Admin States
  const [demoRequests, setDemoRequests] = useState<DemoRequest[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [saasInvoices, setSaasInvoices] = useState<SaaSInvoice[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  
  // Authenticated State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [localReceiptsDirHandle, setLocalReceiptsDirHandle] = useState<any>(null);

  const saveTenantData = (key: string, data: any) => {
    if (currentUser?.tenantId) {
      localStorage.setItem(`${key}_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };


  // Client Tenant States
  const [currentBranch, setCurrentBranch] = useState("Main Branch");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [batches, setBatches] = useState<ProductBatch[]>([]);  // FIFO batch ledger
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([]);
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
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
        const d = localStorage.getItem("unipos_demos");
        if (d) setDemoRequests(JSON.parse(d));
        
        const t = localStorage.getItem("unipos_tenants");
        if (t) setTenants(JSON.parse(t));
        
        const i = localStorage.getItem("unipos_saas_invoices");
        if (i) setSaasInvoices(JSON.parse(i));
        
        const st = localStorage.getItem("unipos_support_tickets");
        if (st) setSupportTickets(JSON.parse(st));
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

    // 2. Load Tenants
    const savedTenants = localStorage.getItem("unipos_tenants");
    let currentTenants: Tenant[] = [];
    if (savedTenants) {
      currentTenants = JSON.parse(savedTenants);
      let migrated = false;
      currentTenants = currentTenants.map(t => {
        if (t.id.startsWith("TEN-")) {
          migrated = true;
          const words = t.businessName.split(" ").filter(Boolean);
          let initials = "";
          if (words.length === 1) {
            initials = words[0].substring(0, 3).toUpperCase();
          } else {
            initials = words.map(w => w[0]).join("").toUpperCase();
          }
          return { ...t, id: `${initials}-${t.id.split("-")[1]}` };
        }
        return t;
      });
      if (migrated) {
        localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));
      }
    } else {
      const initTenants: Tenant[] = [];
      localStorage.setItem("unipos_tenants", JSON.stringify(initTenants));
      currentTenants = initTenants;
    }

    // MIGRATION: Ensure all Approved demos have a corresponding Tenant so they can log in
    const savedDemosForMigration = localStorage.getItem("unipos_demos");
    if (savedDemosForMigration) {
      const parsedDemos: DemoRequest[] = JSON.parse(savedDemosForMigration);
      let tenantsChanged = false;
      parsedDemos.filter(d => d.status === "Approved").forEach(req => {
        const exists = currentTenants.some(t => t.credentialPresets?.some(c => c.email === req.demoEmail));
        if (!exists && req.demoEmail && req.demoPassword) {
          tenantsChanged = true;
          currentTenants.push({
            id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
            businessName: req.businessName,
            ownerName: req.name,
            email: req.demoEmail,
            phone: req.phone || "",
            businessType: req.businessType || "Super Markets",
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
            ]
          });
        }
      });
      if (tenantsChanged) {
        localStorage.setItem("unipos_tenants", JSON.stringify(currentTenants));
      }
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

    // 5. Load Products (with SKU and Barcodes)
    const savedProducts = localStorage.getItem("unipos_products_" + currentUser.tenantId);
    if (savedProducts) {
      const parsed: Product[] = JSON.parse(savedProducts);
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
        return { ...p, id };
      });
      setProducts(sanitized);
      if (JSON.stringify(sanitized) !== savedProducts) {
        saveTenantData("unipos_products", sanitized);
      }
    }
    else if (isPrimaryDemo) {
      const initProducts: Product[] = [
        { id: "P-1001", sku: "GROC-MILK-001", barcode: "888123456789", name: "Nestle Milkpak 1L", category: "Grocery", brand: "Nestle", costPrice: 240, salePrice: 280, wholesalePrice: 255, taxRate: 0, stock: 120, minStock: 25, unit: "Pcs", image: "" },
        { id: "P-1002", sku: "PHAR-PAN-002", barcode: "501112233445", name: "Panadol 500mg Tablet (10x10)", category: "Pharmacy", brand: "GSK", costPrice: 320, salePrice: 400, wholesalePrice: 350, taxRate: 0, stock: 85, minStock: 15, unit: "Box", expiryDate: "2027-12-15", batchNumber: "PAN-B992", image: "" },
        { id: "P-1003", sku: "REST-BURG-003", barcode: "400123", name: "Crispy Zinger Burger", category: "Food & Beverage", brand: "In-House", costPrice: 290, salePrice: 490, wholesalePrice: 450, taxRate: 0, stock: 999, minStock: 0, unit: "Portion", image: "" },
        { id: "P-1004", sku: "ELEC-CHARG-004", barcode: "690123456789", name: "Anker USB-C Charger 20W", category: "Electronics", brand: "Anker", costPrice: 1800, salePrice: 2600, wholesalePrice: 2200, taxRate: 0, stock: 14, minStock: 5, unit: "Pcs", image: "" },
        { id: "P-1005", sku: "CLOT-SHIRT-005", barcode: "740112233", name: "Classic Polo Shirt - Navy Blue", category: "Clothing", brand: "Outfitters", costPrice: 1200, salePrice: 2200, wholesalePrice: 1800, taxRate: 0, stock: 45, minStock: 10, unit: "Pcs", variant: "Medium", image: "" },
        { id: "P-1006", sku: "PHAR-AUG-006", barcode: "502324221122", name: "Augmentin Syrup 156.25mg", category: "Pharmacy", brand: "GSK", costPrice: 180, salePrice: 220, wholesalePrice: 200, taxRate: 0, stock: 4, minStock: 10, unit: "Bottle", expiryDate: "2026-08-30", batchNumber: "AUG-B344" }
      ];
      saveTenantData("unipos_products", initProducts);
      setProducts(initProducts);
    } else { saveTenantData("unipos_products", []); setProducts([]); }

    // 6. Load Customers
    const savedCustomers = localStorage.getItem("unipos_customers_" + currentUser.tenantId);
    if (savedCustomers) {
      const parsed: Customer[] = JSON.parse(savedCustomers);
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
      if (JSON.stringify(sanitized) !== savedCustomers) {
        saveTenantData("unipos_customers", sanitized);
      }
    }
    else if (isPrimaryDemo) {
      const initCustomers: Customer[] = [
        { id: "C-201", customerNo: "CUST-7294", name: "Talal Ahmad", mobile: "03215550100", email: "talal@example.com", address: "DHA Phase 5, Lahore", cnic: "35201-1234567-9", loyaltyPoints: 450, creditBalance: 3200, dueRecoveryHistory: [{ date: "2026-05-15", amount: 1500 }] },
        { id: "C-202", customerNo: "CUST-3829", name: "Sarah Khan", mobile: "03009876543", email: "sarah@example.com", address: "Gulberg III, Lahore", loyaltyPoints: 120, creditBalance: 0, dueRecoveryHistory: [] },
        { id: "C-203", customerNo: "N/A", name: "Walk-in Customer", mobile: "00000000000", email: "walkin@unipos.com", address: "N/A", loyaltyPoints: 0, creditBalance: 0, dueRecoveryHistory: [] }
      ];
      saveTenantData("unipos_customers", initCustomers);
      setCustomers(initCustomers);
    } else { saveTenantData("unipos_customers", []); setCustomers([]); }

    // 7. Load Suppliers
    const savedSuppliers = localStorage.getItem("unipos_suppliers_" + currentUser.tenantId);
    if (savedSuppliers) setSuppliers(JSON.parse(savedSuppliers));
    else if (isPrimaryDemo) {
      const initSuppliers: Supplier[] = [
        { id: "S-301", name: "Nestle Distribution Lahore", company: "Nestle Pakistan", mobile: "042111363636", email: "orders@nestle.com.pk", dueAmount: 45000, purchaseHistory: [{ date: "2026-05-20", orderId: "PO-991", total: 45000 }] },
        { id: "S-302", name: "GSK Pharma Allied", company: "GSK Pakistan", mobile: "02135678901", email: "order@gsk.com", dueAmount: 18200, purchaseHistory: [{ date: "2026-05-24", orderId: "PO-995", total: 18200 }] }
      ];
      saveTenantData("unipos_suppliers", initSuppliers);
      setSuppliers(initSuppliers);
    } else { saveTenantData("unipos_suppliers", []); setSuppliers([]); }

    // 7.5 Load Purchase Orders
    const savedPOs = localStorage.getItem("unipos_pos_" + currentUser.tenantId);
    if (savedPOs) setPurchaseOrders(JSON.parse(savedPOs));
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
    } else { saveTenantData("unipos_pos", []); setPurchaseOrders([]); }

    // 7b. Load FIFO Batches
    const savedBatches = localStorage.getItem("unipos_batches_" + currentUser.tenantId);
    if (savedBatches) setBatches(JSON.parse(savedBatches));
    else { saveTenantData("unipos_batches", []); setBatches([]); }

    // 8. Load Sales History
    const savedSales = localStorage.getItem("unipos_sales_" + currentUser.tenantId);
    if (savedSales) setSales(JSON.parse(savedSales));
    else if (isPrimaryDemo) {
      const initSales: SaleTransaction[] = [
        {
          id: "S-5001",
          receiptNumber: "MT-TXN-10001",
          date: "2026-06-01T09:30:00+05:00",
          branch: "Gulberg Mall",
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
          branch: "Gulberg Mall",
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
    } else { saveTenantData("unipos_sales", []); setSales([]); }

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
    } else { saveTenantData("unipos_expenses", []); setExpenses([]); }

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
    } else { saveTenantData("unipos_employees", []); setEmployees([]); }

    // 11. Load Restaurant Tables
    const savedTables = localStorage.getItem("unipos_tables_" + currentUser.tenantId);
    if (savedTables && JSON.parse(savedTables).length > 0) {
      setTables(JSON.parse(savedTables));
    } else {
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
    } else { saveTenantData("unipos_kitchen", []); setKitchenTickets([]); }

    // 13. Load Accounting Ledgers
    const savedAccounts = localStorage.getItem("unipos_accounts_" + currentUser.tenantId);
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    else if (isPrimaryDemo) {
      const initAccounts: AccountLedger[] = [
        // Assets
        { code: "1001", name: "Main Cash Box", type: "Asset", balance: 145000 },
        { code: "1002", name: "Bank Current Account", type: "Asset", balance: 2450000 },
        { code: "1003", name: "Product Stock Valuation", type: "Asset", balance: 154000 },
        { code: "1004", name: "Accounts Receivable (Customer Due)", type: "Asset", balance: 3200 },
        // Liabilities
        { code: "2001", name: "Accounts Payable (Supplier Debt)", type: "Liability", balance: 63200 },
        // Equity
        { code: "3001", name: "Retained Earnings", type: "Equity", balance: 2500000 },
        // Revenue
        { code: "4001", name: "POS Retail Sales Revenue", type: "Revenue", balance: 4895 },
        // Expenses
        { code: "5001", name: "Cost of Goods Sold (COGS)", type: "Expense", balance: 2710 },
        { code: "5002", name: "Utility Expenses", type: "Expense", balance: 48000 },
        { code: "5003", name: "Office Admin Expenses", type: "Expense", balance: 2400 }
      ];
      saveTenantData("unipos_accounts", initAccounts);
      setAccounts(initAccounts);
    } else { saveTenantData("unipos_accounts", []); setAccounts([]); }



  }, [currentUser?.tenantId]);


  // SaaS Website & Admin Actions
  const addDemoRequest = (req: Omit<DemoRequest, "id" | "ticketNumber" | "date" | "status" | "messages">) => {
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

  const approveDemoRequest = (id: string, trialDays: number) => {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
    const req = demoRequests.find(r => r.id === id);
    if (!req) return;
    const slug = req.businessName.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8);
    const demoEmail = req.email;  // Use the requester's actual email
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
    const newTenant: Tenant = {
      id: `TEN-${Math.floor(100 + Math.random() * 900)}`,
      businessName: req.businessName,
      ownerName: req.name,
      email: demoEmail,
      phone: req.phone || "",
      businessType: req.businessType || "Super Markets",
      plan: "Professional",
      billingCycle: "monthly",
      signupDate: now.toISOString().split("T")[0],
      status: "Trial",
      usersCount: 1,
      monthlyRevenue: 0,
      branches: ["Main Branch"],
      defaultCurrency: "PKR",
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

    // Auto generate onboarding SaaS Invoice
    const newInvoice: SaaSInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "Paid",
      plan: "Trial"
    };
    setSaasInvoices(prev => {
      const updatedInvs = [newInvoice, ...prev];
      localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));
      return updatedInvs;
    });
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
          { sender: "Admin" as const, message: `Your request has been declined. Reason: ${reason}`, date: now.toISOString() }
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
        messages: [...r.messages, { sender, message, date: now.toISOString() }]
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


  const registerTenant = (tenant: Omit<Tenant, "id" | "signupDate" | "status" | "usersCount" | "monthlyRevenue" | "branches"> & { id?: string }) => {
    let finalId = tenant.id;
    if (!finalId) {
      // Generate initials from businessName
      const words = tenant.businessName.split(" ").filter(Boolean);
      let initials = "";
      if (words.length === 1) {
        initials = words[0].substring(0, 3).toUpperCase();
      } else {
        initials = words.map(w => w[0]).join("").toUpperCase();
      }
      finalId = `${initials}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    // Ensure uniqueness
    while (tenants.some(t => t.id === finalId)) {
      finalId = `${finalId}-${Math.floor(Math.random() * 100)}`;
    }

    const signupDateStr = new Date().toISOString().split("T")[0];
    const statusVal = tenant.isTrial ? "Trial" : "Active";
    let trialEndsAtVal = undefined;
    if (tenant.isTrial && tenant.trialDays) {
      const trialEnd = new Date(Date.now() + tenant.trialDays * 24 * 60 * 60 * 1000);
      trialEndsAtVal = trialEnd.toISOString().split("T")[0];
    }

    const newTenant: Tenant = {
      ...tenant,
      id: finalId,
      signupDate: signupDateStr,
      status: statusVal,
      trialEndsAt: trialEndsAtVal,
      usersCount: 1,
      monthlyRevenue: 0,
      branches: ["Main Branch"],
      defaultCurrency: "PKR",
      credentialPresets: [
        { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Owner (Full ERP)", email: tenant.email, pass: "owner123", role: "Owner" }
      ]
    };
    const updated = [newTenant, ...tenants];
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));

    // Auto generate onboarding SaaS Invoice
    const isYearly = tenant.billingCycle === "yearly";
    let baseAmount = 49; // Pro Plan monthly
    if (tenant.plan === "Starter") baseAmount = 19;
    if (tenant.plan === "Enterprise") baseAmount = 99;
    const finalAmount = tenant.isTrial ? 0 : (isYearly ? baseAmount * 12 * 0.8 : baseAmount); // 20% discount annual

    const newInvoice: SaaSInvoice = {
      id: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      tenantId: newTenant.id,
      tenantName: newTenant.businessName,
      amount: finalAmount,
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: tenant.isTrial ? "Paid" : "Unpaid",
      plan: tenant.isTrial ? "Trial" : `${tenant.plan} ${tenant.billingCycle}`
    };
    const updatedInvs = [newInvoice, ...saasInvoices];
    setSaasInvoices(updatedInvs);
    localStorage.setItem("unipos_invoices", JSON.stringify(updatedInvs));

    return finalId;
  };

  const updateTenantStatus = (id: string, status: Tenant["status"]) => {
    const updated = tenants.map(t => t.id === id ? { ...t, status } : t);
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));
  };

  const deleteTenant = (id: string) => {
    const updated = tenants.filter(t => t.id !== id);
    setTenants(updated);
    localStorage.setItem("unipos_tenants", JSON.stringify(updated));
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

  const recordDueRecovery = (id: string, amount: number) => {
    const updated = customers.map(c => {
      if (c.id === id) {
        return {
          ...c,
          creditBalance: Math.max(0, c.creditBalance - amount),
          dueRecoveryHistory: [...c.dueRecoveryHistory, { date: new Date().toISOString().split("T")[0], amount }]
        };
      }
      return c;
    });
    setCustomers(updated);
    saveTenantData("unipos_customers", updated);

    // Live Double Entry Accounting
    addJournalEntry(
      `Customer Credit Recovery payment received`,
      [{ accountCode: "1001", amount }], // Debit Cash
      [{ accountCode: "1004", amount }]  // Credit Accounts Receivable
    );
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
  const addSale = (sale: Omit<SaleTransaction, "id" | "receiptNumber" | "date">) => {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const receiptNumber = `MT-TXN-${dd}${mm}${yy}${hh}${min}`;
    const matchCust = customers.find(c => c.name === sale.customerName);
    const customerNo = matchCust?.customerNo || "N/A";

    const newSale: SaleTransaction = {
      ...sale,
      id: `S-${Math.floor(5000 + Math.random() * 5000)}`,
      receiptNumber,
      date: new Date().toISOString(),
      customerNo
    };

    // 1. Save Sale record
    const updatedSales = [newSale, ...sales];
    setSales(updatedSales);
    saveTenantData("unipos_sales", updatedSales);

    // 2. Reduce products inventory & compute COGS
    let totalCogs = 0;
    const updatedProducts = [...products];

    sale.items.forEach(cartItem => {
      const pIdx = updatedProducts.findIndex(p => p.id === cartItem.productId);
      if (pIdx === -1) return;
      const p = updatedProducts[pIdx];

      totalCogs += p.costPrice * cartItem.qty;

      if (p.ingredients && p.ingredients.length > 0) {
        // Recipe logic: Deduct raw materials
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
        // Standard logic: Deduct direct stock
        updatedProducts[pIdx] = {
          ...p,
          stock: Math.max(0, p.stock - cartItem.qty)
        };
      }
    });

    setProducts(updatedProducts);
    saveTenantData("unipos_products", updatedProducts);

    // 2b. Consume FIFO batches — deduct remainingQty in FIFO order
    const updatedBatches = [...batches];
    sale.items.forEach(cartItem => {
      let remaining = cartItem.qty;
      const available = updatedBatches
        .filter(b => b.productId === cartItem.productId && b.remainingQty > 0)
        .sort((a, b) => new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime());

      for (const batch of available) {
        if (remaining <= 0) break;
        const idx = updatedBatches.findIndex(b => b.id === batch.id);
        if (idx === -1) continue;
        const consumed = Math.min(updatedBatches[idx].remainingQty, remaining);
        updatedBatches[idx] = { ...updatedBatches[idx], remainingQty: updatedBatches[idx].remainingQty - consumed };
        remaining -= consumed;
      }
    });
    setBatches(updatedBatches);
    saveTenantData("unipos_batches", updatedBatches);


    // 3. Accumulate loyalty points for customer
    if (matchCust && matchCust.id !== "C-203") {
      const addedPoints = Math.floor(sale.total / 50); // 100 points per 5000 PKR (1 point per 50 PKR)
      const deductPoints = sale.redeemLoyalty ? 1000 : 0;
      
      // If payment is "On Credit" or split payment contains "On Credit", add to customer creditBalance (Accounts Receivable)
      let creditChange = 0;
      if (sale.paymentMethod === "On Credit" && sale.customerName !== "Walk-in Customer") {
        creditChange = sale.total;
      } else if (sale.splitPayments && sale.customerName !== "Walk-in Customer") {
        creditChange = sale.splitPayments["On Credit"] || 0;
      }

      const updatedCusts = customers.map(c => {
        if (c.id === matchCust.id) {
          const finalPoints = Math.max(0, c.loyaltyPoints + addedPoints - deductPoints);
          return {
            ...c,
            loyaltyPoints: finalPoints,
            creditBalance: c.creditBalance + creditChange
          };
        }
        return c;
      });
      setCustomers(updatedCusts);
      saveTenantData("unipos_customers", updatedCusts);

      // Append state to transaction for printed invoices
      newSale.loyaltyPointsEarned = addedPoints;
      newSale.loyaltyPointsBalance = Math.max(0, matchCust.loyaltyPoints + addedPoints - deductPoints);
      newSale.redeemLoyalty = sale.redeemLoyalty;
    }

    // 4. Fire Double-Entry Accounting Journal Vouchers
    // Cash/Receivables Debit, Sales Revenue Credit
    const debits: Array<{ accountCode: string; amount: number }> = [];
    if (sale.splitPayments) {
      Object.entries(sale.splitPayments).forEach(([method, amt]) => {
        if (amt > 0) {
          let accountCode = "1002";
          if (method === "Cash") {
            accountCode = "1001";
          } else if (method === "On Credit") {
            accountCode = "1004";
          }
          debits.push({ accountCode, amount: amt });
        }
      });
    } else {
      let paymentAccount = "1002";
      if (sale.paymentMethod === "Cash") {
        paymentAccount = "1001";
      } else if (sale.paymentMethod === "On Credit") {
        paymentAccount = "1004";
      }
      debits.push({ accountCode: paymentAccount, amount: sale.total });
    }

    addJournalEntry(
      `Sales Checkout receipt ${receiptNumber}`,
      debits,
      [
        { accountCode: "4001", amount: sale.subtotal - sale.discount }, // Revenue
        { accountCode: "2001", amount: sale.tax } // Tax Payable liability
      ]
    );

    // COGS Debit, Stock Valuation Credit
    addJournalEntry(
      `Inventory Cost matching receipt ${receiptNumber}`,
      [{ accountCode: "5001", amount: totalCogs }], // COGS Expense Debit
      [{ accountCode: "1003", amount: totalCogs }]  // Product Asset Credit
    );

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
