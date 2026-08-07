"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import ThermalSlipModal from "@/components/thermal-slip-modal";
import {
  Search, Barcode, ShoppingCart, User, Plus, Minus, Trash2,
  Tag, DollarSign, Notebook, CreditCard, CheckCircle2, Printer,
  Landmark, Wallet, PlusCircle, Star, Check, X, Scale, Hash,
  Banknote, Calculator, ChevronDown, RotateCcw, AlertTriangle, Package,
  Clock, Timer, LogOut, Download, WifiOff, Bell, Camera, PauseCircle, Play
} from "lucide-react";
import { BrowserMultiFormatReader } from '@zxing/browser';
import { autoSaveReceiptToDisk } from "@/lib/receipt-saver";
import { selectAndInitRootFolder, getStoredDirectoryHandle } from "@/lib/local-storage-folder";

// ─── Types ────────────────────────────────────────────────────────────────────
interface HeldCart {
  id: string;
  label: string;
  cart: CartItem[];
  customer: string;
  heldAt: string;
  discountValue: number;
  discountType: 'percent' | 'fixed';
}
interface CartItem {
  productId: string;
  name: string;
  price: number;        // per unit / per kg rate
  qty: number;          // can be fractional: 0.5, 0.25, etc.
  unit: string;         // e.g. Kg, Pcs, Liter
  taxRate: number;
  subtotal: number;
  saleMode: "qty" | "amount"; // how was it added
}

// Add-to-Cart modal state
interface AddModal {
  open: boolean;
  product: any | null;
  mode: "qty" | "amount";     // Quantity mode OR Amount mode
  qtyInput: string;           // e.g. "0.5"
  amountInput: string;        // e.g. "100"
  quickAmt: number | null;    // quick-select amount button
}

// ─── Weight / Volume units that support fractional & by-amount selling ───────
const WEIGHT_UNITS = ["Kg", "Gram", "Liter", "ml", "Meter"];

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];
const QUICK_FRACS  = [0.25, 0.5, 0.75, 1, 1.5, 2];

function isUserAssignedToCounter(counter: any, user: any): boolean {
  if (!counter || !user) return false;
  if (counter.assignedCashierEmail && user.email && counter.assignedCashierEmail.toLowerCase() === user.email.toLowerCase()) return true;
  const cleanAssigned = (counter.assignedCashierName || "").replace(/\s*\([^)]*\)/, "").trim().toLowerCase();
  const cleanUser = (user.name || "").replace(/\s*\([^)]*\)/, "").trim().toLowerCase();
  if (cleanAssigned && cleanUser && (cleanAssigned === cleanUser || cleanAssigned.includes(cleanUser) || cleanUser.includes(cleanAssigned))) {
    return true;
  }
  return false;
}

export default function PosPage() {
  const {
    products, customers, addCustomer, addSale, updateProduct, sales, expenses,
    currencySymbol, currentBranch, currentUser, businessSettings, recordDueRecovery,
    localReceiptsDirHandle, setLocalReceiptsDirHandle, isOffline, previewFIFO, updateCustomerBalance,
    updateCustomerWalletBalance, settleDuesWithWallet,
    posCounters, assignCounterCashier, closeCounterSession, posShifts, startPOSShift, closePOSShift
  } = useGlobalContext();

  // ── Shift Management State
  const [selectedCounter, setSelectedCounter] = useState<string>("Counter 1");
  const [closingCashCount, setClosingCashCount] = useState<string>("0");
  const [closeShiftNotes, setCloseShiftNotes] = useState<string>("");

  // ── Held Cart State
  const [heldCarts, setHeldCarts] = useState<HeldCart[]>([]);
  const [showHeldCartsPanel, setShowHeldCartsPanel] = useState(false);
  const [holdLabel, setHoldLabel] = useState('');
  const [showHoldModal, setShowHoldModal] = useState(false);

  // ── Local Save Folder State
  const [hasSavedFolder, setHasSavedFolder] = useState<boolean>(false);
  const [folderName, setFolderName] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const checkFolderState = async () => {
      try {
        const handle = await getStoredDirectoryHandle();
        let valid = false;
        if (handle) {
          try {
            const perm = await (handle as any).queryPermission?.({ mode: "readwrite" });
            if (perm === "granted") valid = true;
          } catch {}
        }

        const savedName = typeof window !== "undefined" ? localStorage.getItem("unipos_selected_folder_name") : null;

        if (valid && handle) {
          if (isMounted) {
            setHasSavedFolder(true);
            setFolderName(handle.name);
          }
        } else if (savedName) {
          if (isMounted) {
            setHasSavedFolder(true);
            setFolderName(savedName);
          }
        } else {
          if (isMounted) {
            setHasSavedFolder(false);
            setFolderName("");
          }
        }
      } catch {
        if (isMounted) setHasSavedFolder(false);
      }
    };

    checkFolderState();
    return () => { isMounted = false; };
  }, [localReceiptsDirHandle]);

  // ── Camera Scanner State
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerControlsRef = useRef<{ stop: () => void } | null>(null);

  // ── Cart & Search
  const [searchQuery, setSearchQuery]   = useState("");
  const [selectedCat, setSelectedCat]   = useState("All");
  const [cart, setCart]                 = useState<CartItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");

  // ── Add-to-cart Modal
  const [addModal, setAddModal] = useState<AddModal>({
    open: false, product: null, mode: "qty",
    qtyInput: "1", amountInput: "", quickAmt: null
  });

  // ── Inline qty edit in cart
  const [printingStatus, setPrintingStatus] = useState<"idle" | "printing" | "success" | "error">("idle");
  const [editingQty, setEditingQty] = useState<{ id: string, val: string } | null>(null);

  const lowStockAlerts = products.filter(p => p.stock <= p.minStock);

  // ── Customer
  const [selectedCustomer, setSelectedCustomer] = useState("Walk-in Customer");
  const [custSearch, setCustSearch]             = useState("");
  const [showCustDropdown, setShowCustDropdown] = useState(false);
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [newCustName, setNewCustName]           = useState("");
  const [newCustMobile, setNewCustMobile]       = useState("");

  // ── Discount / Notes / Loyalty
  const [discountType, setDiscountType]       = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue]     = useState<number>(0);
  const [checkoutNotes, setCheckoutNotes]     = useState("");
  const [whatsappNumber, setWhatsappNumber]   = useState("");
  const [redeemLoyalty, setRedeemLoyalty]     = useState(false);

  // ── Checkout
  const [showCheckoutModal, setShowCheckoutModal]   = useState(false);
  const [paymentMethod, setPaymentMethod]           = useState<"Cash"|"Card"|"Bank Transfer"|"EasyPaisa"|"JazzCash"|"Store Wallet Credit"|"Store Wallet"|"On Credit">("Cash");
  const [amountPaid, setAmountPaid]                 = useState("");
  const [successReceipt, setSuccessReceipt]         = useState<any>(null);
  const [toastMsg, setToastMsg]                     = useState<string|null>(null);
  const [showThermalModal, setShowThermalModal]     = useState(false);
  const [isSplit, setIsSplit]                       = useState(false);
  const [splitAmounts, setSplitAmounts]             = useState<Record<string, string>>({
    Cash: "",
    Card: "",
    "Bank Transfer": "",
    EasyPaisa: "",
    JazzCash: "",
    "On Credit": ""
  });

  // ── Return / Refund
  const [showReturnModal, setShowReturnModal]         = useState(false);
  const [returnReceiptSearch, setReturnReceiptSearch] = useState("");
  const [returnSale, setReturnSale]                   = useState<any>(null);
  const [returnItemQtys, setReturnItemQtys]           = useState<Record<number, number>>({});
  const [refundMethod, setRefundMethod]               = useState<"Cash" | "Wallet">("Cash");
  const [returnDone, setReturnDone]                   = useState(false);

  // ── POS Quick Credit Recovery
  const [showPosRecoveryModal, setShowPosRecoveryModal] = useState(false);
  const [posRecoveryAmount, setPosRecoveryAmount]       = useState("");
  const [posRecoveryMethod, setPosRecoveryMethod]       = useState("Cash");

  // ── Shift Management
  const [shiftOpen, setShiftOpen] = useState<boolean>(false);
  const [openingCash, setOpeningCash] = useState('');
  const [showOpenShiftModal, setShowOpenShiftModal] = useState<boolean>(false);
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<string>(() => new Date().toISOString());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const assignedCounter = posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser));
    if (assignedCounter) {
      setSelectedCounter(assignedCounter.name);
      setOpeningCash(String(assignedCounter.openingFloat ?? 0));
      setShiftOpen(true);
      setShowOpenShiftModal(false);
      localStorage.setItem('unipos_shift_open', 'true');
      localStorage.setItem('unipos_shift_opening_cash', String(assignedCounter.openingFloat ?? 0));
      localStorage.setItem('unipos_active_counter', assignedCounter.name);
      setShiftStartTime(assignedCounter.startedAt || new Date().toISOString());
    } else {
      const isOpen = localStorage.getItem('unipos_shift_open') === 'true';
      setShiftOpen(isOpen);
      setShowOpenShiftModal(!isOpen);
      setShiftStartTime(localStorage.getItem('unipos_shift_start') || new Date().toISOString());
    }
  }, [posCounters, currentUser]);

  const customerDropdownRef = useRef<HTMLDivElement>(null);

  // ── Categories (dynamic)
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // ── Filtered products
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    return (p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.sku.toLowerCase().includes(q))
      && (selectedCat === "All" || p.category === selectedCat);
  });

  // ── Filtered customers
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.mobile.includes(custSearch)
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(e.target as Node))
        setShowCustDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setRedeemLoyalty(false); }, [selectedCustomer]);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // ── Shift handlers
  const handleOpenShift = () => {
    const floatNum = parseFloat(openingCash) || 0;
    assignCounterCashier(selectedCounter, currentUser?.name || "Cashier", floatNum);
    startPOSShift(selectedCounter, floatNum);
    localStorage.setItem('unipos_active_counter', selectedCounter);
    localStorage.setItem('unipos_shift_open', 'true');
    localStorage.setItem('unipos_shift_start', new Date().toISOString());
    localStorage.setItem('unipos_shift_opening_cash', floatNum.toString());
    setShiftOpen(true);
    setShowOpenShiftModal(false);
    triggerToast(`✅ Shift started at ${selectedCounter} with Opening Float ${currencySymbol} ${floatNum}!`);
  };

  const handleCloseShift = () => {
    const activeShiftObj = posShifts.find(s => s.status === "Open" && (s.cashierEmail === currentUser?.email || s.cashierName === currentUser?.name));
    const closingVal = parseFloat(closingCashCount) || 0;
    if (activeShiftObj) {
      closePOSShift(activeShiftObj.id, closingVal, closeShiftNotes);
      closeCounterSession(activeShiftObj.counterId, closingVal);
    } else if (selectedCounter) {
      closeCounterSession(selectedCounter, closingVal);
    }
    localStorage.removeItem('unipos_shift_open');
    localStorage.removeItem('unipos_shift_start');
    localStorage.removeItem('unipos_shift_opening_cash');
    setShiftOpen(false);
    setShowCloseShiftModal(false);
    triggerToast('🔒 Shift closed & Z-Report generated. Counter set to Offline.');
  };

  // ── Shift sales computed
  const shiftSales = sales.filter(s => new Date(s.date) >= new Date(shiftStartTime));
  const shiftCashSales = shiftSales.reduce((a, s) => {
    if (s.splitPayments) {
      return a + (s.splitPayments["Cash"] || 0);
    }
    return a + (s.paymentMethod === 'Cash' ? s.total : 0);
  }, 0);
  const shiftCardSales = shiftSales.reduce((a, s) => {
    if (s.splitPayments) {
      return a + (s.splitPayments["Card"] || 0);
    }
    return a + (s.paymentMethod === 'Card' ? s.total : 0);
  }, 0);
  const shiftOtherSales = shiftSales.reduce((a, s) => {
    if (s.splitPayments) {
      const otherAmt = Object.entries(s.splitPayments)
        .filter(([method]) => method !== "Cash" && method !== "Card")
        .reduce((sum, [, val]) => sum + val, 0);
      return a + otherAmt;
    }
    return a + (s.paymentMethod !== 'Cash' && s.paymentMethod !== 'Card' ? s.total : 0);
  }, 0);
  const shiftItemCount = shiftSales.reduce((a, s) => a + (s.items?.length || 0), 0);
  const closingCash = (parseFloat(openingCash) || 0) + shiftCashSales;

  // ── Return/Refund handlers ───────────────────────────────────────────────
  const handleSearchReturn = () => {
    const q = returnReceiptSearch.trim().toLowerCase();
    if (!q) return;
    const found = sales.find(s =>
      s.receiptNumber.toLowerCase() === q || s.id.toLowerCase() === q
    );
    if (found) {
      setReturnSale(found);
      const initQtys: Record<number, number> = {};
      found.items.forEach((item: any, i: number) => { initQtys[i] = item.qty; }); // Default full return qty
      setReturnItemQtys(initQtys);
    } else {
      triggerToast("❌ Receipt not found.");
    }
  };

  const handleConfirmReturn = () => {
    if (!returnSale) return;
    const returningItemsList = returnSale.items
      .map((item: any, i: number) => ({
        ...item,
        returnQty: returnItemQtys[i] || 0
      }))
      .filter((item: any) => item.returnQty > 0);

    if (returningItemsList.length === 0) {
      triggerToast("Select at least 1 unit to return.");
      return;
    }

    const refundTotal = returningItemsList.reduce((a: number, i: any) => a + (i.returnQty * i.price), 0);

    // 2. Generate Return Sale Record
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");

    const returnTxn = addSale({
      receiptNumber: `RET-TXN-${dd}${mm}${yy}${hh}${min}`,
      branch: currentBranch,
      cashierName: currentUser?.name || "Cashier",
      customerName: returnSale.customerName,
      customerNo: returnSale.customerNo,
      items: returningItemsList.map((i: any) => ({
        productId: i.productId,
        productName: i.productName,
        price: i.price,
        qty: i.returnQty,
        subtotal: parseFloat((i.returnQty * i.price).toFixed(2))
      })),
      subtotal: refundTotal,
      discount: 0,
      tax: 0,
      total: refundTotal,
      paymentMethod: refundMethod === "Wallet" ? "Store Wallet Credit" : "Cash Refund",
      status: "Returned",
      notes: `Return for receipt ${returnSale.receiptNumber}`
    } as any);

    // Trigger Return Receipt Modal
    setSuccessReceipt(returnTxn);
    setShowThermalModal(true);
    setShowReturnModal(false);
    triggerToast(`✅ Return processed! Refund: ${currencySymbol} ${refundTotal.toFixed(2)}. Return Receipt created!`);
  };

  const selectedCustObj    = customers.find(c => c.name === selectedCustomer);
  const selectedCustPoints = selectedCustObj?.loyaltyPoints || 0;
  const selectedCustWalletBalance = selectedCustObj?.walletBalance || 0;

  // ════════════════════════════════════════════════════════════════════════════
  //  ADD-TO-CART MODAL HELPERS
  // ════════════════════════════════════════════════════════════════════════════

  /** Directly add 1 unit to cart — for non-weight products (Pcs, Box, Pack…) */
  const directAddToCart = (prod: any) => {
    const existIdx = cart.findIndex(i => i.productId === prod.id);
    if (existIdx > -1) {
      const newQty = cart[existIdx].qty + 1;
      if (newQty > prod.stock) {
        triggerToast(`Only ${prod.stock} ${prod.unit || "Pcs"} available in stock!`);
        return;
      }
      const updatedItem = {
        ...cart[existIdx],
        qty: newQty,
        subtotal: parseFloat((newQty * prod.salePrice).toFixed(2))
      };
      const filtered = cart.filter(i => i.productId !== prod.id);
      setCart([updatedItem, ...filtered]);
    } else {
      if (prod.stock < 1) {
        triggerToast("Out of stock!");
        return;
      }
      setCart(prev => [{
        productId: prod.id,
        name: prod.name,
        price: prod.salePrice,
        qty: 1,
        unit: prod.unit || "Pcs",
        taxRate: prod.taxRate,
        subtotal: prod.salePrice,
        saleMode: "qty" as const
      }, ...prev]);
    }
    triggerToast(`${prod.name} added to cart`);
  };

  /** Smart handler: weight/volume units → modal, everything else → direct add */
  const openAddModal = (prod: any) => {
    if (WEIGHT_UNITS.includes(prod.unit)) {
      // Show modal with Qty / Amount modes
      setAddModal({
        open: true, product: prod,
        mode: "qty", qtyInput: "1", amountInput: "", quickAmt: null
      });
    } else {
      // Pcs, Box, Pack, Dozen, Sheet → direct +1 to cart
      directAddToCart(prod);
    }
  };

  /** Computed preview inside the modal */
  const modalPreview = (() => {
    if (!addModal.product) return { qty: 0, subtotal: 0 };
    const rate = addModal.product.salePrice;
    if (addModal.mode === "qty") {
      const qty = parseFloat(addModal.qtyInput) || 0;
      return { qty, subtotal: parseFloat((qty * rate).toFixed(2)) };
    } else {
      const amt = parseFloat(addModal.amountInput) || (addModal.quickAmt || 0);
      const qty = rate > 0 ? parseFloat((amt / rate).toFixed(4)) : 0;
      return { qty, subtotal: amt };
    }
  })();

  const handleConfirmAddModal = () => {
    const prod = addModal.product;
    if (!prod) return;
    const { qty, subtotal } = modalPreview;
    if (qty <= 0 || subtotal <= 0) {
      triggerToast("Please enter a valid quantity or amount.");
      return;
    }

    const existIdx = cart.findIndex(i => i.productId === prod.id);
    if (existIdx > -1) {
      const newQty = parseFloat((cart[existIdx].qty + qty).toFixed(4));
      if (newQty > prod.stock) {
        triggerToast(`Only ${prod.stock} ${prod.unit || "Pcs"} available in stock!`);
        return;
      }
      const updatedItem = {
        ...cart[existIdx],
        qty: newQty,
        subtotal: parseFloat((newQty * prod.salePrice).toFixed(2))
      };
      const filtered = cart.filter(i => i.productId !== prod.id);
      setCart([updatedItem, ...filtered]);
    } else {
      if (qty > prod.stock) {
        triggerToast(`Only ${prod.stock} ${prod.unit || "Pcs"} available in stock!`);
        return;
      }
      setCart([
        {
          productId: prod.id,
          name: prod.name,
          price: prod.salePrice,
          qty,
          unit: prod.unit || "Pcs",
          taxRate: prod.taxRate,
          subtotal,
          saleMode: addModal.mode
        },
        ...cart
      ]);
    }

    triggerToast(`Added: ${prod.name} — ${qty} ${prod.unit || "Pcs"} for ${currencySymbol} ${subtotal}`);
    setAddModal(m => ({ ...m, open: false }));
  };

  // ── Barcode scan — opens modal for qty/amount confirmation
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput) return;
    const match = products.find(p => p.barcode === barcodeInput || p.sku.toLowerCase() === barcodeInput.toLowerCase());
    if (match) {
      // Weight units → modal for qty/amount; others → direct add
      if (WEIGHT_UNITS.includes(match.unit)) {
        openAddModal(match);
      } else {
        directAddToCart(match);
      }
      setBarcodeInput("");
    } else {
      triggerToast("SKU/Barcode not recognized in catalog.");
    }
  };

  // ── Inline cart qty edit
  const commitQtyEdit = (prodId: string) => {
    if (!editingQty || editingQty.id !== prodId) return;
    const newQty = parseFloat(editingQty.val);
    const prod = products.find(p => p.id === prodId);
    if (isNaN(newQty) || newQty <= 0) {
      setCart(cart.filter(i => i.productId !== prodId));
    } else if (prod && newQty > prod.stock) {
      triggerToast(`Only ${prod.stock} ${prod.unit || "Pcs"} available in stock!`);
      setEditingQty(null);
      return;
    } else {
      setCart(cart.map(i => i.productId === prodId
        ? { ...i, qty: newQty, subtotal: parseFloat((newQty * i.price).toFixed(2)) }
        : i
      ));
    }
    setEditingQty(null);
  };

  const handleQtyDelta = (prodId: string, delta: number) => {
    const prod = products.find(p => p.id === prodId);
    setCart(cart.map(i => {
      if (i.productId !== prodId) return i;
      // step: 0.25 for weight items (Kg/g/Liter/ml), 1 for others
      const step = ["Kg", "Gram", "Liter", "ml", "Meter"].includes(i.unit) ? 0.25 : 1;
      const next = parseFloat(Math.max(step, i.qty + delta * step).toFixed(4));
      if (prod && next > prod.stock) {
        triggerToast(`Only ${prod.stock} ${prod.unit || "Pcs"} available in stock!`);
        return i;
      }
      return { ...i, qty: next, subtotal: parseFloat((next * i.price).toFixed(2)) };
    }));
  };

  const handleRemoveItem   = (id: string) => setCart(cart.filter(i => i.productId !== id));
  const handleClearCart    = () => setCart([]);

  const holdCurrentCart = () => {
    if (cart.length === 0) { triggerToast('Cart is empty. Add items first.'); return; }
    const held: HeldCart = {
      id: `HOLD-${Date.now()}`,
      label: holdLabel || `Customer ${heldCarts.length + 1}`,
      cart,
      customer: selectedCustomer,
      heldAt: new Date().toISOString(),
      discountValue,
      discountType,
    };
    setHeldCarts(prev => [...prev, held]);
    setCart([]);
    setSelectedCustomer('Walk-in Customer');
    setDiscountValue(0);
    setShowHoldModal(false);
    setHoldLabel('');
    triggerToast(`Cart held as "${held.label}"`);
  };

  const retrieveHeldCart = (held: HeldCart) => {
    if (cart.length > 0 && !confirm(`Current cart has ${cart.length} items. Replace with "${held.label}"?`)) return;
    setCart(held.cart);
    setSelectedCustomer(held.customer);
    setDiscountValue(held.discountValue);
    setDiscountType(held.discountType);
    setHeldCarts(prev => prev.filter(h => h.id !== held.id));
    setShowHeldCartsPanel(false);
    triggerToast(`"${held.label}" restored to cart`);
  };

  const startCameraScanner = async () => {
    setShowCameraScanner(true);
    setScannerError(null);
  };

  const stopCameraScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    // Also stop any live video tracks
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(t => t.stop());
      videoRef.current.srcObject = null;
    }
    setShowCameraScanner(false);
  };

  useEffect(() => {
    if (!showCameraScanner) return;
    let mounted = true;
    const codeReader = new BrowserMultiFormatReader();
    
    const startScan = async () => {
      try {
        if (!videoRef.current) return;
        const controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (!mounted) return;
          if (result) {
            const scannedCode = result.getText();
            const match = products.find(p => p.barcode === scannedCode || p.sku.toLowerCase() === scannedCode.toLowerCase());
            if (match) {
              controls?.stop();
              mounted = false;
              setShowCameraScanner(false);
              if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(t => t.stop());
                videoRef.current.srcObject = null;
              }
              if (WEIGHT_UNITS.includes(match.unit)) {
                openAddModal(match);
              } else {
                directAddToCart(match);
              }
            }
          }
        });
        scannerControlsRef.current = controls;
      } catch (err: any) {
        if (mounted) setScannerError(err.message || 'Camera access denied. Please allow camera permission.');
      }
    };
    
    startScan();
    return () => {
      mounted = false;
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [showCameraScanner, products]);


  // ── Customer add
  const handleAddCustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustMobile) return;
    
    const existing = customers.find(c => c.mobile === newCustMobile);
    if (existing) {
      alert(`Customer already exists with ${existing.name}`);
      return;
    }

    if (customers.find(c => c.name.toLowerCase() === newCustName.toLowerCase())) {
      triggerToast("Customer name already registered!");
      return;
    }
    
    addCustomer({ name: newCustName, mobile: newCustMobile, email: "info@customer.com", address: "Store Walk-in" });
    setSelectedCustomer(newCustName);
    setCustSearch(newCustName);
    setShowAddCustModal(false);
    setNewCustName(""); setNewCustMobile("");
    triggerToast("Customer registered and selected!");
  };

  // ── Financials
  const cartSubtotal   = cart.reduce((a, i) => a + i.subtotal, 0);
  const cartTax        = cart.reduce((a, i) => a + i.subtotal * (i.taxRate / 100), 0);
  const discountAmount = discountType === "percent" ? cartSubtotal * (discountValue / 100) : discountValue;
  const loyaltyDiscount= redeemLoyalty ? 100 : 0;
  const rawGrandTotal  = Math.max(0, cartSubtotal + cartTax - discountAmount - loyaltyDiscount);
  const cartGrandTotal = (currencySymbol === "PKR" || !currencySymbol) ? Math.round(rawGrandTotal) : rawGrandTotal;

  // ── Checkout
  const handleConfirmCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (isSplit) {
      // 1. Calculate splits
      const splits = { ...parsedSplits };
      let currentTotal = totalSplitEntered;

      // 1b. Auto-absorb minor leftover decimal fractions (< 1.0 PKR/currency)
      const diff = cartGrandTotal - currentTotal;
      if (diff > 0 && diff < 1.0) {
        const primaryKey = splits["Cash"] > 0 ? "Cash" : (splits["On Credit"] > 0 ? "On Credit" : "Cash");
        splits[primaryKey] = (splits[primaryKey] || 0) + diff;
        currentTotal = cartGrandTotal;
      }

      // 2. Validate total
      if (currentTotal < cartGrandTotal) {
        const rem = (cartGrandTotal - currentTotal).toFixed(2);
        triggerToast(`Payment incomplete! Remaining balance of ${currencySymbol} ${rem} must be entered.`);
        return;
      }

      // 3. Handle cash excess change
      const excess = totalSplitEntered - cartGrandTotal;
      if (excess > 0) {
        const cashAmt = splits["Cash"] || 0;
        if (cashAmt < excess) {
          triggerToast(`Excess amount (${currencySymbol} ${excess.toFixed(2)}) cannot be returned as change because entered Cash (${currencySymbol} ${cashAmt.toFixed(2)}) is less than excess.`);
          return;
        }
        splits["Cash"] = cashAmt - excess;
      }

      // 4. Validate customer for "On Credit" and "Store Wallet Credit"
      if (splits["On Credit"] > 0 && selectedCustomer === "Walk-in Customer") {
        triggerToast("On Credit payment requires a registered customer.");
        return;
      }

      const walletSplitAmt = splits["Store Wallet Credit"] || splits["Store Wallet"] || 0;
      if (walletSplitAmt > 0) {
        if (selectedCustomer === "Walk-in Customer") {
          triggerToast("Store Wallet payment requires a registered customer.");
          return;
        }
        if (walletSplitAmt > selectedCustWalletBalance) {
          triggerToast(`Entered Store Wallet amount (${currencySymbol} ${walletSplitAmt.toFixed(2)}) exceeds available wallet balance (${currencySymbol} ${selectedCustWalletBalance.toFixed(2)}).`);
          return;
        }
      }

      // Clean up splits map (only keep positive entries)
      const cleanSplitPayments = Object.entries(splits).reduce((acc, [key, val]) => {
        if (val > 0) acc[key] = val;
        return acc;
      }, {} as Record<string, number>);

      // Build method description, e.g., "Split (Cash: PKR 500, Card: PKR 1000)"
      const splitSummary = "Split (" + Object.entries(cleanSplitPayments).map(([k, v]) => `${k}: ${currencySymbol} ${v}`).join(", ") + ")";

      const finalSale = addSale({
        branch: currentBranch,
        counterId: (posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser))?.name) || selectedCounter,
        cashierName: currentUser?.name || "Cashier",
        customerName: selectedCustomer,
        items: cart.map(i => ({ productId: i.productId, productName: i.name, price: i.price, qty: i.qty, subtotal: i.subtotal })),
        subtotal: cartSubtotal,
        discount: discountAmount + loyaltyDiscount,
        tax: cartTax,
        total: cartGrandTotal,
        paymentMethod: splitSummary,
        splitPayments: cleanSplitPayments,
        status: "Completed" as const,
        notes: checkoutNotes,
        redeemLoyalty
      });

      setSuccessReceipt(finalSale);
      setShowCheckoutModal(false);
      autoSaveReceiptToDisk(finalSale, businessSettings, currencySymbol).then(res => {
        if (res.success) {
          triggerToast(`✅ Receipt auto-saved to Documents/MT UniPOS/Sale Receipts!`);
        } else {
          console.warn("Receipt auto-save warning:", res.error);
        }
      });
      if (whatsappNumber.trim()) {
        setTimeout(() => triggerToast(`Digital receipt successfully sent to ${whatsappNumber} via WhatsApp API.`), 500);
      }
      setCart([]); setDiscountValue(0); setDiscountType("percent"); setCheckoutNotes(""); setWhatsappNumber(""); setRedeemLoyalty(false);
    } else {
      // Single Payment mode validation
      if (paymentMethod === "On Credit" && selectedCustomer === "Walk-in Customer") {
        triggerToast("On Credit payment requires a registered customer.");
        return;
      }

      if ((paymentMethod === "Store Wallet Credit" || paymentMethod === "Store Wallet") && selectedCustomer === "Walk-in Customer") {
        triggerToast("Store Wallet payment requires a registered customer.");
        return;
      }

      if (paymentMethod === "Store Wallet Credit" || paymentMethod === "Store Wallet") {
        if (selectedCustWalletBalance < cartGrandTotal) {
          triggerToast(`Insufficient Store Wallet balance (${currencySymbol} ${selectedCustWalletBalance.toFixed(2)}) for Grand Total (${currencySymbol} ${cartGrandTotal.toFixed(2)}). Please use Split Payment.`);
          return;
        }
      }

      if (paymentMethod === "Cash") {
        const paid = parseFloat(amountPaid);
        if (isNaN(paid) || paid < cartGrandTotal) {
          triggerToast("Amount paid is less than the grand total.");
          return;
        }
      }

      const paid = paymentMethod === "Cash" ? parseFloat(amountPaid) : cartGrandTotal;
      const change = paymentMethod === "Cash" ? Math.max(0, paid - cartGrandTotal) : 0;

      const finalSale = addSale({
        branch: currentBranch,
        counterId: (posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser))?.name) || selectedCounter,
        cashierName: currentUser?.name || "Cashier",
        customerName: selectedCustomer,
        items: cart.map(i => ({ productId: i.productId, productName: i.name, price: i.price, qty: i.qty, subtotal: i.subtotal })),
        subtotal: cartSubtotal,
        discount: discountAmount + loyaltyDiscount,
        tax: cartTax,
        total: cartGrandTotal,
        paymentMethod,
        receivedAmount: paymentMethod === "Cash" ? paid : undefined,
        changeReturned: paymentMethod === "Cash" ? change : undefined,
        status: "Completed" as const,
        notes: checkoutNotes,
        redeemLoyalty
      });

      setSuccessReceipt(finalSale);
      setShowCheckoutModal(false);
      autoSaveReceiptToDisk(finalSale, businessSettings, currencySymbol).then(res => {
        if (res.success) {
          triggerToast(`✅ Receipt auto-saved to Documents/MT UniPOS/Sale Receipts!`);
        } else {
          console.warn("Receipt auto-save warning:", res.error);
        }
      });
      if (whatsappNumber.trim()) {
        setTimeout(() => triggerToast(`Digital receipt successfully sent to ${whatsappNumber} via WhatsApp API.`), 500);
      }
      setCart([]); setDiscountValue(0); setDiscountType("percent"); setCheckoutNotes(""); setWhatsappNumber(""); setRedeemLoyalty(false);
    }
  };

  // ── Format qty display
  const fmtQty = (qty: number, unit: string) => {
    const isWeight = ["Kg", "Gram", "Liter", "ml", "Meter"].includes(unit);
    return isWeight ? `${qty.toFixed(qty % 1 === 0 ? 0 : 3)} ${unit}` : `${qty} ${unit}`;
  };

  // Split payment sums and change
  const parsedSplits = useMemo(() => {
    return Object.entries(splitAmounts).reduce((acc, [key, val]) => {
      const num = parseFloat(val);
      acc[key] = isNaN(num) || num <= 0 ? 0 : num;
      return acc;
    }, {} as Record<string, number>);
  }, [splitAmounts]);

  const totalSplitEntered = useMemo(() => {
    return Object.values(parsedSplits).reduce((sum, val) => sum + val, 0);
  }, [parsedSplits]);

  const remainingSplit = Math.max(0, cartGrandTotal - totalSplitEntered);
  const excessSplit = Math.max(0, totalSplitEntered - cartGrandTotal);

  // ════════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ════════════════════════════════════════════════════════════════════════════
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-black text-gray-100 font-sans items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-sky"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans print:bg-white print:text-black">
      <ClientSidebar />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={15} /> {toastMsg}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          OPEN SHIFT MODAL — Full-screen overlay when no shift is active
      ══════════════════════════════════════════════════════════════════════ */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md print:hidden"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '28px 28px' }}
        >
          <div className="bg-brand-dark-surface border border-brand-sky/25 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            {/* Header band */}
            <div className="bg-gradient-to-r from-brand-sky/10 to-transparent border-b border-brand-dark-border px-6 pt-8 pb-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-brand-sky/15 border border-brand-sky/30 flex items-center justify-center mx-auto mb-4">
                <DollarSign size={26} className="text-brand-sky" />
              </div>
              <div className="flex items-center gap-2 justify-center">
                <img src="/logo.jpg" alt="MT UniPOS Logo" className="w-6 h-6 rounded border border-brand-dark-border/50" />
                <h2 className="font-black text-white text-lg tracking-tight">MT UniPOS</h2>
              </div>
              <p className="text-[10px] text-brand-sky uppercase tracking-widest font-bold mt-0.5">Point of Sale — Shift Control</p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h3 className="font-black text-white text-sm mb-1">Open New Shift</h3>
                <p className="text-[10px] text-gray-500">Record your opening cash balance to begin selling.</p>
              </div>

              {/* Cashier & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/50 border border-brand-dark-border rounded-xl p-3">
                  <p className="text-[9px] uppercase font-bold text-gray-500 mb-1">Cashier</p>
                  <p className="text-white font-black text-xs truncate">{currentUser?.name || 'Cashier'}</p>
                </div>
                <div className="bg-black/50 border border-brand-dark-border rounded-xl p-3">
                  <p className="text-[9px] uppercase font-bold text-gray-500 mb-1">Date & Time</p>
                  <p className="text-white font-mono text-[10px] font-black">
                    {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Select Counter */}
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Select Checkout Counter / Terminal</label>
                <select
                  value={selectedCounter}
                  onChange={e => setSelectedCounter(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-3 rounded-xl text-white font-bold text-xs focus:outline-none mb-3"
                >
                  <option value="Counter 1">Counter 1 (Main Checkout)</option>
                  <option value="Counter 2">Counter 2 (Secondary)</option>
                  <option value="Counter 3">Counter 3 (Express)</option>
                  <option value="Mobile POS">Mobile POS Checkout</option>
                  <option value="Delivery Desk">Delivery Desk</option>
                </select>
              </div>

              {/* Opening Cash Input */}
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-2">Opening Cash Float Balance ({currencySymbol})</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3.5 text-brand-sky" size={15} />
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    min="0"
                    step="1"
                    value={openingCash}
                    onChange={e => setOpeningCash(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleOpenShift()}
                    autoFocus
                    className="w-full bg-black border border-brand-sky/30 focus:border-brand-sky pl-10 pr-4 py-3 rounded-xl text-white font-mono text-lg font-black focus:outline-none transition"
                  />
                </div>
                <p className="text-[9px] text-gray-600 mt-1">Enter 0 if starting with an empty drawer.</p>
              </div>

              <button
                onClick={handleOpenShift}
                className="w-full py-4 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase tracking-wider rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-sky/20"
              >
                <Timer size={16} /> Open Shift &amp; Start Selling
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN POS GRID
      ══════════════════════════════════════════════════════════════════════ */}
      <main className="flex-grow p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 max-h-screen overflow-hidden print:hidden">

        {/* ── SHIFT STATUS BAR ── */}
        {shiftOpen && (
          <div className="lg:col-span-12 flex items-center justify-between bg-brand-dark-surface/80 border border-brand-dark-border rounded-xl px-4 py-2 shrink-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-400 uppercase">
                  {posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser))?.name || selectedCounter} · SHIFT ACTIVE
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-brand-dark-surface border border-brand-dark-border px-2.5 py-1 rounded-lg text-[10px] font-mono">
                <span className="text-gray-400 font-bold">DRAWER CASH:</span>
                <span className="text-emerald-400 font-black">
                  {currencySymbol} {Math.max(0, (((posCounters.find(c => c.status === "Active" && isUserAssignedToCounter(c, currentUser))?.openingFloat ?? parseFloat(localStorage.getItem('unipos_shift_opening_cash') || openingCash || '0')) || 0) + shiftCashSales) - expenses.filter(e => e.paymentMethod === "Cash" || e.paymentMethod === "Drawer Cash" || !e.paymentMethod).reduce((a, e) => a + e.amount, 0)).toLocaleString()}
                </span>
              </div>
              {isOffline && (
                <div className="flex items-center gap-1.5 bg-red-500/20 px-2 py-1 rounded">
                  <WifiOff size={10} className="text-red-400 animate-pulse" />
                  <span className="text-[10px] font-black text-red-400 uppercase">Offline Mode (Syncing Paused)</span>
                </div>
              )}
              <div className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                <Clock size={10} className="text-gray-500" />
                Started: {new Date(shiftStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                <ShoppingCart size={10} className="text-gray-500" />
                Sales: <span className="text-white font-black ml-0.5">{shiftSales.length}</span>
              </div>
              <button 
                onClick={() => setShowHeldCartsPanel(true)}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded transition ${heldCarts.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}>
                <Clock size={10} />
                Held ({heldCarts.length})
              </button>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                <DollarSign size={10} className="text-brand-sky" />
                Cash: <span className="text-brand-sky font-black ml-0.5">{currencySymbol} {shiftCashSales.toFixed(0)}</span>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setShowLowStockModal(!showLowStockModal)}
                  className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2 py-1 rounded transition ${lowStockAlerts.length > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-gray-800 text-gray-400 border border-gray-700 hover:bg-gray-700'}`}>
                  <Bell size={10} />
                  Alerts {lowStockAlerts.length > 0 && `(${lowStockAlerts.length})`}
                </button>
                {showLowStockModal && (
                  <div className="absolute top-8 left-0 w-64 bg-[#111111] border border-brand-dark-border rounded-xl shadow-2xl z-50 overflow-hidden">
                    <div className="bg-amber-500/10 border-b border-brand-dark-border px-3 py-2 flex justify-between items-center">
                      <span className="text-[10px] font-black text-amber-400 uppercase flex items-center gap-1">
                        <Package size={10} /> Low Stock Alerts
                      </span>
                      <button onClick={() => setShowLowStockModal(false)} className="text-gray-500 hover:text-white"><X size={12} /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {lowStockAlerts.length > 0 ? (
                        lowStockAlerts.map(p => (
                          <div key={p.id} className="flex justify-between items-center px-3 py-2 border-b border-brand-dark-border/40 hover:bg-brand-dark-border/20">
                            <div>
                              <div className="text-[10px] font-bold text-white truncate w-32">{p.name}</div>
                              <div className="text-[8px] text-gray-500 font-mono">{p.sku}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-black text-red-400">{p.stock} left</div>
                              <div className="text-[8px] text-gray-500">Min: {p.minStock}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-3 py-6 text-center text-[10px] text-gray-500">All stock levels healthy!</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <button 
                onClick={async () => {
                  const res = await selectAndInitRootFolder();
                  if (res.success && res.folderName) {
                    setHasSavedFolder(true);
                    setFolderName(res.folderName);
                    if (res.isSafari) {
                      triggerToast(`ℹ️ Safari Mode (${res.folderName}): Set Safari -> Settings -> File Download Location to "${res.folderName}" for direct folder saving!`);
                    } else {
                      triggerToast(`✅ Save Folder Connected: "${res.folderName}"! Subfolders created.`);
                    }
                  } else if (res.error && res.error !== "Folder selection cancelled") {
                    triggerToast(`⚠️ ${res.error}`);
                  }
                }}
                className={`flex items-center gap-1.5 text-[9px] font-black uppercase px-2.5 py-1 rounded transition cursor-pointer ${
                  hasSavedFolder 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20" 
                    : "bg-red-500/20 text-red-400 border-2 border-red-500/60 animate-pulse hover:bg-red-500/30 shadow-lg shadow-red-500/30"
                }`}
                title={hasSavedFolder ? `Save folder connected: ${folderName}` : "Click to set local save folder for auto-saving receipts"}
              >
                {hasSavedFolder ? (
                  <>
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span>✓ {folderName ? `FOLDER: ${folderName}` : "SAVE FOLDER SET"}</span>
                  </>
                ) : (
                  <>
                    <Download size={11} className="animate-bounce text-red-400" />
                    <span>⚠️ SET SAVE FOLDER</span>
                  </>
                )}
              </button>
            </div>
            <button
              onClick={() => setShowCloseShiftModal(true)}
              className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 font-black text-[10px] px-3 py-1.5 rounded-lg transition"
            >
              <LogOut size={11} /> Close Shift
            </button>
          </div>
        )}

        {/* ── LEFT: Product Catalog (7 cols) ── */}
        <section className="lg:col-span-7 flex flex-col h-[92vh] space-y-3">

          {/* Search + Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search by name, SKU, barcode..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-brand-dark-surface border border-brand-dark-border pl-10 pr-4 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-brand-sky"
              />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="relative flex gap-2">
              <div className="relative flex-grow">
                <Barcode className="absolute left-3 top-3 text-brand-sky" size={15} />
                <input
                  type="text"
                  placeholder="Scan Barcode / SKU → Enter..."
                  value={barcodeInput}
                  onChange={e => setBarcodeInput(e.target.value)}
                  className="w-full bg-brand-dark-surface border border-brand-sky/30 pl-10 pr-4 py-2.5 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-brand-sky"
                />
              </div>
              <button
                type="button"
                onClick={startCameraScanner}
                className="bg-brand-sky/10 border border-brand-sky/30 hover:bg-brand-sky/20 text-brand-sky p-2.5 rounded-lg transition shrink-0"
                title="Use Camera Scanner"
              >
                <Camera size={15} />
              </button>
            </form>
          </div>

          {/* Category Tabs + Return Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-2 overflow-x-auto pb-1 flex-grow">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase shrink-0 transition ${
                    selectedCat === cat ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                  }`}
                >{cat}</button>
              ))}
            </div>
            <button
              onClick={() => { setShowReturnModal(true); setReturnSale(null); setReturnDone(false); setReturnReceiptSearch(""); }}
              className="shrink-0 flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 font-bold text-[10px] px-3 py-1.5 rounded-lg transition"
            >
              <RotateCcw size={11} /> Return
            </button>
          </div>

          {/* Product Grid */}
          <div className="flex-grow overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
            {filteredProducts.map(prod => {
              const isLow = prod.stock <= prod.minStock && prod.minStock > 0;
              const isWeight = WEIGHT_UNITS.includes(prod.unit);
              return (
                <button
                  key={prod.id}
                  onClick={() => openAddModal(prod)}
                  className={`p-3.5 rounded-xl text-left border flex flex-col justify-between h-36 transition hover:scale-[1.01] active:scale-[0.98] ${
                    isLow ? "bg-red-500/5 border-red-500/20 hover:border-red-500/60" : "bg-brand-dark-surface/50 border-brand-dark-border/80 hover:border-brand-sky/50"
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase tracking-widest font-bold text-gray-500 flex items-center gap-1">
                      {isWeight && <Scale size={8} className="text-brand-sky" />}
                      {prod.category}
                    </span>
                    <h4 className="text-white font-bold text-xs leading-snug truncate">{prod.name}</h4>
                    <p className="text-[9px] text-gray-500 font-mono">{prod.variant || prod.unit}</p>
                  </div>
                  <div className="flex justify-between items-end mt-2 w-full gap-1">
                    <div>
                      <span className="text-brand-sky font-black font-mono text-xs">{currencySymbol} {prod.salePrice}</span>
                      <span className="text-[8px] text-gray-600 block">per {prod.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[9px] font-mono ${isLow ? "text-red-400 font-bold" : "text-gray-500"}`}>
                        {prod.stock} {prod.unit}
                      </span>
                      {isWeight ? (
                        <div className="text-[7px] text-brand-sky/70 uppercase tracking-wide mt-0.5 font-bold">⚖ Qty / Amount</div>
                      ) : (
                        <div className="text-[7px] text-gray-600 uppercase tracking-wide mt-0.5">Tap to add</div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── RIGHT: Cart Panel (5 cols) ── */}
        <section className="lg:col-span-5 bg-brand-dark-surface/70 border border-brand-dark-border rounded-2xl p-4 flex flex-col h-[92vh] justify-between">

          <div className="flex-grow overflow-y-auto space-y-3">
            {/* Customer Row */}
            <div className="border-b border-brand-dark-border/40 pb-3 space-y-2 text-xs relative" ref={customerDropdownRef}>

              {/* Clear cart */}
              <div className="flex items-center justify-end gap-2">
                <button onClick={() => setShowHoldModal(true)} className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded transition">
                  <PauseCircle size={11} /> Hold Sale
                </button>
                <button onClick={handleClearCart} className="text-[10px] text-red-400 hover:text-red-300 font-bold flex items-center gap-1">
                  <Trash2 size={11} /> Clear Cart
                </button>
              </div>

              {/* Customer Search */}
              <div className="flex items-center gap-2 relative">
                <User size={12} className="text-gray-500 shrink-0" />
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search loyalty customer..."
                    value={custSearch}
                    onFocus={() => setShowCustDropdown(true)}
                    onChange={e => { setCustSearch(e.target.value); setShowCustDropdown(true); }}
                    className="w-full bg-black border border-brand-dark-border/80 p-2 rounded-lg text-[11px] text-white focus:outline-none focus:border-brand-sky"
                  />
                  {showCustDropdown && (
                    <div className="absolute left-0 right-0 top-9 bg-brand-dark-surface border border-brand-dark-border rounded-xl shadow-2xl max-h-44 overflow-y-auto z-30 p-1">
                      <button
                        onClick={() => { setSelectedCustomer("Walk-in Customer"); setCustSearch(""); setShowCustDropdown(false); setRedeemLoyalty(false); }}
                        className={`w-full text-left p-2.5 rounded-lg text-[10px] flex items-center gap-2 hover:bg-brand-sky/10 transition ${selectedCustomer === "Walk-in Customer" ? "bg-brand-sky/10 border-l-2 border-brand-sky" : ""}`}
                      >
                        <User size={10} className="text-gray-500" />
                        <div>
                          <div className="font-bold text-gray-300 text-[11px]">Walk-in Customer</div>
                          <div className="text-gray-600 text-[9px]">Anonymous · no loyalty</div>
                        </div>
                      </button>
                      {filteredCustomers.map(c => (
                        <button key={c.id} onClick={() => { setSelectedCustomer(c.name); setCustSearch(c.name); setShowCustDropdown(false); }}
                          className={`w-full text-left p-2.5 rounded-lg text-[10px] flex justify-between hover:bg-brand-sky/15 text-gray-200 transition ${selectedCustomer === c.name ? "bg-brand-sky/10 border-l-2 border-brand-sky" : ""}`}
                        >
                          <div>
                            <div className="font-bold text-white text-[11px]">{c.name}</div>
                            <div className="text-gray-500 font-mono text-[9px]">{c.mobile}</div>
                          </div>
                          <span className="text-yellow-400 font-black text-[9px] flex items-center gap-0.5">
                            <Star size={9} className="fill-yellow-400" />{c.loyaltyPoints} pts
                          </span>
                        </button>
                      ))}
                      {filteredCustomers.length === 0 && custSearch && (
                        <div className="text-center py-3 text-gray-500 text-[9px] italic">No match. Add new below.</div>
                      )}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowAddCustModal(true)}
                  className="p-1.5 bg-brand-sky/10 border border-brand-sky/20 text-brand-sky rounded-lg hover:bg-brand-sky hover:text-black transition shrink-0">
                  <PlusCircle size={13} />
                </button>
              </div>
            </div>

            {/* Customer Loyalty & Pending Credit Badge */}
            {selectedCustObj && selectedCustomer !== "Walk-in Customer" && (
              <div className="space-y-2">
                <div className="bg-brand-sky/10 border border-brand-sky/20 p-2.5 rounded-xl text-xs flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    <div>
                      <span className="font-bold text-white">{selectedCustomer}</span>
                      <p className="text-[9px] text-gray-400">{selectedCustObj.mobile}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-xs text-yellow-400 font-black">{selectedCustPoints} pts</span>
                    <p className="text-[8px] text-gray-500">Loyalty Balance</p>
                  </div>
                </div>

                {/* Store Wallet Credit Badge */}
                {(selectedCustObj.walletBalance || 0) > 0 && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs flex justify-between items-center animate-fade-in">
                    <div>
                      <div className="text-[9px] uppercase font-black text-emerald-400 tracking-wider">Store Wallet Credit</div>
                      <div className="font-mono font-black text-emerald-300 text-xs">{currencySymbol} {(selectedCustObj.walletBalance || 0).toFixed(2)}</div>
                    </div>
                    {selectedCustObj.creditBalance > 0 && (
                      <button
                        onClick={() => {
                          const recSale = settleDuesWithWallet(selectedCustObj.id);
                          if (recSale) {
                            setSuccessReceipt(recSale);
                            setShowThermalModal(true);
                            triggerToast(`⚡ Settled dues using Store Wallet! Receipt saved in /Dues_Clear/`);
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[9px] uppercase rounded-lg transition"
                        title="Use available wallet balance to pay off credit dues"
                      >
                        Pay Dues via Wallet
                      </button>
                    )}
                  </div>
                )}

                {selectedCustObj.creditBalance > 0 && (
                  <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-xs flex justify-between items-center animate-fade-in">
                    <div>
                      <div className="text-[9px] uppercase font-black text-red-400 tracking-wider">Pending Credit Due</div>
                      <div className="font-mono font-black text-red-300 text-xs">{currencySymbol} {selectedCustObj.creditBalance.toFixed(2)}</div>
                    </div>
                    <button
                      onClick={() => {
                        setPosRecoveryAmount(String(selectedCustObj.creditBalance));
                        setShowPosRecoveryModal(true);
                      }}
                      className="px-2.5 py-1 bg-red-500 hover:bg-red-400 text-black font-black text-[9px] uppercase rounded-lg transition"
                    >
                      Clear Due
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="space-y-2">
              {cart.map(item => (
                <div key={item.productId} className="bg-black/40 border border-brand-dark-border/60 p-2.5 rounded-xl">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-grow min-w-0">
                      <h5 className="font-bold text-white text-xs truncate">{item.name}</h5>
                      <span className="text-[9px] text-brand-sky font-mono">{currencySymbol} {item.price} / {item.unit}</span>
                    </div>
                    <button onClick={() => handleRemoveItem(item.productId)} className="text-gray-500 hover:text-red-400 shrink-0 mt-0.5">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {/* Qty controls row */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => handleQtyDelta(item.productId, -1)}
                        className="p-1 bg-brand-dark-border hover:bg-red-500/20 hover:text-red-400 rounded text-gray-400">
                        <Minus size={10} />
                      </button>

                      {/* Editable qty field */}
                      {editingQty?.id === item.productId ? (
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          autoFocus
                          value={editingQty.val}
                          onChange={e => setEditingQty({ id: item.productId, val: e.target.value })}
                          onBlur={() => commitQtyEdit(item.productId)}
                          onKeyDown={e => { if (e.key === "Enter") commitQtyEdit(item.productId); if (e.key === "Escape") setEditingQty(null); }}
                          className="w-20 bg-black border border-brand-sky/60 text-brand-sky text-center text-[11px] font-mono font-black rounded px-1 py-0.5 focus:outline-none"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingQty({ id: item.productId, val: item.qty.toString() })}
                          className="min-w-[4rem] text-center font-black font-mono text-white text-[11px] bg-brand-dark-border/70 rounded px-2 py-0.5 hover:bg-brand-sky/20 hover:text-brand-sky transition"
                          title="Click to edit quantity"
                        >
                          {fmtQty(item.qty, item.unit)}
                        </button>
                      )}

                      <button onClick={() => handleQtyDelta(item.productId, 1)}
                        className="p-1 bg-brand-dark-border hover:bg-brand-sky/20 hover:text-brand-sky rounded text-gray-400">
                        <Plus size={10} />
                      </button>
                    </div>

                    <span className="font-black text-white font-mono text-xs">{currencySymbol} {item.subtotal.toFixed(2)}</span>
                  </div>

                  {/* Mode badge */}
                  {item.saleMode === "amount" && (
                    <div className="mt-1 text-[8px] text-emerald-400/70 flex items-center gap-1">
                      <Banknote size={8} /> Sold by amount
                    </div>
                  )}
                  {(() => {
                    const itemBatches = previewFIFO ? previewFIFO(item.productId, item.qty) : [];
                    if (itemBatches && itemBatches.length > 1) {
                      return (
                        <div className="mt-1 text-[8px] text-purple-400 flex items-center gap-1">
                          <Package size={8} /> FIFO: {itemBatches.map((b: any) => `${b.qtyUsed}u @ ${b.costPrice}`).join(" + ")}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ))}

              {cart.length === 0 && (
                <div className="text-center py-12 text-xs">
                  <ShoppingCart className="text-gray-700 mx-auto mb-2 animate-bounce" size={26} />
                  <p className="text-gray-600">Cart is empty. Click a product to add.</p>
                </div>
              )}
            </div>
          </div>

          {/* ── Financial Summary ── */}
          <div className="border-t border-brand-dark-border pt-3 mt-2 space-y-2.5 shrink-0">

            {/* Loyalty Redemption */}
            {selectedCustPoints >= 1000 && selectedCustomer !== "Walk-in Customer" && (
              <div className="bg-purple-600/10 border border-purple-500/30 p-2.5 rounded-xl text-xs flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Tag size={12} className="text-purple-400" />
                  <div>
                    <span className="font-bold text-white">Loyalty Reward!</span>
                    <p className="text-[8px] text-gray-500">1,000 pts → {currencySymbol} 100 off</p>
                  </div>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={redeemLoyalty} onChange={e => setRedeemLoyalty(e.target.checked)}
                    className="rounded w-3.5 h-3.5 bg-black border-purple-500 text-purple-600 focus:ring-0" />
                  <span className="font-bold text-[9px] text-purple-400">Redeem</span>
                </label>
              </div>
            )}

            {/* Discount + Notes */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative flex items-center bg-black border border-brand-dark-border rounded-lg overflow-hidden">
                <Tag className="absolute left-2.5 text-gray-500" size={11} />
                <input
                  type="number"
                  placeholder={discountType === "percent" ? "Discount %" : `Discount (${currencySymbol})`}
                  value={discountValue || ""}
                  min={0}
                  max={discountType === "percent" ? 100 : undefined}
                  onChange={e => {
                    const val = parseFloat(e.target.value) || 0;
                    if (discountType === "percent") {
                      setDiscountValue(Math.min(100, Math.max(0, val)));
                    } else {
                      setDiscountValue(Math.max(0, val));
                    }
                  }}
                  className="w-full bg-transparent pl-7 pr-10 py-1.5 text-[10px] text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setDiscountType(discountType === "percent" ? "fixed" : "percent");
                    setDiscountValue(0);
                  }}
                  className="absolute right-1 px-1.5 py-0.5 bg-brand-dark-border hover:bg-brand-sky/20 text-brand-sky hover:text-white font-bold text-[8px] rounded uppercase transition"
                >
                  {discountType === "percent" ? "%" : currencySymbol}
                </button>
              </div>
              <div className="relative">
                <Notebook className="absolute left-2 top-2 text-gray-500" size={11} />
                <input type="text" placeholder="Receipt Notes..." value={checkoutNotes}
                  onChange={e => setCheckoutNotes(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border pl-7 pr-2 py-1.5 rounded text-[10px] text-white focus:outline-none" />
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-1 font-mono text-[10px] text-gray-500 border-b border-brand-dark-border/40 pb-2">
              <div className="flex justify-between"><span>Subtotal:</span><span className="text-white font-bold">{currencySymbol} {cartSubtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax:</span><span className="text-white">{currencySymbol} {cartTax.toFixed(2)}</span></div>
              {discountValue > 0 && (
                <div className="flex justify-between text-red-400">
                  <span>Discount ({discountType === "percent" ? `${discountValue}%` : `${currencySymbol} ${discountValue}`}):</span>
                  <span>-{currencySymbol} {discountAmount.toFixed(2)}</span>
                </div>
              )}
              {redeemLoyalty && <div className="flex justify-between text-purple-400 font-bold"><span>Loyalty Redeem:</span><span>-{currencySymbol} 100</span></div>}
            </div>

            <div className="flex justify-between items-baseline">
              <span className="text-xs text-white font-black uppercase">Grand Total:</span>
              <span className="text-xl font-black text-brand-sky font-mono">{currencySymbol} {cartGrandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={() => { 
                if (cart.length > 0) {
                  setShowCheckoutModal(true); 
                  setIsSplit(false);
                  setSplitAmounts({
                    Cash: Math.ceil(cartGrandTotal).toString(),
                    Card: "",
                    "Bank Transfer": "",
                    EasyPaisa: "",
                    JazzCash: "",
                    "On Credit": ""
                  });
                  setAmountPaid(Math.ceil(cartGrandTotal).toString());
                }
              }}
              disabled={cart.length === 0}
              className="w-full py-3.5 bg-brand-sky disabled:bg-brand-dark-border disabled:text-gray-500 hover:bg-brand-sky-light text-black font-black uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 shadow-lg shadow-brand-sky/15 text-xs"
            >
              Confirm Checkout
            </button>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          ADD-TO-CART MODAL (Qty / Amount Mode)
      ══════════════════════════════════════════════════════════════════════ */}
      {addModal.open && addModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-brand-sky/30 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up overflow-hidden">

            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-brand-dark-border">
              <div>
                <h3 className="font-black text-white text-sm">{addModal.product.name}</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {currencySymbol} <span className="text-brand-sky font-black">{addModal.product.salePrice}</span> per {addModal.product.unit}
                  <span className="ml-2 text-gray-600">Stock: {addModal.product.stock} {addModal.product.unit}</span>
                </p>
              </div>
              <button onClick={() => setAddModal(m => ({ ...m, open: false }))} className="text-gray-500 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex border-b border-brand-dark-border">
              <button
                onClick={() => setAddModal(m => ({ ...m, mode: "qty", amountInput: "", quickAmt: null }))}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition ${
                  addModal.mode === "qty" ? "bg-brand-sky/15 text-brand-sky border-b-2 border-brand-sky" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Scale size={13} /> By Quantity
              </button>
              <button
                onClick={() => setAddModal(m => ({ ...m, mode: "amount", qtyInput: "1" }))}
                className={`flex-1 py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider transition ${
                  addModal.mode === "amount" ? "bg-emerald-500/10 text-emerald-400 border-b-2 border-emerald-500" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <Banknote size={13} /> By Amount
              </button>
            </div>

            <div className="p-5 space-y-4">

              {/* ── QTY MODE ── */}
              {addModal.mode === "qty" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-2">
                      Enter Quantity ({addModal.product.unit})
                    </label>
                    {/* Quick Fraction Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {QUICK_FRACS.map(f => (
                        <button
                          key={f}
                          onClick={() => setAddModal(m => ({ ...m, qtyInput: f.toString() }))}
                          className={`py-2 rounded-lg text-xs font-black border transition ${
                            addModal.qtyInput === f.toString()
                              ? "bg-brand-sky text-black border-brand-sky"
                              : "bg-black border-brand-dark-border text-gray-300 hover:border-brand-sky/40"
                          }`}
                        >
                          {f} {addModal.product.unit}
                        </button>
                      ))}
                    </div>
                    {/* Custom input */}
                    <div className="relative">
                      <Scale className="absolute left-3 top-3 text-brand-sky" size={14} />
                      <input
                        type="number"
                        step="0.001"
                        min="0.001"
                        placeholder="Custom qty e.g. 0.350"
                        value={addModal.qtyInput}
                        onChange={e => setAddModal(m => ({ ...m, qtyInput: e.target.value }))}
                        autoFocus
                        className="w-full bg-black border border-brand-sky/40 focus:border-brand-sky pl-10 pr-4 py-2.5 rounded-lg text-white font-mono text-sm font-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── AMOUNT MODE ── */}
              {addModal.mode === "amount" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-gray-400 mb-2">
                      Quick Amount ({currencySymbol})
                    </label>
                    {/* Quick Amount Buttons */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {QUICK_AMOUNTS.map(amt => (
                        <button
                          key={amt}
                          onClick={() => setAddModal(m => ({ ...m, quickAmt: amt, amountInput: amt.toString() }))}
                          className={`py-2 rounded-lg text-xs font-black border transition ${
                            addModal.amountInput === amt.toString()
                              ? "bg-emerald-500 text-white border-emerald-500"
                              : "bg-black border-brand-dark-border text-gray-300 hover:border-emerald-500/40"
                          }`}
                        >
                          {currencySymbol} {amt}
                        </button>
                      ))}
                      <button
                        onClick={() => setAddModal(m => ({ ...m, amountInput: "", quickAmt: null }))}
                        className="py-2 rounded-lg text-xs font-black border border-brand-dark-border text-gray-400 hover:border-brand-sky/40 bg-black"
                      >
                        Custom
                      </button>
                    </div>
                    {/* Custom amount input */}
                    <div className="relative">
                      <Banknote className="absolute left-3 top-3 text-emerald-400" size={14} />
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder={`Enter amount e.g. 150`}
                        value={addModal.amountInput}
                        onChange={e => setAddModal(m => ({ ...m, amountInput: e.target.value, quickAmt: null }))}
                        className="w-full bg-black border border-emerald-500/40 focus:border-emerald-500 pl-10 pr-4 py-2.5 rounded-lg text-white font-mono text-sm font-black focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Live Preview ── */}
              <div className="bg-black/60 border border-brand-dark-border rounded-xl p-4 space-y-2 font-mono text-xs">
                <div className="text-[9px] uppercase tracking-widest text-gray-600 font-sans font-bold mb-2">Live Preview</div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Quantity:</span>
                  <span className="text-white font-black">
                    {modalPreview.qty > 0 ? `${modalPreview.qty.toFixed(modalPreview.qty % 1 === 0 ? 0 : 3)} ${addModal.product.unit}` : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rate:</span>
                  <span className="text-gray-300">{currencySymbol} {addModal.product.salePrice} / {addModal.product.unit}</span>
                </div>
                <div className="border-t border-brand-dark-border/50 pt-2 flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-brand-sky font-black">
                    {currencySymbol} {modalPreview.subtotal > 0 ? modalPreview.subtotal.toFixed(2) : "0.00"}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmAddModal}
                disabled={modalPreview.subtotal <= 0}
                className="w-full py-3 bg-brand-sky disabled:bg-brand-dark-border disabled:text-gray-500 hover:bg-brand-sky-light text-black font-black uppercase rounded-xl transition text-xs tracking-wider"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CHECKOUT PAYMENT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl max-w-md w-full shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
              <div>
                <h3 className="font-black text-white text-sm">POS Payment Gate</h3>
                <p className="text-[9px] text-brand-sky">Finalizing sale transaction</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="text-gray-400 hover:text-white font-bold text-xs bg-brand-dark-border px-2 py-0.5 rounded">Cancel</button>
            </div>

            <form onSubmit={handleConfirmCheckout} className="space-y-4 text-xs">
              {/* Premium Single vs Split Toggle */}
              <div className="flex bg-black rounded-lg p-0.5 border border-brand-dark-border/80 mb-2">
                <button
                  type="button"
                  onClick={() => setIsSplit(false)}
                  className={`flex-grow py-2 text-[10px] uppercase tracking-wider text-center rounded-md font-black transition-all duration-200 ${!isSplit ? 'bg-brand-sky text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Single Payment
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSplit(true);
                    setSplitAmounts({
                      Cash: "",
                      Card: "",
                      "Bank Transfer": "",
                      EasyPaisa: "",
                      JazzCash: "",
                      "On Credit": ""
                    });
                  }}
                  className={`flex-grow py-2 text-[10px] uppercase tracking-wider text-center rounded-md font-black transition-all duration-200 ${isSplit ? 'bg-brand-sky text-black' : 'text-gray-400 hover:text-white'}`}
                >
                  Split Payment
                </button>
              </div>

              {!isSplit ? (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-500 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "Cash", icon: DollarSign, label: "Cash" },
                      { id: "Card", icon: CreditCard, label: "Card" },
                      { id: "Bank Transfer", icon: Landmark, label: "Bank" },
                      { id: "EasyPaisa", icon: Wallet, label: "EasyPaisa" },
                      { id: "JazzCash", icon: Wallet, label: "JazzCash" },
                      { id: "Store Wallet Credit", icon: Wallet, label: "Store Wallet" },
                      { id: "On Credit", icon: CreditCard, label: "On Credit" }
                    ].map(m => (
                      <button key={m.id} type="button"
                        onClick={() => { setPaymentMethod(m.id as any); if (m.id === "Cash") setAmountPaid(Math.ceil(cartGrandTotal).toString()); }}
                        className={`p-2 rounded border flex items-center gap-1.5 transition ${
                          m.id === "On Credit"
                            ? paymentMethod === m.id ? "bg-red-500/20 border-red-500 text-white" : "bg-black/60 border-red-500/30 text-red-400 hover:border-red-500/60"
                            : m.id === "Store Wallet Credit"
                              ? paymentMethod === m.id ? "bg-emerald-500/20 border-emerald-500 text-white" : "bg-black/60 border-emerald-500/30 text-emerald-400 hover:border-emerald-500/60"
                              : paymentMethod === m.id ? "bg-brand-sky/15 border-brand-sky text-white" : "bg-black/60 border-brand-dark-border/80 text-gray-400 hover:border-brand-sky/20"
                        }`}
                      >
                        <m.icon size={11} className={paymentMethod === m.id && m.id === "On Credit" ? "text-red-400" : paymentMethod === m.id && m.id === "Store Wallet Credit" ? "text-emerald-400" : paymentMethod === m.id ? "text-brand-sky" : ""} />
                        <span className="text-[9px] font-bold">{m.label || m.id}</span>
                      </button>
                    ))}
                  </div>

                  {(paymentMethod === "Store Wallet Credit" || paymentMethod === "Store Wallet") && selectedCustomer === "Walk-in Customer" && (
                    <div className="mt-2 text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                      ⚠ Store Wallet payment requires a registered customer. Select a customer first.
                    </div>
                  )}

                  {(paymentMethod === "Store Wallet Credit" || paymentMethod === "Store Wallet") && selectedCustomer !== "Walk-in Customer" && (
                    <div className="mt-2 text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded px-2.5 py-2 font-mono space-y-1">
                      <div className="flex justify-between font-bold">
                        <span>💳 {selectedCustomer}&apos;s Store Wallet:</span>
                        <span>{currencySymbol} {selectedCustWalletBalance.toFixed(2)}</span>
                      </div>
                      {selectedCustWalletBalance < cartGrandTotal && (
                        <div className="text-red-400 text-[9px]">
                          ⚠️ Insufficient Wallet balance for full payment ({currencySymbol} {cartGrandTotal.toFixed(2)}). Use Split Payment to pay partial amount.
                        </div>
                      )}
                    </div>
                  )}

                  {paymentMethod === "On Credit" && selectedCustomer === "Walk-in Customer" && (
                    <div className="mt-2 text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                      ⚠ On Credit requires a registered customer. Select a customer first.
                    </div>
                  )}
                  {paymentMethod === "On Credit" && selectedCustomer !== "Walk-in Customer" && (
                    <div className="mt-2 text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-2 py-1.5">
                      📋 This sale will be added to {selectedCustomer}&apos;s credit balance (due account).
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] uppercase font-bold text-gray-500">Split Breakdown</label>
                    <div className="flex items-center gap-2">
                      {remainingSplit > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            const targetKey = parsedSplits["Cash"] > 0 ? "Cash" : (parsedSplits["On Credit"] > 0 ? "On Credit" : "Cash");
                            const currentVal = parsedSplits[targetKey] || 0;
                            setSplitAmounts(prev => ({
                              ...prev,
                              [targetKey]: (currentVal + remainingSplit).toFixed(2)
                            }));
                          }}
                          className="text-[9px] bg-brand-sky/20 border border-brand-sky/40 text-brand-sky hover:bg-brand-sky hover:text-black font-bold px-2 py-0.5 rounded transition animate-pulse"
                        >
                          ⚡ Auto Balance ({currencySymbol} {remainingSplit.toFixed(2)})
                        </button>
                      )}
                      {selectedCustomer !== "Walk-in Customer" && (
                        <span className="text-[9px] text-emerald-400 font-mono font-bold">
                          💳 Wallet: {currencySymbol} {selectedCustWalletBalance.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 bg-black/40 p-3 rounded-xl border border-brand-dark-border/60">
                    {[
                      { id: "Cash", icon: DollarSign, color: "text-brand-sky" },
                      { id: "Card", icon: CreditCard, color: "text-blue-400" },
                      { id: "Bank Transfer", icon: Landmark, color: "text-purple-400" },
                      { id: "EasyPaisa", icon: Wallet, color: "text-emerald-400" },
                      { id: "JazzCash", icon: Wallet, color: "text-orange-400" },
                      { id: "Store Wallet Credit", icon: Wallet, color: "text-emerald-400", label: "Store Wallet" },
                      { id: "On Credit", icon: CreditCard, color: "text-red-400" }
                    ].map(m => {
                      const Icon = m.icon;
                      const isWallet = m.id === "Store Wallet Credit";
                      return (
                        <div key={m.id} className="space-y-1">
                          <div className="flex items-center justify-between text-[9px] uppercase font-bold text-gray-400">
                            <div className="flex items-center gap-1">
                              <Icon size={10} className={m.color} />
                              <span>{m.label || m.id}</span>
                            </div>
                            {isWallet && selectedCustomer !== "Walk-in Customer" && selectedCustWalletBalance > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const applyAmt = Math.min(selectedCustWalletBalance, remainingSplit > 0 ? remainingSplit : cartGrandTotal);
                                  setSplitAmounts(prev => ({
                                    ...prev,
                                    "Store Wallet Credit": applyAmt.toFixed(2)
                                  }));
                                }}
                                >
                                [Apply Max]
                              </button>
                            )}
                            {!isWallet && remainingSplit > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const currentVal = parsedSplits[m.id] || 0;
                                  setSplitAmounts(prev => ({
                                    ...prev,
                                    [m.id]: (currentVal + remainingSplit).toFixed(2)
                                  }));
                                }}
                                className="text-[8px] text-brand-sky hover:underline font-mono"
                              >
                                [+ Remaining]
                              </button>
                            )}
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            value={splitAmounts[m.id] || ""}
                            onChange={e => {
                              const val = e.target.value;
                              setSplitAmounts(prev => ({
                                ...prev,
                                [m.id]: val
                              }));
                            }}
                            className="w-full bg-black border border-brand-dark-border hover:border-brand-sky/30 focus:border-brand-sky px-2.5 py-1.5 rounded-lg text-white font-mono text-xs focus:outline-none transition"
                          />
                        </div>
                      );
                    })}
                  </div>
                  {parsedSplits["Store Wallet Credit"] > 0 && selectedCustomer === "Walk-in Customer" && (
                    <div className="text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                      ⚠ "Store Wallet Credit" split portion requires a registered customer.
                    </div>
                  )}
                  {parsedSplits["On Credit"] > 0 && selectedCustomer === "Walk-in Customer" && (
                    <div className="text-[9px] text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1.5">
                      ⚠ "On Credit" split portion requires a registered customer.
                    </div>
                  )}
                </div>
              )}

              {/* Bill summary */}
              <div className="bg-black/60 border border-brand-dark-border p-3.5 rounded-xl font-mono text-[10px] space-y-1">
                <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="text-white font-bold">{selectedCustomer}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Items:</span><span className="text-white">{cart.length}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Grand Total:</span><span className="text-brand-sky font-black">{currencySymbol} {cartGrandTotal.toFixed(2)}</span></div>
                {isSplit && (
                  <>
                    <div className="flex justify-between border-t border-brand-dark-border/40 pt-1 mt-1">
                      <span className="text-gray-500">Total Entered:</span>
                      <span className="text-white font-black">{currencySymbol} {totalSplitEntered.toFixed(2)}</span>
                    </div>
                    {remainingSplit > 0 && (
                      <div className="flex justify-between text-red-400 font-bold">
                        <span>Remaining:</span>
                        <span>{currencySymbol} {remainingSplit.toFixed(2)}</span>
                      </div>
                    )}
                    {excessSplit > 0 && (
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Change (Cash):</span>
                        <span>{currencySymbol} {excessSplit.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {isSplit && remainingSplit > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl text-[10px] text-red-400 font-bold flex items-center justify-between animate-shake">
                  <span>⚠️ Unpaid Remaining: {currencySymbol} {remainingSplit.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const targetKey = parsedSplits["Cash"] > 0 ? "Cash" : (parsedSplits["On Credit"] > 0 ? "On Credit" : "Cash");
                      const currentVal = parsedSplits[targetKey] || 0;
                      setSplitAmounts(prev => ({ ...prev, [targetKey]: (currentVal + remainingSplit).toFixed(2) }));
                    }}
                    className="bg-red-500 text-white text-[9px] px-2 py-1 rounded font-mono uppercase tracking-wider hover:bg-red-600 font-bold"
                  >
                    Auto-Fill Balance
                  </button>
                </div>
              )}

              {/* Cash change */}
              {!isSplit && paymentMethod === "Cash" && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] uppercase font-bold text-gray-400">Cash Received</label>
                  <input type="number" required placeholder="Enter amount received" value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-3 rounded text-base text-brand-sky font-mono font-black focus:outline-none focus:border-brand-sky" />
                  {parseFloat(amountPaid) >= cartGrandTotal && (
                    <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded font-mono text-xs text-emerald-400">
                      <span>Change:</span>
                      <span className="font-black">{currencySymbol} {(parseFloat(amountPaid) - cartGrandTotal).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              )}

              {/* WhatsApp Receipt */}
              <div className="space-y-1.5 pt-2 border-t border-brand-dark-border">
                <label className="block text-[10px] uppercase font-bold text-gray-400">Digital Receipt (WhatsApp)</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="+92 300 1234567 (Optional)" value={whatsappNumber}
                    onChange={e => setWhatsappNumber(e.target.value)}
                    className="flex-1 bg-black border border-brand-dark-border p-2.5 rounded text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>
              </div>

              <button type="submit" className="w-full py-3.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase tracking-wider rounded-xl transition">
                Dispatch Payment &amp; Log Sale
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SUCCESS RECEIPT MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {successReceipt && !showThermalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 print:hidden">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl text-center space-y-4 animate-fade-in-up font-sans">
            <CheckCircle2 size={44} className="text-emerald-400 mx-auto animate-pulse" />
            <div>
              <h3 className="font-black text-white text-base">Checkout Complete!</h3>
              <p className="text-[10px] text-gray-400">Inventory updated, ledger posted.</p>
            </div>
            <div className="bg-black/60 border border-brand-dark-border p-3 rounded font-mono text-[10px] text-left space-y-1">
              <div>Receipt: <span className="text-white font-bold">{successReceipt.receiptNumber}</span></div>
              <div>Customer: <span className="text-white font-bold">{successReceipt.customerName}</span></div>
              <div>Total: <span className="text-brand-sky font-bold">{currencySymbol} {successReceipt.total.toFixed(2)}</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button onClick={() => setShowThermalModal(true)}
                className="py-2.5 bg-brand-dark-surface border border-brand-sky hover:bg-brand-sky/10 text-white font-black uppercase rounded flex items-center justify-center gap-1 transition">
                <Printer size={13} /> View Slip
              </button>
              <button onClick={async () => {
                  // Save receipt to Documents\MT UniPOS folder + auto-print
                  try {
                    const { default: html2canvas } = await import("html2canvas-pro");
                    // Build a temporary hidden slip to capture
                    const tempDiv = document.createElement("div");
                    tempDiv.style.cssText = "position:fixed;left:-9999px;top:0;width:302px;background:#fff;padding:10px;font-family:Arial,sans-serif;font-size:10px;z-index:-1;";
                    tempDiv.innerHTML = `<div style="text-align:center;padding:20px;font-size:11px;font-family:Arial">
                      <div style="font-size:14px;font-weight:900">${successReceipt.customerName}</div>
                      <div>Receipt: ${successReceipt.receiptNumber}</div>
                      <div>Total: ${currencySymbol} ${successReceipt.total.toFixed(2)}</div>
                      <div>Items: ${successReceipt.items?.length || 0}</div>
                      <div style="margin-top:8px;font-size:9px;color:#555">Powered by MT UniPOS</div>
                    </div>`;
                    document.body.appendChild(tempDiv);
                    const canvas = await html2canvas(tempDiv, { backgroundColor: "#ffffff", scale: 2, logging: false });
                    document.body.removeChild(tempDiv);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);


                    // Open print window
                    const printWin = window.open("", "_blank", "width=420,height=600");
                    if (printWin) {
                      printWin.document.write(`<!DOCTYPE html><html><head><style>@page{size:80mm auto;margin:0}body{font-family:Arial;font-size:11px;padding:10px;width:80mm}</style></head><body>
                        <div style="text-align:center">
                          <div style="font-size:13px;font-weight:900">MT UniPOS</div>
                          <div style="font-weight:700">${successReceipt.customerName}</div>
                          <div>Receipt: <b>${successReceipt.receiptNumber}</b></div>
                          <div>Total: <b>${currencySymbol} ${successReceipt.total.toFixed(2)}</b></div>
                          <hr/>
                          ${successReceipt.items?.map((i: any) => `<div style="display:flex;justify-content:space-between"><span>${i.productName} x${i.qty}</span><span>${currencySymbol} ${i.subtotal}</span></div>`).join("") || ""}
                          <hr/>
                          <div style="font-size:9px;color:#555">Powered by MT UniPOS</div>
                        </div>
                        <script>window.onload=function(){window.print();}<\/script>
                      </body></html>`);
                      printWin.document.close();
                    }
                    setToastMsg("✅ Receipt saved to Documents/MT UniPOS & sent to printer!");
                    setTimeout(() => setToastMsg(null), 3000);
                  } catch (e) {
                    console.error("Direct print error:", e);
                    setToastMsg("⚠️ Could not save receipt. Check if app server is running.");
                    setTimeout(() => setToastMsg(null), 3000);
                  }
                }}
                className="py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase rounded flex items-center justify-center gap-1 transition">
                <WifiOff size={13} /> Direct Print
              </button>
              <button onClick={() => setSuccessReceipt(null)}
                className="py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-white font-bold rounded">
                Close Register
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          THERMAL SLIP PREVIEW MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {successReceipt && (
        <ThermalSlipModal
          sale={successReceipt}
          currencySymbol={currencySymbol}
          branch={currentBranch}
          businessSettings={businessSettings}
          onClose={() => { setShowThermalModal(false); setSuccessReceipt(null); }}
          onBack={() => setShowThermalModal(false)}
          isHidden={!showThermalModal}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ADD NEW CUSTOMER MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAddCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl max-w-sm w-full shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <PlusCircle size={15} className="text-brand-sky" /> Register Loyalty Customer
              </h3>
              <button onClick={() => setShowAddCustModal(false)}><X size={16} className="text-gray-400 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAddCustSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Customer Name</label>
                <input type="text" required placeholder="e.g. Ahmed Raza" value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky" />
              </div>
              <div>
                <label className="block text-[9px] uppercase font-bold text-gray-400 mb-1">Mobile Number</label>
                <input type="text" required placeholder="03xxxxxxxxx" value={newCustMobile}
                  onChange={e => setNewCustMobile(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-brand-sky font-mono" />
              </div>
              <div className="bg-brand-sky/5 border border-brand-sky/15 p-2.5 rounded text-[9px] text-gray-400">
                <Star size={9} className="text-yellow-400 fill-yellow-400 inline mr-1" />
                Loyalty points start at 0. Earned automatically per purchase.
              </div>
              <button type="submit"
                className="w-full py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded transition">
                Register &amp; Select
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          SALES RETURN / REFUND MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0d0d0d] border border-amber-500/30 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-dark-border pb-3 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                  <RotateCcw size={14} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Process Sales Return</h3>
                  <p className="text-[9px] text-gray-500">Search receipt → select items → confirm refund</p>
                </div>
              </div>
              <button onClick={() => setShowReturnModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            {returnDone ? (
              // ── Success State ──
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-black text-white">Return Processed!</h4>
                  <p className="text-[10px] text-gray-400 mt-1">Stock has been restored. Refund issued to customer.</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setReturnSale(null); setReturnDone(false); setReturnReceiptSearch(""); }}
                    className="flex-1 py-2.5 bg-brand-dark-border text-gray-300 font-bold rounded-lg text-xs hover:bg-brand-dark-border/70 transition">
                    New Return
                  </button>
                  <button onClick={() => setShowReturnModal(false)}
                    className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs transition">
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">

                {/* Search */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Receipt Number or Sale ID</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. MT-TXN-12345"
                      value={returnReceiptSearch}
                      onChange={e => setReturnReceiptSearch(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearchReturn()}
                      className="flex-grow bg-black border border-brand-dark-border p-2.5 rounded-lg text-white font-mono focus:outline-none focus:border-amber-500"
                    />
                    <button onClick={handleSearchReturn}
                      className="px-4 py-2.5 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-400 font-black rounded-lg transition">
                      Search
                    </button>
                  </div>
                </div>

                {/* Found Sale Preview */}
                {returnSale && (
                  <div className="space-y-3">
                    <div className="bg-black/60 border border-brand-dark-border rounded-xl p-3 font-mono text-[10px] space-y-1">
                      <div className="flex justify-between"><span className="text-gray-500">Receipt:</span><span className="text-amber-400 font-bold">{returnSale.receiptNumber}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Customer:</span><span className="text-white">{returnSale.customerName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Original Total:</span><span className="text-white font-black">{currencySymbol} {returnSale.total.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Date:</span><span className="text-gray-400">{new Date(returnSale.date).toLocaleString()}</span></div>
                    </div>

                    {/* Items Quantities Selector */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block">Select Quantities to Return</label>
                        <div className="flex items-center gap-1.5 font-mono">
                          <button
                            type="button"
                            onClick={() => {
                              const all: Record<number, number> = {};
                              returnSale.items.forEach((item: any, idx: number) => {
                                all[idx] = item.qty;
                              });
                              setReturnItemQtys(all);
                            }}
                            className="text-[8px] font-black uppercase text-amber-400 hover:text-amber-300 transition"
                          >
                            Return All
                          </button>
                          <span className="text-gray-700 text-[8px] font-black font-sans">|</span>
                          <button
                            type="button"
                            onClick={() => {
                              setReturnItemQtys({});
                            }}
                            className="text-[8px] font-black uppercase text-gray-500 hover:text-white transition"
                          >
                            Clear All
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-52 overflow-y-auto">
                        {returnSale.items.map((item: any, i: number) => {
                          const currentQty = returnItemQtys[i] || 0;
                          const isSelected = currentQty > 0;
                          return (
                            <div key={i} className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 ${
                              isSelected ? "bg-amber-500/10 border-amber-500/30" : "bg-black/40 border-brand-dark-border hover:border-brand-dark-border/80"
                            }`}>
                              <div className="flex-grow min-w-0">
                                <div className="font-bold text-white text-[11px] truncate">{item.productName}</div>
                                <div className="text-[9px] text-gray-500 font-mono">Bought: {item.qty} × {currencySymbol} {item.price}</div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <div className="flex items-center bg-black border border-brand-dark-border rounded-lg overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() => setReturnItemQtys(prev => ({ ...prev, [i]: Math.max(0, (prev[i] || 0) - 1) }))}
                                    className="px-2 py-1 bg-brand-dark-border/50 text-gray-400 hover:text-white transition"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 py-1 text-white font-mono font-bold text-[11px] min-w-[24px] text-center">
                                    {currentQty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setReturnItemQtys(prev => ({ ...prev, [i]: Math.min(item.qty, (prev[i] || 0) + 1) }))}
                                    className="px-2 py-1 bg-brand-dark-border/50 text-gray-400 hover:text-white transition"
                                  >
                                    +
                                  </button>
                                </div>
                                <span className="font-black font-mono text-[11px] text-amber-400 min-w-[60px] text-right">
                                  {currencySymbol} {(currentQty * item.price).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Refund Method Selector */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Refund Payment Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRefundMethod("Cash")}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                            refundMethod === "Cash"
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "bg-black/40 border-brand-dark-border text-gray-400 hover:text-white"
                          }`}
                        >
                          💵 Cash Refund
                        </button>
                        <button
                          type="button"
                          onClick={() => setRefundMethod("Wallet")}
                          className={`p-2.5 rounded-xl border text-[10px] font-bold uppercase transition flex items-center justify-center gap-1.5 ${
                            refundMethod === "Wallet"
                              ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                              : "bg-black/40 border-brand-dark-border text-gray-400 hover:text-white"
                          }`}
                        >
                          💳 Store Wallet Credit
                        </button>
                      </div>
                    </div>

                    {/* Refund Preview */}
                    <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-gray-400">Total Refund Amount:</span>
                      <span className="font-black text-amber-400">
                        {currencySymbol} {returnSale.items
                          .reduce((a: number, item: any, i: number) => a + ((returnItemQtys[i] || 0) * item.price), 0).toFixed(2)}
                      </span>
                    </div>

                    <button onClick={handleConfirmReturn}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase rounded-xl text-xs tracking-wider transition">
                      Confirm Return & Issue Return Receipt
                    </button>
                  </div>
                )}

                {!returnSale && (
                  <div className="text-center py-8 text-gray-600">
                    <Package size={28} className="mx-auto mb-2 opacity-30" />
                    <p className="text-[10px]">Enter a receipt number above to begin the return process.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POS Quick Credit Recovery Modal */}
      {showPosRecoveryModal && selectedCustObj && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 font-sans">
          <div className="bg-[#0d0d0d] border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-brand-dark-border pb-3">
              <div className="flex items-center gap-2">
                <Wallet className="text-red-400" size={16} />
                <h3 className="font-black text-white text-sm">Clear Customer Credit</h3>
              </div>
              <button onClick={() => setShowPosRecoveryModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            
            <div className="bg-black/60 border border-brand-dark-border p-3 rounded-xl text-xs space-y-1 font-mono">
              <div className="flex justify-between"><span className="text-gray-400">Customer:</span><span className="text-white font-bold">{selectedCustObj.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-400">Total Pending Due:</span><span className="text-red-400 font-black">{currencySymbol} {selectedCustObj.creditBalance.toFixed(2)}</span></div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Payment Method</label>
              <select
                value={posRecoveryMethod}
                onChange={e => setPosRecoveryMethod(e.target.value)}
                className="w-full bg-black border border-brand-dark-border p-2.5 rounded-xl text-white font-bold focus:outline-none focus:border-red-500 mb-3"
              >
                <option value="Cash">💵 Cash</option>
                <option value="Card">💳 Credit / Debit Card</option>
                <option value="Bank Transfer">🏦 Bank Transfer</option>
                <option value="EasyPaisa / JazzCash">📱 EasyPaisa / JazzCash</option>
              </select>

              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Recovery Payment Amount</label>
              <input
                type="number"
                value={posRecoveryAmount}
                onChange={e => setPosRecoveryAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full bg-black border border-brand-dark-border p-2.5 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-red-500"
              />
            </div>

            <button
              onClick={() => {
                const amt = parseFloat(posRecoveryAmount);
                if (!amt || amt <= 0) { triggerToast("Enter valid recovery amount."); return; }
                const recSale = recordDueRecovery(selectedCustObj.id, amt, posRecoveryMethod);
                if (recSale) {
                  setSuccessReceipt(recSale);
                  setShowThermalModal(true);
                }
                triggerToast(`✅ Recovered ${currencySymbol} ${amt} via ${posRecoveryMethod}! Receipt saved in /Dues_Clear/`);
                setShowPosRecoveryModal(false);
              }}
              className="w-full py-3 bg-red-500 hover:bg-red-400 text-black font-black uppercase rounded-xl text-xs tracking-wider transition"
            >
              Confirm Dues Recovery & Issue Receipt
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          CLOSE SHIFT MODAL — Z-Report Summary
      ══════════════════════════════════════════════════════════════════════ */}
      {showCloseShiftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 print:hidden">
          <div className="bg-brand-dark-surface border border-red-500/25 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-dark-border px-5 pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
                  <LogOut size={15} className="text-red-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Close Shift — Z-Report</h3>
                  <p className="text-[9px] text-gray-500">End-of-shift summary for {currentUser?.name || 'Cashier'}</p>
                </div>
              </div>
              <button onClick={() => setShowCloseShiftModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Shift Duration */}
              <div className="bg-black/60 border border-brand-dark-border rounded-xl p-3.5 font-mono text-[10px] space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Clock size={10} /> Shift Started:</span>
                  <span className="text-white font-bold">{new Date(shiftStartTime).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 flex items-center gap-1"><Timer size={10} /> Shift Ended:</span>
                  <span className="text-white font-bold">{new Date().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cashier:</span>
                  <span className="text-brand-sky font-bold">{currentUser?.name || 'Cashier'}</span>
                </div>
              </div>

              {/* Sales Breakdown */}
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Sales Breakdown</p>
                <div className="bg-black/60 border border-brand-dark-border rounded-xl p-3.5 font-mono text-[10px] space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Transactions:</span>
                    <span className="text-white font-black">{shiftSales.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Items Sold:</span>
                    <span className="text-white font-black">{shiftItemCount}</span>
                  </div>
                  <div className="border-t border-brand-dark-border/40 pt-2 space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><DollarSign size={9} /> Cash Sales:</span>
                      <span className="text-emerald-400 font-black">{currencySymbol} {shiftCashSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><CreditCard size={9} /> Card Sales:</span>
                      <span className="text-blue-400 font-black">{currencySymbol} {shiftCardSales.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 flex items-center gap-1"><Wallet size={9} /> Other:</span>
                      <span className="text-purple-400 font-black">{currencySymbol} {shiftOtherSales.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t border-brand-dark-border/40 pt-2 flex justify-between text-sm">
                    <span className="text-gray-300 font-bold">Total Revenue:</span>
                    <span className="text-brand-sky font-black">
                      {currencySymbol} {(shiftCashSales + shiftCardSales + shiftOtherSales).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cash Drawer */}
              <div>
                <p className="text-[9px] uppercase font-bold text-gray-400 mb-2">Cash Drawer</p>
                <div className="bg-black/60 border border-brand-dark-border rounded-xl p-3.5 font-mono text-[10px] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Opening Balance:</span>
                    <span className="text-white font-black">{currencySymbol} {parseFloat(openingCash || '0').toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">+ Cash Sales:</span>
                    <span className="text-emerald-400 font-black">+ {currencySymbol} {shiftCashSales.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-brand-dark-border/40 pt-1.5 flex justify-between">
                    <span className="text-gray-300 font-bold">Expected Closing Cash:</span>
                    <span className="text-brand-sky font-black">{currencySymbol} {closingCash.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-white font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <Printer size={12} /> Print Z-Report
                </button>
                <button
                  onClick={handleCloseShift}
                  className="py-2.5 bg-red-500 hover:bg-red-400 text-white font-black text-[10px] uppercase rounded-xl flex items-center justify-center gap-1.5 transition"
                >
                  <LogOut size={12} /> Close Shift
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Hold Cart Modal */}
      {showHoldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm print:hidden">
          <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl w-full max-w-sm p-5 shadow-2xl">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <PauseCircle size={18} className="text-amber-400" /> Hold Current Sale
            </h3>
            <div className="mb-4">
              <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Reference Note (Optional)</label>
              <input 
                type="text" 
                value={holdLabel} 
                onChange={e => setHoldLabel(e.target.value)} 
                placeholder="e.g. Table 4, Waiting for wallet..." 
                className="w-full bg-black border border-brand-dark-border rounded-lg p-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowHoldModal(false)} className="px-4 py-2 rounded-lg text-xs font-bold text-gray-400 hover:text-white">Cancel</button>
              <button onClick={holdCurrentCart} className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 text-black hover:bg-amber-400">Hold Sale</button>
            </div>
          </div>
        </div>
      )}

      {/* Held Carts Panel */}
      {showHeldCartsPanel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm print:hidden" onClick={() => setShowHeldCartsPanel(false)}>
          <div className="bg-brand-dark-surface w-full max-w-md h-full border-l border-brand-dark-border shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-brand-dark-border flex justify-between items-center bg-black/20">
              <h2 className="text-white font-bold flex items-center gap-2"><Clock size={18} className="text-brand-sky" /> Parked Sales ({heldCarts.length})</h2>
              <button onClick={() => setShowHeldCartsPanel(false)} className="text-gray-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 space-y-3">
              {heldCarts.length === 0 ? (
                <div className="text-center text-gray-500 text-sm mt-10">No held sales.</div>
              ) : (
                heldCarts.map(h => (
                  <div key={h.id} className="bg-black/40 border border-brand-dark-border rounded-xl p-4 flex flex-col gap-3 hover:border-brand-sky/40 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-white text-sm">{h.label}</div>
                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5"><User size={10}/> {h.customer}</div>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {new Date(h.heldAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-t border-brand-dark-border/40 pt-3">
                      <span className="text-xs text-brand-sky font-bold font-mono">{h.cart.length} items</span>
                      <button onClick={() => retrieveHeldCart(h)} className="px-3 py-1.5 bg-brand-sky/10 hover:bg-brand-sky text-brand-sky hover:text-black rounded-lg text-xs font-bold transition">
                        Retrieve
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Camera Scanner Modal */}
      {showCameraScanner && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md print:hidden p-4">
          <div className="w-full max-w-lg bg-brand-dark-surface border border-brand-dark-border rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 border-b border-brand-dark-border flex justify-between items-center bg-black/50">
              <h3 className="text-white font-bold flex items-center gap-2"><Camera size={18} className="text-brand-sky" /> Scan Barcode</h3>
              <button onClick={stopCameraScanner} className="text-gray-400 hover:text-white"><X size={18}/></button>
            </div>
            <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
              <video ref={videoRef} autoPlay playsInline className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 border-[40px] border-black/50 z-10 pointer-events-none"></div>
              <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                <div className="w-48 h-32 border-2 border-brand-sky rounded-xl animate-pulse"></div>
              </div>
            </div>
            <div className="p-4 text-center">
              {scannerError ? (
                <div className="text-red-400 text-xs font-bold flex items-center justify-center gap-1"><AlertTriangle size={14}/> {scannerError}</div>
              ) : (
                <div className="text-brand-sky text-xs font-bold animate-pulse">Point camera at barcode</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
