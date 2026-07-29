"use client";

import React, { useState } from "react";
import ClientSidebar from "@/components/client-sidebar";
import {
  Laptop, Database, Lock, Globe, Terminal, ArrowRight, Copy,
  CheckCircle2, Zap, Shield, Code2, Smartphone, BookOpen,
  ChevronRight, AlertTriangle, Key, RefreshCw, Package,
  Users, ShoppingCart, BarChart3, Settings, Layers, Info
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Section = "getting-started" | "auth" | "endpoints" | "errors" | "sdk";
type MethodType = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Route {
  id: string;
  method: MethodType;
  path: string;
  group: string;
  tag: string;
  desc: string;
  reqHeaders: string;
  reqBody: string;
  resBody: string;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const METHOD_STYLE: Record<MethodType, string> = {
  GET:    "bg-brand-sky/20 text-brand-sky border border-brand-sky/30",
  POST:   "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
  PUT:    "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  DELETE: "bg-red-500/20 text-red-400 border border-red-500/30",
  PATCH:  "bg-purple-500/20 text-purple-400 border border-purple-500/30",
};

const BASE_URL = "https://api.unipos.mt/v1";

// ─── Routes ───────────────────────────────────────────────────────────────────
const ROUTES: Route[] = [
  // ── Auth
  {
    id: "auth-login", method: "POST", path: "/auth/login",
    group: "Authentication", tag: "Auth",
    desc: "Authenticate staff with email & password. Returns a JWT Bearer token valid for 8 hours. Include this token in every subsequent request.",
    reqHeaders: `Content-Type: application/json`,
    reqBody: `{
  "email": "cashier@store.com",
  "password": "yourPassword123",
  "terminalId": "TERM-LHR-01",
  "branchId": "Gulberg Mall"
}`,
    resBody: `{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800,
  "user": {
    "id": "U-001",
    "name": "Ahmed Cashier",
    "role": "Cashier",
    "branch": "Gulberg Mall",
    "tenantId": "T-001"
  }
}`,
    notes: "Store the token securely. All endpoints except /auth/login require the Authorization header."
  },
  {
    id: "auth-refresh", method: "POST", path: "/auth/refresh",
    group: "Authentication", tag: "Auth",
    desc: "Refresh an expiring JWT token without re-entering credentials. Call this before the 8-hour expiry.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json`,
    reqBody: `{ "refreshToken": "rt_eyJhbGciOiJIUzI1Ni..." }`,
    resBody: `{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 28800
}`,
  },

  // ── Products
  {
    id: "products-list", method: "GET", path: "/products",
    group: "Products", tag: "Products",
    desc: "Fetch all products in the catalog. Supports filtering by category, search, and pagination.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>`,
    reqBody: `Query params:
?page=1&limit=50&category=Grocery&search=Milk&branchId=Gulberg`,
    resBody: `{
  "status": "success",
  "total": 320,
  "page": 1,
  "limit": 50,
  "products": [
    {
      "id": "P-1001",
      "sku": "GRC-MLK-001",
      "barcode": "8901234567890",
      "name": "Olper's Milk 1L",
      "category": "Grocery",
      "brand": "Engro",
      "salePrice": 220,
      "costPrice": 185,
      "stock": 48,
      "minStock": 10,
      "unit": "Pcs",
      "taxRate": 17
    }
  ]
}`,
  },
  {
    id: "products-barcode", method: "GET", path: "/products/barcode/:code",
    group: "Products", tag: "Products",
    desc: "Look up a product by scanning its EAN-13 barcode. Used by barcode scanners in mobile POS apps.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>`,
    reqBody: `URL param: /products/barcode/8901234567890`,
    resBody: `{
  "status": "success",
  "product": {
    "id": "P-1001",
    "sku": "GRC-MLK-001",
    "barcode": "8901234567890",
    "name": "Olper's Milk 1L",
    "salePrice": 220,
    "stock": 48,
    "unit": "Pcs"
  }
}`,
    notes: "Returns 404 if barcode not found."
  },

  // ── Sales / POS
  {
    id: "pos-checkout", method: "POST", path: "/sales/checkout",
    group: "POS & Sales", tag: "Sales",
    desc: "Commit a full POS transaction. Automatically deducts stock, posts ledger entries, earns loyalty points, and generates a receipt.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json`,
    reqBody: `{
  "customerId": "C-201",
  "paymentMethod": "Cash",
  "items": [
    { "productId": "P-1001", "qty": 2 },
    { "productId": "P-1005", "qty": 1 }
  ],
  "discountPercent": 5,
  "redeemLoyalty": false,
  "notes": "Customer requested bag"
}`,
    resBody: `{
  "status": "success",
  "receiptNumber": "MT-TXN-90211",
  "transactionId": "S-5991",
  "subtotal": 640.00,
  "discount": 32.00,
  "tax": 103.36,
  "grandTotal": 711.36,
  "paymentMethod": "Cash",
  "loyaltyPointsEarned": 7,
  "loyaltyBalance": 142,
  "timestamp": "2026-06-03T10:30:00Z"
}`,
    notes: "paymentMethod: Cash | Card | Bank Transfer | EasyPaisa | JazzCash | On Credit"
  },
  {
    id: "sales-list", method: "GET", path: "/sales",
    group: "POS & Sales", tag: "Sales",
    desc: "Retrieve sales history with filtering by date range, cashier, payment method, and status.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>`,
    reqBody: `Query params:
?from=2026-06-01&to=2026-06-03
&cashier=Ahmed&method=Cash&status=Completed
&page=1&limit=25`,
    resBody: `{
  "status": "success",
  "total": 84,
  "sales": [
    {
      "id": "S-5991",
      "receiptNumber": "MT-TXN-90211",
      "date": "2026-06-03T10:30:00Z",
      "cashierName": "Ahmed Cashier",
      "customerName": "Walk-in Customer",
      "total": 711.36,
      "paymentMethod": "Cash",
      "status": "Completed",
      "itemCount": 3
    }
  ]
}`,
  },

  // ── Customers
  {
    id: "customers-list", method: "GET", path: "/customers",
    group: "Customers", tag: "Customers",
    desc: "Fetch all registered customers with loyalty points, credit balance, and purchase history.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>`,
    reqBody: `Query params: ?search=Ahmed&page=1&limit=25`,
    resBody: `{
  "status": "success",
  "customers": [
    {
      "id": "C-201",
      "name": "Ahmed Raza",
      "mobile": "03001234567",
      "email": "ahmed@gmail.com",
      "loyaltyPoints": 1420,
      "tier": "Silver",
      "creditBalance": 0,
      "totalPurchases": 28
    }
  ]
}`,
  },
  {
    id: "customers-create", method: "POST", path: "/customers",
    group: "Customers", tag: "Customers",
    desc: "Register a new loyalty customer. They will start earning points on their next purchase.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json`,
    reqBody: `{
  "name": "Sara Khan",
  "mobile": "03331234567",
  "email": "sara@email.com",
  "address": "DHA Phase 5, Lahore",
  "cnic": "35202-1234567-8"
}`,
    resBody: `{
  "status": "success",
  "customer": {
    "id": "C-305",
    "name": "Sara Khan",
    "loyaltyPoints": 0,
    "tier": "Bronze",
    "createdAt": "2026-06-03T11:00:00Z"
  }
}`,
  },

  // ── Inventory
  {
    id: "inventory-stock", method: "GET", path: "/inventory/stock",
    group: "Inventory", tag: "Inventory",
    desc: "Get real-time stock levels for all products. Use reorderAlert flag to trigger purchase orders.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>`,
    reqBody: `Query params: ?branchId=Gulberg&lowStock=true`,
    resBody: `{
  "status": "success",
  "branch": "Gulberg Mall",
  "totalSKUs": 320,
  "lowStockCount": 5,
  "items": [
    {
      "productId": "P-1001",
      "sku": "GRC-MLK-001",
      "name": "Olper's Milk 1L",
      "stock": 4,
      "minStock": 10,
      "reorderAlert": true,
      "unit": "Pcs"
    }
  ]
}`,
  },
  {
    id: "inventory-adjust", method: "POST", path: "/inventory/adjust",
    group: "Inventory", tag: "Inventory",
    desc: "Manually adjust stock — for damage write-offs, stock counts, or corrections.",
    reqHeaders: `Authorization: Bearer <YOUR_JWT_TOKEN>
Content-Type: application/json`,
    reqBody: `{
  "productId": "P-1001",
  "adjustmentType": "Shrinkage",
  "qty": -3,
  "reason": "Damaged goods found during stock count",
  "staffId": "U-001"
}`,
    resBody: `{
  "status": "success",
  "productId": "P-1001",
  "previousStock": 48,
  "adjustment": -3,
  "newStock": 45,
  "ledgerRef": "ADJ-2291"
}`,
    notes: "adjustmentType: Receiving | Shrinkage | StockCount | Correction"
  },
];

const GROUPS = Array.from(new Set(ROUTES.map(r => r.group)));

// ─── Code Copy Hook ───────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy}
      className={`flex items-center gap-1 text-[8px] font-bold uppercase px-2 py-1 rounded transition ${
        copied ? "bg-emerald-500/20 text-emerald-400" : "bg-brand-dark-border text-gray-500 hover:text-white"
      }`}>
      {copied ? <CheckCircle2 size={9} /> : <Copy size={9} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────
function CodeBlock({ label, color, content }: { label: string; color: string; content: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] uppercase font-black text-gray-500 tracking-widest">{label}</span>
        <CopyButton text={content} />
      </div>
      <pre className={`bg-black/70 p-3.5 rounded-xl border border-brand-dark-border/60 text-[10px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap ${color}`}>
        {content}
      </pre>
    </div>
  );
}

// ─── Getting Started Section ──────────────────────────────────────────────────
function GettingStarted() {
  const steps = [
    {
      num: "01", title: "Get Your API Key",
      icon: Key, color: "text-brand-sky", bg: "bg-brand-sky/10 border-brand-sky/20",
      body: `Go to Settings → API Access → Generate Key.\nEach branch gets a unique API key tied to its tenant ID.\nStore it securely — never expose it in client-side code.`
    },
    {
      num: "02", title: "Authenticate",
      icon: Lock, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20",
      body: `POST /auth/login with your staff email & password.\nYou'll receive a JWT Bearer Token (valid 8 hours).\nPass this token in every request header:\nAuthorization: Bearer <YOUR_TOKEN>`
    },
    {
      num: "03", title: "Make API Calls",
      icon: Globe, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20",
      body: `Base URL: ${BASE_URL}\nAll requests & responses use JSON format.\nDate fields are ISO 8601 (UTC).\nAll amounts are in PKR unless otherwise specified.`
    },
    {
      num: "04", title: "Handle Responses",
      icon: CheckCircle2, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20",
      body: `All responses include a "status" field:\n✅ "success" — request completed\n❌ "error" — see errorCode & message\nHTTP codes: 200 OK, 400 Bad Request, 401 Unauthorized, 404 Not Found, 500 Server Error`
    },
  ];

  const codeExamples = [
    {
      lang: "JavaScript / React Native", color: "text-yellow-300",
      code: `// Step 1: Login to get token
const res = await fetch('${BASE_URL}/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'cashier@store.com',
    password: 'pass123',
    terminalId: 'TERM-01'
  })
});
const { token } = await res.json();

// Step 2: Use token in subsequent calls
const products = await fetch('${BASE_URL}/products', {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
const data = await products.json();`
    },
    {
      lang: "Flutter / Dart", color: "text-blue-300",
      code: `import 'dart:convert';
import 'package:http/http.dart' as http;

// Login
final loginRes = await http.post(
  Uri.parse('${BASE_URL}/auth/login'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': 'cashier@store.com',
    'password': 'pass123',
    'terminalId': 'TERM-01',
  }),
);
final token = jsonDecode(loginRes.body)['token'];

// Fetch products
final productsRes = await http.get(
  Uri.parse('${BASE_URL}/products'),
  headers: {'Authorization': 'Bearer \$token'},
);
final products = jsonDecode(productsRes.body);`
    },
    {
      lang: "cURL / Terminal", color: "text-green-300",
      code: `# 1. Login
curl -X POST ${BASE_URL}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"cashier@store.com","password":"pass123","terminalId":"TERM-01"}'

# 2. Get products (replace TOKEN with your JWT)
curl ${BASE_URL}/products \\
  -H "Authorization: Bearer TOKEN"

# 3. Process a sale
curl -X POST ${BASE_URL}/sales/checkout \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"customerId":"C-201","paymentMethod":"Cash","items":[{"productId":"P-1001","qty":2}]}'`
    },
  ];

  const [activeLang, setActiveLang] = useState(0);

  return (
    <div className="space-y-8">
      {/* Steps */}
      <div>
        <h2 className="text-base font-black text-white mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-brand-sky" /> How to Use the MT UniPOS API
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div key={step.num} className={`bg-brand-dark-surface/40 border rounded-xl p-4 ${step.bg}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl border ${step.bg} flex items-center justify-center shrink-0`}>
                    <Icon size={15} className={step.color} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-black ${step.color} font-mono`}>STEP {step.num}</span>
                    </div>
                    <h3 className="font-black text-white text-sm mb-1.5">{step.title}</h3>
                    <pre className="text-[10px] text-gray-400 leading-relaxed whitespace-pre-wrap font-sans">{step.body}</pre>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Base URL info */}
      <div className="bg-brand-sky/5 border border-brand-sky/20 rounded-xl p-4 flex items-center gap-3">
        <Globe size={16} className="text-brand-sky shrink-0" />
        <div>
          <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Base URL</div>
          <code className="text-brand-sky font-mono font-black text-sm">{BASE_URL}</code>
        </div>
        <div className="ml-auto"><CopyButton text={BASE_URL} /></div>
      </div>

      {/* Code examples */}
      <div>
        <h3 className="text-sm font-black text-white mb-3 flex items-center gap-2">
          <Code2 size={14} className="text-purple-400" /> Code Examples
        </h3>
        {/* Language tabs */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {codeExamples.map((ex, i) => (
            <button key={i} onClick={() => setActiveLang(i)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${
                activeLang === i ? "bg-brand-sky text-black" : "bg-brand-dark-surface border border-brand-dark-border text-gray-400 hover:text-white"
              }`}>
              {ex.lang}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] uppercase font-black text-gray-500">{codeExamples[activeLang].lang}</span>
          <CopyButton text={codeExamples[activeLang].code} />
        </div>
        <pre className={`bg-black/80 border border-brand-dark-border rounded-xl p-4 text-[10px] font-mono leading-relaxed overflow-x-auto ${codeExamples[activeLang].color}`}>
          {codeExamples[activeLang].code}
        </pre>
      </div>

      {/* Rate limits */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <h4 className="font-black text-amber-400 text-xs flex items-center gap-1.5 mb-3">
          <Zap size={12} /> Rate Limits &amp; Limits
        </h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-[10px]">
          {[
            { label: "Requests / minute", value: "300" },
            { label: "Token validity",    value: "8 hours" },
            { label: "Max items per PO",  value: "500" },
            { label: "Pagination limit",  value: "100 records" },
          ].map(r => (
            <div key={r.label} className="bg-black/40 rounded-lg p-2.5 text-center">
              <div className="font-black text-white text-base font-mono">{r.value}</div>
              <div className="text-gray-500 text-[8px] uppercase tracking-wider mt-0.5">{r.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Error Codes Section ──────────────────────────────────────────────────────
function ErrorCodes() {
  const errors = [
    { code: "400", name: "Bad Request",          color: "text-amber-400",  desc: "Missing or invalid request body / query parameters." },
    { code: "401", name: "Unauthorized",         color: "text-red-400",    desc: "Token missing, expired, or invalid. Re-authenticate via /auth/login." },
    { code: "403", name: "Forbidden",            color: "text-red-400",    desc: "Authenticated but insufficient role permissions for this endpoint." },
    { code: "404", name: "Not Found",            color: "text-gray-400",   desc: "Resource (product, customer, order) does not exist." },
    { code: "409", name: "Conflict",             color: "text-amber-400",  desc: "Duplicate entry — e.g. customer mobile already registered." },
    { code: "422", name: "Unprocessable Entity", color: "text-amber-400",  desc: "Validation failed — check the errors array in the response." },
    { code: "429", name: "Too Many Requests",    color: "text-red-400",    desc: "Rate limit exceeded. Wait 1 minute before retrying." },
    { code: "500", name: "Internal Server Error",color: "text-red-400",    desc: "Server-side error. Contact support with the requestId." },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-base font-black text-white flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-400" /> Error Codes &amp; Handling
      </h2>

      <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-brand-dark-border text-[9px] text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left">HTTP Code</th>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">When it happens</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-dark-border/20">
            {errors.map(e => (
              <tr key={e.code} className="hover:bg-brand-dark-surface/60 transition">
                <td className={`px-4 py-3 font-black font-mono ${e.color}`}>{e.code}</td>
                <td className={`px-4 py-3 font-bold ${e.color}`}>{e.name}</td>
                <td className="px-4 py-3 text-gray-400 text-[10px]">{e.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h4 className="text-xs font-black text-white mb-2">Standard Error Response Shape</h4>
        <CodeBlock
          label="Error Response (JSON)"
          color="text-red-400"
          content={`{
  "status": "error",
  "errorCode": "INSUFFICIENT_STOCK",
  "message": "Product P-1001 only has 2 units in stock, but 5 were requested.",
  "requestId": "req_8f2a1b3c",
  "timestamp": "2026-06-03T10:30:00Z"
}`}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ApiDocsPage() {
  const [section, setSection]         = useState<Section>("getting-started");
  const [activeGroup, setActiveGroup] = useState(GROUPS[0]);
  const [activeRoute, setActiveRoute] = useState(ROUTES[0].id);

  const currentRoute = ROUTES.find(r => r.id === activeRoute) || ROUTES[0];
  const groupRoutes  = ROUTES.filter(r => r.group === activeGroup);

  const GROUP_ICONS: Record<string, any> = {
    "Authentication": Lock,
    "Products":       Package,
    "POS & Sales":    ShoppingCart,
    "Customers":      Users,
    "Inventory":      Database,
  };

  const NAV = [
    { id: "getting-started", label: "Getting Started",  icon: BookOpen  },
    { id: "auth",            label: "Authentication",   icon: Lock      },
    { id: "endpoints",       label: "API Endpoints",    icon: Globe     },
    { id: "errors",          label: "Error Codes",      icon: AlertTriangle },
    { id: "sdk",             label: "SDK & SDKs",       icon: Smartphone },
  ] as const;

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <div className="flex-grow flex flex-col max-h-screen overflow-hidden">

        {/* Top nav bar */}
        <div className="border-b border-brand-dark-border bg-brand-dark-surface/60 px-5 py-0 flex items-center gap-1 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-2 mr-4 py-3 shrink-0">
            <div className="w-6 h-6 rounded-lg bg-brand-sky/20 border border-brand-sky/30 flex items-center justify-center">
              <Terminal size={12} className="text-brand-sky" />
            </div>
            <span className="font-black text-white text-xs whitespace-nowrap">MT UniPOS API <span className="text-brand-sky">v1</span></span>
          </div>
          {NAV.map(n => {
            const Icon = n.icon;
            return (
              <button key={n.id} onClick={() => setSection(n.id as Section)}
                className={`flex items-center gap-1.5 px-3 py-3.5 text-[10px] font-bold border-b-2 transition whitespace-nowrap ${
                  section === n.id
                    ? "border-brand-sky text-brand-sky"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}>
                <Icon size={11} /> {n.label}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-2 py-3 shrink-0">
            <span className="text-[8px] text-emerald-400 font-black uppercase bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> API Online
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-5">

          {/* ── GETTING STARTED ── */}
          {section === "getting-started" && <GettingStarted />}

          {/* ── AUTHENTICATION DEEP DIVE ── */}
          {section === "auth" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Lock size={16} className="text-emerald-400" /> Authentication Guide
              </h2>

              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-4">
                <h3 className="font-black text-white text-sm">JWT Bearer Token Flow</h3>
                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono text-gray-400">
                  {["Your App","→","POST /auth/login","→","JWT Token (8h)","→","Include in every request","→","Protected Endpoints"].map((step, i) => (
                    <span key={i} className={step === "→" ? "text-brand-sky font-black" : "bg-black/60 border border-brand-dark-border px-2 py-1 rounded text-white font-bold"}>
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              {ROUTES.filter(r => r.group === "Authentication").map(route => (
                <div key={route.id} className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black ${METHOD_STYLE[route.method]}`}>{route.method}</span>
                    <code className="text-brand-sky font-mono font-black text-sm">{BASE_URL}{route.path}</code>
                    <CopyButton text={`${BASE_URL}${route.path}`} />
                  </div>
                  <p className="text-[10px] text-gray-400">{route.desc}</p>
                  {route.notes && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 flex gap-2 text-[10px] text-amber-400">
                      <Info size={12} className="shrink-0 mt-0.5" /> {route.notes}
                    </div>
                  )}
                  <CodeBlock label="Request Body" color="text-white" content={route.reqBody} />
                  <CodeBlock label="Response (200 OK)" color="text-emerald-400" content={route.resBody} />
                </div>
              ))}

              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 space-y-2">
                <h4 className="font-black text-white text-xs flex items-center gap-1.5"><Shield size={12} className="text-brand-sky" /> Role Permissions</h4>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    { role: "Owner",           perms: "Full access to all endpoints" },
                    { role: "Manager",         perms: "Sales, inventory, customers, reports" },
                    { role: "Cashier",         perms: "POS checkout, customer lookup, sales history" },
                    { role: "Inventory Mgr",   perms: "Stock levels, adjustments, purchase orders" },
                    { role: "Accountant",      perms: "Reports, ledger entries, expense records" },
                    { role: "HR",              perms: "Staff management, payroll records" },
                  ].map(r => (
                    <div key={r.role} className="bg-black/40 border border-brand-dark-border rounded-lg p-2.5">
                      <div className="font-black text-brand-sky">{r.role}</div>
                      <div className="text-gray-500 mt-0.5">{r.perms}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── API ENDPOINTS ── */}
          {section === "endpoints" && (
            <div className="flex gap-4 h-full">
              {/* Endpoint list sidebar */}
              <div className="w-64 shrink-0 space-y-2">
                {GROUPS.map(group => {
                  const Icon = GROUP_ICONS[group] || Layers;
                  const isActive = activeGroup === group;
                  return (
                    <div key={group}>
                      <button onClick={() => { setActiveGroup(group); setActiveRoute(ROUTES.find(r=>r.group===group)?.id || ""); }}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition ${
                          isActive ? "bg-brand-sky/10 border border-brand-sky/30 text-brand-sky" : "bg-brand-dark-surface/40 border border-brand-dark-border text-gray-400 hover:text-white"
                        }`}>
                        <Icon size={12} /> {group}
                        <span className="ml-auto text-[8px] bg-brand-dark-border px-1.5 py-0.5 rounded font-mono">
                          {ROUTES.filter(r=>r.group===group).length}
                        </span>
                      </button>
                      {isActive && (
                        <div className="ml-3 mt-1 space-y-1 border-l-2 border-brand-sky/20 pl-3">
                          {groupRoutes.map(r => (
                            <button key={r.id} onClick={() => setActiveRoute(r.id)}
                              className={`w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-[9px] transition ${
                                activeRoute === r.id ? "bg-brand-sky/10 text-brand-sky font-black" : "text-gray-500 hover:text-white"
                              }`}>
                              <span className={`px-1.5 py-0.5 rounded text-[7px] font-black ${METHOD_STYLE[r.method]}`}>{r.method}</span>
                              <span className="truncate font-mono">{r.path}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Route detail */}
              <div className="flex-grow space-y-4 overflow-y-auto pr-1">
                <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${METHOD_STYLE[currentRoute.method]}`}>
                      {currentRoute.method}
                    </span>
                    <code className="text-brand-sky font-mono font-black">{BASE_URL}{currentRoute.path}</code>
                    <CopyButton text={`${BASE_URL}${currentRoute.path}`} />
                  </div>
                  <p className="text-[11px] text-gray-300">{currentRoute.desc}</p>
                  {currentRoute.notes && (
                    <div className="bg-brand-sky/5 border border-brand-sky/20 rounded-xl p-3 flex gap-2 text-[10px] text-brand-sky">
                      <Info size={12} className="shrink-0 mt-0.5" /> {currentRoute.notes}
                    </div>
                  )}
                  <CodeBlock label="HTTP Headers" color="text-amber-300" content={currentRoute.reqHeaders} />
                  <CodeBlock label={currentRoute.method === "GET" ? "Query Parameters" : "JSON Request Body"} color="text-white" content={currentRoute.reqBody} />
                  <CodeBlock label="Response (200 OK)" color="text-emerald-400" content={currentRoute.resBody} />
                </div>
              </div>
            </div>
          )}

          {/* ── ERRORS ── */}
          {section === "errors" && <ErrorCodes />}

          {/* ── SDK ── */}
          {section === "sdk" && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Smartphone size={16} className="text-brand-sky" /> SDKs &amp; Mobile Integration
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[
                  { name: "React Native", icon: "⚛️", status: "Available", color: "text-brand-sky", bg: "bg-brand-sky/10 border-brand-sky/20",
                    desc: "Full-featured SDK with barcode scanner support, offline sync, and receipt printer integration." },
                  { name: "Flutter",      icon: "🐦", status: "Available", color: "text-blue-400",  bg: "bg-blue-500/10 border-blue-500/20",
                    desc: "Dart package for Android & iOS. Includes JazzCash & EasyPaisa payment gateway hooks." },
                  { name: "Android (Kotlin)", icon: "🤖", status: "Beta",  color: "text-green-400", bg: "bg-green-500/10 border-green-500/20",
                    desc: "Native Android SDK for thermal printer integration and NFC payment support." },
                ].map(sdk => (
                  <div key={sdk.name} className={`border rounded-xl p-4 ${sdk.bg}`}>
                    <div className="text-3xl mb-2">{sdk.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-white text-sm">{sdk.name}</h3>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${sdk.color} bg-black/30`}>{sdk.status}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">{sdk.desc}</p>
                    <button className={`mt-3 text-[9px] font-black ${sdk.color} flex items-center gap-1 hover:underline`}>
                      View Docs <ArrowRight size={9} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-5 space-y-3">
                <h3 className="font-black text-white text-sm flex items-center gap-2"><Zap size={13} className="text-yellow-400" /> Webhook Events</h3>
                <p className="text-[10px] text-gray-400">Register a webhook URL to receive real-time push notifications when key events occur.</p>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  {[
                    "sale.completed", "sale.refunded", "stock.low_alert",
                    "customer.credit_overdue", "po.received", "shift.opened", "shift.closed"
                  ].map(e => (
                    <div key={e} className="bg-black/50 border border-brand-dark-border rounded-lg px-3 py-2 font-mono text-emerald-400 font-bold">
                      {e}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-5">
                <h3 className="font-black text-white text-sm mb-3 flex items-center gap-2">
                  <RefreshCw size={13} className="text-purple-400" /> Offline Sync Strategy
                </h3>
                <div className="space-y-2 text-[10px] text-gray-400">
                  {[
                    ["Queue sales locally", "When offline, store transactions in device SQLite/AsyncStorage"],
                    ["Sync on reconnect",   "POST /sales/checkout/bulk with the queued array on reconnect"],
                    ["Conflict resolution", "Server timestamp wins. Device sends clientTimestamp for logging"],
                    ["Product catalog",     "Cache GET /products response locally, refresh every 15 minutes"],
                  ].map(([title, desc]) => (
                    <div key={title} className="flex gap-3 items-start bg-black/30 rounded-lg p-2.5">
                      <ChevronRight size={10} className="text-brand-sky shrink-0 mt-0.5" />
                      <div><span className="font-bold text-white">{title}:</span> {desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
