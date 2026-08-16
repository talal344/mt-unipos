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
  const { theme, students, gateVisitors, gatePunchLogs, registerGateVisitor, checkoutGateVisitor, punchGateCard } = useSMS();
  const isLight = theme === "light";

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
      const isMorning = new Date().getHours() < 12;
      const type = isMorning ? "IN" : "OUT";
      punchGateCard(matched.id, type);

      setPunchToast({
        name: `${matched.firstName} ${matched.lastName}`,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: type === "IN" ? "Gate IN Entry" : "Gate OUT Exit"
      });

      setRfidInput("");
      setTimeout(() => setPunchToast(null), 3500);
    } else {
      alert("No student match found for this barcode / ID!");
    }
  };

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vForm.fullName || !vForm.cnic) return;

    const created = registerGateVisitor(vForm);
    setShowVisitorModal(false);
    handlePrintVisitorPass(created);
    setVForm({
      fullName: "",
      cnic: "",
      phone: "",
      purpose: "Meeting Principal",
      personToMeet: "Prof. Muhammad Aslam (Principal)",
      vehicleNo: "",
      badgeNumber: `BADGE-${Math.floor(10 + Math.random() * 90)}`
    });
  };

  const handlePrintVisitorPass = (v: GateVisitor) => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Security Visitor Gate Pass - ${v.visitorPassNo}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #ffffff; color: #0f172a; padding: 20px; display: flex; justify-content: center; }
    .badge { width: 340px; border: 2px solid #000; border-radius: 12px; overflow: hidden; padding: 15px; }
    .head { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 10px; }
    .school { font-size: 14px; font-weight: 900; }
    .tag { background: #dc2626; color: white; display: inline-block; padding: 2px 10px; font-size: 10px; font-weight: 900; border-radius: 4px; margin-top: 4px; text-transform: uppercase; }
    .details { font-size: 11px; margin-bottom: 12px; }
    .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dotted #cbd5e1; }
    .qr { text-align: center; background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px; font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: bold; border-radius: 6px; }
    .footer { text-align: center; font-size: 8px; color: #64748b; margin-top: 10px; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print" style="position: absolute; top: 10px; right: 10px;">
    <button onclick="window.print()" style="background: #0284c7; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer;">🖨️ Print Pass</button>
  </div>
  <div class="badge">
    <div class="head">
      <div class="school">MT CORE MODEL SCHOOL</div>
      <div class="tag">OFFICIAL VISITOR PASS</div>
    </div>
    <div class="details">
      <div class="row"><span>Pass Number:</span><b>${v.visitorPassNo}</b></div>
      <div class="row"><span>Visitor Name:</span><b>${v.fullName}</b></div>
      <div class="row"><span>CNIC:</span><span>${v.cnic}</span></div>
      <div class="row"><span>Person to Meet:</span><b>${v.personToMeet}</b></div>
      <div class="row"><span>Purpose:</span><span>${v.purpose}</span></div>
      <div class="row"><span>Check-In Time:</span><b>${v.checkInTime}</b></div>
      <div class="row"><span>Badge Assigned:</span><b style="color: #0284c7;">${v.badgeNumber}</b></div>
    </div>
    <div class="qr">PASS CODE: ${v.visitorPassNo} &bull; GATE 01</div>
    <div class="footer">Please return this visitor pass at the main security gate upon exit.</div>
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
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <ShieldAlert className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Smart Gate Security, RFID Turnstile &amp; Visitor Desk</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
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
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
          <div className={`flex items-center gap-2 ${isLight ? "text-sky-700" : "text-sky-400"} font-black text-sm border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
            <ScanLine size={16} />
            <span>Turnstile RFID / Barcode Scanner</span>
          </div>

          <form onSubmit={handleSimulateScan} className="space-y-4 text-xs">
            <div className={`p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-black/60 border-sky-500/30"} border rounded-2xl text-center space-y-2`}>
              <div className={`w-14 h-14 ${
                isLight ? "bg-sky-100 text-sky-700 border-sky-300" : "bg-sky-500/10 text-sky-400 border-sky-500/30"
              } border rounded-2xl flex items-center justify-center mx-auto`}>
                <QrCode size={28} className="animate-pulse" />
              </div>
              <div className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>Tap Card / Barcode Scanner</div>
              <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>Scan student PVC card or type Admission ID / Name</div>
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>
                Scan / Enter Student ID
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ADM-2026-0041 or Ahmed"
                value={rfidInput}
                onChange={(e) => setRfidInput(e.target.value)}
                className={`w-full ${
                  isLight ? "bg-white border-slate-300 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                } border p-3 rounded-xl font-mono font-bold text-center text-sm focus:outline-none focus:border-sky-500`}
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
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-xl`}>
            <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
                Active Campus Visitors ({gateVisitors.filter((v) => v.status === "Inside Campus").length} Inside)
              </h3>
              <span className={`text-[10px] ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} font-mono`}>Security Checkpoint 1</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                    <th className="p-3 font-bold">Pass #</th>
                    <th className="p-3 font-bold">Visitor Name</th>
                    <th className="p-3 font-bold">CNIC</th>
                    <th className="p-3 font-bold">Purpose</th>
                    <th className="p-3 font-bold">Person to Meet</th>
                    <th className="p-3 font-bold">In Time</th>
                    <th className="p-3 font-bold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
                  {gateVisitors.map((v) => (
                    <tr key={v.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      <td className={`p-3 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{v.visitorPassNo}</td>
                      <td className={`p-3 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{v.fullName}</td>
                      <td className={`p-3 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{v.cnic}</td>
                      <td className={`p-3 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{v.purpose}</td>
                      <td className={`p-3 font-sans ${isLight ? "text-emerald-700" : "text-emerald-400"} font-bold`}>{v.personToMeet}</td>
                      <td className={`p-3 ${isLight ? "text-slate-700" : "text-gray-300"}`}>{v.checkInTime}</td>
                      <td className="p-3 text-center">
                        <div className="flex gap-1.5 justify-center">
                          <button
                            onClick={() => handlePrintVisitorPass(v)}
                            className={`p-1.5 ${
                              isLight ? "bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200" : "bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-white"
                            } rounded-lg transition cursor-pointer`}
                            title="Print Visitor Pass Badge"
                          >
                            <Printer size={12} />
                          </button>
                          {v.status === "Inside Campus" && (
                            <button
                              onClick={() => checkoutGateVisitor(v.id)}
                              className={`px-2 py-0.5 ${
                                isLight ? "bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200" : "bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white"
                              } rounded font-bold text-[9px] cursor-pointer`}
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
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-xl`}>
            <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
                Today's Student Gate Turnstile Feed ({gatePunchLogs.length})
              </h3>
              <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-mono`}>Live Gate Sync</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                    <th className="p-3 font-bold">Admission ID</th>
                    <th className="p-3 font-bold">Student Name</th>
                    <th className="p-3 font-bold">Class &amp; Section</th>
                    <th className="p-3 font-bold">Turnstile Event</th>
                    <th className="p-3 font-bold">Time</th>
                    <th className="p-3 font-bold text-center">Parent Alert</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[10px]`}>
                  {gatePunchLogs.map((p) => (
                    <tr key={p.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      <td className={`p-3 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{p.admissionNo}</td>
                      <td className={`p-3 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{p.studentName}</td>
                      <td className={`p-3 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{p.className}</td>
                      <td className={`p-3 font-sans ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-bold`}>{p.punchType}</td>
                      <td className={`p-3 ${isLight ? "text-slate-900" : "text-white"}`}>{p.timestamp}</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] ${
                          isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        } border px-2 py-0.5 rounded font-bold`}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <div className="flex items-center gap-2">
                <ShieldAlert size={16} className={isLight ? "text-sky-600" : "text-sky-400"} />
                <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Issue Gate Visitor Pass</h3>
              </div>
              <button onClick={() => setShowVisitorModal(false)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleVisitorSubmit} className="space-y-4 text-xs">
              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Visitor Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Tariq"
                  value={vForm.fullName}
                  onChange={(e) => setVForm({ ...vForm, fullName: e.target.value })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>CNIC Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="35201-xxxxxxx-x"
                    value={vForm.cnic}
                    onChange={(e) => setVForm({ ...vForm, cnic: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="0300-1234567"
                    value={vForm.phone}
                    onChange={(e) => setVForm({ ...vForm, phone: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:outline-none`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Purpose of Visit</label>
                <select
                  value={vForm.purpose}
                  onChange={(e) => setVForm({ ...vForm, purpose: e.target.value as any })}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold focus:outline-none`}
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
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Person to Meet</label>
                  <input
                    type="text"
                    value={vForm.personToMeet}
                    onChange={(e) => setVForm({ ...vForm, personToMeet: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:outline-none`}
                  />
                </div>
                <div>
                  <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Vehicle # (Optional)</label>
                  <input
                    type="text"
                    placeholder="LEA-2024"
                    value={vForm.vehicleNo}
                    onChange={(e) => setVForm({ ...vForm, vehicleNo: e.target.value })}
                    className={`w-full ${
                      isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                    } border p-2.5 rounded-xl focus:outline-none`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-sky-600/20"
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
