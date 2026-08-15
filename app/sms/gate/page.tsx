"use client";

import React, { useState } from "react";
import { useSMS, GateVisitor, StudentRecord } from "@/context/sms-context";
import {
  ShieldAlert,
  Plus,
  Printer,
  QrCode,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  ScanLine,
  X,
  Phone,
  Car
} from "lucide-react";

export default function SMSGatePage() {
  const { students, gateVisitors, gatePunchLogs, registerGateVisitor, checkoutGateVisitor, punchGateCard } = useSMS();

  const [activeTab, setActiveTab] = useState<"scanner" | "visitors" | "logs">("scanner");
  const [rfidInput, setRfidInput] = useState("");
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [punchToast, setPunchToast] = useState<{ name: string; time: string; type: string } | null>(null);

  // New Visitor Form State
  const [vForm, setVForm] = useState({
    fullName: "",
    cnic: "",
    phone: "",
    purpose: "Meeting Principal" as const,
    personToMeet: "Prof. Muhammad Aslam (Principal)",
    vehicleNo: "",
    badgeNumber: `BADGE-${Math.floor(10 + Math.random() * 90)}`
  });

  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfidInput) return;

    const matched = students.find(
      (s) =>
        s.admissionNo.toLowerCase() === rfidInput.trim().toLowerCase() ||
        s.rollNo === rfidInput.trim() ||
        s.firstName.toLowerCase().includes(rfidInput.trim().toLowerCase())
    );

    if (matched) {
      punchGateCard(matched.id, "Entry (Morning Gate)");
      setPunchToast({
        name: `${matched.firstName} ${matched.lastName}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "Gate Entry Stamped"
      });
      setRfidInput("");
      setTimeout(() => setPunchToast(null), 4500);
    } else {
      alert("No student found with this Card / ID #.");
    }
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vForm.fullName || !vForm.phone) return;

    const newVis = registerGateVisitor(vForm);
    setShowVisitorModal(false);
    handlePrintVisitorPass(newVis);
  };

  const handlePrintVisitorPass = (v: GateVisitor) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Gate Visitor Pass - ${v.visitorPassNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 20px; display: flex; justify-content: center; }
    .badge { width: 340px; border: 2px dashed #0284c7; padding: 20px; border-radius: 12px; }
    .header { text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 10px; margin-bottom: 15px; }
    .school { font-size: 14px; font-weight: 900; color: #0284c7; }
    .pass-title { font-size: 16px; font-weight: 900; text-transform: uppercase; color: #0f172a; margin-top: 4px; }
    .pass-no { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: #dc2626; font-weight: bold; }
    .row { display: flex; justify-content: space-between; font-size: 11px; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
    .label { color: #64748b; font-weight: 600; }
    .val { color: #0f172a; font-weight: 800; }
    .badge-box { background: #0f172a; color: #38bdf8; text-align: center; padding: 8px; font-size: 14px; font-weight: 900; border-radius: 6px; margin: 15px 0 10px; }
    .footer { text-align: center; font-size: 9px; color: #64748b; margin-top: 15px; }
    @media print { .no-print { display: none; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 10px; right: 10px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer;">🖨️ Print Pass</button>
  </div>
  <div class="badge">
    <div class="header">
      <div class="school">MT CORE MODEL SCHOOL</div>
      <div class="pass-title">OFFICIAL VISITOR GATE PASS</div>
      <div class="pass-no">Pass #: ${v.visitorPassNo}</div>
    </div>

    <div class="row"><span class="label">Visitor Name:</span><span class="val">${v.fullName}</span></div>
    <div class="row"><span class="label">CNIC / ID:</span><span class="val">${v.cnic}</span></div>
    <div class="row"><span class="label">Phone:</span><span class="val">${v.phone}</span></div>
    <div class="row"><span class="label">Purpose:</span><span class="val">${v.purpose}</span></div>
    <div class="row"><span class="label">Person to Meet:</span><span class="val">${v.personToMeet}</span></div>
    <div class="row"><span class="label">Check-In Time:</span><span class="val">${v.checkInTime}</span></div>
    ${v.vehicleNo ? `<div class="row"><span class="label">Vehicle #:</span><span class="val">${v.vehicleNo}</span></div>` : ''}

    <div class="badge-box">SECURITY TOKEN: ${v.badgeNumber}</div>
    <div style="font-size: 9px; color: #dc2626; font-weight: bold; text-align: center;">Please return this pass at Main Security Gate before exit.</div>
    <div class="footer">Gate Security Stamped • Session 2025-2026</div>
  </div>
</body>
</html>`;

    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {punchToast && (
        <div className="fixed top-20 right-8 z-50 bg-sky-600 text-white font-bold text-xs py-3.5 px-6 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce border border-sky-300">
          <ScanLine size={18} className="animate-spin" />
          <div>
            <div className="font-black text-sm">{punchToast.name}</div>
            <div className="text-[10px] text-sky-100">{punchToast.type} at {punchToast.time} • WhatsApp Alert Dispatched</div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
            <ShieldAlert className="text-sky-400" size={22} />
            <span>Smart Gate Security, RFID Turnstile &amp; Visitor Desk</span>
          </h1>
          <p className="text-xs text-gray-400">
            Real-time student card gate punch logging with automated WhatsApp parent notifications and printable visitor passes.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowVisitorModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Issue Visitor Pass</span>
          </button>
        </div>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* RFID Tap Scanner Simulator */}
        <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sky-400 font-black text-sm border-b border-gray-800 pb-3">
            <ScanLine size={16} />
            <span>Turnstile RFID / Barcode Scanner</span>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-4 text-xs">
            <div className="p-4 bg-black/60 border border-sky-500/30 rounded-2xl text-center space-y-2">
              <div className="w-14 h-14 bg-sky-500/10 border border-sky-500/30 rounded-2xl flex items-center justify-center mx-auto text-sky-400">
                <QrCode size={28} className="animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white">Tap Card / Barcode Scanner</div>
              <div className="text-[10px] text-gray-400">Scan student PVC card or type Admission ID / Name</div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">
                Scan / Enter Student ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ADM-2026-0041 or Ahmed"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                className="w-full bg-black border border-gray-800 p-3 rounded-xl text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-sky-600/20 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Stamp Gate Punch &amp; Alert Parent</span>
            </button>
          </form>
        </div>

        {/* Real-time Gate In/Out Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visitors Inside Campus */}
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
              <h3 className="font-black text-white text-xs uppercase tracking-wider">
                Active Campus Visitors ({gateVisitors.filter((v) => v.status === "Inside Campus").length} Inside)
              </h3>
              <span className="text-[10px] text-sky-400 font-mono">Security Checkpoint 1</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                    <th className="p-3 font-bold">Pass #</th>
                    <th className="p-3 font-bold">Visitor Name</th>
                    <th className="p-3 font-bold">CNIC</th>
                    <th className="p-3 font-bold">Purpose</th>
                    <th className="p-3 font-bold">Person to Meet</th>
                    <th className="p-3 font-bold">In Time</th>
                    <th className="p-3 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 font-mono text-[10px]">
                  {gateVisitors.map((v) => (
                    <tr key={v.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3 font-bold text-sky-400">{v.visitorPassNo}</td>
                      <td className="p-3 font-sans font-bold text-white">{v.fullName}</td>
                      <td className="p-3 text-gray-400">{v.cnic}</td>
                      <td className="p-3 font-sans text-gray-300">{v.purpose}</td>
                      <td className="p-3 font-sans text-emerald-400 font-bold">{v.personToMeet}</td>
                      <td className="p-3 text-gray-300">{v.checkInTime}</td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handlePrintVisitorPass(v)}
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white rounded-lg transition"
                            title="Print Visitor Pass Badge"
                          >
                            <Printer size={12} />
                          </button>
                          {v.status === "Inside Campus" && (
                            <button
                              onClick={() => checkoutGateVisitor(v.id)}
                              className="px-2 py-0.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded font-bold text-[9px]"
                            >
                              Check Out
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Gate Card Punches Log */}
          <div className="bg-[#0b121e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-black/40">
              <h3 className="font-black text-white text-xs uppercase tracking-wider">
                Today's Student Gate Turnstile Feed ({gatePunchLogs.length})
              </h3>
              <span className="text-[10px] text-emerald-400 font-mono">Live Gate Sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-mono text-[10px] bg-black/20">
                    <th className="p-3 font-bold">Admission ID</th>
                    <th className="p-3 font-bold">Student Name</th>
                    <th className="p-3 font-bold">Class &amp; Section</th>
                    <th className="p-3 font-bold">Turnstile Event</th>
                    <th className="p-3 font-bold">Time</th>
                    <th className="p-3 font-bold text-center">Parent Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50 font-mono text-[10px]">
                  {gatePunchLogs.map((p) => (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition">
                      <td className="p-3 font-bold text-sky-400">{p.admissionNo}</td>
                      <td className="p-3 font-sans font-bold text-white">{p.studentName}</td>
                      <td className="p-3 font-sans text-gray-300">{p.className}</td>
                      <td className="p-3 font-sans text-emerald-400 font-bold">{p.punchType}</td>
                      <td className="p-3 text-white">{p.timestamp}</td>
                      <td className="p-3 text-center">
                        <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                          ✓ {p.alertStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Visitor Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-[#0b121e] border border-sky-500/40 rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className="text-sky-400" />
                <h3 className="font-black text-white text-sm">Issue Gate Visitor Pass</h3>
              </div>
              <button onClick={() => setShowVisitorModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Tariq"
                  value={vForm.fullName}
                  onChange={(e) => setVForm({ ...vForm, fullName: e.target.value })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">CNIC Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="35201-xxxxxxx-x"
                    value={vForm.cnic}
                    onChange={(e) => setVForm({ ...vForm, cnic: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={vForm.phone}
                    onChange={(e) => setVForm({ ...vForm, phone: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-sky-400 mb-1">Purpose of Visit</label>
                <select
                  value={vForm.purpose}
                  onChange={(e) => setVForm({ ...vForm, purpose: e.target.value as any })}
                  className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                >
                  <option value="Meeting Principal">Meeting Principal</option>
                  <option value="Fee Deposit">Fee Deposit / Accounts</option>
                  <option value="Admission Enquiry">Admission Enquiry</option>
                  <option value="Student Pickup">Emergency Student Pickup</option>
                  <option value="Vendor / Contractor">Vendor / Contractor Delivery</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Person to Meet</label>
                  <input
                    type="text"
                    value={vForm.personToMeet}
                    onChange={(e) => setVForm({ ...vForm, personToMeet: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Vehicle # (Optional)</label>
                  <input
                    type="text"
                    placeholder="LEA-2024"
                    value={vForm.vehicleNo}
                    onChange={(e) => setVForm({ ...vForm, vehicleNo: e.target.value })}
                    className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition text-xs flex items-center justify-center gap-2"
              >
                <Printer size={15} />
                <span>Issue &amp; Print Official Pass</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
