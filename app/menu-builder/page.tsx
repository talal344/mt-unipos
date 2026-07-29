"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext, Product } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  ChefHat, Plus, Edit2, Trash2, Search, X, Layers, PlusCircle,
  Coffee, Utensils, Pizza, CupSoda, Tag, Info, ListOrdered, FileJson,
  CheckCircle2, AlertTriangle, ScanBarcode, Box
} from "lucide-react";

const FNB_CATEGORIES = [
  "Food & Beverage", "Restaurant", "Bakery", "Burgers", "Pizza",
  "Beverages", "Desserts", "Sides", "Mains", "Salads", "Appetizers",
  "Coffee", "Tea", "Smoothies", "Alcohol", "Raw Material"
];

function generateEAN13(): string {
  const rand9 = () => Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, "0");
  const digits = "890" + rand9();
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(digits[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return digits + check.toString();
}

function generateSKU(category: string): string {
  const prefix = category.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const mid = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${mid}-${suffix}`;
}

export default function MenuBuilderPage() {
  const { products, addProduct, updateProduct, deleteProduct, currencySymbol } = useGlobalContext();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"basic" | "variants" | "addons" | "recipe">("basic");
  
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const initialForm: Omit<Product, "id"> = {
    name: "",
    category: "Food & Beverage",
    salePrice: 0,
    costPrice: 0,
    sku: "",
    barcode: "",
    brand: "",
    stock: 0,
    minStock: 0,
    unit: "pcs",
    taxRate: 0,
    wholesalePrice: 0,
    variants: [],
    addons: [],
    ingredients: []
  };

  const [formData, setFormData] = useState<Omit<Product, "id">>(initialForm);

  // For Variants Tab
  const [newVariantName, setNewVariantName] = useState("");
  const [newVariantPrice, setNewVariantPrice] = useState("");

  // For Addons Tab
  const [newAddonName, setNewAddonName] = useState("");
  const [newAddonPrice, setNewAddonPrice] = useState("");

  // For Recipe Tab
  const [newIngId, setNewIngId] = useState("");
  const [newIngQty, setNewIngQty] = useState("");

  // Filter products
  const menuItems = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCat === "All" || p.category === filterCat;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, filterCat]);

  // Unique categories for filter
  const existingCategories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return ["All", ...Array.from(cats)];
  }, [products]);

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ ...initialForm, sku: generateSKU("FNB"), barcode: generateEAN13() });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingId(p.id);
    setFormData({
      name: p.name,
      category: p.category || "Food & Beverage",
      salePrice: p.salePrice || 0,
      costPrice: p.costPrice || 0,
      sku: p.sku || "",
      barcode: p.barcode || "",
      brand: p.brand || "",
      stock: p.stock || 0,
      minStock: p.minStock || 0,
      unit: p.unit || "pcs",
      taxRate: p.taxRate || 0,
      wholesalePrice: p.wholesalePrice || 0,
      variants: p.variants || [],
      addons: p.addons || [],
      ingredients: p.ingredients || []
    });
    setActiveTab("basic");
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return showToast("Name is required!");
    
    if (editingId) {
      updateProduct(editingId, formData);
      showToast("Menu Item updated successfully");
    } else {
      addProduct(formData);
      showToast("Menu Item added successfully");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteProduct(id);
      showToast("Item deleted");
    }
  };

  // Add Variant
  const handleAddVariant = () => {
    if (!newVariantName || !newVariantPrice) return;
    setFormData(prev => ({
      ...prev,
      variants: [...(prev.variants || []), { name: newVariantName, price: parseFloat(newVariantPrice) }]
    }));
    setNewVariantName("");
    setNewVariantPrice("");
  };

  const handleRemoveVariant = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants?.filter((_, i) => i !== idx)
    }));
  };

  // Add Addon
  const handleAddAddon = () => {
    if (!newAddonName || !newAddonPrice) return;
    setFormData(prev => ({
      ...prev,
      addons: [...(prev.addons || []), { name: newAddonName, price: parseFloat(newAddonPrice) }]
    }));
    setNewAddonName("");
    setNewAddonPrice("");
  };

  const handleRemoveAddon = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      addons: prev.addons?.filter((_, i) => i !== idx)
    }));
  };

  // Add Ingredient
  const handleAddIngredient = () => {
    if (!newIngId || !newIngQty) return;
    setFormData(prev => ({
      ...prev,
      ingredients: [...(prev.ingredients || []), { productId: newIngId, qty: parseFloat(newIngQty) }]
    }));
    setNewIngId("");
    setNewIngQty("");
  };

  const handleRemoveIngredient = (idx: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter((_, i) => i !== idx)
    }));
  };

  return (
    <div className="flex min-h-screen bg-brand-dark-surface text-gray-100 font-sans selection:bg-brand-sky/30">
      <ClientSidebar />

      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/90 backdrop-blur-md text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-[60] flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-6 sm:p-8 space-y-8 overflow-y-auto max-h-screen">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <ChefHat size={28} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
              Menu & Recipe Builder
            </h1>
            <p className="text-xs text-gray-400 mt-1 font-medium">Design products, add variants, modifiers, and link raw ingredients.</p>
          </div>
          
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-brand-sky hover:bg-brand-sky-light text-black px-5 py-2.5 rounded-lg font-bold text-sm transition-all active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.4)]"
          >
            <Plus size={16} />
            Add Menu Item
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-dark-card border border-brand-dark-border text-white text-sm rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition-all"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-brand-dark-card border border-brand-dark-border text-white text-sm rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-sky transition-all"
          >
            {existingCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {menuItems.map(p => {
            const hasVariants = p.variants && p.variants.length > 0;
            const hasAddons = p.addons && p.addons.length > 0;
            const hasRecipe = p.ingredients && p.ingredients.length > 0;

            return (
              <div key={p.id} className="group bg-brand-dark-card border border-brand-dark-border rounded-2xl p-5 hover:border-brand-sky/50 transition-all hover:shadow-[0_0_20px_rgba(14,165,233,0.1)] relative overflow-hidden flex flex-col h-full">
                
                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(p)} className="p-1.5 bg-brand-dark-surface border border-white/10 rounded-md text-gray-400 hover:text-brand-sky hover:border-brand-sky transition-colors">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-brand-dark-surface border border-white/10 rounded-md text-gray-400 hover:text-red-400 hover:border-red-400 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-dark-surface to-brand-dark-border flex items-center justify-center border border-white/5 shrink-0">
                    {p.category.toLowerCase().includes("pizza") ? <Pizza size={20} className="text-amber-400" /> :
                     p.category.toLowerCase().includes("burger") ? <Utensils size={20} className="text-amber-500" /> :
                     p.category.toLowerCase().includes("drink") || p.category.toLowerCase().includes("beverage") ? <CupSoda size={20} className="text-sky-400" /> :
                     p.category.toLowerCase().includes("coffee") ? <Coffee size={20} className="text-amber-700" /> :
                     <ChefHat size={20} className="text-gray-400" />}
                  </div>
                  <div className="pr-12">
                    <h3 className="text-base font-black text-white leading-tight">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{p.category}</p>
                  </div>
                </div>

                <div className="flex-grow space-y-3">
                  <div className="flex items-center justify-between py-2 border-y border-white/5">
                    <div className="text-xs text-gray-400 font-medium">Price</div>
                    <div className="text-sm font-black text-emerald-400">{currencySymbol}{p.salePrice.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {hasVariants && (
                      <div className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Layers size={10} /> {p.variants?.length} Variants
                      </div>
                    )}
                    {hasAddons && (
                      <div className="text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <PlusCircle size={10} /> {p.addons?.length} Add-ons
                      </div>
                    )}
                    {hasRecipe && (
                      <div className="text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <ListOrdered size={10} /> Recipe Set
                      </div>
                    )}
                    {!hasVariants && !hasAddons && !hasRecipe && (
                      <div className="text-[10px] font-bold bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Tag size={10} /> Standard Item
                      </div>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
          
          {menuItems.length === 0 && (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-500 bg-brand-dark-card/50 rounded-2xl border border-dashed border-brand-dark-border">
              <ChefHat size={48} className="text-gray-600 mb-4 opacity-50" />
              <p className="text-sm font-semibold">No menu items found</p>
              <p className="text-xs mt-1">Try adjusting your filters or add a new item.</p>
            </div>
          )}
        </div>

      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-brand-dark-card border border-brand-dark-border w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-brand-dark-surface/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-sky/10 flex items-center justify-center border border-brand-sky/20">
                  <ChefHat size={16} className="text-brand-sky" />
                </div>
                <h2 className="text-lg font-black text-white">{editingId ? "Edit Menu Item" : "Create Menu Item"}</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-white/5 bg-brand-dark-surface/30">
              {[
                { id: "basic", label: "Basic Details", icon: Info },
                { id: "variants", label: "Variants (Sizes)", icon: Layers },
                { id: "addons", label: "Add-ons (Modifiers)", icon: PlusCircle },
                { id: "recipe", label: "Recipe (Ingredients)", icon: ListOrdered }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`py-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${activeTab === t.id ? "border-brand-sky text-brand-sky" : "border-transparent text-gray-500 hover:text-gray-300"}`}
                >
                  <t.icon size={16} />
                  {t.label}
                  {t.id === "variants" && formData.variants && formData.variants.length > 0 && (
                     <span className="bg-indigo-500/20 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full">{formData.variants.length}</span>
                  )}
                  {t.id === "addons" && formData.addons && formData.addons.length > 0 && (
                     <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded-full">{formData.addons.length}</span>
                  )}
                  {t.id === "recipe" && formData.ingredients && formData.ingredients.length > 0 && (
                     <span className="bg-rose-500/20 text-rose-400 text-[10px] px-1.5 py-0.5 rounded-full">{formData.ingredients.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-grow p-6 overflow-y-auto bg-brand-dark-surface/10 custom-scrollbar">
              
              {/* Tab: Basic */}
              {activeTab === "basic" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Item Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition-all outline-none"
                        placeholder="e.g. Classic Cheeseburger"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Category</label>
                      <input
                        type="text"
                        list="cat-list"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:border-brand-sky focus:ring-1 focus:ring-brand-sky transition-all outline-none"
                      />
                      <datalist id="cat-list">
                        {FNB_CATEGORIES.map(c => <option key={c} value={c} />)}
                      </datalist>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Sale Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <input
                          type="number"
                          value={formData.salePrice || ""}
                          onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-emerald-400 font-bold focus:border-brand-sky transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5">Cost Price</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <input
                          type="number"
                          value={formData.costPrice || ""}
                          onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white focus:border-brand-sky transition-all outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                        SKU
                        <button onClick={() => setFormData(p => ({...p, sku: generateSKU("FNB")}))} className="text-brand-sky hover:text-brand-sky-light text-[10px]">Auto</button>
                      </label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:border-brand-sky transition-all outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-1.5 flex items-center justify-between">
                        Barcode
                        <button onClick={() => setFormData(p => ({...p, barcode: generateEAN13()}))} className="text-brand-sky hover:text-brand-sky-light text-[10px]">Auto</button>
                      </label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        className="w-full bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white font-mono focus:border-brand-sky transition-all outline-none"
                      />
                    </div>
                  </div>

                  <div className="bg-brand-dark-surface border border-white/5 p-4 rounded-xl flex gap-3 items-start">
                    <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-400 leading-relaxed">
                      For items managed purely as recipes (e.g., Burgers, Pizzas), you can leave stock at 0 and track inventory entirely through raw ingredients in the Recipe tab. For retail items (e.g., Canned Cola), use standard stock management.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab: Variants */}
              {activeTab === "variants" && (
                <div className="space-y-6">
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-indigo-400 mb-1">Product Variants</h3>
                    <p className="text-xs text-gray-400 mb-4">Add different sizes or types (e.g. Small, Medium, Large) with specific prices.</p>
                    
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Variant Name (e.g. Large)"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                        className="flex-grow bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                      />
                      <div className="relative w-32 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={newVariantPrice}
                          onChange={(e) => setNewVariantPrice(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
                        />
                      </div>
                      <button onClick={handleAddVariant} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">Add</button>
                    </div>
                  </div>

                  {formData.variants && formData.variants.length > 0 ? (
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-brand-dark-surface">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-400">Variant Name</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-32">Price</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-16 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-brand-dark-card">
                          {formData.variants.map((v, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 text-white font-medium">{v.name}</td>
                              <td className="px-4 py-3 text-emerald-400 font-mono">{currencySymbol}{v.price.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleRemoveVariant(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                      <Layers size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No variants added yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Addons */}
              {activeTab === "addons" && (
                <div className="space-y-6">
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-amber-400 mb-1">Add-ons & Modifiers</h3>
                    <p className="text-xs text-gray-400 mb-4">Allow customers to add extras (e.g. Extra Cheese, Extra Shot) for an additional price.</p>
                    
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Add-on Name (e.g. Extra Cheese)"
                        value={newAddonName}
                        onChange={(e) => setNewAddonName(e.target.value)}
                        className="flex-grow bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                      />
                      <div className="relative w-32 shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">{currencySymbol}</span>
                        <input
                          type="number"
                          placeholder="Price"
                          value={newAddonPrice}
                          onChange={(e) => setNewAddonPrice(e.target.value)}
                          className="w-full bg-black border border-white/10 rounded-lg pl-8 pr-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                        />
                      </div>
                      <button onClick={handleAddAddon} className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">Add</button>
                    </div>
                  </div>

                  {formData.addons && formData.addons.length > 0 ? (
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-brand-dark-surface">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-400">Add-on Name</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-32">Extra Price</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-16 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-brand-dark-card">
                          {formData.addons.map((a, i) => (
                            <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-4 py-3 text-white font-medium">{a.name}</td>
                              <td className="px-4 py-3 text-emerald-400 font-mono">+{currencySymbol}{a.price.toLocaleString()}</td>
                              <td className="px-4 py-3 text-right">
                                <button onClick={() => handleRemoveAddon(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                      <PlusCircle size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No add-ons added yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Recipe */}
              {activeTab === "recipe" && (
                <div className="space-y-6">
                  <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-rose-400 mb-1">Recipe Ingredients</h3>
                    <p className="text-xs text-gray-400 mb-4">Link raw materials or existing products. When this menu item is sold, the linked ingredients' stock will be automatically deducted.</p>
                    
                    <div className="flex gap-3">
                      <select
                        value={newIngId}
                        onChange={(e) => setNewIngId(e.target.value)}
                        className="flex-grow bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500"
                      >
                        <option value="">-- Select Raw Material / Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={newIngQty}
                        onChange={(e) => setNewIngQty(e.target.value)}
                        className="w-32 shrink-0 bg-black border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white outline-none focus:border-rose-500"
                      />
                      <button onClick={handleAddIngredient} className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors">Add</button>
                    </div>
                  </div>

                  {formData.ingredients && formData.ingredients.length > 0 ? (
                    <div className="border border-white/5 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-brand-dark-surface">
                          <tr>
                            <th className="px-4 py-3 font-semibold text-gray-400">Ingredient</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-32">Qty to Deduct</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-32">Unit Cost</th>
                            <th className="px-4 py-3 font-semibold text-gray-400 w-16 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-brand-dark-card">
                          {formData.ingredients.map((ing, i) => {
                            const p = products.find(prod => prod.id === ing.productId);
                            if (!p) return null;
                            return (
                              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                                <td className="px-4 py-3 text-white font-medium flex items-center gap-2">
                                  <Box size={14} className="text-gray-500" /> {p.name} <span className="text-[10px] text-gray-500 px-1 bg-white/5 rounded">{p.unit}</span>
                                </td>
                                <td className="px-4 py-3 text-white font-mono">{ing.qty}</td>
                                <td className="px-4 py-3 text-gray-400 font-mono">{currencySymbol}{(p.costPrice * ing.qty).toLocaleString()}</td>
                                <td className="px-4 py-3 text-right">
                                  <button onClick={() => handleRemoveIngredient(i)} className="text-gray-500 hover:text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-brand-dark-surface/50 border-t border-white/5">
                          <tr>
                            <td className="px-4 py-3 text-right text-xs text-gray-400 font-bold" colSpan={2}>Total Recipe Cost:</td>
                            <td className="px-4 py-3 text-white font-mono font-bold" colSpan={2}>
                              {currencySymbol}{formData.ingredients.reduce((acc, ing) => {
                                const p = products.find(prod => prod.id === ing.productId);
                                return acc + (p ? p.costPrice * ing.qty : 0);
                              }, 0).toLocaleString()}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500 border border-dashed border-white/10 rounded-xl">
                      <ListOrdered size={32} className="mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No ingredients added yet.</p>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-white/5 bg-brand-dark-surface flex items-center justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white hover:bg-white/5 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-6 py-2.5 rounded-lg text-sm font-black bg-brand-sky hover:bg-brand-sky-light text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                {editingId ? "Update Item" : "Save Menu Item"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
