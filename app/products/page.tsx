"use client";

import React, { useState, useRef, useCallback } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import {
  Plus, Edit2, Trash2, Barcode, RefreshCw, Tag, Search, X,
  Package, Upload, Download, FileSpreadsheet, CheckCircle2,
  AlertTriangle, ChevronRight, Loader2, Eye, BarChart3, Printer, Layers
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Auto Code Generators ────────────────────────────────────────────────────

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

const CAT_PREFIX: Record<string, string> = {
  "Grocery": "GRC",
  "Pharmacy": "PHM",
  "Food & Beverage": "FNB",
  "Electronics": "ELC",
  "Clothing": "CLT",
  "Footwear": "FTW",
  "Books & Stationery": "BKS",
  "Cosmetics": "CSM",
  "Hardware": "HRD",
  "Mobiles": "MOB",
  "Gift & Toys": "GFT",
  "Wholesale": "WHL",
  "General Retail": "GNR",
  "Restaurant": "RST",
  "Bakery": "BKR",
};

function generateSKU(category: string): string {
  const prefix = CAT_PREFIX[category] || category.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 3).padEnd(3, "X");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  const mid = Math.random().toString(36).toUpperCase().slice(2, 5);
  return `${prefix}-${mid}-${suffix}`;
}

// ─── Preset Categories ────────────────────────────────────────────────────────
const PRESET_CATEGORIES = [
  "Grocery", "Pharmacy", "Food & Beverage", "Electronics", "Clothing",
  "Footwear", "Books & Stationery", "Cosmetics", "Hardware", "Mobiles",
  "Gift & Toys", "Wholesale", "General Retail", "Restaurant", "Bakery", "Custom...",
];

const UNITS = ["Pcs", "Kg", "Gram", "Liter", "ml", "Box", "Pack", "Dozen", "Meter", "Sheet"];

// ─── Excel column schema ──────────────────────────────────────────────────────
// SKU and Barcode are intentionally left empty — auto-generated on import
const DEMO_TEMPLATE_COLS = [
  "Product Name",
  "Category",
  "Brand",
  "Variant",
  "Cost Price",
  "Sale Price",
  "Wholesale Price",
  "Stock Qty",
  "Min Stock",
  "Unit",
  "Tax Rate (%)",
];

// ─── Default empty form ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: "", sku: "", barcode: "", category: "Grocery", customCategory: "",
  brand: "", costPrice: 0, salePrice: 0, wholesalePrice: 0,
  taxRate: 0, stock: 50, minStock: 10, unit: "Pcs", variant: "",
};

// ─── Parsed row preview type ──────────────────────────────────────────────────
interface ParsedRow {
  row: number;
  name: string;
  category: string;
  brand: string;
  variant: string;
  costPrice: number;
  salePrice: number;
  wholesalePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  taxRate: number;
  error?: string;
}

export default function ProductsPage() {
  const { products, addProduct, addProductsBulk, mergeProductsBulk, updateProduct, deleteProduct, deleteProductsBulk, currencySymbol, getProductBatches, theme } = useGlobalContext();
  const isLight = theme === "light";

  // ── Single product modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeBarcode, setActiveBarcode] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [isCustomCat, setIsCustomCat] = useState(false);

  // ── Bulk upload state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [uploadStep, setUploadStep] = useState<"idle" | "preview" | "conflicts" | "done">("idle");
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Selection and Bulk Actions state
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showLabelSheet, setShowLabelSheet] = useState(false);
  const [labelQty, setLabelQty] = useState<Record<string, number>>({});

  // ── Conflict reconciliation state
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [directMerges, setDirectMerges] = useState<any[]>([]);
  const [newProductsList, setNewProductsList] = useState<any[]>([]);

  // ── Bulk Update state
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [bulkUpdateForm, setBulkUpdateForm] = useState({
    category: "No Change",
    customCategory: "",
    taxRate: "",
    brand: "",
    unit: "No Change",
  });
  const [isBulkCustomCat, setIsBulkCustomCat] = useState(false);

  // ── Batch View state
  const [batchViewProduct, setBatchViewProduct] = useState<any>(null);

  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // ── Derive effective category ─────────────────────────────────────────────
  const effectiveCategory = isCustomCat ? form.customCategory : form.category;

  const handleOpenAdd = () => {
    setEditingId(null);
    setIsCustomCat(false);
    const fresh = { ...EMPTY_FORM };
    fresh.sku = generateSKU(fresh.category);
    fresh.barcode = generateEAN13();
    setForm(fresh);
    setShowModal(true);
  };

  const handleOpenEdit = (prod: any) => {
    const isCustom = !PRESET_CATEGORIES.includes(prod.category) || prod.category === "Custom...";
    setIsCustomCat(isCustom);
    setForm({
      name: prod.name, sku: prod.sku, barcode: prod.barcode,
      category: isCustom ? "Grocery" : prod.category,
      customCategory: isCustom ? prod.category : "",
      brand: prod.brand || "", costPrice: prod.costPrice, salePrice: prod.salePrice,
      wholesalePrice: prod.wholesalePrice || 0, taxRate: prod.taxRate || 17,
      stock: prod.stock, minStock: prod.minStock || 10,
      unit: prod.unit || "Pcs", variant: prod.variant || "",
    });
    setEditingId(prod.id);
    setShowModal(true);
  };

  const handleCategoryChange = (val: string) => {
    if (val === "Custom...") {
      setIsCustomCat(true);
      setForm(prev => ({ ...prev, category: "Grocery", customCategory: "" }));
    } else {
      setIsCustomCat(false);
      if (!editingId) {
        setForm(prev => ({ ...prev, category: val, customCategory: "", sku: generateSKU(val), barcode: generateEAN13() }));
      } else {
        setForm(prev => ({ ...prev, category: val, customCategory: "" }));
      }
    }
  };

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isBulkCustomCat ? bulkUpdateForm.customCategory.trim() : bulkUpdateForm.category;
    
    selectedProductIds.forEach(id => {
      const updates: any = {};
      if (finalCategory !== "No Change" && finalCategory !== "") {
        updates.category = finalCategory;
      }
      if (bulkUpdateForm.taxRate !== "") {
        updates.taxRate = Number(bulkUpdateForm.taxRate);
      }
      if (bulkUpdateForm.brand !== "") {
        updates.brand = bulkUpdateForm.brand;
      }
      if (bulkUpdateForm.unit !== "No Change" && bulkUpdateForm.unit !== "") {
        updates.unit = bulkUpdateForm.unit;
      }
      
      if (Object.keys(updates).length > 0) {
        updateProduct(id, updates);
      }
    });

    setShowBulkUpdateModal(false);
    setSelectedProductIds(new Set());
    setBulkUpdateForm({
      category: "No Change",
      customCategory: "",
      taxRate: "",
      brand: "",
      unit: "No Change",
    });
    setIsBulkCustomCat(false);
    triggerToast("⚡ Bulk updates applied successfully!");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCat ? form.customCategory.trim() : form.category;
    if (!form.name || !form.sku || !form.barcode || !finalCategory) return;
    const payload = {
      name: form.name, sku: form.sku, barcode: form.barcode, category: finalCategory,
      brand: form.brand, costPrice: Number(form.costPrice), salePrice: Number(form.salePrice),
      wholesalePrice: Number(form.wholesalePrice), taxRate: Number(form.taxRate),
      stock: Number(form.stock), minStock: Number(form.minStock),
      unit: form.unit, variant: form.variant,
    };
    if (payload.salePrice < payload.costPrice) {
      triggerToast(`⚠️ Warning: Selling price (${payload.salePrice}) is LOWER than Purchase Cost (${payload.costPrice})! Profit will be negative.`);
    }

    if (editingId) updateProduct(editingId, payload);
    else addProduct(payload);
    setShowModal(false);
    setEditingId(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  EXCEL DEMO TEMPLATE DOWNLOAD
  // ─────────────────────────────────────────────────────────────────────────
  const handleDownloadTemplate = () => {
    // Demo rows so owner understands the format
    const demoData = [
      {
        "Product Name": "Sprite 1.5L Bottle",
        "Category": "Food & Beverage",
        "Brand": "Coca-Cola Pakistan",
        "Variant": "1.5 Liter",
        "Cost Price": 90,
        "Sale Price": 110,
        "Wholesale Price": 100,
        "Stock Qty": 200,
        "Min Stock": 20,
        "Unit": "Pcs",
        "Tax Rate (%)": 0,
      },
      {
        "Product Name": "Basmati Rice Premium",
        "Category": "Grocery",
        "Brand": "Guard Rice",
        "Variant": "5 Kg Bag",
        "Cost Price": 1200,
        "Sale Price": 1450,
        "Wholesale Price": 1300,
        "Stock Qty": 100,
        "Min Stock": 15,
        "Unit": "Kg",
        "Tax Rate (%)": 0,
      },
      {
        "Product Name": "Surf Excel 1Kg",
        "Category": "Grocery",
        "Brand": "Unilever",
        "Variant": "1 Kg Box",
        "Cost Price": 380,
        "Sale Price": 430,
        "Wholesale Price": 400,
        "Stock Qty": 150,
        "Min Stock": 20,
        "Unit": "Pcs",
        "Tax Rate (%)": 17,
      },
    ];

    const ws = XLSX.utils.json_to_sheet(demoData, { header: DEMO_TEMPLATE_COLS });

    // Style header row width
    ws["!cols"] = DEMO_TEMPLATE_COLS.map((col, i) => ({
      wch: Math.max(col.length + 4, 18)
    }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Products Template");

    XLSX.writeFile(wb, "MT_UniPOS_Product_Template.xlsx");
    triggerToast("📥 Demo Excel template downloaded!");
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  EXCEL PARSE + VALIDATE
  // ─────────────────────────────────────────────────────────────────────────
  const parseExcelFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];

        // Dynamically detect if A1 has information and headers are on Row 2
        const cellA1 = ws["A1"]?.v ? String(ws["A1"].v).trim() : "";
        const isNoteRow = cellA1.includes("ℹ️") || cellA1.toLowerCase().includes("leave sku");
        const rawRows: any[] = XLSX.utils.sheet_to_json(ws, isNoteRow ? { range: 1, defval: "" } : { defval: "" });

        // Filter out instruction/header/empty rows by checking if "Product Name" is a real value
        const dataRows = rawRows.filter(r => {
          const name = String(r["Product Name"] || r["product name"] || r["name"] || "").trim();
          return name.length > 0 &&
            !name.startsWith("ℹ️") &&
            name.toLowerCase() !== "product name" &&
            name.toLowerCase() !== "product description / name";
        });

        const parsed: ParsedRow[] = dataRows.map((r, idx) => {
          const name = String(r["Product Name"] || r["product name"] || r["name"] || "").trim();
          const category = String(r["Category"] || r["category"] || "Grocery").trim() || "Grocery";
          const brand = String(r["Brand"] || r["brand"] || "").trim();
          const variant = String(r["Variant"] || r["variant"] || "").trim();
          const costPrice = parseFloat(String(r["Cost Price"] || r["cost price"] || "0")) || 0;
          const salePrice = parseFloat(String(r["Sale Price"] || r["sale price"] || "0")) || 0;
          const wholesalePrice = parseFloat(String(r["Wholesale Price"] || r["wholesale price"] || "0")) || 0;
          const stock = parseInt(String(r["Stock Qty"] || r["stock qty"] || r["stock"] || "0")) || 0;
          const minStock = parseInt(String(r["Min Stock"] || r["min stock"] || "10")) || 10;
          const unit = String(r["Unit"] || r["unit"] || "Pcs").trim() || "Pcs";
          const taxRate = parseFloat(String(r["Tax Rate (%)"] || r["Tax Rate"] || r["tax rate"] || "0")) || 0;

          let error: string | undefined;
          if (!name) error = "Product name is required";
          else if (salePrice <= 0) error = "Sale price must be > 0";

          return { row: idx + 1, name, category, brand, variant, costPrice, salePrice, wholesalePrice, stock, minStock, unit, taxRate, error };
        });

        setParsedRows(parsed);
        setUploadStep("preview");
      } catch (err) {
        triggerToast("❌ Could not read Excel file. Make sure it's a valid .xlsx or .xls file.");
      }
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseExcelFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith(".xlsx") || file.name.endsWith(".xls") || file.name.endsWith(".csv"))) {
      parseExcelFile(file);
    } else {
      triggerToast("Please drop a valid Excel (.xlsx) or CSV file.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  CONFIRM IMPORT — add all valid rows with duplicate checking
  // ─────────────────────────────────────────────────────────────────────────
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter(r => !r.error);
    if (!validRows.length) return;

    // 1. Consolidate duplicates within the Excel file itself
    const uniqueParsedRowsMap = new Map<string, ParsedRow>();
    validRows.forEach(row => {
      const key = row.name.toLowerCase().trim();
      if (uniqueParsedRowsMap.has(key)) {
        const existing = uniqueParsedRowsMap.get(key)!;
        existing.stock += row.stock;
        existing.costPrice = row.costPrice;
        existing.salePrice = row.salePrice;
        existing.wholesalePrice = row.wholesalePrice;
        existing.taxRate = row.taxRate;
        existing.variant = row.variant || existing.variant;
        existing.brand = row.brand || existing.brand;
        existing.unit = row.unit || existing.unit;
      } else {
        uniqueParsedRowsMap.set(key, { ...row });
      }
    });
    const consolidated = Array.from(uniqueParsedRowsMap.values());

    const foundConflicts: any[] = [];
    const foundDirectMerges: any[] = [];
    const foundNewProducts: any[] = [];

    consolidated.forEach(row => {
      const existingProduct = products.find(p => p.name.toLowerCase().trim() === row.name.toLowerCase().trim());
      if (existingProduct) {
        const costDiff = existingProduct.costPrice !== row.costPrice;
        const saleDiff = existingProduct.salePrice !== row.salePrice;
        if (costDiff || saleDiff) {
          foundConflicts.push({
            id: `conf-${Math.random().toString(36).substr(2, 9)}`,
            existingProduct,
            incomingRow: row,
            choice: "existing", // default to keep existing prices
          });
        } else {
          foundDirectMerges.push({
            existingProduct,
            incomingRow: row,
          });
        }
      } else {
        foundNewProducts.push({
          name: row.name,
          category: row.category,
          brand: row.brand,
          variant: row.variant,
          costPrice: row.costPrice,
          salePrice: row.salePrice,
          wholesalePrice: row.wholesalePrice,
          stock: row.stock,
          minStock: row.minStock,
          unit: row.unit,
          taxRate: row.taxRate,
        });
      }
    });

    if (foundConflicts.length > 0) {
      setConflicts(foundConflicts);
      setDirectMerges(foundDirectMerges);
      setNewProductsList(foundNewProducts);
      setUploadStep("conflicts");
    } else {
      performFinalImport(foundNewProducts, foundDirectMerges, []);
    }
  };

  const performFinalImport = (
    newProds: any[],
    merges: any[],
    resolvedConflicts: any[]
  ) => {
    setImporting(true);

    const updates: { id: string; stock: number; costPrice: number; salePrice: number; additionalStock: number }[] = [];

    // Process direct merges (same prices, add stock)
    merges.forEach(m => {
      const existing = m.existingProduct;
      updates.push({
        id: existing.id,
        stock: existing.stock + m.incomingRow.stock,
        costPrice: existing.costPrice,
        salePrice: existing.salePrice,
        additionalStock: m.incomingRow.stock,
      });
    });

    // Process resolved conflicts (user choice for prices)
    resolvedConflicts.forEach(c => {
      const existing = c.existingProduct;
      const chosenCost = c.choice === "existing" ? existing.costPrice : c.incomingRow.costPrice;
      const chosenSale = c.choice === "existing" ? existing.salePrice : c.incomingRow.salePrice;
      updates.push({
        id: existing.id,
        stock: existing.stock + c.incomingRow.stock,
        costPrice: chosenCost,
        salePrice: chosenSale,
        additionalStock: c.incomingRow.stock,
      });
    });

    // Format new products (omit temporary or extra fields) and generate unique SKU / Barcode
    const formattedNewProds = newProds.map(p => ({
      name: p.name,
      sku: generateSKU(p.category),
      barcode: generateEAN13(),
      category: p.category,
      brand: p.brand,
      variant: p.variant || "",
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      wholesalePrice: p.wholesalePrice,
      stock: p.stock,
      minStock: p.minStock,
      unit: p.unit,
      taxRate: p.taxRate,
    }));

    mergeProductsBulk(formattedNewProds, updates);

    setImportCount(newProds.length + merges.length + resolvedConflicts.length);
    setImporting(false);
    setUploadStep("done");
  };

  const handleResolveAndImport = () => {
    performFinalImport(newProductsList, directMerges, conflicts);
  };

  const toggleConflictChoice = (index: number, choice: "existing" | "new") => {
    setConflicts(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], choice };
      return updated;
    });
  };

  const closeBulkModal = () => {
    setShowBulkModal(false);
    setUploadStep("idle");
    setParsedRows([]);
    setConflicts([]);
    setDirectMerges([]);
    setNewProductsList([]);
    setImporting(false);
    setImportCount(0);
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const allCats = ["All", ...Array.from(new Set(products.map(p => p.category)))];
  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.barcode.includes(searchQuery) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCat === "All" || p.category === filterCat;
    return matchSearch && matchCat;
  });

  const validCount = parsedRows.filter(r => !r.error).length;
  const errorCount = parsedRows.filter(r => !!r.error).length;

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-500/95 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-[60] flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} /> {toast}
        </div>
      )}

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">

        {/* ── Top Header ── */}
        <div className={`flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center border-b pb-4 ${
          isLight ? "border-slate-200" : "border-brand-dark-border/60"
        }`}>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-2 ${
              isLight ? "text-slate-900" : "text-white"
            }`}>
              <Package size={20} className="text-sky-500" />
              Product Catalog
            </h1>
            <p className={`text-[10px] mt-0.5 ${isLight ? "text-slate-500" : "text-gray-500"}`}>
              {products.length} SKUs registered · Auto-generated EAN-13 barcodes · Bulk Excel import supported
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download Template */}
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-600 font-bold text-xs px-3.5 py-2.5 rounded-lg transition"
            >
              <Download size={13} />
              Excel Template
            </button>

            {/* Bulk Upload */}
            <button
              onClick={() => { setShowBulkModal(true); setUploadStep("idle"); setParsedRows([]); }}
              className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-600 font-bold text-xs px-3.5 py-2.5 rounded-lg transition"
            >
              <Upload size={13} />
              Bulk Upload
            </button>

            {/* Print Labels */}
            {selectedProductIds.size > 0 && (
              <button
                onClick={() => setShowLabelSheet(true)}
                className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 text-amber-600 font-bold text-xs px-3.5 py-2.5 rounded-lg transition"
              >
                <Printer size={13} />
                Print Labels ({selectedProductIds.size})
              </button>
            )}

            {/* Add Single */}
            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className={`absolute left-3 top-2.5 ${isLight ? "text-slate-400" : "text-gray-500"}`} size={14} />
            <input
              type="text"
              placeholder="Search by name, SKU, barcode, or category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg text-xs font-bold border focus:outline-none ${
                isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500 shadow-xs" : "bg-brand-dark-surface border-brand-dark-border text-white focus:border-brand-sky"
              }`}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {allCats.slice(0, 8).map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCat(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide uppercase shrink-0 transition ${
                  filterCat === cat
                    ? isLight
                      ? "bg-sky-600 text-white shadow-xs border border-sky-600"
                      : "bg-brand-sky text-black"
                    : isLight
                    ? "bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs"
                    : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total SKUs", val: products.length, color: "text-sky-500" },
            { label: "Low Stock Alerts", val: products.filter(p => p.stock <= p.minStock).length, color: "text-red-500" },
            { label: "Categories", val: new Set(products.map(p => p.category)).size, color: "text-purple-500" },
            { label: "Avg. Sale Price", val: `${currencySymbol} ${products.length ? Math.round(products.reduce((a, p) => a + p.salePrice, 0) / products.length).toLocaleString() : 0}`, color: "text-emerald-500" },
          ].map(stat => (
            <div key={stat.label} className={`border rounded-xl p-4 text-center ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              <div className={`text-lg font-black font-mono ${stat.color}`}>{stat.val}</div>
              <div className={`text-[10px] uppercase tracking-wide mt-0.5 font-bold ${isLight ? "text-slate-500" : "text-gray-500"}`}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Products Table ── */}
        <div className={`border rounded-2xl overflow-hidden ${
          isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-100"
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className={`border-b font-mono text-[10px] uppercase font-bold tracking-wider ${
                  isLight ? "bg-slate-100 text-slate-700 border-slate-200" : "border-brand-dark-border text-gray-500 bg-black/60"
                }`}>
                  <th className="p-4 w-10">
                    <input
                      type="checkbox"
                      checked={filtered.length > 0 && filtered.every(p => selectedProductIds.has(p.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedProductIds(new Set([...selectedProductIds, ...filtered.map(p => p.id)]));
                        } else {
                          const newSelection = new Set(selectedProductIds);
                          filtered.forEach(p => newSelection.delete(p.id));
                          setSelectedProductIds(newSelection);
                        }
                      }}
                      className="rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </th>
                  <th className="p-4 font-semibold">#</th>
                  <th className="p-4 font-semibold">SKU / EAN Barcode</th>
                  <th className="p-4 font-semibold">Product Description</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Cost</th>
                  <th className="p-4 font-semibold">Retail</th>
                  <th className="p-4 font-semibold">Stock</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono text-[11px] ${
                isLight ? "divide-slate-200 text-slate-900" : "divide-brand-dark-border/40 text-gray-200"
              }`}>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-12 text-center text-gray-600">
                      <Package size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="mb-3">No products found.</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => { setShowBulkModal(true); setUploadStep("idle"); setParsedRows([]); }}
                          className="flex items-center gap-1.5 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-purple-500/10 transition"
                        >
                          <Upload size={11} /> Bulk Upload Excel
                        </button>
                        <span className="text-gray-700 text-[10px]">or</span>
                        <button
                          onClick={handleOpenAdd}
                          className="flex items-center gap-1.5 text-brand-sky border border-brand-sky/30 px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-brand-sky/10 transition"
                        >
                          <Plus size={11} /> Add one manually
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map((prod, idx) => (
                  <tr key={prod.id} className={`transition ${isLight ? "hover:bg-slate-50" : "hover:bg-brand-dark-surface/60"}`}>
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedProductIds.has(prod.id)}
                        onChange={(e) => {
                          const newSelection = new Set(selectedProductIds);
                          if (e.target.checked) {
                            newSelection.add(prod.id);
                          } else {
                            newSelection.delete(prod.id);
                          }
                          setSelectedProductIds(newSelection);
                        }}
                        className="rounded border-gray-600 bg-brand-dark-surface text-brand-sky focus:ring-brand-sky focus:ring-opacity-50 cursor-pointer"
                      />
                    </td>
                    <td className="p-4 text-gray-600">{idx + 1}</td>
                    <td className="p-4">
                      <div className={`font-bold tracking-wide ${isLight ? "text-slate-900" : "text-white"}`}>{prod.sku}</div>
                      <div className="text-[9px] text-brand-sky font-mono tracking-widest mt-0.5">{prod.barcode}</div>
                    </td>
                    <td className="p-4">
                      <div className={`font-bold font-sans ${isLight ? "text-slate-900" : "text-white"}`}>{prod.name}</div>
                      <div className="text-[9px] text-gray-500 font-sans">{prod.brand}{prod.variant ? ` · ${prod.variant}` : ""}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-md bg-brand-sky/10 text-brand-sky text-[9px] font-bold uppercase">
                        {prod.category}
                      </span>
                    </td>
                    <td className={`p-4 font-bold ${isLight ? "text-slate-600" : "text-gray-300"}`}>{currencySymbol} {prod.costPrice.toLocaleString()}</td>
                    <td className="p-4 text-brand-sky font-black">{currencySymbol} {prod.salePrice.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        prod.stock <= prod.minStock ? "bg-red-500/10 border border-red-500/30 text-red-400" : "text-gray-300"
                      }`}>
                        {prod.stock} {prod.unit}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedProductIds(prev => {
                              const n = new Set(prev);
                              n.has(prod.id) ? n.delete(prod.id) : n.add(prod.id);
                              return n;
                            });
                          }}
                          className={`p-1.5 rounded transition ${selectedProductIds.has(prod.id) ? "bg-brand-sky text-black" : "bg-brand-dark-border text-gray-500 hover:text-white"}`}
                          title="Select for Label Print / Bulk Actions"
                        >
                          <Printer size={12} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(prod)}
                          className="p-1.5 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded transition"
                          title="Edit Product"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => setBatchViewProduct(prod)}
                          className="p-1.5 bg-brand-dark-border hover:bg-purple-500/20 text-gray-400 hover:text-purple-400 rounded transition"
                          title="View FIFO Batches"
                        >
                          <Layers size={12} />
                        </button>
                        <button
                          onClick={() => setActiveBarcode(prod)}
                          className="p-1.5 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-white rounded transition"
                          title="View Barcode Label"
                        >
                          <Barcode size={12} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete "${prod.name}"?`)) {
                              deleteProduct(prod.id);
                              triggerToast("🗑️ Product deleted successfully.");
                            }
                          }}
                          className="p-1.5 bg-brand-dark-border hover:bg-red-600/20 text-gray-400 hover:text-red-400 rounded transition"
                          title="Delete Product"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* ═══════════════════════════════════════════════════════════════════════
          BULK EXCEL UPLOAD MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-2xl" : "bg-[#0d0d0d] border-brand-dark-border"} border rounded-2xl w-full max-w-3xl shadow-2xl my-4 animate-fade-in-up overflow-hidden`}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-dark-border bg-gradient-to-r from-purple-500/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <FileSpreadsheet size={16} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm">Bulk Product Import</h3>
                  <p className="text-[9px] text-gray-500 mt-0.5">
                    Upload Excel / CSV · SKU & Barcode auto-generated · Errors highlighted before import
                  </p>
                </div>
              </div>
              <button onClick={closeBulkModal} className="text-gray-500 hover:text-white p-1 rounded-lg hover:bg-brand-dark-border transition">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5">

              {/* ── STEP: IDLE — Drop Zone + info ── */}
              {uploadStep === "idle" && (
                <div className="space-y-4">

                  {/* Info Banner */}
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3">
                    <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-gray-300 space-y-1.5">
                      <p className="font-bold text-amber-400">Before you upload:</p>
                      <p>1. Download the <button onClick={handleDownloadTemplate} className="text-emerald-400 underline font-bold">demo Excel template</button> for the correct column format.</p>
                      <p>2. Fill in your product data. Leave <span className="text-brand-sky font-bold">SKU</span> and <span className="text-brand-sky font-bold">Barcode</span> columns empty — they are generated automatically.</p>
                      <p>3. Upload the filled file below.</p>
                    </div>
                  </div>

                  {/* Template download card */}
                  <button
                    onClick={handleDownloadTemplate}
                    className="w-full flex items-center gap-4 p-4 bg-emerald-500/8 border border-emerald-500/25 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-500/12 transition group text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/25 transition">
                      <Download size={16} className="text-emerald-400" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-white text-xs">Download Demo Template</div>
                      <div className="text-[9px] text-gray-500 mt-0.5">MT_UniPOS_Product_Template.xlsx · 3 example rows included · Fill and upload</div>
                    </div>
                    <ChevronRight size={14} className="text-gray-600 group-hover:text-emerald-400 transition" />
                  </button>

                  {/* Drop Zone */}
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      dragOver
                        ? "border-purple-500 bg-purple-500/10"
                        : "border-brand-dark-border hover:border-purple-500/60 hover:bg-purple-500/5"
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition ${dragOver ? "bg-purple-500/20" : "bg-brand-dark-surface"}`}>
                      <Upload size={22} className={dragOver ? "text-purple-400" : "text-gray-500"} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-sm">
                        {dragOver ? "Drop file here!" : "Drop Excel file or click to browse"}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1">Supports .xlsx · .xls · .csv files</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  {/* Column guide */}
                  <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4">
                    <div className="text-[9px] uppercase font-bold text-gray-500 mb-3 tracking-wider">Required Excel Columns</div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {DEMO_TEMPLATE_COLS.map(col => (
                        <div key={col} className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand-sky shrink-0" />
                          <span className="text-[9px] text-gray-400 font-mono">{col}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0" />
                        <span className="text-[9px] text-gray-600 font-mono line-through">SKU (auto)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-600 shrink-0" />
                        <span className="text-[9px] text-gray-600 font-mono line-through">Barcode (auto)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP: PREVIEW — Parsed rows table ── */}
              {uploadStep === "preview" && (
                <div className="space-y-4">

                  {/* Summary bar */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 rounded-lg">
                      <CheckCircle2 size={13} className="text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">{validCount} valid rows</span>
                    </div>
                    {errorCount > 0 && (
                      <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/25 px-3 py-2 rounded-lg">
                        <AlertTriangle size={13} className="text-red-400" />
                        <span className="text-xs font-bold text-red-400">{errorCount} errors (will be skipped)</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 bg-brand-sky/10 border border-brand-sky/25 px-3 py-2 rounded-lg ml-auto">
                      <Barcode size={13} className="text-brand-sky" />
                      <span className="text-[10px] text-brand-sky font-bold">SKU & Barcode auto-generated on import</span>
                    </div>
                  </div>

                  {/* Parsed rows preview */}
                  <div className="max-h-72 overflow-y-auto border border-brand-dark-border rounded-xl">
                    <table className="w-full text-[10px]">
                      <thead className="sticky top-0 bg-brand-dark-surface border-b border-brand-dark-border">
                        <tr className="text-gray-500 font-bold uppercase tracking-wide">
                          <th className="p-2.5 text-left w-8">#</th>
                          <th className="p-2.5 text-left">Product Name</th>
                          <th className="p-2.5 text-left">Category</th>
                          <th className="p-2.5 text-left">Brand</th>
                          <th className="p-2.5 text-right">Cost</th>
                          <th className="p-2.5 text-right">Sale</th>
                          <th className="p-2.5 text-right">Stock</th>
                          <th className="p-2.5 text-left">Unit</th>
                          <th className="p-2.5 text-center w-6">✓</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-brand-dark-border/40">
                        {parsedRows.map(row => (
                          <tr key={row.row} className={`${row.error ? "bg-red-500/5" : "hover:bg-brand-dark-surface/40"} transition`}>
                            <td className="p-2.5 text-gray-600 font-mono">{row.row}</td>
                            <td className="p-2.5 font-semibold text-white max-w-[140px] truncate">{row.name || <span className="text-red-400 italic">missing</span>}</td>
                            <td className="p-2.5 text-gray-400">{row.category}</td>
                            <td className="p-2.5 text-gray-500">{row.brand || "—"}</td>
                            <td className="p-2.5 text-right font-mono text-gray-300">{currencySymbol} {row.costPrice}</td>
                            <td className="p-2.5 text-right font-mono text-brand-sky font-bold">{currencySymbol} {row.salePrice}</td>
                            <td className="p-2.5 text-right font-mono text-gray-300">{row.stock}</td>
                            <td className="p-2.5 text-gray-400">{row.unit}</td>
                            <td className="p-2.5 text-center">
                              {row.error
                                ? <span title={row.error}><AlertTriangle size={11} className="text-red-400 mx-auto" /></span>
                                : <CheckCircle2 size={11} className="text-emerald-400 mx-auto" />
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {errorCount > 0 && (
                    <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-3 space-y-1">
                      <p className="text-[9px] font-bold text-red-400 uppercase">Rows with errors (will be skipped):</p>
                      {parsedRows.filter(r => r.error).map(r => (
                        <p key={r.row} className="text-[9px] text-gray-400">
                          Row {r.row} — <span className="text-white">{r.name || "unnamed"}</span>: <span className="text-red-400">{r.error}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => { setUploadStep("idle"); setParsedRows([]); }}
                      className="flex-1 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg text-xs transition"
                    >
                      ← Upload Different File
                    </button>
                    <button
                      onClick={handleConfirmImport}
                      disabled={validCount === 0 || importing}
                      className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-400 disabled:bg-brand-dark-border disabled:text-gray-500 text-white font-black uppercase rounded-lg text-xs transition flex items-center justify-center gap-2"
                    >
                      {importing
                        ? <><Loader2 size={13} className="animate-spin" /> Importing...</>
                        : <><Upload size={13} /> Import {validCount} Products</>
                      }
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: CONFLICTS ── */}
              {uploadStep === "conflicts" && (
                <div className="space-y-4">
                  <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex gap-3">
                    <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-300">
                      <h4 className="font-bold text-amber-400">Price Reconciliations Required ({conflicts.length})</h4>
                      <p className="mt-1 text-[11px] text-gray-400 leading-relaxed">
                        The products listed below already exist in the catalog, but the Excel prices do not match. Select which price option you want to keep. The stock counts will be added together in both cases.
                      </p>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
                    {conflicts.map((c, idx) => {
                      const existing = c.existingProduct;
                      const incoming = c.incomingRow;
                      return (
                        <div key={c.id} className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-bold text-white text-xs">{existing.name}</h4>
                              <p className="text-[10px] text-gray-500 mt-0.5">
                                Stock: {existing.stock} {existing.unit} + {incoming.stock} {incoming.unit} (Incoming) → <span className="text-brand-sky font-bold font-mono">{existing.stock + incoming.stock} {existing.unit}</span>
                              </p>
                            </div>
                            <span className="px-2 py-0.5 rounded bg-brand-dark-border text-[9px] font-bold text-gray-400 font-mono">
                              {existing.sku}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Option 1: Keep Existing */}
                            <button
                              type="button"
                              onClick={() => toggleConflictChoice(idx, "existing")}
                              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                                c.choice === "existing"
                                  ? "bg-brand-sky/10 border-brand-sky text-brand-sky"
                                  : "bg-black/40 border-brand-dark-border hover:border-gray-700 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Keep Current Prices</span>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  c.choice === "existing" ? "border-brand-sky" : "border-gray-600"
                                }`}>
                                  {c.choice === "existing" && <div className="w-1.5 h-1.5 rounded-full bg-brand-sky" />}
                                </div>
                              </div>
                              <div className="mt-2 text-xs font-mono">
                                <div>Cost: <span className="text-white font-bold">{currencySymbol} {existing.costPrice}</span></div>
                                <div>Retail: <span className="text-brand-sky font-bold">{currencySymbol} {existing.salePrice}</span></div>
                              </div>
                            </button>

                            {/* Option 2: Use Uploaded */}
                            <button
                              type="button"
                              onClick={() => toggleConflictChoice(idx, "new")}
                              className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                                c.choice === "new"
                                  ? "bg-purple-500/10 border-purple-500 text-purple-400"
                                  : "bg-black/40 border-brand-dark-border hover:border-gray-700 text-gray-400"
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="text-[10px] font-bold uppercase tracking-wider">Use Excel Prices</span>
                                <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  c.choice === "new" ? "border-purple-500" : "border-gray-600"
                                }`}>
                                  {c.choice === "new" && <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
                                </div>
                              </div>
                              <div className="mt-2 text-xs font-mono">
                                <div>Cost: <span className="text-white font-bold">{currencySymbol} {incoming.costPrice}</span></div>
                                <div>Retail: <span className="text-purple-400 font-bold">{currencySymbol} {incoming.salePrice}</span></div>
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary of resolution */}
                  <div className="text-[10px] text-gray-500 flex justify-between px-1 font-mono">
                    <span>New Products: <strong className="text-white">{newProductsList.length}</strong></span>
                    <span>Direct Merges: <strong className="text-white">{directMerges.length}</strong></span>
                    <span>Conflicts Reconciled: <strong className="text-white">{conflicts.length}</strong></span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setUploadStep("preview")}
                      className="flex-1 py-2.5 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg text-xs transition"
                    >
                      ← Back to Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleResolveAndImport}
                      disabled={importing}
                      className="flex-1 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg text-xs transition flex items-center justify-center gap-2"
                    >
                      {importing ? (
                        <><Loader2 size={13} className="animate-spin" /> Importing...</>
                      ) : (
                        "Resolve & Finalize Import"
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* ── STEP: DONE ── */}
              {uploadStep === "done" && (
                <div className="text-center py-8 space-y-5">
                  <div className="w-20 h-20 rounded-full bg-emerald-500/15 border-2 border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={36} className="text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-black text-white text-lg">{importCount} Products Imported!</h4>
                    <p className="text-[10px] text-gray-400 mt-1">
                      Each product has been assigned a unique SKU code and EAN-13 barcode automatically.
                    </p>
                  </div>
                  <div className="bg-brand-sky/8 border border-brand-sky/20 rounded-xl p-3 text-[10px] text-gray-400 flex items-center gap-2 mx-auto max-w-xs">
                    <Barcode size={14} className="text-brand-sky shrink-0" />
                    Auto-generated EAN-13 barcodes are ready to print from the product table.
                  </div>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <button
                      onClick={() => { setUploadStep("idle"); setParsedRows([]); setImportCount(0); }}
                      className="flex-1 py-2.5 bg-brand-dark-border text-gray-300 font-bold rounded-lg text-xs hover:bg-brand-dark-border/70 transition"
                    >
                      Upload More
                    </button>
                    <button
                      onClick={closeBulkModal}
                      className="flex-1 py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black rounded-lg text-xs transition"
                    >
                      View Catalog
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-2xl text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-white"} border p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up my-4`}>
            
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-200" : "border-brand-dark-border"} pb-3 mb-5`}>
              <div>
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{editingId ? "Edit Product SKU" : "Register New SKU"}</h3>
                <p className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"} mt-0.5`}>
                  {editingId ? "Update product details in catalog" : "SKU code and EAN barcode are auto-generated — regenerate anytime"}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-700" : "text-gray-400 hover:text-white"}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Product Description / Name *</label>
                <input
                  type="text" required
                  placeholder="e.g. Sprite 1.5L Chilled Bottle"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Custom SKU Code *</label>
                  <div className="flex gap-1">
                    <input
                      type="text" required placeholder="Auto-generated"
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      className={`flex-grow ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg font-mono focus:outline-none text-[10px]`}
                    />
                    <button type="button"
                      onClick={() => setForm(prev => ({ ...prev, sku: generateSKU(effectiveCategory || form.category) }))}
                      className="p-2 bg-brand-sky/10 border border-brand-sky/20 rounded-lg text-brand-sky hover:bg-brand-sky hover:text-black transition"
                      title="Regenerate SKU"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Standard EAN-13 Barcode *</label>
                  <div className="flex gap-1">
                    <input
                      type="text" required placeholder="Auto-generated"
                      value={form.barcode}
                      onChange={e => setForm({ ...form, barcode: e.target.value })}
                      className={`flex-grow ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg font-mono focus:outline-none text-[10px]`}
                    />
                    <button type="button"
                      onClick={() => setForm(prev => ({ ...prev, barcode: generateEAN13() }))}
                      className="p-2 bg-brand-sky/10 border border-brand-sky/20 rounded-lg text-brand-sky hover:bg-brand-sky hover:text-black transition"
                      title="Regenerate Barcode"
                    >
                      <RefreshCw size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {!editingId && (
                <div className={`flex items-center gap-2 ${isLight ? "bg-sky-50 border-sky-200 text-sky-800" : "bg-brand-sky/5 border-brand-sky/15 text-gray-400"} border rounded-lg p-2.5 text-[9px]`}>
                  <Tag size={12} className="text-brand-sky shrink-0" />
                  <span>SKU and EAN Barcode are <span className="text-brand-sky font-bold">auto-generated and unique</span>. Use the refresh icon to get a new code, or type your own.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Category *</label>
                  {isCustomCat ? (
                    <div className="flex gap-1">
                      <input
                        type="text" required placeholder="Type your category..."
                        value={form.customCategory}
                        onChange={e => setForm({ ...form, customCategory: e.target.value })}
                        className={`flex-grow ${isLight ? "bg-white border-sky-400 text-slate-900" : "bg-black border-brand-sky/40 text-white"} border p-2.5 rounded-lg focus:outline-none focus:border-brand-sky text-[10px]`}
                        autoFocus
                      />
                      <button type="button"
                        onClick={() => { setIsCustomCat(false); setForm(prev => ({ ...prev, customCategory: "", category: "Grocery" })); }}
                        className={`p-2 ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-brand-dark-border text-gray-400 hover:text-white"} rounded-lg transition`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <select
                      value={form.category}
                      onChange={e => handleCategoryChange(e.target.value)}
                      className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none appearance-none cursor-pointer`}
                    >
                      {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Brand / Company</label>
                  <input
                    type="text" placeholder="e.g. Coca-Cola Pakistan"
                    value={form.brand}
                    onChange={e => setForm({ ...form, brand: e.target.value })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Cost Price", key: "costPrice" as const },
                  { label: "Retail Price", key: "salePrice" as const },
                  { label: "Wholesale", key: "wholesalePrice" as const },
                ].map(field => (
                  <div key={field.key}>
                    <label className={`block text-[9px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>{field.label}</label>
                    <input
                      type="number" min={0}
                      value={form[field.key] || ""}
                      onChange={e => setForm({ ...form, [field.key]: Number(e.target.value) })}
                      className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2 rounded focus:outline-none`}
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className={`block text-[9px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Stock Qty</label>
                  <input type="number" min={0} value={form.stock || ""}
                    onChange={e => setForm({ ...form, stock: Number(e.target.value) })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"} border p-2 rounded focus:outline-none`} />
                </div>
                <div>
                  <label className={`block text-[9px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Reorder Pt.</label>
                  <input type="number" min={0} value={form.minStock || ""}
                    onChange={e => setForm({ ...form, minStock: Number(e.target.value) })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"} border p-2 rounded focus:outline-none`} />
                </div>
                <div>
                  <label className={`block text-[9px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Unit</label>
                  <select value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"} border p-2 rounded focus:outline-none`}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className={`block text-[9px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Tax (%)</label>
                  <input type="number" min={0} max={100} value={form.taxRate || ""}
                    onChange={e => setForm({ ...form, taxRate: Number(e.target.value) })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"} border p-2 rounded focus:outline-none`} />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Variant / Description (optional)</label>
                <input
                  type="text" placeholder="e.g. 1.5L, Red, Size M, Flavor Lemon..."
                  value={form.variant}
                  onChange={e => setForm({ ...form, variant: e.target.value })}
                  className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg transition text-xs tracking-wider"
              >
                {editingId ? "Save Changes" : "Register in Catalog Database"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          FIFO BATCH VIEW MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {batchViewProduct && (() => {
        const productBatches = getProductBatches(batchViewProduct.id);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className={`${isLight ? "bg-white border-purple-300 shadow-2xl text-slate-900" : "bg-[#0d0d0d] border-purple-500/30 text-white"} border rounded-2xl w-full max-w-xl shadow-2xl max-h-[85vh] flex flex-col`}>
              <div className={`flex items-center justify-between px-5 py-4 border-b ${isLight ? "border-slate-200" : "border-brand-dark-border"} shrink-0`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                    <Layers size={14} className="text-purple-400" />
                  </div>
                  <div>
                    <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>FIFO Batch Ledger</h3>
                    <p className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{batchViewProduct.name} · {productBatches.length} batch(es)</p>
                  </div>
                </div>
                <button onClick={() => setBatchViewProduct(null)} className={`${isLight ? "text-slate-400 hover:text-slate-700" : "text-gray-400 hover:text-white"}`}><X size={16} /></button>
              </div>
              <div className="p-5 overflow-y-auto flex-grow space-y-3">
                {productBatches.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 text-xs">
                    <Layers size={32} className="mx-auto mb-3 text-gray-400 opacity-40" />
                    No batches found. Receive goods via Purchase Orders to create FIFO batches.
                  </div>
                ) : (
                  productBatches.map((batch, i) => {
                    const isExpired = batch.expiryDate && new Date(batch.expiryDate) < new Date();
                    const isExpiringSoon = batch.expiryDate && !isExpired && new Date(batch.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                    return (
                      <div key={batch.id} className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/50 border-brand-dark-border"} border rounded-xl p-4 text-xs ${isExpired ? 'border-red-500/40' : isExpiringSoon ? 'border-amber-500/40' : ''}`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] bg-purple-500/15 text-purple-600 border border-purple-500/30 px-2 py-0.5 rounded font-black font-mono">#{i + 1} FIFO</span>
                            <span className={`font-black ${isLight ? "text-slate-900" : "text-white"}`}>{batch.batchNumber}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isExpired && <span className="text-[9px] bg-red-500/15 text-red-500 border border-red-500/30 px-2 py-0.5 rounded font-black">EXPIRED</span>}
                            {isExpiringSoon && <span className="text-[9px] bg-amber-500/15 text-amber-500 border border-amber-500/30 px-2 py-0.5 rounded font-black animate-pulse">EXPIRING SOON</span>}
                            <span className={`font-black font-mono ${batch.remainingQty > 0 ? 'text-emerald-500' : 'text-gray-400'}`}>{batch.remainingQty} / {batch.initialQty} left</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between"><span className={`${isLight ? "text-slate-500" : "text-gray-500"}`}>Purchase Price:</span><span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{currencySymbol} {batch.costPrice}</span></div>
                            <div className="flex justify-between"><span className={`${isLight ? "text-slate-500" : "text-gray-500"}`}>Sale Price:</span><span className="text-brand-sky font-bold">{currencySymbol} {batch.salePrice}</span></div>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between"><span className={`${isLight ? "text-slate-500" : "text-gray-500"}`}>Received:</span><span className={`${isLight ? "text-slate-700" : "text-gray-300"}`}>{new Date(batch.purchasedAt).toLocaleDateString('en-PK', {day:'2-digit', month:'short', year:'numeric'})}</span></div>
                            {batch.expiryDate && <div className="flex justify-between"><span className={`${isLight ? "text-slate-500" : "text-gray-500"}`}>Expiry:</span><span className={isExpired ? 'text-red-500 font-bold' : isExpiringSoon ? 'text-amber-500 font-bold' : isLight ? 'text-slate-700' : 'text-gray-300'}>{batch.expiryDate}</span></div>}
                          </div>
                        </div>
                        <div className={`mt-2.5 ${isLight ? "bg-slate-200" : "bg-brand-dark-border/40"} rounded-lg h-1.5`}>
                          <div className="h-full rounded-lg bg-gradient-to-r from-purple-500 to-brand-sky transition-all" style={{width: `${batch.initialQty > 0 ? (batch.remainingQty / batch.initialQty) * 100 : 0}%`}} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className={`px-5 py-4 border-t ${isLight ? "border-slate-200" : "border-brand-dark-border"} shrink-0`}>
                <button onClick={() => setBatchViewProduct(null)} className={`w-full py-2.5 ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-brand-dark-border text-gray-300 hover:bg-brand-dark-border/70"} font-bold text-xs rounded-xl transition`}>Close</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════════════
          BARCODE LABEL MODAL
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeBarcode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-2xl text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-white"} border p-6 rounded-2xl w-full max-w-xs shadow-2xl text-center space-y-4 animate-fade-in-up`}>
            
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-200" : "border-brand-dark-border/40"} pb-2 mb-1 font-sans`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs`}>EAN-13 Barcode Label</h3>
              <button onClick={() => setActiveBarcode(null)} className={`text-xs ${isLight ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "text-gray-400 hover:text-white bg-brand-dark-border"} px-2 py-0.5 rounded`}>
                <X size={14} />
              </button>
            </div>

            <div className="bg-white text-black p-5 rounded-lg border border-gray-200 space-y-3 font-mono">
              <div className="font-sans font-black text-[11px] tracking-tight text-gray-800">{activeBarcode.name}</div>
              {activeBarcode.brand && <div className="text-[9px] text-gray-500 font-sans">{activeBarcode.brand}</div>}
              <div className="w-full h-14 flex justify-center items-end gap-px border border-dashed border-gray-300 p-1.5 bg-white overflow-hidden">
                {Array.from({ length: 60 }, (_, i) => {
                  const pattern = [2,1,3,1,2,4,1,2,1,3,2,1];
                  const w = pattern[i % pattern.length];
                  return (
                    <div key={i} style={{ width: `${w}px` }}
                      className={`h-10 ${(i + Math.floor(i / 5)) % 2 === 0 ? "bg-black" : "bg-transparent"}`}
                    />
                  );
                })}
              </div>
              <div className="text-[10px] tracking-[2px] font-black text-center">{activeBarcode.barcode}</div>
              <div className="text-[9px] text-gray-500 font-sans">SKU: {activeBarcode.sku}</div>
              <div className="font-sans font-black text-sm text-black py-1.5 border-t border-gray-200">
                {currencySymbol} {activeBarcode.salePrice?.toLocaleString()}
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg text-xs font-sans"
            >
              🖨️ Print Barcode Label
            </button>
          </div>
        </div>
      )}

      {/* ── Floating Bulk Action Bar ── */}
      {selectedProductIds.size > 0 && (
        <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 ${isLight ? "bg-white/95 border-slate-300 text-slate-900" : "bg-brand-dark-surface/95 border-brand-sky/40 text-white"} border backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl z-40 flex items-center gap-6 animate-slide-up`}>
          <div className="text-xs">
            <span className="font-bold text-brand-sky font-mono">{selectedProductIds.size}</span> products selected
          </div>
          <div className={`h-4 w-px ${isLight ? "bg-slate-200" : "bg-brand-dark-border"}`} />
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowLabelSheet(true)}
              className="flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-500 text-xs px-3 py-1.5 rounded-lg font-bold transition"
            >
              <Printer size={13} />
              Print Labels
            </button>
            <button
              onClick={() => setShowBulkUpdateModal(true)}
              className="flex items-center gap-1.5 bg-purple-500/10 hover:bg-purple-500/25 border border-purple-500/30 text-purple-500 text-xs px-3 py-1.5 rounded-lg font-bold transition"
            >
              <Edit2 size={13} />
              Bulk Update
            </button>
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete these ${selectedProductIds.size} products? This cannot be undone.`)) {
                  deleteProductsBulk(Array.from(selectedProductIds));
                  setSelectedProductIds(new Set());
                  triggerToast(`🗑️ ${selectedProductIds.size} products deleted successfully.`);
                }
              }}
              className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 text-red-500 text-xs px-3 py-1.5 rounded-lg font-bold transition"
            >
              <Trash2 size={13} />
              Bulk Delete
            </button>
            <button
              onClick={() => setSelectedProductIds(new Set())}
              className={`${isLight ? "text-slate-500 hover:text-slate-800" : "text-gray-400 hover:text-white"} text-xs px-2 py-1.5 transition`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── BULK UPDATE MODAL ── */}
      {showBulkUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white border-slate-200 shadow-2xl text-slate-900" : "bg-brand-dark-surface border-brand-sky/30 text-white"} border p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up my-4`}>
            
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-200" : "border-brand-dark-border"} pb-3 mb-5`}>
              <div>
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Bulk Update Products</h3>
                <p className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"} mt-0.5`}>
                  Modifying {selectedProductIds.size} selected products. Fill only fields you wish to change.
                </p>
              </div>
              <button onClick={() => setShowBulkUpdateModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-700" : "text-gray-400 hover:text-white"}`}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleBulkUpdateSubmit} className="space-y-4 text-xs">
              
              {/* Category */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Update Category</label>
                {isBulkCustomCat ? (
                  <div className="flex gap-1">
                    <input
                      type="text" required placeholder="Type your category..."
                      value={bulkUpdateForm.customCategory}
                      onChange={e => setBulkUpdateForm({ ...bulkUpdateForm, customCategory: e.target.value })}
                      className={`flex-grow ${isLight ? "bg-white border-sky-400 text-slate-900" : "bg-black border-brand-sky/40 text-white"} border p-2.5 rounded-lg focus:outline-none focus:border-brand-sky text-[10px]`}
                      autoFocus
                    />
                    <button type="button"
                      onClick={() => { setIsBulkCustomCat(false); setBulkUpdateForm(prev => ({ ...prev, customCategory: "", category: "No Change" })); }}
                      className={`p-2 ${isLight ? "bg-slate-100 text-slate-600 hover:bg-slate-200" : "bg-brand-dark-border text-gray-400 hover:text-white"} rounded-lg transition`}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ) : (
                  <select
                    value={bulkUpdateForm.category}
                    onChange={e => {
                      if (e.target.value === "Custom...") {
                        setIsBulkCustomCat(true);
                        setBulkUpdateForm(prev => ({ ...prev, category: "Grocery", customCategory: "" }));
                      } else {
                        setIsBulkCustomCat(false);
                        setBulkUpdateForm(prev => ({ ...prev, category: e.target.value, customCategory: "" }));
                      }
                    }}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="No Change">No Change (Leave as is)</option>
                    {PRESET_CATEGORIES.filter(c => c !== "Custom...").map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="Custom...">Custom...</option>
                  </select>
                )}
              </div>

              {/* Brand */}
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Update Brand</label>
                <input
                  type="text"
                  placeholder="Leave blank for no change..."
                  value={bulkUpdateForm.brand}
                  onChange={e => setBulkUpdateForm({ ...bulkUpdateForm, brand: e.target.value })}
                  className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Unit */}
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Update Unit</label>
                  <select
                    value={bulkUpdateForm.unit}
                    onChange={e => setBulkUpdateForm({ ...bulkUpdateForm, unit: e.target.value })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none appearance-none cursor-pointer`}
                  >
                    <option value="No Change">No Change (Leave as is)</option>
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>

                {/* Tax Rate */}
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-600" : "text-gray-400"} mb-1`}>Update Tax Rate (%)</label>
                  <input
                    type="number" min={0} max={100}
                    placeholder="No change"
                    value={bulkUpdateForm.taxRate}
                    onChange={e => setBulkUpdateForm({ ...bulkUpdateForm, taxRate: e.target.value })}
                    className={`w-full ${isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"} border p-2.5 rounded-lg focus:outline-none`}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBulkUpdateModal(false)}
                  className={`flex-1 py-3 ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700" : "bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300"} font-bold rounded-lg transition text-xs tracking-wider`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-brand-sky hover:bg-brand-sky-light text-black font-black uppercase rounded-lg transition text-xs tracking-wider"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          BULK LABEL PRINT SHEET
      ═══════════════════════════════════════════════════════════════════════ */}
      {showLabelSheet && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col font-sans">
          {/* Control bar — hidden on print */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-brand-dark-border bg-brand-dark-surface print:hidden shrink-0">
            <div>
              <h3 className="font-black text-white text-sm">Label Print Sheet</h3>
              <p className="text-[9px] text-gray-500">{selectedProductIds.size} products selected · click Print to send to printer</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs px-4 py-2 rounded-lg transition">
                <Printer size={13} /> Print Sheet
              </button>
              <button onClick={() => setShowLabelSheet(false)}
                className="flex items-center gap-1.5 bg-brand-dark-border text-gray-300 font-bold text-xs px-3 py-2 rounded-lg hover:bg-brand-dark-border/70 transition">
                <X size={13} /> Close
              </button>
            </div>
          </div>

          {/* Label Grid — visible on screen + prints cleanly */}
          <div className="flex-grow overflow-y-auto p-6 print:p-0">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 print:grid-cols-4 print:gap-1">
              {Array.from(selectedProductIds).flatMap(id => {
                const prod = products.find(p => p.id === id);
                if (!prod) return [];
                const qty = labelQty[id] || 1;
                return Array(qty).fill(prod);
              }).map((prod: any, i: number) => (
                <div key={i}
                  className="bg-white text-black border border-gray-200 rounded-lg p-2.5 print:rounded-none print:border-gray-300 space-y-1.5"
                  style={{ breakInside: 'avoid' }}
                >
                  <div className="font-sans font-black text-[10px] tracking-tight text-gray-900 leading-tight truncate">{prod.name}</div>
                  {prod.brand && <div className="text-[8px] text-gray-500 font-sans">{prod.brand}</div>}
                  {/* Simple barcode bars */}
                  <div className="w-full h-10 flex items-end gap-px overflow-hidden">
                    {Array.from({ length: 48 }, (_, bi) => {
                      const p = [2,1,3,1,2,4,1,2,1,3,2,1];
                      const w = p[bi % p.length];
                      return (
                        <div key={bi} style={{ width: `${w}px` }}
                          className={`${(bi + Math.floor(bi / 5)) % 2 === 0 ? "bg-black" : "bg-transparent"} h-8 shrink-0`}
                        />
                      );
                    })}
                  </div>
                  <div className="text-[7px] tracking-widest font-black text-center text-gray-700 font-mono">{prod.barcode}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-[7px] text-gray-500 font-mono">{prod.sku}</div>
                    <div className="font-sans font-black text-[10px] text-black">{currencySymbol}{prod.salePrice?.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
