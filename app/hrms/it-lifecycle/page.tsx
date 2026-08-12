"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import HRMSTopHeader from "@/components/hrms-top-header";
import { useGlobalContext, HREmployee } from "@/context/global-context";
import {
  ShieldAlert,
  Key,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Lock,
  Unlock,
  CreditCard,
  Cloud,
  X,
  Sparkles,
  UserX,
  UserCheck
} from "lucide-react";

interface SoftwareLicense {
  id: string;
  name: string;
  vendor: string;
  category: "Productivity" | "Design" | "Cloud / POS" | "Security" | "Communication";
  seatsTotal: number;
  seatsUsed: number;
  annualCost: number;
  renewalDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
  licenseKey?: string;
  notes?: string;
}

export default function ITLifecyclePage() {
  const { currentUser, hrEmployees, updateHREmployee, currencySymbol } = useGlobalContext();
  const [activeTab, setActiveTab] = useState<"identity" | "licenses">("identity");
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [showAddLicenseModal, setShowAddLicenseModal] = useState(false);
  const [offboardingTarget, setOffboardingTarget] = useState<HREmployee | null>(null);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_saas_licenses_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed: SoftwareLicense[] = JSON.parse(saved);
          const filtered = parsed.filter(l => l.id !== "LIC-1" && l.id !== "LIC-2" && l.id !== "LIC-3" && l.id !== "LIC-4");
          setLicenses(filtered);
          if (filtered.length !== parsed.length) {
            localStorage.setItem(key, JSON.stringify(filtered));
          }
        } catch {
          setLicenses([]);
        }
      } else {
        setLicenses([]);
      }
    }
  }, [currentUser?.tenantId]);

  const saveLicenses = (data: SoftwareLicense[]) => {
    setLicenses(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_saas_licenses_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const handleExecuteKillSwitch = (emp: HREmployee) => {
    updateHREmployee(emp.id, {
      status: "Inactive",
      posAccessBlocked: true,
      itAccessRevokedAt: new Date().toISOString()
    } as any);

    setOffboardingTarget(null);
    triggerToast(`🚨 Kill-Switch Executed! All POS logins and credentials revoked for ${emp.name}.`);
  };

  const [licenseForm, setLicenseForm] = useState({
    name: "",
    vendor: "",
    category: "Productivity" as SoftwareLicense["category"],
    seatsTotal: 5,
    seatsUsed: 1,
    annualCost: 500,
    renewalDate: new Date().toISOString().split("T")[0],
    licenseKey: "",
    notes: ""
  });

  const handleAddLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const newLic: SoftwareLicense = {
      id: `LIC-${Date.now()}`,
      name: licenseForm.name,
      vendor: licenseForm.vendor,
      category: licenseForm.category,
      seatsTotal: Number(licenseForm.seatsTotal) || 1,
      seatsUsed: Number(licenseForm.seatsUsed) || 0,
      annualCost: Number(licenseForm.annualCost) || 0,
      renewalDate: licenseForm.renewalDate,
      status: "Active",
      licenseKey: licenseForm.licenseKey,
      notes: licenseForm.notes
    };

    saveLicenses([newLic, ...licenses]);
    setShowAddLicenseModal(false);
    setLicenseForm({
      name: "",
      vendor: "",
      category: "Productivity",
      seatsTotal: 5,
      seatsUsed: 1,
      annualCost: 500,
      renewalDate: new Date().toISOString().split("T")[0],
      licenseKey: "",
      notes: ""
    });
    triggerToast("✅ Software license recorded in vault!");
  };

  const handleDeleteLicense = (id: string, name: string) => {
    if (confirm(`Delete license record for "${name}"?`)) {
      const updated = licenses.filter((l) => l.id !== id);
      saveLicenses(updated);
      triggerToast(`🗑️ License "${name}" deleted!`);
    }
  };

  const filteredEmployees = useMemo(() => {
    return hrEmployees.filter((emp) => {
      const q = searchQuery.toLowerCase();
      return (
        q === "" ||
        emp.name.toLowerCase().includes(q) ||
        emp.employeeCode.toLowerCase().includes(q) ||
        emp.department.toLowerCase().includes(q)
      );
    });
  }, [hrEmployees, searchQuery]);

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow overflow-y-auto h-full relative">
        {/* Toast */}
        {toastMsg && (
          <div className="fixed top-6 right-6 z-50 bg-emerald-500 text-black px-4 py-2.5 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce border border-emerald-400/50">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <HRMSTopHeader
          title="🔐 IT Identity Lifecycle & SaaS License Manager"
          subtitle="1-Click employee credential provisioning, offboarding kill-switch, and SaaS subscription tracking."
        />

        <div className="p-6 space-y-6">
          {/* Top Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Active Credentials</p>
              <p className="text-2xl font-black text-emerald-400">
                {hrEmployees.filter((e) => e.status === "Active").length} Users
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">POS &amp; System Access Active</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Revoked / Offboarded</p>
              <p className="text-2xl font-black text-red-400">
                {hrEmployees.filter((e) => e.status !== "Active").length} Locked
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Zero Residual Risk</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Managed Software</p>
              <p className="text-2xl font-black text-sky-400">{licenses.length} Apps</p>
              <p className="text-[10px] text-gray-500 mt-0.5">SaaS Subscriptions</p>
            </div>

            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-4.5">
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider mb-1">Total SaaS Budget</p>
              <p className="text-2xl font-black text-amber-400">
                {currencySymbol || "$"}{licenses.reduce((acc, l) => acc + l.annualCost, 0).toLocaleString()} / yr
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">Annual Software Cost</p>
            </div>
          </div>

          {/* Tab Switcher & Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("identity")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === "identity"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                <Key size={14} /> Identity Lifecycle &amp; Kill-Switch
              </button>
              <button
                onClick={() => setActiveTab("licenses")}
                className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer ${
                  activeTab === "licenses"
                    ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                }`}
              >
                <Cloud size={14} /> Software &amp; SaaS Licenses ({licenses.length})
              </button>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {activeTab === "identity" ? (
                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAddLicenseModal(true)}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-3.5 py-2 rounded-xl transition shadow cursor-pointer"
                >
                  <Plus size={14} /> Add SaaS License
                </button>
              )}
            </div>
          </div>

          {/* TAB 1: Identity Lifecycle & Kill-Switch */}
          {activeTab === "identity" && (
            <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-black/40 text-[10px] text-gray-500 uppercase tracking-wider font-mono border-b border-gray-800">
                      <th className="p-3.5">Employee</th>
                      <th className="p-3.5">Department</th>
                      <th className="p-3.5">POS Security Status</th>
                      <th className="p-3.5">IT Provisioning</th>
                      <th className="p-3.5 text-right">Offboarding Kill-Switch</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/60">
                    {filteredEmployees.map((emp) => {
                      const isActive = emp.status === "Active";

                      return (
                        <tr key={emp.id} className="hover:bg-emerald-500/5 transition">
                          <td className="p-3.5">
                            <div className="font-bold text-white">{emp.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              {emp.employeeCode} &bull; {emp.email || "No email"}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="text-gray-300">{emp.department}</span>
                            <div className="text-[10px] text-gray-500 font-mono">{emp.designation}</div>
                          </td>
                          <td className="p-3.5">
                            {isActive ? (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full w-fit">
                                <Unlock size={11} /> POS Active &amp; Valid
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full w-fit">
                                <Lock size={11} /> Access Terminated
                              </span>
                            )}
                          </td>
                          <td className="p-3.5">
                            <span className="text-[10px] font-mono text-gray-400">
                              {emp.joiningDate ? `Provisioned on ${emp.joiningDate}` : "Standard Profile"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            {isActive ? (
                              <button
                                onClick={() => setOffboardingTarget(emp)}
                                className="flex items-center gap-1.5 text-[11px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-600 border border-red-500/30 px-3 py-1.5 rounded-lg transition ml-auto cursor-pointer"
                              >
                                <ShieldAlert size={13} /> Trigger Kill-Switch
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-500 italic">Offboarded &bull; Locked</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: Software & SaaS Licenses */}
          {activeTab === "licenses" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {licenses.map((lic) => {
                const percent = Math.round((lic.seatsUsed / lic.seatsTotal) * 100);

                return (
                  <div
                    key={lic.id}
                    className="bg-[#0b0f17] border border-gray-800 hover:border-sky-500/40 rounded-2xl p-5 space-y-4 transition group shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                          {lic.category}
                        </span>
                        <h3 className="text-sm font-extrabold text-white mt-1 group-hover:text-sky-400 transition">
                          {lic.name}
                        </h3>
                        <p className="text-[11px] text-gray-500 font-mono">{lic.vendor}</p>
                      </div>

                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                          lic.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : lic.status === "Expiring Soon"
                            ? "bg-amber-500/10 text-amber-400 animate-pulse"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {lic.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">Seats Utilization:</span>
                        <span className="text-white font-bold">
                          {lic.seatsUsed} / {lic.seatsTotal} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percent > 90 ? "bg-amber-500" : "bg-sky-500"
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-xs font-mono border-t border-gray-800/80 pt-3 text-gray-400">
                      <div className="flex justify-between">
                        <span>Annual Cost:</span>{" "}
                        <span className="text-emerald-400 font-bold">{currencySymbol || "$"}{lic.annualCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Renewal Date:</span> <span className="text-white">{lic.renewalDate}</span>
                      </div>
                      {lic.licenseKey && (
                        <div className="flex justify-between">
                          <span>Key Vault:</span> <span className="text-gray-500 font-mono">{lic.licenseKey}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-800/80 flex justify-end">
                      <button
                        onClick={() => handleDeleteLicense(lic.id, lic.name)}
                        className="text-gray-500 hover:text-red-400 p-1 rounded transition cursor-pointer"
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Kill Switch Confirmation Modal */}
      {offboardingTarget && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-red-500/50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-base font-black text-white">Trigger Offboarding Kill-Switch</h3>
                <p className="text-xs text-red-400 font-mono">Emergency Credential Revocation</p>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/20 p-3.5 rounded-xl text-xs text-gray-300 space-y-2">
              <p>
                You are about to permanently revoke all access for <strong>{offboardingTarget.name}</strong> ({offboardingTarget.employeeCode}).
              </p>
              <ul className="list-disc list-inside space-y-1 text-red-300 font-mono text-[11px]">
                <li>POS Cashier PIN &amp; login immediately disabled.</li>
                <li>Cloud active session tokens invalidated.</li>
                <li>Status switched to Inactive / Terminated.</li>
              </ul>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setOffboardingTarget(null)}
                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecuteKillSwitch(offboardingTarget)}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-red-950/60 cursor-pointer text-xs"
              >
                Confirm Revoke Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add SaaS License Modal */}
      {showAddLicenseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-sky-500/30 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-800 bg-sky-500/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Cloud size={16} className="text-sky-400" />
                Register Software / SaaS License
              </h2>
              <button onClick={() => setShowAddLicenseModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddLicense} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Software / Service Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Microsoft 365, Canva Pro, Figma"
                  value={licenseForm.name}
                  onChange={(e) => setLicenseForm({ ...licenseForm, name: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Vendor</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Microsoft, Adobe"
                    value={licenseForm.vendor}
                    onChange={(e) => setLicenseForm({ ...licenseForm, vendor: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Category</label>
                  <select
                    value={licenseForm.category}
                    onChange={(e) => setLicenseForm({ ...licenseForm, category: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500 cursor-pointer"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Design">Design</option>
                    <option value="Cloud / POS">Cloud / POS</option>
                    <option value="Security">Security</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Total Seats / Users</label>
                  <input
                    type="number"
                    value={licenseForm.seatsTotal}
                    onChange={(e) => setLicenseForm({ ...licenseForm, seatsTotal: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Annual Cost ({currencySymbol || "$"})</label>
                  <input
                    type="number"
                    value={licenseForm.annualCost}
                    onChange={(e) => setLicenseForm({ ...licenseForm, annualCost: Number(e.target.value) })}
                    className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">Renewal Expiry Date</label>
                <input
                  type="date"
                  value={licenseForm.renewalDate}
                  onChange={(e) => setLicenseForm({ ...licenseForm, renewalDate: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-400 font-bold uppercase mb-1">License Key / Account ID</label>
                <input
                  type="text"
                  placeholder="Optional License or Account Serial"
                  value={licenseForm.licenseKey}
                  onChange={(e) => setLicenseForm({ ...licenseForm, licenseKey: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white rounded-xl p-2.5 focus:border-sky-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddLicenseModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl transition shadow-lg shadow-sky-950/50 cursor-pointer"
                >
                  Save License
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
