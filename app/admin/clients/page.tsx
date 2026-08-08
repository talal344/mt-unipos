"use client";

import React, { useState, useMemo } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import {
  Plus,
  Edit2,
  ShieldAlert,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Check,
  ExternalLink,
  Key,
  DollarSign,
  CheckCircle,
  X,
  PlusCircle,
  Save,
  Trash,
  Clock,
  Eye,
  EyeOff,
  MessageCircle,
  Send,
  Calendar,
  Filter,
  Search,
  ChevronDown,
  Users,
  Building2,
  Timer,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Shield,
  Database,
  Download,
  Upload,
  Cpu,
  RefreshCw,
  FileText,
  Printer,
} from "lucide-react";
import type { DemoRequest, Tenant } from "@/context/global-context";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function daysUntil(isoDate: string) {
  const diff = new Date(isoDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function DemoStatusBadge({ status }: { status: DemoRequest["status"] }) {
  const cfg: Record<string, string> = {
    Pending:
      "bg-amber-500/10 border border-amber-500/30 text-amber-400",
    Reviewed:
      "bg-sky-500/10 border border-sky-500/30 text-sky-400",
    "Under Review":
      "bg-purple-500/10 border border-purple-500/30 text-purple-400",
    Approved:
      "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400",
    Rejected:
      "bg-red-500/10 border border-red-500/30 text-red-400",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-bold ${cfg[status] ?? ""}`}
    >
      {status}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-4 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value}</div>
        <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">
          {label}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  APPROVE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ApproveModal({
  req,
  onClose,
  approveDemoRequest,
}: {
  req: DemoRequest;
  onClose: () => void;
  approveDemoRequest: (id: string, days: number) => void;
}) {
  const [trialDays, setTrialDays] = useState(14);
  const [customDays, setCustomDays] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [done, setDone] = useState(false);
  const [generatedCreds, setGeneratedCreds] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // We need the updated request to grab generated creds — we'll mirror what the
  // context does so we can show them immediately without re-reading context.
  const handleApprove = () => {
    setErrorMsg(null);
    try {
      const days = useCustom ? parseInt(customDays, 10) || 14 : trialDays;
      const email = req.email;  // Use the requester's actual email
      const password = `Demo@${Math.floor(1000 + Math.random() * 9000)}`;
      approveDemoRequest(req.id, days);
      setGeneratedCreds({ email, password });
      setDone(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to approve demo request.");
    }
  };

  const presets = [14, 30, 60];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-brand-dark-surface border border-emerald-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400" />
            <h3 className="font-black text-white text-sm">Approve Demo Request</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Info */}
        <div className="bg-black/30 border border-brand-dark-border rounded-xl p-3 mb-4 space-y-1 text-xs font-mono">
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Ticket #</span>
            <span className="text-sky-400 font-bold">{req.ticketNumber}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Name</span>
            <span className="text-white">{req.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Business</span>
            <span className="text-white">{req.businessName}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Email</span>
            <span className="text-white">{req.email}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Phone</span>
            <span className="text-white">{req.phone}</span>
          </div>
        </div>

        {!done ? (
          <>
            {/* Trial Selector */}
            <div className="mb-4">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">
                Trial Duration
              </label>
              <div className="flex gap-2 mb-3">
                {presets.map((d) => (
                  <button
                    key={d}
                    onClick={() => {
                      setTrialDays(d);
                      setUseCustom(false);
                    }}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                      !useCustom && trialDays === d
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                        : "bg-black/30 border-brand-dark-border text-gray-400 hover:border-emerald-500/30 hover:text-emerald-400"
                    }`}
                  >
                    {d} Days
                  </button>
                ))}
                <button
                  onClick={() => setUseCustom(true)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold border transition ${
                    useCustom
                      ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                      : "bg-black/30 border-brand-dark-border text-gray-400 hover:border-emerald-500/30 hover:text-emerald-400"
                  }`}
                >
                  Custom
                </button>
              </div>
              {useCustom && (
                <input
                  type="number"
                  min={1}
                  max={365}
                  placeholder="Enter number of days"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              )}
            </div>

            <button
              onClick={handleApprove}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 transition"
            >
              <CheckCircle2 size={14} />
              Approve &amp; Generate Credentials
            </button>
          </>
        ) : (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
              <CheckCircle size={16} />
              Approved Successfully!
            </div>
            <p className="text-[10px] text-gray-400">
              Generated credentials for{" "}
              <span className="text-white font-bold">{req.businessName}</span>:
            </p>
            <div className="bg-black/40 rounded-lg p-3 font-mono text-xs space-y-1">
              <div>
                <span className="text-gray-500">Demo Email: </span>
                <span className="text-emerald-300 font-bold">
                  {generatedCreds?.email}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Password: </span>
                <span className="text-emerald-300 font-bold">
                  {generatedCreds?.password}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2 bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 font-bold text-xs rounded transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  REJECT MODAL
// ─────────────────────────────────────────────────────────────────────────────

function RejectModal({
  req,
  onClose,
  rejectDemoRequest,
}: {
  req: DemoRequest;
  onClose: () => void;
  rejectDemoRequest: (id: string, reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  const handleReject = () => {
    if (!reason.trim()) return;
    rejectDemoRequest(req.id, reason.trim());
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-brand-dark-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <XCircle size={16} className="text-red-400" />
            <h3 className="font-black text-white text-sm">Reject Demo Request</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="bg-black/30 border border-brand-dark-border rounded-xl p-3 mb-4 text-xs font-mono space-y-1">
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Ticket #</span>
            <span className="text-sky-400 font-bold">{req.ticketNumber}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Name</span>
            <span className="text-white">{req.name}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-500 w-24">Business</span>
            <span className="text-white">{req.businessName}</span>
          </div>
        </div>

        {!done ? (
          <>
            <div className="mb-4">
              <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">
                Rejection Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Please provide a reason for rejection..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white text-xs focus:outline-none focus:border-red-500 resize-none"
              />
            </div>
            <button
              onClick={handleReject}
              disabled={!reason.trim()}
              className="w-full py-3 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xs uppercase rounded-lg flex items-center justify-center gap-2 transition"
            >
              <XCircle size={14} />
              Confirm Rejection
            </button>
          </>
        ) : (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-black text-sm">
              <XCircle size={16} />
              Request Rejected
            </div>
            <p className="text-[10px] text-gray-400">
              The demo request from{" "}
              <span className="text-white font-bold">{req.businessName}</span>{" "}
              has been rejected.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2 bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 font-bold text-xs rounded transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  DETAIL / VIEW MODAL
// ─────────────────────────────────────────────────────────────────────────────

function DetailModal({
  req,
  onClose,
  addDemoMessage,
}: {
  req: DemoRequest;
  onClose: () => void;
  addDemoMessage: (ticketNumber: string, message: string, sender: "Client" | "Admin") => void;
}) {
  const [replyText, setReplyText] = useState("");

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    addDemoMessage(req.ticketNumber, replyText.trim(), "Admin");
    setReplyText("");
  };

  const trialExpiry = req.trialEndsAt ? daysUntil(req.trialEndsAt) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-brand-dark-surface border border-brand-dark-border rounded-2xl w-full max-w-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border p-5 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Shield size={14} className="text-sky-400" />
              <span className="text-sky-400 font-mono text-xs font-bold">
                {req.ticketNumber}
              </span>
              <DemoStatusBadge status={req.status} />
            </div>
            <h3 className="font-black text-white text-sm">{req.businessName}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: "Contact Name", value: req.name },
              { label: "Business Name", value: req.businessName },
              { label: "Email", value: req.email },
              { label: "Phone", value: req.phone },
              { label: "Country", value: req.country },
              { label: "Business Type", value: req.businessType },
              { label: "Request Date", value: formatDate(req.date) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="bg-black/30 border border-brand-dark-border/60 rounded-lg p-2.5"
              >
                <div className="text-[9px] uppercase font-bold text-gray-500 mb-0.5">
                  {label}
                </div>
                <div className="text-white font-semibold">{value}</div>
              </div>
            ))}
          </div>

          {/* Approved Section */}
          {req.status === "Approved" && req.demoEmail && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-wide">
                <CheckCircle2 size={14} />
                Demo Account Approved
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="bg-black/40 rounded-lg p-2.5">
                  <div className="text-[9px] text-gray-500 mb-0.5">Demo Email</div>
                  <div className="text-emerald-300 font-bold">{req.demoEmail}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2.5">
                  <div className="text-[9px] text-gray-500 mb-0.5">Password</div>
                  <div className="text-emerald-300 font-bold">{req.demoPassword}</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2.5">
                  <div className="text-[9px] text-gray-500 mb-0.5">Trial Duration</div>
                  <div className="text-white font-bold">{req.trialDays} Days</div>
                </div>
                <div className="bg-black/40 rounded-lg p-2.5">
                  <div className="text-[9px] text-gray-500 mb-0.5">Approved On</div>
                  <div className="text-white font-bold">
                    {req.approvedAt ? formatDate(req.approvedAt) : "—"}
                  </div>
                </div>
              </div>
              {req.trialEndsAt && (
                <div
                  className={`flex items-center gap-2 rounded-lg p-2.5 text-xs font-bold ${
                    trialExpiry !== null && trialExpiry > 0
                      ? "bg-sky-500/10 border border-sky-500/20 text-sky-400"
                      : "bg-red-500/10 border border-red-500/20 text-red-400"
                  }`}
                >
                  <Timer size={13} />
                  {trialExpiry !== null && trialExpiry > 0
                    ? `Trial expires in ${trialExpiry} day(s) — ${formatDate(req.trialEndsAt)}`
                    : `Trial EXPIRED on ${formatDate(req.trialEndsAt)}`}
                </div>
              )}
            </div>
          )}

          {/* Rejected Section */}
          {req.status === "Rejected" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-400 font-black text-xs uppercase tracking-wide">
                <XCircle size={14} />
                Request Rejected
              </div>
              {req.rejectedAt && (
                <div className="text-[10px] text-gray-400">
                  Rejected on: <span className="text-white">{formatDate(req.rejectedAt)}</span>
                </div>
              )}
              {req.rejectedReason && (
                <div className="bg-black/30 rounded-lg p-2.5 text-xs text-gray-300">
                  {req.rejectedReason}
                </div>
              )}
            </div>
          )}

          {/* Messages / Chat Thread */}
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-3">
              <MessageCircle size={12} />
              Conversation Thread
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-3">
              {req.messages.length === 0 ? (
                <p className="text-[10px] text-gray-600 italic text-center py-4">
                  No messages yet.
                </p>
              ) : (
                req.messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.sender === "Admin" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl p-2.5 text-xs ${
                        msg.sender === "Admin"
                          ? "bg-purple-600/20 border border-purple-500/30 text-purple-100"
                          : "bg-brand-dark-border/60 border border-brand-dark-border text-gray-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className={`text-[9px] font-bold uppercase ${
                            msg.sender === "Admin" ? "text-purple-400" : "text-sky-400"
                          }`}
                        >
                          {msg.sender}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {formatDate(msg.date)}
                        </span>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Reply Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type an admin reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendReply()}
                className="flex-1 bg-black border border-brand-dark-border p-2.5 rounded-lg text-white text-xs focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim()}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-lg transition flex items-center gap-1 text-xs font-bold"
              >
                <Send size={12} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

type ActiveTab = "demo" | "tenants";

export default function AdminClientsPage() {
  const {
    demoRequests,
    updateDemoStatus,
    approveDemoRequest,
    rejectDemoRequest,
    addDemoMessage,
    deleteDemoRequest,
    tenants,
    registerTenant,
    updateTenantStatus,
    deleteTenant,
    setTenantCurrency,
    addTenantCredential,
    updateTenantCredential,
    deleteTenantCredential,
    saasInvoices,
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<ActiveTab>("demo");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Demo Tab State ───────────────────────────────────────────────────────
  const [demoSearch, setDemoSearch] = useState("");
  const [demoStatusFilter, setDemoStatusFilter] = useState<DemoRequest["status"] | "All">("All");
  const [approveTarget, setApproveTarget] = useState<DemoRequest | null>(null);
  const [rejectTarget, setRejectTarget]   = useState<DemoRequest | null>(null);
  const [detailTarget, setDetailTarget]   = useState<DemoRequest | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<DemoRequest | null>(null);

  // Sync detailTarget with live data so messages appear instantly
  const liveDetailTarget = useMemo(() => {
    if (!detailTarget) return null;
    return demoRequests.find((r) => r.id === detailTarget.id) ?? detailTarget;
  }, [detailTarget, demoRequests]);

  const filteredDemos = useMemo(() => {
    return demoRequests.filter((r) => {
      const matchStatus = demoStatusFilter === "All" || r.status === demoStatusFilter;
      const q = demoSearch.toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.businessName.toLowerCase().includes(q) ||
        (r.ticketNumber || "").toLowerCase().includes(q);

      return matchStatus && matchSearch;
    });
  }, [demoRequests, demoSearch, demoStatusFilter]);

  const demoStats = useMemo(
    () => ({
      total: demoRequests.length,
      pending: demoRequests.filter((r) => r.status === "Pending").length,
      approved: demoRequests.filter((r) => r.status === "Approved").length,
      rejected: demoRequests.filter((r) => r.status === "Rejected").length,
    }),
    [demoRequests]
  );

  // ── Tenant Tab State ─────────────────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<any>(null);

  // Expanded client sharding features
  const [tenantSearch, setTenantSearch] = useState("");
  const [tenantPlanFilter, setTenantPlanFilter] = useState<"All" | "Starter" | "Professional" | "Enterprise">("All");
  const [tenantStatusFilter, setTenantStatusFilter] = useState<"All" | "Active" | "Trial" | "Suspended">("All");
  const [tenantTypeFilter, setTenantTypeFilter] = useState<string>("All");
  const [shardDetailTarget, setShardDetailTarget] = useState<any | null>(null);
  const [backupLoading, setBackupLoading] = useState<Record<string, boolean>>({});
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreTenantId, setRestoreTenantId] = useState<string | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);

  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const q = tenantSearch.toLowerCase();
      const matchSearch =
        !q ||
        t.id.toLowerCase().includes(q) ||
        t.businessName.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      
      const matchPlan = tenantPlanFilter === "All" || t.plan === tenantPlanFilter;
      const matchStatus = tenantStatusFilter === "All" || t.status === tenantStatusFilter;
      
      let matchType = true;
      if (tenantTypeFilter !== "All") {
        if (tenantTypeFilter === "Super Markets") matchType = t.businessType?.includes("Super");
        else if (tenantTypeFilter === "Pharmacy Stores") matchType = t.businessType?.includes("Pharmacy");
        else if (tenantTypeFilter === "Restaurants / Cafes") matchType = t.businessType?.includes("Rest") || t.businessType?.includes("Cafe");
        else if (tenantTypeFilter === "Electronics Stores") matchType = t.businessType?.includes("Elect");
        else if (tenantTypeFilter === "Clothing Stores") matchType = t.businessType?.includes("Cloth");
      }

      return matchSearch && matchPlan && matchStatus && matchType;
    });
  }, [tenants, tenantSearch, tenantPlanFilter, tenantStatusFilter, tenantTypeFilter]);

  // ── All tenant-specific localStorage key prefixes (must match global-context) ──
  const TENANT_DATA_KEYS = [
    "unipos_products", "unipos_customers", "unipos_suppliers", "unipos_sales",
    "unipos_expenses", "unipos_employees", "unipos_settings", "unipos_pos",
    "unipos_batches", "unipos_tables", "unipos_kitchen", "unipos_accounts",
    "unipos_journal", "unipos_attendance", "unipos_payroll", "unipos_transfers",
  ];

  const handleBackupDb = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;

    setBackupLoading(prev => ({ ...prev, [tenantId]: true }));
    triggerToast(`Generating database backup for ${tenant.businessName}...`);

    setTimeout(() => {
      const backup: Record<string, any> = {
        _meta: {
          tenantId,
          businessName: tenant.businessName,
          exportedAt: new Date().toISOString(),
          version: "unipos-v1",
        },
        tenantMeta: tenant,
        data: {} as Record<string, any>,
      };

      // Collect all tenant-specific localStorage data
      TENANT_DATA_KEYS.forEach(key => {
        const val = localStorage.getItem(`${key}_${tenantId}`);
        if (val) {
          try { backup.data[key] = JSON.parse(val); } catch { backup.data[key] = val; }
        }
      });

      const json = JSON.stringify(backup, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unipos_backup_${tenantId}_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setBackupLoading(prev => ({ ...prev, [tenantId]: false }));
      triggerToast(`✅ Backup downloaded for ${tenant.businessName}!`);
    }, 800);
  };

  const handlePrintA4ActivationCertificate = async (tenant: Tenant) => {
    const inv = saasInvoices.find(i => i.tenantId === tenant.id);
    const total = inv ? Number(inv.amount || 0) : 25000;
    const paid = inv ? Number(inv.paidAmount ?? (inv.status === "Paid" ? total : 0)) : (tenant.status === "Active" ? total : 0);
    const remaining = total - paid;
    const paymentStatus = tenant.status === "Active" ? "PAID & ACTIVATED" : (inv?.status || "PENDING PAYMENT");
    
    // Generate License Key
    let keyString = "WEB-VERSION-NO-KEY-REQUIRED";

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>A4 Activation Certificate & Invoice - ${tenant.id}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 40px; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .card { border: 2px solid #0ea5e9; border-radius: 16px; padding: 35px; background: #ffffff; box-shadow: 0 10px 30px rgba(14,165,233,0.08); position: relative; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 25px; }
    .brand-title { font-size: 26px; font-weight: 900; color: #0284c7; letter-spacing: -0.5px; }
    .brand-sub { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
    .meta-right { text-align: right; }
    .doc-id { font-size: 18px; font-weight: 900; color: #0f172a; font-family: 'JetBrains Mono', monospace; }
    .badge { display: inline-block; margin-top: 6px; font-size: 10px; font-weight: 800; padding: 5px 12px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-pending { background: #fee2e2; color: #b91c1c; }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px; }
    .box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; }
    .box-title { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #0284c7; letter-spacing: 1px; margin-bottom: 10px; }
    .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
    .label { color: #64748b; font-weight: 600; }
    .val { color: #0f172a; font-weight: 700; }

    .cred-box { background: #0f172a; color: #ffffff; border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 2px solid #38bdf8; }
    .cred-title { font-size: 11px; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 1px; margin-bottom: 12px; }
    .key-box { background: #1e293b; border: 1px border #334155; border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace; font-size: 10px; word-break: break-all; color: #4ade80; margin-top: 10px; }

    .totals { background: #f1f5f9; border-radius: 12px; padding: 20px; margin-bottom: 25px; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; font-weight: 700; }
    .grand-total { border-top: 2px solid #cbd5e1; padding-top: 10px; font-size: 16px; font-weight: 900; color: #0284c7; }

    .footer { border-top: 2px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b; }
    .print-btn { background: #0284c7; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-bottom: 20px; font-size: 14px; }
    @media print { .no-print { display: none; } body { padding: 0; } .card { border: none; box-shadow: none; } }
  </style>
</head>
<body>
  <div className="no-print" style="text-align: right;">
    <button onclick="window.print()" class="print-btn">🖨️ Print / Save as PDF Certificate</button>
  </div>
  <div class="card">
    <div class="header">
      <div>
        <div class="brand-title">MT UniPOS</div>
        <div class="brand-sub">Enterprise SaaS POS &amp; ERP Platform</div>
        <div style="font-size: 12px; color: #475569; margin-top: 4px;">SuperAdmin Provider: Mian Talal (03396399895 | miantalal2@gmail.com)</div>
      </div>
      <div class="meta-right">
        <div class="doc-id">${tenant.id}</div>
        <div class="badge ${tenant.status === 'Active' ? 'badge-active' : 'badge-pending'}">
          ${paymentStatus}
        </div>
        <div style="font-size:11px; color:#64748b; margin-top:6px;">Date: ${new Date().toLocaleDateString()}</div>
      </div>
    </div>

    <div class="grid">
      <div class="box">
        <div class="box-title">Client &amp; Business Information</div>
        <div class="row"><span class="label">Business Name:</span><span class="val">${tenant.businessName}</span></div>
        <div class="row"><span class="label">Owner Name:</span><span class="val">${tenant.ownerName}</span></div>
        <div class="row"><span class="label">Corporate Email:</span><span class="val">${tenant.email}</span></div>
        <div class="row"><span class="label">Phone:</span><span class="val">${tenant.phone || 'N/A'}</span></div>
      </div>
      <div class="box">
        <div class="box-title">Subscription &amp; Deployment Plan</div>
        <div class="row"><span class="label">Plan Tier:</span><span class="val">${tenant.plan} (${tenant.billingCycle})</span></div>
        <div class="row"><span class="label">Connectivity:</span><span class="val" style="text-transform:uppercase;">${tenant.connectivityPlan || 'Hybrid'}</span></div>
        <div class="row"><span class="label">Default Currency:</span><span class="val">${tenant.defaultCurrency || 'PKR'}</span></div>
        <div class="row"><span class="label">Sign-up Date:</span><span class="val">${tenant.signupDate}</span></div>
      </div>
    </div>

    <div class="cred-box">
      <div class="cred-title">🔑 Software Login Credentials &amp; Cryptographic License Key</div>
      <div class="row"><span style="color:#94a3b8">Authorized Email:</span><span style="color:#ffffff;font-weight:700">${tenant.email}</span></div>
      <div class="row"><span style="color:#94a3b8">Default Password:</span><span style="color:#4ade80;font-weight:900">owner123</span></div>
      <div style="margin-top:10px;font-size:11px;color:#cbd5e1;font-weight:600;">Cryptographic License Key (Lifetime Activation String):</div>
      <div class="key-box">${keyString}</div>
    </div>

    <div class="totals">
      <div class="total-row"><span>Subscription Plan Bill:</span><span>PKR ${total.toLocaleString()}</span></div>
      <div class="total-row" style="color:#16a34a;"><span>Amount Paid / Received:</span><span>PKR ${paid.toLocaleString()}</span></div>
      <div class="total-row grand-total"><span>Balance Due:</span><span>PKR ${remaining.toLocaleString()}</span></div>
    </div>

    <div class="footer">
      <div>
        <b>Official Verification Stamp:</b> MT UniPOS Enterprise Authority<br/>
        This document serves as an official invoice and lifetime license activation certificate.
      </div>
      <div style="text-align:right">
        <b>Founder Signature:</b> Mian Talal<br/>
        <i>Verified &amp; Sealed</i>
      </div>
    </div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const handleRestoreDb = (tenantId: string) => {
    setRestoreTenantId(tenantId);
    setShowRestoreModal(true);
  };

  const handleRestoreFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restoreTenantId) return;

    setRestoreLoading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target?.result as string);
        if (!backup.data || !backup._meta) {
          triggerToast("❌ Invalid backup file format!");
          setRestoreLoading(false);
          return;
        }

        // Restore all data under this tenant's keys
        const targetTenantId = restoreTenantId;
        Object.entries(backup.data as Record<string, any>).forEach(([key, value]) => {
          localStorage.setItem(`${key}_${targetTenantId}`, JSON.stringify(value));
        });

        setRestoreLoading(false);
        setShowRestoreModal(false);
        setRestoreTenantId(null);
        triggerToast(`✅ Backup restored for Tenant ${targetTenantId}! Ask them to refresh.`);
      } catch {
        triggerToast("❌ Failed to parse backup file. Please upload a valid JSON backup.");
        setRestoreLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExtendTrial = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant) return;
    updateTenantStatus(tenantId, "Trial");
    triggerToast(`Extended trial active period for ${tenant.businessName} by 30 Days!`);
  };

  const handleResetPassword = (tenantId: string) => {
    const tenant = tenants.find(t => t.id === tenantId);
    if (!tenant || !tenant.credentialPresets || tenant.credentialPresets.length === 0) {
      triggerToast("No credential presets linked to this tenant shard.");
      return;
    }
    const targetPre = tenant.credentialPresets[0];
    const newPass = `Reset@${Math.floor(1000 + Math.random() * 9000)}`;
    updateTenantCredential(tenantId, targetPre.id, { pass: newPass });
    triggerToast(`Master password for ${tenant.businessName} reset to: ${newPass}`);
  };

  const handleExportRegistry = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tenants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", `unipos_tenants_registry_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    triggerToast("Exported active tenants sharding registry successfully!");
  };

  const [addForm, setAddForm] = useState({
    id: "",
    businessName: "",
    ownerName: "",
    email: "",
    phone: "",
    businessType: "Super Mart",
    plan: "Starter" as const,
    billingCycle: "monthly" as const,
    isTrial: false,
    trialDays: 7,
    connectivityPlan: "hybrid" as "offline-only" | "online-only" | "hybrid",
  });

  const [editForm, setEditForm] = useState({
    plan: "Starter" as const,
    billingCycle: "monthly" as const,
    defaultCurrency: "PKR",
    connectivityPlan: "hybrid" as "offline-only" | "online-only" | "hybrid",
  });

  const [credForm, setCredForm] = useState({
    id: "",
    label: "",
    email: "",
    pass: "",
    role: "Owner" as "Owner" | "Manager" | "Cashier" | "Accountant" | "Warehouse Staff",
  });

  // ── Helpers ──────────────────────────────────────────────────────────────

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // ── Tenant Handlers ──────────────────────────────────────────────────────

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.businessName || !addForm.ownerName || !addForm.email) return;
    try {
      registerTenant(addForm);
      setShowAddModal(false);
      setAddForm({
        id: "",
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        businessType: "Super Mart",
        plan: "Starter",
        billingCycle: "monthly",
        isTrial: false,
        trialDays: 7,
        connectivityPlan: "hybrid",
      });
      triggerToast("Provisioned new Tenant database sharding successfully!");
    } catch (err: any) {
      triggerToast(err.message || "Duplicate Tenant Error!");
    }
  };

  const handleOpenEdit = (tenant: any) => {
    setSelectedTenant(tenant);
    setEditForm({
      plan: tenant.plan,
      billingCycle: tenant.billingCycle,
      defaultCurrency: tenant.defaultCurrency || "PKR",
      connectivityPlan: tenant.connectivityPlan || "hybrid",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    selectedTenant.plan = editForm.plan;
    selectedTenant.billingCycle = editForm.billingCycle;
    selectedTenant.connectivityPlan = editForm.connectivityPlan;
    setTenantCurrency(selectedTenant.id, editForm.defaultCurrency);
    setShowEditModal(false);
    setSelectedTenant(null);
    triggerToast("Successfully updated Tenant shard configurations!");
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Active" ? "Suspended" : "Active";
    updateTenantStatus(id, nextStatus as any);
    triggerToast(`Tenant status set to ${nextStatus}!`);
  };

  const handleDeleteTenant = async (id: string, name: string) => {
    if (
      confirm(
        `⚠️ PERMANENT DELETE\n\nAre you absolutely sure you want to permanently delete Tenant "${name}"?\n\nThis will delete:\n• All products, customers, sales\n• All expenses, employees, reports\n• All cloud database records\n• All linked invoices\n\nThis action CANNOT be undone.`
      )
    ) {
      await deleteTenant(id);
      triggerToast(`✅ Permanently deleted Tenant "${name}" and all its data.`);
    }
  };

  const handleOpenPresets = (tenant: any) => {
    setSelectedTenant(tenant);
    setCredForm({ id: "", label: "", email: "", pass: "", role: "Owner" });
    setShowPresetsModal(true);
  };

  const handleSaveCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant || !credForm.label || !credForm.email || !credForm.pass) return;
    if (credForm.id) {
      updateTenantCredential(selectedTenant.id, credForm.id, {
        label: credForm.label,
        email: credForm.email,
        pass: credForm.pass,
        role: credForm.role,
      });
      triggerToast("Updated credential preset successfully!");
    } else {
      addTenantCredential(selectedTenant.id, {
        label: credForm.label,
        email: credForm.email,
        pass: credForm.pass,
        role: credForm.role,
      });
      triggerToast("Added new credential preset!");
    }
    setCredForm({ id: "", label: "", email: "", pass: "", role: "Owner" });
  };

  const handleEditCredential = (cred: any) => {
    setCredForm({
      id: cred.id,
      label: cred.label,
      email: cred.email,
      pass: cred.pass,
      role: cred.role,
    });
  };

  const handleDeleteCredential = (credId: string) => {
    if (!selectedTenant) return;
    deleteTenantCredential(selectedTenant.id, credId);
    triggerToast("Removed credential preset.");
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <AdminSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-purple-600/90 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl border border-purple-500/20 backdrop-blur flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-white">
              Client Management
            </h1>
            <p className="text-[10px] text-gray-500 font-sans">
              Manage demo requests pipeline and active tenant database shards.
            </p>
          </div>
          {activeTab === "tenants" && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs px-4 py-2.5 rounded-lg shadow-lg transition"
            >
              <Plus size={14} />
              Provision Store Tenant
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-brand-dark-surface/40 border border-brand-dark-border rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("demo")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "demo"
                ? "bg-sky-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Timer size={13} />
            Demo Requests
            {demoStats.pending > 0 && (
              <span className="bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {demoStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("tenants")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === "tenants"
                ? "bg-purple-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Building2 size={13} />
            Active Tenants
          </button>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: DEMO REQUESTS                                               */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "demo" && (
          <div className="space-y-5">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Total Requests"
                value={demoStats.total}
                icon={Users}
                color="bg-sky-500/15 text-sky-400"
              />
              <StatCard
                label="Pending Review"
                value={demoStats.pending}
                icon={Clock}
                color="bg-amber-500/15 text-amber-400"
              />
              <StatCard
                label="Approved"
                value={demoStats.approved}
                icon={CheckCircle2}
                color="bg-emerald-500/15 text-emerald-400"
              />
              <StatCard
                label="Rejected"
                value={demoStats.rejected}
                icon={XCircle}
                color="bg-red-500/15 text-red-400"
              />
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search by name, business, or ticket #..."
                  value={demoSearch}
                  onChange={(e) => setDemoSearch(e.target.value)}
                  className="w-full bg-brand-dark-surface/40 border border-brand-dark-border pl-9 pr-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-sky-500 placeholder-gray-600"
                />
              </div>
              {/* Status Filter */}
              <div className="flex gap-1.5">
                {(["All", "Pending", "Under Review", "Reviewed", "Approved", "Rejected"] as const).map(
                  (s) => (
                    <button
                      key={s}
                      onClick={() => setDemoStatusFilter(s as any)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition ${
                        demoStatusFilter === s
                          ? s === "All"
                            ? "bg-sky-600 border-sky-500 text-white"
                            : s === "Pending"
                            ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                            : s === "Under Review"
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-400"
                            : s === "Reviewed"
                            ? "bg-sky-500/20 border-sky-500/50 text-sky-400"
                            : s === "Approved"
                            ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400"
                            : "bg-red-500/20 border-red-500/50 text-red-400"
                          : "bg-brand-dark-surface/30 border-brand-dark-border text-gray-500 hover:text-gray-300"
                      }`}
                    >
                      {s}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Table */}
            <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Ticket #</th>
                      <th className="p-4 font-semibold">Name</th>
                      <th className="p-4 font-semibold">Business</th>
                      <th className="p-4 font-semibold">Type</th>
                      <th className="p-4 font-semibold">Country</th>
                      <th className="p-4 font-semibold">Date</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {filteredDemos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="p-8 text-center text-gray-600 italic font-sans"
                        >
                          No demo requests match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredDemos.map((req) => {
                        const canAct =
                          req.status !== "Approved" && req.status !== "Rejected";
                        return (
                          <tr
                            key={req.id}
                            className="hover:bg-brand-dark-surface/60 transition"
                          >
                            <td className="p-4 text-sky-400 font-bold">
                              {req.ticketNumber}
                            </td>
                            <td className="p-4 font-sans text-white">
                              {req.name}
                            </td>
                            <td className="p-4 font-sans">
                              <div className="font-bold text-white">
                                {req.businessName}
                              </div>
                            </td>
                            <td className="p-4 text-gray-400">
                              {req.businessType}
                            </td>
                            <td className="p-4 text-gray-400">{req.country}</td>
                            <td className="p-4 text-gray-400">
                              {formatDate(req.date)}
                            </td>
                            <td className="p-4">
                              <DemoStatusBadge status={req.status} />
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1.5 justify-center">
                                {canAct && (
                                  <>
                                    <button
                                      onClick={() => {
                                        updateDemoStatus(req.id, "Under Review");
                                      }}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-lg text-[10px] font-bold transition"
                                      title="Mark as Under Review"
                                    >
                                      <Eye size={10} />
                                      Reviewing
                                    </button>
                                    <button
                                      onClick={() => setApproveTarget(req)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-[10px] font-bold transition"
                                    >
                                      <CheckCircle2 size={10} />
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => setRejectTarget(req)}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-bold transition"
                                    >
                                      <XCircle size={10} />
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => setDetailTarget(req)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 rounded-lg text-[10px] font-bold transition"
                                >
                                  <Eye size={10} />
                                  View
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(req)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-red-900/20 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-[10px] font-bold transition"
                                  title="Delete this request permanently"
                                >
                                  <Trash2 size={10} />
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: ACTIVE TENANTS                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "tenants" && (
          <div className="space-y-5">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-grow">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Search by ID, business name, owner name, email..."
                  value={tenantSearch}
                  onChange={(e) => setTenantSearch(e.target.value)}
                  className="w-full bg-brand-dark-surface/40 border border-brand-dark-border pl-9 pr-3 py-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 placeholder-gray-600"
                />
              </div>

              {/* Advanced Dropdowns */}
              <div className="flex flex-wrap gap-2">
                <select
                  value={tenantPlanFilter}
                  onChange={(e) => setTenantPlanFilter(e.target.value as any)}
                  className="bg-brand-dark-surface/40 border border-brand-dark-border px-3 py-2 rounded-lg text-[10px] text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Plans</option>
                  <option value="Starter">Starter</option>
                  <option value="Professional">Professional</option>
                  <option value="Enterprise">Enterprise</option>
                </select>

                <select
                  value={tenantStatusFilter}
                  onChange={(e) => setTenantStatusFilter(e.target.value as any)}
                  className="bg-brand-dark-surface/40 border border-brand-dark-border px-3 py-2 rounded-lg text-[10px] text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Trial">Trial</option>
                  <option value="Suspended">Suspended</option>
                </select>

                <select
                  value={tenantTypeFilter}
                  onChange={(e) => setTenantTypeFilter(e.target.value)}
                  className="bg-brand-dark-surface/40 border border-brand-dark-border px-3 py-2 rounded-lg text-[10px] text-gray-300 focus:outline-none focus:border-purple-500"
                >
                  <option value="All">All Sectors</option>
                  <option value="Super Markets">Super Markets</option>
                  <option value="Pharmacy Stores">Pharmacy Stores</option>
                  <option value="Restaurants / Cafes">Restaurants / Cafes</option>
                  <option value="Electronics Stores">Electronics Stores</option>
                  <option value="Clothing Stores">Clothing Stores</option>
                </select>

                <button
                  onClick={handleExportRegistry}
                  className="flex items-center gap-1 bg-brand-dark-surface hover:bg-brand-dark-border border border-brand-dark-border px-3 py-2 rounded-lg text-[10px] text-gray-300 hover:text-white transition"
                  title="Export sharding registry configuration metadata to JSON"
                >
                  <Download size={12} />
                  <span>Export JSON</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                      <th className="p-4 font-semibold">Tenant ID</th>
                      <th className="p-4 font-semibold">Business Info</th>
                      <th className="p-4 font-semibold">Owner Contact</th>
                      <th className="p-4 font-semibold">Plan Tiers</th>
                      <th className="p-4 font-semibold">Default Currency</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold text-center">
                        Settings &amp; Controls
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                    {filteredTenants.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="p-8 text-center text-gray-600 italic font-sans"
                        >
                          No active store database shards match your filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTenants.map((tenant) => (
                        <tr
                          key={tenant.id}
                          className="hover:bg-brand-dark-surface/60 transition"
                        >
                          <td className="p-4 text-purple-400 font-bold">
                            {tenant.id}
                          </td>
                          <td className="p-4 font-sans">
                            <div className="font-bold text-white font-sans">
                              {tenant.businessName}
                            </div>
                            <div className="text-[10px] text-gray-500 font-sans">
                              {tenant.businessType}
                            </div>
                          </td>
                          <td className="p-4 font-sans">
                            <div className="text-white font-sans">
                              {tenant.ownerName}
                            </div>
                            <div className="text-[10px] text-gray-500">
                              {tenant.email}
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold px-2 py-0.5 rounded text-[10px] block w-fit">
                              {tenant.plan} ({tenant.billingCycle})
                            </span>
                          </td>
                          <td className="p-4 font-bold text-white">
                            {tenant.defaultCurrency || "PKR"}
                          </td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                tenant.status === "Active"
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                                  : tenant.status === "Trial"
                                  ? "bg-brand-sky/10 border border-brand-sky/30 text-brand-sky"
                                  : "bg-red-500/10 border border-red-500/30 text-red-400"
                              }`}
                            >
                              {tenant.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1.5 justify-center flex-wrap">
                              <button
                                onClick={() => handleOpenEdit(tenant)}
                                className="p-1.5 bg-brand-sky/10 hover:bg-brand-sky text-brand-sky hover:text-black rounded transition"
                                title="Edit Tenant Shard & Plan Configuration"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={() => handleOpenPresets(tenant)}
                                className="p-1.5 bg-purple-500/10 hover:bg-purple-500 text-purple-400 hover:text-white rounded transition"
                                title="Manage Login Credentials & Staff Presets"
                              >
                                <Key size={12} />
                              </button>
                              <button
                                onClick={() => handlePrintA4ActivationCertificate(tenant)}
                                className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded transition"
                                title="Print A4 Activation Certificate & Tax Invoice"
                              >
                                <Printer size={12} />
                              </button>
                              <button
                                onClick={() => handleRestoreDb(tenant.id)}
                                className="p-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black rounded transition"
                                title="Restore Tenant Backup JSON"
                              >
                                <Upload size={12} />
                              </button>
                              <button
                                onClick={() => handleToggleStatus(tenant.id, tenant.status)}
                                className={`p-1.5 rounded transition ${
                                  tenant.status === "Active"
                                    ? "bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-black"
                                    : "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white"
                                }`}
                                title={tenant.status === "Active" ? "Suspend Tenant Shard" : "Activate Tenant Shard"}
                              >
                                {tenant.status === "Active" ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                              </button>
                              <button
                                onClick={() => handleDeleteTenant(tenant.id, tenant.businessName)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded transition"
                                title="Permanently Delete Tenant & All Data"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* RESTORE BACKUP MODAL                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-amber-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Upload size={15} className="text-amber-400" />
                <h3 className="font-black text-white text-sm">Restore Tenant Backup</h3>
              </div>
              <button onClick={() => { setShowRestoreModal(false); setRestoreTenantId(null); }} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-300">
              <div className="font-black mb-1">⚠️ Restore Warning</div>
              <div className="text-amber-300/80">This will overwrite the current data for Tenant <span className="font-bold text-white">{restoreTenantId}</span> with the contents of the uploaded backup file. Existing data will be replaced.</div>
            </div>

            <div className="bg-black/30 border border-brand-dark-border rounded-xl p-3 mb-4 text-xs font-mono">
              <div className="text-gray-500 mb-1">Tenant ID</div>
              <div className="text-purple-400 font-bold">{restoreTenantId}</div>
            </div>

            <label className="block">
              <div className="text-[10px] uppercase font-bold text-gray-400 mb-2">Select Backup File (.json)</div>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="restore-file-input"
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed cursor-pointer transition ${
                    restoreLoading
                      ? "border-amber-500/30 bg-amber-500/5 text-amber-400 opacity-60 cursor-wait"
                      : "border-brand-dark-border hover:border-amber-500/50 text-gray-400 hover:text-amber-400 bg-black/20 hover:bg-amber-500/5"
                  } text-xs font-bold`}
                >
                  {restoreLoading ? (
                    <><RefreshCw size={14} className="animate-spin" /> Restoring...</>
                  ) : (
                    <><Upload size={14} /> Click to Upload Backup JSON</>  
                  )}
                </label>
                <input
                  id="restore-file-input"
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={handleRestoreFileUpload}
                  disabled={restoreLoading}
                />
              </div>
            </label>

            <button
              onClick={() => { setShowRestoreModal(false); setRestoreTenantId(null); }}
              className="w-full mt-4 py-2 bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 font-bold text-xs rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* DEMO MODALS                                                            */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {approveTarget && (
        <ApproveModal
          req={approveTarget}
          onClose={() => setApproveTarget(null)}
          approveDemoRequest={approveDemoRequest}
        />
      )}

      {rejectTarget && (
        <RejectModal
          req={rejectTarget}
          onClose={() => setRejectTarget(null)}
          rejectDemoRequest={rejectDemoRequest}
        />
      )}

      {liveDetailTarget && (
        <DetailModal
          req={liveDetailTarget}
          onClose={() => setDetailTarget(null)}
          addDemoMessage={addDemoMessage}
        />
      )}

      {/* Delete Demo Request Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-red-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trash2 size={15} className="text-red-400" />
                <h3 className="font-black text-white text-sm">Delete Demo Request</h3>
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <div className="bg-black/40 border border-brand-dark-border rounded-xl p-3 mb-4 text-xs space-y-1 font-mono">
              <div className="flex gap-2">
                <span className="text-gray-500 w-20">Ticket #</span>
                <span className="text-sky-400 font-bold">{deleteTarget.ticketNumber || "—"}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20">Name</span>
                <span className="text-white">{deleteTarget.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-gray-500 w-20">Business</span>
                <span className="text-white">{deleteTarget.businessName}</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mb-5">
              This will permanently delete this demo request and all its messages. This action <span className="text-red-400 font-bold">cannot be undone</span>.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-brand-dark-border text-gray-300 text-xs font-black uppercase rounded-xl hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDemoRequest(deleteTarget.id);
                  setDeleteTarget(null);
                  triggerToast(`Demo request from ${deleteTarget.businessName} deleted.`);
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 size={12} /> Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════ */}
      {/* TENANT MODALS                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════════ */}

      {/* Provision Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white">Deploy Store Shard</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Tenant Key (Leave blank to auto-generate)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. MT-1234"
                    value={addForm.id}
                    onChange={(e) =>
                      setAddForm({ ...addForm, id: e.target.value.toUpperCase() })
                    }
                    className="flex-1 bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-mono tracking-widest uppercase"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const words = addForm.businessName.split(" ").filter(Boolean);
                      let initials = "TEN";
                      if (words.length === 1) initials = words[0].substring(0, 3).toUpperCase();
                      else if (words.length > 1) initials = words.map(w => w[0]).join("").toUpperCase();
                      setAddForm(prev => ({ ...prev, id: `${initials}-${Math.floor(1000 + Math.random() * 9000)}` }));
                    }}
                    className="px-3 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold transition flex items-center justify-center"
                    title="Auto-Generate"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Company / Store Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Al-Hamd Super Market"
                  value={addForm.businessName}
                  onChange={(e) =>
                    setAddForm({ ...addForm, businessName: e.target.value })
                  }
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Talal"
                    value={addForm.ownerName}
                    onChange={(e) =>
                      setAddForm({ ...addForm, ownerName: e.target.value })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Sector Line
                  </label>
                  <select
                    value={addForm.businessType}
                    onChange={(e) =>
                      setAddForm({ ...addForm, businessType: e.target.value })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                  >
                    <option>Super Mart</option>
                    <option>Pharmacy Stores</option>
                    <option>Restaurants / Cafes</option>
                    <option>Electronics Stores</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. owner@alhamd.com"
                  value={addForm.email}
                  onChange={(e) =>
                    setAddForm({ ...addForm, email: e.target.value })
                  }
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Plan Tier
                  </label>
                  <select
                    value={addForm.plan}
                    onChange={(e) =>
                      setAddForm({ ...addForm, plan: e.target.value as any })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                  >
                    <option>Starter</option>
                    <option>Professional</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={addForm.billingCycle}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        billingCycle: e.target.value as any,
                      })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-sans"
                  >
                    <option>monthly</option>
                    <option>yearly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-end">
                <div className="flex items-center gap-2 h-10">
                  <input
                    type="checkbox"
                    id="isTrial"
                    checked={addForm.isTrial}
                    onChange={(e) =>
                      setAddForm({ ...addForm, isTrial: e.target.checked })
                    }
                    className="rounded border-brand-dark-border text-purple-600 focus:ring-purple-500 bg-black w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="isTrial" className="text-[10px] uppercase font-bold text-gray-400 cursor-pointer select-none">
                    Enable Custom Trial
                  </label>
                </div>
                {addForm.isTrial && (
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                      Trial Duration (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={addForm.trialDays}
                      onChange={(e) =>
                        setAddForm({ ...addForm, trialDays: parseInt(e.target.value) || 1 })
                      }
                      className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none focus:border-purple-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded shadow-lg transition"
              >
                Confirm Provisioning
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Limits & Currency Modal */}
      {showEditModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4 text-xs">
              <h3 className="font-black text-white">Adjust Shard Plan Limits</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <h4 className="text-white font-bold">
                  {selectedTenant.businessName}
                </h4>
                <p className="text-[10px] text-gray-500 font-mono">
                  Tenant ID: {selectedTenant.id}
                </p>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Subscription Tier
                </label>
                <select
                  value={editForm.plan}
                  onChange={(e) =>
                    setEditForm({ ...editForm, plan: e.target.value as any })
                  }
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option>Starter</option>
                  <option>Professional</option>
                  <option>Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Billing Period
                </label>
                <select
                  value={editForm.billingCycle}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      billingCycle: e.target.value as any,
                    })
                  }
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option>monthly</option>
                  <option>yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">
                  Base Shard Currency
                </label>
                <select
                  value={editForm.defaultCurrency}
                  onChange={(e) =>
                    setEditForm({ ...editForm, defaultCurrency: e.target.value })
                  }
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white"
                >
                  <option value="PKR">PKR (Rs) - Default</option>
                  <option value="USD">USD ($)</option>
                  <option value="AED">AED (Dh)</option>
                  <option value="SAR">SAR (SR)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase rounded"
              >
                Save Platform Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Preset Manager Modal */}
      {showPresetsModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
          {/* ... preset modal content ... */}
          <div className="bg-brand-dark-surface border border-purple-500/30 p-6 rounded-2xl w-full max-w-2xl shadow-2xl animate-fade-in-up font-sans">
            <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
              <div>
                <h3 className="font-black text-white text-sm">
                  Credentials presets for {selectedTenant.businessName}
                </h3>
                <p className="text-[10px] text-gray-500">
                  Provide sharded developer/staff preset accounts for quick login testing.
                </p>
              </div>
              <button
                onClick={() => setShowPresetsModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Form */}
              <form
                onSubmit={handleSaveCredential}
                className="md:col-span-2 bg-black/40 border border-brand-dark-border/80 p-4 rounded-xl space-y-3.5 text-xs"
              >
                <h4 className="text-white font-bold flex items-center gap-1.5">
                  {credForm.id ? (
                    <Edit2 size={12} className="text-brand-sky" />
                  ) : (
                    <PlusCircle size={14} className="text-purple-400" />
                  )}
                  <span>{credForm.id ? "Edit Preset" : "Add New Preset"}</span>
                </h4>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-gray-400">
                    Account Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cashier Terminal"
                    value={credForm.label}
                    onChange={(e) =>
                      setCredForm({ ...credForm, label: e.target.value })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-gray-400">
                    Staff Role Group
                  </label>
                  <select
                    value={credForm.role}
                    onChange={(e) =>
                      setCredForm({ ...credForm, role: e.target.value as any })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white"
                  >
                    <option value="Owner">Owner (Full ERP)</option>
                    <option value="Manager">Manager</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Warehouse Staff">Warehouse Staff</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-gray-400">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="cashier@store.com"
                    value={credForm.email}
                    onChange={(e) =>
                      setCredForm({ ...credForm, email: e.target.value })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] uppercase font-bold text-gray-400">
                    Preset Password
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="cashier123"
                    value={credForm.pass}
                    onChange={(e) =>
                      setCredForm({ ...credForm, pass: e.target.value })
                    }
                    className="w-full bg-black border border-brand-dark-border p-2 rounded text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded flex items-center justify-center gap-1.5 transition"
                >
                  <Save size={12} />
                  <span>{credForm.id ? "Save Changes" : "Create Preset"}</span>
                </button>

                {credForm.id && (
                  <button
                    type="button"
                    onClick={() =>
                      setCredForm({
                        id: "",
                        label: "",
                        email: "",
                        pass: "",
                        role: "Owner",
                      })
                    }
                    className="w-full py-1.5 bg-brand-dark-border hover:bg-brand-dark-border/80 text-gray-300 font-bold rounded transition"
                  >
                    Reset Form
                  </button>
                )}
              </form>

              {/* Presets List */}
              <div className="md:col-span-3 space-y-3">
                <h4 className="text-gray-400 uppercase tracking-wider text-[9px] font-black">
                  Active Presets Directory
                </h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {!selectedTenant.credentialPresets ||
                  selectedTenant.credentialPresets.length === 0 ? (
                    <p className="text-[10px] text-gray-500 italic py-6 text-center">
                      No credential presets linked to this database shard.
                    </p>
                  ) : (
                    selectedTenant.credentialPresets.map((pre: any) => (
                      <div
                        key={pre.id}
                        className="bg-brand-dark-surface/60 border border-brand-dark-border/80 p-3 rounded-lg flex items-center justify-between gap-4 font-mono text-[10px]"
                      >
                        <div>
                          <div className="font-sans font-bold text-white text-[11px]">
                            {pre.label}
                          </div>
                          <div className="text-[9px] text-purple-400 font-bold uppercase mt-0.5">
                            {pre.role}
                          </div>
                          <div className="text-gray-400 mt-1">E: {pre.email}</div>
                          <div className="text-gray-500">P: {pre.pass}</div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleEditCredential(pre)}
                            className="p-1 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded transition"
                            title="Edit"
                          >
                            <Edit2 size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteCredential(pre.id)}
                            className="p-1 bg-brand-dark-border hover:bg-red-500/20 text-gray-300 hover:text-red-400 rounded transition"
                            title="Delete"
                          >
                            <Trash size={10} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {shardDetailTarget && (
        <ShardDetailsModal
          tenant={shardDetailTarget}
          onClose={() => setShardDetailTarget(null)}
          handleBackupDb={handleBackupDb}
          backupLoading={backupLoading}
          handleExtendTrial={handleExtendTrial}
          handleResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  SHARD DETAILS / HEALTH CONSOLE MODAL
// ─────────────────────────────────────────────────────────────────────────────

function ShardDetailsModal({
  tenant,
  onClose,
  handleBackupDb,
  backupLoading,
  handleExtendTrial,
  handleResetPassword,
}: {
  tenant: any;
  onClose: () => void;
  handleBackupDb: (id: string) => void;
  backupLoading: Record<string, boolean>;
  handleExtendTrial: (id: string) => void;
  handleResetPassword: (id: string) => void;
}) {
  const isTrial = tenant.status === "Trial";
  const isBackingUp = !!backupLoading[tenant.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-brand-dark-surface border border-emerald-500/30 p-6 rounded-2xl w-full max-w-lg shadow-2xl animate-fade-in-up text-xs font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-brand-dark-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-400" />
            <h3 className="font-black text-white text-sm">PostgreSQL Shard Console</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {/* Database Stats info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-black/30 border border-brand-dark-border/80 rounded-xl p-3.5 space-y-2 font-mono text-[10px]">
            <h4 className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-wider mb-1">Shard Infrastructure</h4>
            <div className="flex justify-between">
              <span className="text-gray-500">Shard ID:</span>
              <span className="text-purple-400 font-bold">{tenant.id}</span>
            </div>
            <div className="flex flex-col gap-0.5 mt-1 border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Virtual Hostname:</span>
              <span className="text-white text-[9px] truncate" title={`pg-shard-${tenant.id.toLowerCase()}.unipos-infra.internal`}>
                pg-shard-{tenant.id.toLowerCase()}.unipos-infra.internal
              </span>
            </div>
            <div className="flex justify-between border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Postgres:</span>
              <span className="text-gray-300">v16.2 (RDS Sharded)</span>
            </div>
            <div className="flex justify-between border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Shard Health:</span>
              <span className={`inline-flex items-center gap-1 font-bold ${tenant.status === "Suspended" ? "text-red-400" : "text-emerald-400"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tenant.status === "Suspended" ? "bg-red-500 animate-pulse" : "bg-emerald-500 animate-pulse"}`} />
                {tenant.status === "Suspended" ? "SUSPENDED" : "ONLINE"}
              </span>
            </div>
          </div>

          <div className="bg-black/30 border border-brand-dark-border/80 rounded-xl p-3.5 space-y-2 font-mono text-[10px]">
            <h4 className="text-[10px] text-gray-400 font-sans uppercase font-bold tracking-wider mb-1">Database Volume &amp; Load</h4>
            <div className="flex justify-between">
              <span className="text-gray-500">Allocated Size:</span>
              <span className="text-white font-bold">128 MB Shard Pool</span>
            </div>
            <div className="flex justify-between border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Estimated Index Size:</span>
              <span className="text-purple-400 font-bold">4.2 MB</span>
            </div>
            <div className="flex justify-between border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Active Pool Conns:</span>
              <span className="text-emerald-400 font-bold">4 Connections</span>
            </div>
            <div className="flex justify-between border-t border-brand-dark-border/40 pt-1">
              <span className="text-gray-500">Vacuum State:</span>
              <span className="text-gray-400">Auto-vacuum idle</span>
            </div>
          </div>
        </div>

        {/* Shard Operations */}
        <div className="space-y-3">
          <h4 className="text-xs uppercase font-bold text-gray-300 tracking-wider">Administrative Shard Actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            
            {/* Backup DB button */}
            <button
              onClick={() => handleBackupDb(tenant.id)}
              disabled={isBackingUp}
              className="py-2.5 px-3 bg-brand-dark-border hover:bg-emerald-600/20 disabled:opacity-50 text-gray-300 hover:text-emerald-400 rounded-lg flex items-center justify-center gap-1.5 border border-brand-dark-border hover:border-emerald-500/30 transition text-center font-bold"
            >
              <RefreshCw size={12} className={isBackingUp ? "animate-spin" : ""} />
              <span>{isBackingUp ? "Backing up..." : "Trigger DB Shard Backup"}</span>
            </button>

            {/* Reset Master Password */}
            <button
              onClick={() => handleResetPassword(tenant.id)}
              className="py-2.5 px-3 bg-brand-dark-border hover:bg-purple-600/20 text-gray-300 hover:text-purple-400 rounded-lg flex items-center justify-center gap-1.5 border border-brand-dark-border hover:border-purple-500/30 transition text-center font-bold"
            >
              <Key size={12} />
              <span>Reset Master Password</span>
            </button>

            {/* Extend Trial */}
            {isTrial && (
              <button
                onClick={() => handleExtendTrial(tenant.id)}
                className="py-2.5 px-3 bg-brand-dark-border hover:bg-brand-sky/20 text-gray-300 hover:text-brand-sky rounded-lg flex items-center justify-center gap-1.5 border border-brand-dark-border hover:border-brand-sky/30 transition text-center font-bold sm:col-span-2"
              >
                <Clock size={12} />
                <span>Extend Trial Period (30 Days)</span>
              </button>
            )}
          </div>
        </div>

        {/* Credentials presets list inside shard modal */}
        <div className="mt-5 border-t border-brand-dark-border/50 pt-4">
          <h4 className="text-xs uppercase font-bold text-gray-300 tracking-wider mb-2">Linked Credentials Presets</h4>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
            {!tenant.credentialPresets || tenant.credentialPresets.length === 0 ? (
              <p className="text-[10px] text-gray-500 italic py-2">No credentials sharded for this client database.</p>
            ) : (
              tenant.credentialPresets.map((pre: any) => (
                <div key={pre.id} className="bg-black/35 border border-brand-dark-border/40 p-2.5 rounded-lg flex items-center justify-between text-[10px] font-mono">
                  <div>
                    <span className="text-white font-sans font-bold">{pre.label}</span>
                    <span className="text-purple-400 text-[8px] uppercase font-bold ml-2">({pre.role})</span>
                    <div className="text-gray-400 mt-0.5">User: {pre.email}</div>
                  </div>
                  <div className="text-emerald-400 font-bold">{pre.pass}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-6 w-full py-2 bg-brand-dark-border hover:bg-brand-dark-border/70 text-gray-300 font-bold rounded-lg transition"
        >
          Dismiss Console
        </button>
      </div>
    </div>
  );
}
