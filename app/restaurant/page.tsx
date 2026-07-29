"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext, RestaurantTable, TableBillItem } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { 
  Utensils, Clock, CheckCircle2, Split, X, Search, ShoppingCart, 
  ChefHat, Banknote, Printer, Tag, RotateCcw, Plus, Minus, Trash2, ArrowLeft 
} from "lucide-react";

export default function RestaurantPage() {
  const { 
    tables, kitchenTickets, products, currencySymbol, addSale, currentUser, currentBranch, customers, employees,
    updateTableStatus, updateTableBill, dispatchKitchenTicket, completeKitchenTicket, clearKitchenTicket, clearTableKitchenTickets,
    addTable, updateTableBase, deleteTable
  } = useGlobalContext();
  
  const [successMsg, setSuccessMsg] = useState("");
  
  // --- View State ---
  // null = showing floor map; else = showing POS for the selected table
  const [activeTable, setActiveTable] = useState<RestaurantTable | null>(null);

  // --- Floor Management ---
  const [selectedHall, setSelectedHall] = useState("All");

  // --- Delivery & Takeaway States ---
  const [orderMode, setOrderMode] = useState<"Dine-In" | "Takeaway" | "Delivery">("Dine-In");
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({ name: "", phone: "", address: "", rider: "" });

  // --- POS State (when activeTable is set) ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [waiterName, setWaiterName] = useState("Sajid Waiter");
  
  // --- Variant / Addon Modal State ---
  const [productToCustomize, setProductToCustomize] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedAddons, setSelectedAddons] = useState<any[]>([]);

  // The local draft of the bill (includes dispatched + new pending items)
  const [draftBill, setDraftBill] = useState<TableBillItem[]>([]);
  
  // --- Split billing states (for floor map view) ---
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [splitBillAmount, setSplitBillAmount] = useState("");
  const [splitGuestsCount, setSplitGuestsCount] = useState("");

  // --- Checkout Modal State ---
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutMethod, setCheckoutMethod] = useState("Cash");
  const [discountPercent, setDiscountPercent] = useState(0);

  // --- CRM & Loyalty State ---
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [foundCustomer, setFoundCustomer] = useState<any>(null);
  const [redeemLoyalty, setRedeemLoyalty] = useState(false);

  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  const waiters = useMemo(() => employees.filter(e => e.role.toLowerCase().includes("waiter") || e.role.toLowerCase().includes("server")), [employees]);
  const riders = useMemo(() => employees.filter(e => e.role.toLowerCase().includes("rider") || e.role.toLowerCase().includes("driver")), [employees]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (selectedCat === "All" || p.category === selectedCat)
    );
  }, [products, searchQuery, selectedCat]);

  const handleOpenTablePOS = (table: RestaurantTable) => {
    setActiveTable(table);
    setDraftBill(table.currentBill ? [...table.currentBill] : []);
    setWaiterName(table.waiterName || "Sajid Waiter");
  };

  const handleCloseTablePOS = () => {
    setActiveTable(null);
    setDraftBill([]);
    setSearchQuery("");
  };

  const handleStartTakeaway = () => {
    const tempNum = `TAW-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = addTable({ number: tempNum, capacity: 1, hall: "Takeaway" });
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    updateTableStatus(newId, "Occupied", orderId, currentUser?.name || "Cashier");
    
    const newTable: RestaurantTable = {
      id: newId,
      number: tempNum,
      capacity: 1,
      hall: "Takeaway",
      status: "Occupied",
      activeOrderId: orderId,
      waiterName: currentUser?.name || "Cashier",
      currentBill: []
    };
    handleOpenTablePOS(newTable);
  };

  const submitDeliveryOrder = () => {
    const tempNum = `DLV-${Math.floor(1000 + Math.random() * 9000)}`;
    const newId = addTable({ number: tempNum, capacity: 1, hall: "Delivery" });
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    
    updateTableStatus(newId, "Occupied", orderId, currentUser?.name || "Cashier");
    updateTableBase(newId, {
      customerName: deliveryForm.name,
      customerPhone: deliveryForm.phone,
      customerAddress: deliveryForm.address,
      riderName: deliveryForm.rider 
    });
    
    const newTable: RestaurantTable = {
      id: newId,
      number: tempNum,
      capacity: 1,
      hall: "Delivery",
      status: "Occupied",
      activeOrderId: orderId,
      waiterName: currentUser?.name || "Cashier",
      currentBill: [],
      customerName: deliveryForm.name,
      customerPhone: deliveryForm.phone,
      customerAddress: deliveryForm.address,
      riderName: deliveryForm.rider
    };
    handleOpenTablePOS(newTable);
    setShowDeliveryModal(false);
    setDeliveryForm({ name: "", phone: "", address: "", rider: "" });
  };

  // --- POS Actions ---
  const handleProductClick = (prod: any) => {
    if ((prod.variants && prod.variants.length > 0) || (prod.addons && prod.addons.length > 0)) {
      setProductToCustomize(prod);
      setSelectedVariant(prod.variants?.[0] || null);
      setSelectedAddons([]);
    } else {
      handleAddItemToBill(prod);
    }
  };

  const handleAddItemToBill = (prod: any, variant?: any, addons?: any[]) => {
    const vName = variant?.name || "";
    const aNames = addons?.map((a: any) => a.name) || [];
    const price = prod.salePrice + (variant?.price || 0) + (addons?.reduce((sum: number, a: any) => sum + a.price, 0) || 0);
    const fullName = `${prod.name}${vName ? ` - ${vName}` : ""}${aNames.length > 0 ? ` + ${aNames.join(", ")}` : ""}`;

    // Only allow adding as "Pending" (isDispatched = false)
    const existingPendingIdx = draftBill.findIndex(i => 
      i.productId === prod.id && 
      !i.isDispatched && 
      i.selectedVariant === (vName || undefined) && 
      JSON.stringify(i.selectedAddons || []) === JSON.stringify(aNames.length > 0 ? aNames : [])
    );
    
    if (existingPendingIdx > -1) {
      const updated = [...draftBill];
      const newQty = updated[existingPendingIdx].qty + 1;
      updated[existingPendingIdx] = {
        ...updated[existingPendingIdx],
        qty: newQty,
        subtotal: newQty * price
      };
      setDraftBill(updated);
    } else {
      setDraftBill([...draftBill, {
        productId: prod.id,
        name: fullName,
        price: price,
        qty: 1,
        unit: prod.unit || "Pcs",
        taxRate: prod.taxRate,
        subtotal: price,
        isDispatched: false,
        selectedVariant: vName || undefined,
        selectedAddons: aNames.length > 0 ? aNames : undefined
      }]);
    }

    setProductToCustomize(null);
    setSelectedVariant(null);
    setSelectedAddons([]);
  };

  const handleRemovePendingItem = (idx: number) => {
    setDraftBill(draftBill.filter((_, i) => i !== idx));
  };

  const handleDispatchToKitchen = () => {
    if (!activeTable) return;

    const pendingItems = draftBill.filter(i => !i.isDispatched);
    if (pendingItems.length === 0) {
      alert("No new items to dispatch.");
      return;
    }

    // 1. Send to KDS
    const kdsItems = pendingItems.map(i => ({
      name: i.name,
      qty: i.qty,
      notes: i.notes
    }));
    dispatchKitchenTicket(activeTable.number, kdsItems);

    // 2. Mark all draft as dispatched
    const updatedBill = draftBill.map(i => ({ ...i, isDispatched: true }));
    setDraftBill(updatedBill);

    // 3. Save to global state
    const orderId = activeTable.activeOrderId || `REST-${Math.floor(1000 + Math.random() * 9000)}`;
    updateTableStatus(activeTable.id, "Occupied", orderId, waiterName);
    updateTableBill(activeTable.id, updatedBill);

    setSuccessMsg(`Sent ${pendingItems.length} items to Chef!`);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleCheckoutClick = () => {
    if (!activeTable) return;
    if (draftBill.some(i => !i.isDispatched)) {
      if (!confirm("You have undispatched items! Checkout anyway?")) return;
    }
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = () => {
    if (!activeTable) return;

    const rawSubtotal = draftBill.reduce((sum, i) => sum + i.subtotal, 0);
    const loyaltyDiscountAmount = (redeemLoyalty && foundCustomer && foundCustomer.loyaltyPoints >= 1000) ? 20 : 0;
    const percentageDiscountAmount = rawSubtotal * (discountPercent / 100);
    const totalDiscountAmount = percentageDiscountAmount + loyaltyDiscountAmount;
    
    const subtotal = rawSubtotal - totalDiscountAmount;
    const tax = draftBill.reduce((sum, i) => sum + (i.subtotal * (i.taxRate / 100)), 0);
    const total = subtotal + tax;

    // Create a sale in the ledger
    addSale({
      branch: currentBranch,
      cashierName: currentUser?.name || "Cashier",
      customerName: foundCustomer ? foundCustomer.name : (activeTable.customerName || "Dine-in Guest"),
      redeemLoyalty: (redeemLoyalty && foundCustomer && foundCustomer.loyaltyPoints >= 1000) ? true : undefined,
      items: draftBill.map(i => ({ 
        productId: i.productId, 
        productName: i.name, 
        price: i.price, 
        qty: i.qty, 
        subtotal: i.subtotal 
      })),
      subtotal,
      discount: totalDiscountAmount,
      tax,
      total,
      paymentMethod: checkoutMethod as any,
      status: "Completed"
    });

    // Clear Kitchen Tickets for this table automatically
    clearTableKitchenTickets(activeTable.number);

    // Clear Table
    if (activeTable.hall === "Takeaway" || activeTable.hall === "Delivery") {
      deleteTable(activeTable.id);
    } else {
      updateTableStatus(activeTable.id, "Free");
    }
    setSuccessMsg(`Table ${activeTable.number} checked out! Paid ${currencySymbol} ${total.toFixed(2)} via ${checkoutMethod}`);
    setTimeout(() => setSuccessMsg(""), 4000);
    setShowCheckoutModal(false);
    setDiscountPercent(0);
    setCheckoutMethod("Cash");
    setCustomerSearchQuery("");
    setFoundCustomer(null);
    setRedeemLoyalty(false);
    handleCloseTablePOS();
  };

  // --- Render ---

  if (activeTable) {
    // ─── FULL SCREEN POS FOR TABLE ───
    const pendingItems = draftBill.filter(i => !i.isDispatched);
    const dispatchedItems = draftBill.filter(i => i.isDispatched);
    const subtotal = draftBill.reduce((a, b) => a + b.subtotal, 0);
    const tax = draftBill.reduce((a, b) => a + (b.subtotal * (b.taxRate/100)), 0);
    const grandTotal = subtotal + tax;

    return (
      <div className="flex min-h-screen bg-black text-gray-100 font-sans">
        <ClientSidebar />
        <main className="flex-grow flex flex-col max-h-screen overflow-hidden">
          {/* Header */}
          <div className="bg-brand-dark-surface border-b border-brand-dark-border px-6 py-4 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={handleCloseTablePOS} className="p-2 bg-brand-dark-border/50 hover:bg-brand-dark-border rounded-xl transition">
                <ArrowLeft size={18} />
              </button>
              <div>
                <h1 className="text-xl font-black text-white flex items-center gap-2">
                  {activeTable.number}
                  {(activeTable.hall === "Takeaway" || activeTable.hall === "Delivery") && (
                    <span className="text-xs text-brand-sky bg-brand-sky/10 px-2 py-0.5 rounded uppercase tracking-wider">{activeTable.hall}</span>
                  )}
                </h1>
                <p className="text-[10px] text-gray-400 font-mono">Status: <span className="text-emerald-400">Order Session Active</span></p>
                {activeTable.hall === "Delivery" && (
                  <div className="text-[10px] mt-1 text-gray-300">
                    <span className="font-bold">Customer:</span> {activeTable.customerName} ({activeTable.customerPhone}) | 
                    <span className="font-bold ml-1">Address:</span> {activeTable.customerAddress} | 
                    <span className="font-bold ml-1">Rider:</span> {activeTable.riderName}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-black border border-brand-dark-border px-3 py-1.5 rounded-lg flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Waiter:</span>
                <select 
                  value={waiterName} 
                  onChange={e => setWaiterName(e.target.value)}
                  className="bg-brand-dark-bg border border-brand-dark-border text-white text-sm rounded-lg px-2 py-1 outline-none"
                >
                  <option value="">Select Waiter...</option>
                  {waiters.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                  {waiters.length === 0 && <option value="Sajid Waiter">Sajid Waiter</option>}
                  {waiters.length === 0 && <option value="Nabeel Waiter">Nabeel Waiter</option>}
                  {waiters.length === 0 && <option value="Usman Waiter">Usman Waiter</option>}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
            {/* Left: Menu Catalog (7 cols) */}
            <div className="lg:col-span-7 flex flex-col p-4 space-y-4 border-r border-brand-dark-border/50 bg-black/40">
              {/* Search & Tabs */}
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-3 text-gray-500" size={15} />
                  <input
                    type="text"
                    placeholder="Search menu..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-brand-dark-surface border border-brand-dark-border pl-10 pr-4 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-brand-sky"
                  />
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 shrink-0">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCat(cat)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase shrink-0 transition ${
                      selectedCat === cat ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                    }`}
                  >{cat}</button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="flex-grow overflow-y-auto pr-2 grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
                {filteredProducts.map(prod => (
                  <button
                    key={prod.id}
                    onClick={() => handleProductClick(prod)}
                    className="bg-brand-dark-surface/50 border border-brand-dark-border/80 hover:border-brand-sky/50 p-4 rounded-xl text-left flex flex-col justify-between h-32 transition hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div>
                      <h4 className="text-white font-bold text-xs leading-snug">{prod.name}</h4>
                      <p className="text-[9px] text-gray-500 mt-1">{prod.category}</p>
                    </div>
                    <div className="text-brand-sky font-black font-mono text-sm mt-2">
                      {currencySymbol} {prod.salePrice}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Right: Table Bill (5 cols) */}
            <div className="lg:col-span-5 flex flex-col p-4 bg-brand-dark-surface/30">
              
              <h2 className="text-sm font-black text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Utensils size={16} className="text-brand-sky" /> Table Bill
              </h2>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2">
                {/* Pending Items */}
                {pendingItems.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-[10px] uppercase font-black text-amber-400 tracking-widest border-b border-amber-500/20 pb-1">
                      Pending (Not sent to Chef)
                    </h3>
                    {pendingItems.map((item, idx) => (
                      <div key={'p'+idx} className="bg-amber-500/5 border border-amber-500/20 p-2.5 rounded-lg flex justify-between items-center group">
                        <div>
                          <div className="text-white font-bold text-xs">{item.name}</div>
                          <div className="text-[10px] text-gray-400">{item.qty} x {currencySymbol} {item.price}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-amber-400 font-bold text-xs">{currencySymbol} {item.subtotal.toFixed(2)}</span>
                          <button onClick={() => handleRemovePendingItem(draftBill.indexOf(item))} className="text-red-400 opacity-0 group-hover:opacity-100 transition">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dispatched Items */}
                {dispatchedItems.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <h3 className="text-[10px] uppercase font-black text-emerald-400 tracking-widest border-b border-emerald-500/20 pb-1">
                      Dispatched to Kitchen
                    </h3>
                    {dispatchedItems.map((item, idx) => (
                      <div key={'d'+idx} className="bg-emerald-500/5 border border-emerald-500/20 p-2.5 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="text-white font-bold text-xs flex items-center gap-1.5">
                            <CheckCircle2 size={12} className="text-emerald-400" /> {item.name}
                          </div>
                          <div className="text-[10px] text-gray-400 ml-4">{item.qty} x {currencySymbol} {item.price}</div>
                        </div>
                        <span className="font-mono text-emerald-400 font-bold text-xs">{currencySymbol} {item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {draftBill.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <ShoppingCart size={32} className="mx-auto mb-3 opacity-20" />
                    <p className="text-xs font-bold">Table is empty</p>
                    <p className="text-[10px]">Add items from the menu to start ordering</p>
                  </div>
                )}
              </div>

              {/* Bill Totals & Actions */}
              <div className="border-t border-brand-dark-border pt-4 space-y-3 shrink-0 mt-2">
                <div className="space-y-1 font-mono text-[10px] text-gray-400">
                  <div className="flex justify-between"><span>Subtotal:</span><span className="text-white">{currencySymbol} {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span>Tax:</span><span className="text-white">{currencySymbol} {tax.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between items-baseline border-t border-brand-dark-border/50 pt-2 mb-4">
                  <span className="text-sm font-black text-white uppercase tracking-wider">Grand Total:</span>
                  <span className="text-xl font-black text-brand-sky font-mono">{currencySymbol} {grandTotal.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleDispatchToKitchen}
                    disabled={pendingItems.length === 0}
                    className="py-3.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:hover:bg-amber-500 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <ChefHat size={16} /> Send to KDS
                  </button>
                  <button 
                    onClick={handleCheckoutClick}
                    disabled={draftBill.length === 0}
                    className="py-3.5 bg-brand-sky hover:bg-brand-sky-light disabled:opacity-50 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 transition"
                  >
                    <Banknote size={16} /> Pay &amp; Clear
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Variant & Addon Modal */}
          {productToCustomize && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
              <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-3xl w-full max-w-lg shadow-2xl animate-fade-in-up font-sans flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center border-b border-brand-dark-border pb-4 mb-4 shrink-0">
                  <h3 className="font-black text-white text-lg flex items-center gap-2">
                    <Tag size={20} className="text-brand-sky" /> Customize {productToCustomize.name}
                  </h3>
                  <button onClick={() => setProductToCustomize(null)} className="text-gray-400 hover:text-white p-2 bg-brand-dark-border/50 rounded-full transition">
                    <X size={18} />
                  </button>
                </div>
                
                <div className="overflow-y-auto pr-2 space-y-6 flex-grow custom-scrollbar">
                  {/* Variants */}
                  {productToCustomize.variants && productToCustomize.variants.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Select Variant (Required)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {productToCustomize.variants.map((v: any, i: number) => (
                          <button
                            key={i}
                            onClick={() => setSelectedVariant(v)}
                            className={`p-4 rounded-xl border flex justify-between items-center transition ${
                              selectedVariant?.name === v.name ? "bg-brand-sky/20 border-brand-sky text-brand-sky" : "bg-black border-brand-dark-border text-white hover:border-gray-500"
                            }`}
                          >
                            <span className="font-bold text-sm">{v.name}</span>
                            <span className="font-mono text-xs text-gray-400">+{v.price}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Addons */}
                  {productToCustomize.addons && productToCustomize.addons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">Extra Addons (Optional)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {productToCustomize.addons.map((a: any, i: number) => {
                          const isSelected = selectedAddons.some(sa => sa.name === a.name);
                          return (
                            <button
                              key={i}
                              onClick={() => {
                                if (isSelected) setSelectedAddons(selectedAddons.filter(sa => sa.name !== a.name));
                                else setSelectedAddons([...selectedAddons, a]);
                              }}
                              className={`p-4 rounded-xl border flex justify-between items-center transition ${
                                isSelected ? "bg-amber-500/20 border-amber-500 text-amber-500" : "bg-black border-brand-dark-border text-white hover:border-gray-500"
                              }`}
                            >
                              <span className="font-bold text-sm">{a.name}</span>
                              <span className="font-mono text-xs text-gray-400">+{a.price}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-brand-dark-border pt-4 mt-4 shrink-0 flex justify-between items-center">
                  <div className="text-sm font-black text-white">
                    Total: <span className="text-brand-sky font-mono">{currencySymbol} {(productToCustomize.salePrice + (selectedVariant?.price || 0) + selectedAddons.reduce((sum: number, a: any) => sum + a.price, 0)).toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => handleAddItemToBill(productToCustomize, selectedVariant, selectedAddons)}
                    className="px-6 py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase tracking-wider rounded-xl text-sm transition"
                  >
                    Add to Order
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* Checkout & Payment Modal */}
        {showCheckoutModal && activeTable && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-3xl w-full max-w-md shadow-2xl animate-fade-in-up font-sans flex flex-col">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-4 mb-4">
                <div>
                  <h3 className="font-black text-white text-lg">Checkout Table {activeTable.number}</h3>
                  <p className="text-xs text-gray-400 mt-1">Select payment method and apply discounts</p>
                </div>
                <button onClick={() => {
                  setShowCheckoutModal(false);
                  setCustomerSearchQuery("");
                  setFoundCustomer(null);
                  setRedeemLoyalty(false);
                }} className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 flex-grow">
                {/* CRM Lookup */}
                <div className="bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-xl">
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Customer Lookup</label>
                  <input
                    type="text"
                    placeholder="Search by name or phone..."
                    value={customerSearchQuery}
                    onChange={e => {
                      const q = e.target.value;
                      setCustomerSearchQuery(q);
                      if (q.length > 2) {
                        const match = customers.find(c => c.mobile.includes(q) || c.name.toLowerCase().includes(q.toLowerCase()));
                        setFoundCustomer(match || null);
                      } else {
                        setFoundCustomer(null);
                      }
                      setRedeemLoyalty(false);
                    }}
                    className="w-full bg-black border border-brand-dark-border px-3 py-2 rounded-lg text-sm text-white focus:outline-none focus:border-brand-sky mb-3"
                  />
                  {foundCustomer && (
                    <div className="bg-black/40 p-3 rounded-lg border border-brand-sky/20">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white">{foundCustomer.name}</span>
                        <span className="text-xs text-gray-400">{foundCustomer.mobile}</span>
                      </div>
                      <div className="text-sm mt-1">Loyalty Points: <span className="text-brand-sky font-bold font-mono">{foundCustomer.loyaltyPoints}</span></div>
                      {foundCustomer.loyaltyPoints >= 1000 && (
                        <label className="flex items-center gap-2 mt-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={redeemLoyalty} 
                            onChange={e => setRedeemLoyalty(e.target.checked)}
                            className="accent-brand-sky w-4 h-4"
                          />
                          <span className="text-sm text-brand-sky">Redeem 1000 points for $20 discount</span>
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Billing Summary */}
                <div className="bg-black/50 p-4 rounded-xl border border-brand-dark-border space-y-2 text-sm font-mono text-gray-300">
                  <div className="flex justify-between">
                    <span>Raw Subtotal:</span>
                    <span>{currencySymbol} {draftBill.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-400">
                      <span>Discount ({discountPercent}%):</span>
                      <span>-{currencySymbol} {(draftBill.reduce((sum, i) => sum + i.subtotal, 0) * (discountPercent/100)).toFixed(2)}</span>
                    </div>
                  )}
                  {redeemLoyalty && foundCustomer && foundCustomer.loyaltyPoints >= 1000 && (
                    <div className="flex justify-between text-brand-sky">
                      <span>Loyalty Redemption:</span>
                      <span>-{currencySymbol} 20.00</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>{currencySymbol} {draftBill.reduce((sum, i) => sum + (i.subtotal * (i.taxRate/100)), 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-brand-dark-border mt-2 font-black text-white text-lg">
                    <span>Grand Total:</span>
                    <span className="text-brand-sky">
                      {currencySymbol} {(((draftBill.reduce((sum, i) => sum + i.subtotal, 0) * (1 - discountPercent/100)) - (redeemLoyalty && foundCustomer && foundCustomer.loyaltyPoints >= 1000 ? 20 : 0)) + draftBill.reduce((sum, i) => sum + (i.subtotal * (i.taxRate/100)), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Discount */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Apply Discount (%)</label>
                  <div className="flex space-x-2">
                    {[0, 10, 15, 20].map(pct => (
                      <button
                        key={pct}
                        onClick={() => setDiscountPercent(pct)}
                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${discountPercent === pct ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
                      >
                        {pct === 0 ? 'None' : `${pct}%`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Cash", "Credit Card", "Online Transfer", "Wallet"].map(method => (
                      <button
                        key={method}
                        onClick={() => setCheckoutMethod(method)}
                        className={`py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${checkoutMethod === method ? 'bg-brand-sky text-black' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}
                      >
                        {method === "Cash" && <Banknote size={16} />}
                        {method === "Credit Card" && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>}
                        {method === "Online Transfer" && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 16h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>}
                        {method === "Wallet" && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>}
                        {method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-brand-dark-border mt-4">
                <button 
                  onClick={handleConfirmCheckout}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider rounded-2xl transition shadow-lg shadow-emerald-500/20"
                >
                  Confirm &amp; Print Receipt
                </button>
              </div>
            </div>
          </div>
        )}

        </main>
      </div>
    );
  }

  // ─── FLOOR MAP VIEW ───
  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Floor Tables layout & split calculator */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Dining Floor &amp; Order Management</h1>
              <p className="text-[10px] text-gray-500">Live physical dining table visual maps, waiters routings, and POS ordering.</p>
            </div>
            <button
              onClick={() => setShowSplitModal(true)}
              className="flex items-center gap-1 bg-brand-sky/10 hover:bg-brand-sky/20 border border-brand-sky/30 text-brand-sky font-black text-[11px] px-3.5 py-2 rounded-lg transition"
            >
              <Split size={12} /> Split Calculator
            </button>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Top Toggle Bar */}
          <div className="flex gap-2 bg-brand-dark-surface/50 p-1 rounded-xl w-fit border border-brand-dark-border">
            {(["Dine-In", "Takeaway", "Delivery"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setOrderMode(mode)}
                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition ${
                  orderMode === mode ? "bg-brand-sky text-black" : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {orderMode === "Dine-In" && (
            <>
              {/* Hall Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {["All", ...Array.from(new Set(tables.filter(t => t.hall !== "Takeaway" && t.hall !== "Delivery").map(t => t.hall || "Main Hall")))].map((hall, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedHall(hall)}
                    className={`px-4 py-2 rounded-lg text-[11px] font-bold uppercase shrink-0 transition ${
                      selectedHall === hall ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                    }`}
                  >
                    {hall}
                  </button>
                ))}
              </div>

              {/* Tables Map Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {tables.filter(t => t.hall !== "Takeaway" && t.hall !== "Delivery" && (selectedHall === "All" || (t.hall || "Main Hall") === selectedHall)).map(table => {
                  const isFree = table.status === "Free";
                  const isOccupied = table.status === "Occupied";
                  return (
                    <div
                      key={table.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between h-40 transition-all cursor-pointer ${
                        isFree ? "bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500" :
                        isOccupied ? "bg-brand-sky/10 border-brand-sky/40 text-white hover:border-brand-sky" :
                        "bg-amber-500/5 border-amber-500/30 text-white"
                      }`}
                      onClick={() => handleOpenTablePOS(table)}
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500">Cap: {table.capacity} pax</span>
                          <Utensils size={14} className={isFree ? "text-emerald-400" : isOccupied ? "text-brand-sky" : "text-amber-400"} />
                        </div>
                        <h4 className="text-white font-bold text-xs">{table.number}</h4>
                        {isOccupied && (
                          <div className="text-[9px] text-gray-400 leading-tight pt-1">
                            <div>Server: <span className="text-white">{table.waiterName}</span></div>
                            <div className="mt-1 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-brand-sky rounded-full animate-pulse"></span>
                              <span className="text-brand-sky font-bold">Eating</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        {isFree ? (
                          <span className="text-[10px] text-emerald-400 font-bold">Tap to Occupy</span>
                        ) : (
                          <span className="text-[10px] text-brand-sky font-bold">View Open Bill</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {orderMode === "Takeaway" && (
            <div className="space-y-4">
              <button onClick={handleStartTakeaway} className="w-full py-4 border-2 border-dashed border-brand-sky/50 text-brand-sky hover:bg-brand-sky/10 font-black uppercase rounded-xl transition flex items-center justify-center gap-2">
                <Plus size={18} /> Start New Takeaway Order
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tables.filter(t => t.hall === "Takeaway" && t.status !== "Free").map(table => (
                   <div key={table.id} className="p-4 rounded-xl bg-brand-sky/10 border border-brand-sky/40 text-white hover:border-brand-sky cursor-pointer" onClick={() => handleOpenTablePOS(table)}>
                      <h4 className="font-bold text-xs">{table.number}</h4>
                      <p className="text-[10px] text-gray-400 mt-1">Status: Active</p>
                      <div className="text-[10px] text-brand-sky font-bold mt-3 flex items-center gap-1"><ShoppingCart size={12}/> View Order</div>
                   </div>
                ))}
              </div>
            </div>
          )}

          {orderMode === "Delivery" && (
            <div className="space-y-4">
              <button onClick={() => setShowDeliveryModal(true)} className="w-full py-4 border-2 border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/10 font-black uppercase rounded-xl transition flex items-center justify-center gap-2">
                <Plus size={18} /> Start New Delivery Order
              </button>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {tables.filter(t => t.hall === "Delivery" && t.status !== "Free").map(table => (
                   <div key={table.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/40 text-white hover:border-amber-500 cursor-pointer" onClick={() => handleOpenTablePOS(table)}>
                      <h4 className="font-bold text-xs">{table.number}</h4>
                      <div className="text-[10px] text-gray-400 mt-1 line-clamp-1">{table.customerName} - {table.customerPhone}</div>
                      <div className="text-[10px] text-amber-500 font-bold mt-3 flex items-center gap-1"><ShoppingCart size={12}/> View Order</div>
                   </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Kitchen Display System (KDS) board */}
        <div className="lg:col-span-1 bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-2xl flex flex-col max-h-[80vh]">
          <h2 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-brand-dark-border/40 pb-2 flex items-center gap-1.5">
            <Clock className="text-brand-sky" size={14} />
            Chef Kitchen Display (KDS)
          </h2>
          
          <div className="space-y-3 overflow-y-auto flex-grow pr-1">
            {kitchenTickets.map(t => (
              <div key={t.id} className="bg-black/60 border border-brand-dark-border p-3.5 rounded-xl space-y-3 relative">
                <div className="flex justify-between items-center text-[10px] font-mono border-b border-brand-dark-border pb-1.5 text-gray-500">
                  <span className="text-brand-sky font-bold">KDS ID: {t.id}</span>
                  <span>{t.tableNumber}</span>
                </div>
                
                <ul className="space-y-1 text-xs">
                  {t.items.map((item, idx) => (
                    <li key={idx} className="text-white font-bold flex justify-between">
                      <span>{item.name} <span className="text-brand-sky-light">x{item.qty}</span></span>
                      {item.notes && <span className="text-[9px] text-amber-400 font-normal italic">*{item.notes}</span>}
                    </li>
                  ))}
                </ul>

                <div className="flex justify-between items-center pt-2 border-t border-brand-dark-border/40 text-[10px]">
                  <span className="text-amber-500 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    {t.status}
                  </span>
                  {t.status !== "Ready" ? (
                    <button
                      onClick={() => completeKitchenTicket(t.id)}
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded text-[9px] transition"
                    >
                      Dish Ready
                    </button>
                  ) : (
                    <button
                      onClick={() => clearKitchenTicket(t.id)}
                      className="px-2.5 py-1 bg-blue-500 hover:bg-blue-400 text-white font-black rounded text-[9px] transition"
                    >
                      Mark Served
                    </button>
                  )}
                </div>
              </div>
            ))}
            {kitchenTickets.length === 0 && (
              <p className="text-[10px] text-gray-500 italic text-center py-10">No pending orders in Chef queue.</p>
            )}
          </div>
        </div>

        {/* Split Billing Calculator Modal */}
        {showSplitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-brand-dark-surface border border-brand-sky/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-mono text-center space-y-4">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-2 mb-2 font-sans">
                <h3 className="font-black text-white text-xs">Split Bill Calculator</h3>
                <button onClick={() => setShowSplitModal(false)} className="text-gray-400 hover:text-white text-xs bg-brand-dark-border px-1.5 py-0.5 rounded">Close</button>
              </div>

              <div className="space-y-3 text-xs font-sans text-left">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Grand Bill Amount (PKR)</label>
                  <input
                    type="number"
                    value={splitBillAmount}
                    onChange={(e) => setSplitBillAmount(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-brand-sky font-mono font-bold focus:outline-none focus:border-brand-sky"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Splits Guests (Persons)</label>
                  <input
                    type="number"
                    value={splitGuestsCount}
                    onChange={(e) => setSplitGuestsCount(e.target.value)}
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white font-mono focus:outline-none focus:border-brand-sky"
                  />
                </div>
              </div>

              {Number(splitBillAmount) > 0 && Number(splitGuestsCount) > 0 && (
                <div className="bg-black/60 border border-brand-dark-border p-4 rounded text-xs leading-normal">
                  <div className="text-gray-500 font-sans">Split share due per person:</div>
                  <div className="text-lg font-black text-brand-sky font-mono mt-1">
                    PKR {Math.round(Number(splitBillAmount) / Number(splitGuestsCount)).toLocaleString()}
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowSplitModal(false)}
                className="w-full py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg text-xs font-sans transition"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Delivery Order Modal */}
        {showDeliveryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="bg-brand-dark-surface border border-amber-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up space-y-4">
              <div className="flex justify-between items-center border-b border-brand-dark-border pb-2 mb-2">
                <h3 className="font-black text-white text-sm flex items-center gap-2"><Plus size={16} className="text-amber-500"/> New Delivery Order</h3>
                <button onClick={() => setShowDeliveryModal(false)} className="text-gray-400 hover:text-white text-xs bg-brand-dark-border px-1.5 py-0.5 rounded">Close</button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={deliveryForm.name}
                    onChange={(e) => setDeliveryForm(prev => ({...prev, name: e.target.value}))}
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. Ali Khan"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Customer Phone</label>
                  <input
                    type="text"
                    value={deliveryForm.phone}
                    onChange={(e) => setDeliveryForm(prev => ({...prev, phone: e.target.value}))}
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white focus:outline-none focus:border-amber-500"
                    placeholder="e.g. 03001234567"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Delivery Address</label>
                  <textarea
                    value={deliveryForm.address}
                    onChange={(e) => setDeliveryForm(prev => ({...prev, address: e.target.value}))}
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white focus:outline-none focus:border-amber-500 resize-none h-16"
                    placeholder="Complete address..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Assigned Rider</label>
                  <select 
                    value={deliveryForm.rider}
                    onChange={(e) => setDeliveryForm(prev => ({...prev, rider: e.target.value}))}
                    className="w-full bg-slate-950/50 border border-slate-700 p-3 rounded-xl text-white outline-none focus:border-amber-500 transition"
                  >
                    <option value="">Select Rider...</option>
                    {riders.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    {riders.length === 0 && <option value="Usman Rider">Usman Rider</option>}
                  </select>
                </div>
              </div>

              <button
                onClick={submitDeliveryOrder}
                disabled={!deliveryForm.name || !deliveryForm.address}
                className="w-full py-3 mt-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-black uppercase rounded-lg text-xs transition"
              >
                Create &amp; Open POS
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
