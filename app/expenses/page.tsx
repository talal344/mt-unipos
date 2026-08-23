"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  TrendingDown, 
  Calendar, 
  Sparkles, 
  CheckCircle,
  FileText,
  CreditCard,
  Building
} from "lucide-react";

export default function ExpensesPage() {
  const { expenses, addExpense, currencySymbol, theme } = useGlobalContext();
  const isLight = theme === "light";
  
  // Local form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState("Utility Expenses");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [description, setDescription] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Constants for categories
  const expenseCategories = [
    "Utility Expenses",
    "Office Rent",
    "Marketing & Ads",
    "Staff Meals & Tea",
    "Stationery & Supplies",
    "Maintenance & Repairs",
    "Travel & Transport",
    "Other Admin Expenses"
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      triggerToast("Please enter a valid expense amount.");
      return;
    }

    addExpense({
      category,
      amount: parseFloat(amount),
      description: description || `Paid for ${category}`,
      paymentMethod
    });

    // Reset Form
    setAmount("");
    setDescription("");
    setShowAddForm(false);
    triggerToast(`Successfully recorded ${category} voucher entry!`);
  };

  // Filtered expenses list
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exp.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategoryFilter === "All" || exp.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Analytics calculation
  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  const cashExpenses = expenses.filter(e => e.paymentMethod === "Cash").reduce((sum, e) => sum + e.amount, 0);
  const bankExpenses = expenses.filter(e => e.paymentMethod !== "Cash").reduce((sum, e) => sum + e.amount, 0);

  // Category breakdown
  const categoryBreakdown = expenseCategories.reduce((acc, cat) => {
    const total = expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
    acc[cat] = total;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className={`flex h-screen overflow-hidden font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      {/* Main Expense Workspace */}
      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto h-screen">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-emerald-500/90 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl border border-emerald-400/20 backdrop-blur flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className={`flex justify-between items-center border-b pb-4 ${isLight ? "border-slate-200" : "border-brand-dark-border/60"}`}>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${isLight ? "text-slate-900" : "text-white"}`}>
              <Receipt size={24} className="text-sky-500" />
              Expense Vouchers Registry
            </h1>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Record and post corporate expenditures directly to ledger accounts.</p>
          </div>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white text-xs font-bold rounded-xl hover:bg-sky-500 transition shadow-lg"
          >
            <Plus size={14} />
            <span>Create Expense Voucher</span>
          </button>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className="flex justify-between items-start text-gray-500">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-slate-500" : "text-gray-500"}`}>Total Expenditures</span>
              <div className="p-1.5 rounded-lg bg-red-500/10 text-red-500">
                <TrendingDown size={14} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {currencySymbol} {totalExpenseAmount.toLocaleString()}
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>{expenses.length} operational vouchers filed</p>
            </div>
          </div>

          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className="flex justify-between items-start text-gray-500">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-slate-500" : "text-gray-500"}`}>Cash Disbursed</span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-500">
                <DollarSign size={14} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {currencySymbol} {cashExpenses.toLocaleString()}
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Deducted from Main Cash Box [1001]</p>
            </div>
          </div>

          <div className={`border p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between min-h-[110px] ${
            isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
          }`}>
            <div className="flex justify-between items-start text-gray-500">
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? "text-slate-500" : "text-gray-500"}`}>Bank Disbursements</span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                <CreditCard size={14} />
              </div>
            </div>
            <div>
              <div className={`text-2xl font-black font-mono mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                {currencySymbol} {bankExpenses.toLocaleString()}
              </div>
              <p className={`text-[9px] mt-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Deducted from Bank Account [1002]</p>
            </div>
          </div>
        </div>

        {/* Dynamic Breakdown Charts & Interactive Entry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel - Interactive Forms */}
          <div className="lg:col-span-1 space-y-6">
            {showAddForm ? (
              <form onSubmit={handleSubmit} className={`border p-6 rounded-2xl space-y-4 relative ${
                isLight ? "bg-white border-sky-300 shadow-xs text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-gray-100"
              }`}>
                <div className="absolute -top-3 left-6 px-3 py-1 bg-sky-600 text-white text-[9px] font-black uppercase rounded-full tracking-wider flex items-center gap-1 shadow-md">
                  <Sparkles size={10} />
                  Live Ledger Post
                </div>
                
                <h3 className={`text-sm font-bold mt-2 ${isLight ? "text-slate-900" : "text-white"}`}>New Expense Voucher</h3>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Posts live double-entry debits to Expense ledger and credits Asset ledger.</p>

                <div className="space-y-1.5">
                  <label className={`block text-[9px] font-bold uppercase ${isLight ? "text-slate-600" : "text-gray-400"}`}>Expense Head Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className={`w-full border px-3 py-2 rounded-xl text-xs font-bold focus:outline-none ${
                      isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white focus:border-brand-sky"
                    }`}
                  >
                    {expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[9px] font-bold uppercase ${isLight ? "text-slate-600" : "text-gray-400"}`}>Disbursed Amount ({currencySymbol})</label>
                  <div className="relative">
                    <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>{currencySymbol}</span>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className={`w-full border pl-12 pr-4 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[9px] font-bold uppercase ${isLight ? "text-slate-600" : "text-gray-400"}`}>Payment Source</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className={`w-full border px-3 py-2 rounded-xl text-xs font-bold focus:outline-none ${
                      isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white focus:border-brand-sky"
                    }`}
                  >
                    <option value="Cash">Cash Voucher (Main Cash Box 1001)</option>
                    <option value="Bank Transfer">Bank Debit Voucher (Current Bank A/C 1002)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className={`block text-[9px] font-bold uppercase ${isLight ? "text-slate-600" : "text-gray-400"}`}>Transaction Note / Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide justification notes, supplier receipt reference, etc."
                    className={`w-full border px-3 py-2 rounded-xl text-xs font-bold focus:outline-none resize-none ${
                      isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white focus:border-brand-sky"
                    }`}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit"
                    className="flex-grow py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition"
                  >
                    Post Journal Voucher
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className={`px-4 py-2 border text-xs font-bold rounded-xl transition ${
                      isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-brand-dark-border text-gray-300 hover:bg-brand-dark-border/80"
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className={`border p-6 rounded-2xl space-y-4 ${
                isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
              }`}>
                <h3 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${isLight ? "text-slate-900" : "text-gray-400"}`}>
                  <Building size={14} className="text-sky-500" />
                  Expense Distribution Head (Realtime)
                </h3>
                <div className="space-y-3 pt-2">
                  {expenseCategories.map(cat => {
                    const value = categoryBreakdown[cat] || 0;
                    const pct = totalExpenseAmount > 0 ? (value / totalExpenseAmount) * 100 : 0;
                    return (
                      <div key={cat} className="space-y-1">
                        <div className={`flex justify-between text-[10px] font-semibold ${isLight ? "text-slate-700" : "text-gray-300"}`}>
                          <span>{cat}</span>
                          <span className={`font-mono font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {value.toLocaleString()}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isLight ? "bg-slate-200" : "bg-black"}`}>
                          <div 
                            className="h-full bg-sky-500 rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right panel - List and filter registry table */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Filter Search controls */}
            <div className={`border p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-center ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
            }`}>
              <div className="relative w-full sm:w-64">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search voucher entries..."
                  className={`w-full pl-9 pr-4 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                    isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white focus:border-brand-sky"
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter size={14} className="text-sky-500 shrink-0" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className={`w-full sm:w-auto border px-2 py-1.5 rounded-xl text-[10px] font-bold focus:outline-none ${
                    isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500 shadow-xs" : "bg-black border-brand-dark-border/80 text-white"
                  }`}
                >
                  <option value="All">All Categories</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expenses List Table */}
            <div className={`border rounded-2xl overflow-hidden ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead>
                    <tr className={`uppercase tracking-wider text-[9px] font-black border-b ${
                      isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "bg-black/60 text-gray-400 border-brand-dark-border"
                    }`}>
                      <th className="px-6 py-4">Voucher ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Expense Category</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Source</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-brand-dark-border/30"}`}>
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500 font-bold">
                          <FileText size={32} className="mx-auto mb-2 text-gray-600" />
                          No expense vouchers matching active filter settings.
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((exp) => (
                        <tr key={exp.id} className={`transition ${isLight ? "hover:bg-slate-50 text-slate-900" : "hover:bg-brand-dark-border/20 text-gray-100"}`}>
                          <td className="px-6 py-3.5 font-mono text-[10px] text-sky-600 font-bold">
                            {exp.id}
                          </td>
                          <td className={`px-6 py-3.5 font-semibold font-mono text-[10px] flex items-center gap-1.5 ${isLight ? "text-slate-500" : "text-gray-400"}`}>
                            <Calendar size={12} className={isLight ? "text-slate-400" : "text-gray-600"} />
                            {exp.date}
                          </td>
                          <td className={`px-6 py-3.5 font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                            {exp.category}
                          </td>
                          <td className={`px-6 py-3.5 max-w-[200px] truncate ${isLight ? "text-slate-600" : "text-gray-300"}`}>
                            {exp.description}
                          </td>
                          <td className="px-6 py-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                              exp.paymentMethod === "Cash"
                                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                            }`}>
                              <CreditCard size={8} />
                              {exp.paymentMethod}
                            </span>
                          </td>
                          <td className="px-6 py-3.5 text-right font-mono font-black text-red-500">
                            - {currencySymbol} {exp.amount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
