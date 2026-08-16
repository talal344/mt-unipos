"use client";

import React, { useState } from "react";
import { useSMS, WhatsAppLog } from "@/context/sms-context";
import {
  MessageSquare,
  Send,
  Sparkles,
  CheckCircle2,
  Phone,
  Search,
  Filter,
  Users,
  CreditCard,
  Award,
  AlertCircle,
  Clock,
  ExternalLink
} from "lucide-react";

export default function SMSWhatsAppPage() {
  const { theme, students, feeVouchers, marks, whatsappLogs, sendWhatsAppAlert } = useSMS();
  const isLight = theme === "light";

  const [selectedCategory, setSelectedCategory] = useState<WhatsAppLog["category"]>("Absence Alert");
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [customMsg, setCustomMsg] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const targetStudent = students.find((s) => s.id === selectedStudentId) || students[0];

  const templates: Record<WhatsAppLog["category"], (s: any) => string> = {
    "Absence Alert": (s) =>
      `Assalam-o-Alaikum Respected Parent, this is an automated attendance notice from MT Core Model School. Your child ${s?.firstName} ${s?.lastName} (Roll #${s?.rollNo}, ${s?.className}) is marked ABSENT today (${new Date().toLocaleDateString()}). If this is due to illness, please submit a formal leave application. Helpline: 042-35789011.`,
    "Fee Voucher": (s) =>
      `Assalam-o-Alaikum Respected Parent, Monthly Fee Challan for ${s?.firstName} ${s?.lastName} (ID: ${s?.admissionNo}, ${s?.className}) amounting to Rs ${s?.customMonthlyFee || 18500} has been issued. Due Date: 10th of this month. Please deposit at any Meezan / HBL branch or via online banking.`,
    "Result Declared": (s) =>
      `Alhamdulillah! Examination Results for Midterm 2026 have been announced. Your child ${s?.firstName} ${s?.lastName} (${s?.className}) secured 1st Position with Grade A+ (98%). Digital progress report is available on the Parent Portal.`,
    "Event Notice": (s) =>
      `Respected Parents, MT Core Model School cordially invites you to the Annual Science Exhibition & Declamation Gala on Saturday at 10:00 AM in the Central Auditorium. Attendance is requested.`,
    "Disciplinary": (s) =>
      `Respected Parent, this is a formal notice regarding ${s?.firstName}'s classroom conduct today. Please contact the Class Incharge (Sir Shahid Mehmood) tomorrow between 09:00 AM - 10:00 AM.`
  };

  const currentPreview = customMsg || (targetStudent ? templates[selectedCategory](targetStudent) : "");

  const handleSend = () => {
    if (!targetStudent?.fatherPhone) {
      alert("No father/guardian phone number found for this student.");
      return;
    }

    sendWhatsAppAlert(
      targetStudent.fatherPhone,
      targetStudent.fatherName,
      selectedCategory,
      currentPreview,
      targetStudent.admissionNo
    );

    // Open WhatsApp Web Link with prefilled text
    const cleanPhone = targetStudent.fatherPhone.replace(/\D/g, "").replace(/^0/, "92");
    const encodedText = encodeURIComponent(currentPreview);
    window.open(`https://wa.me/${cleanPhone}?text=${encodedText}`, "_blank");

    setToastMsg(`✅ WhatsApp alert queued for ${targetStudent.fatherName} (${targetStudent.fatherPhone})!`);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <MessageSquare className={isLight ? "text-emerald-600" : "text-emerald-400"} size={22} />
            <span>Automated WhatsApp &amp; SMS Broadcast Gateway</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Dispatch instant WhatsApp notifications to parents for morning absences, monthly fee challans, exam results, and emergency school circulars.
          </p>
        </div>

        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${
          isLight ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
        } border text-xs font-bold font-mono`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          WhatsApp API Connected
        </span>
      </div>

      {/* Dispatcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Message Composer */}
        <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-6 space-y-4`}>
          <div className={`flex items-center gap-2 ${isLight ? "text-emerald-700" : "text-emerald-400"} font-black text-sm border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3`}>
            <Sparkles size={16} />
            <span>Broadcast Composer</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Message Category / Template</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as any);
                  setCustomMsg("");
                }}
                className={`w-full ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                } border p-2.5 rounded-xl font-bold focus:outline-none focus:border-emerald-500`}
              >
                <option value="Absence Alert">🚨 Daily Absence Alert</option>
                <option value="Fee Voucher">💳 Fee Challan Due Reminder</option>
                <option value="Result Declared">🏆 Terminal Exam Result Notification</option>
                <option value="Event Notice">📢 School Circular &amp; Holiday Notice</option>
                <option value="Disciplinary">⚠️ Disciplinary Meeting Notice</option>
              </select>
            </div>

            <div>
              <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} mb-1`}>Select Student Target</label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setCustomMsg("");
                }}
                className={`w-full ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                } border p-2.5 rounded-xl font-bold focus:outline-none focus:border-sky-500`}
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.firstName} {st.lastName} ({st.className} • {st.fatherPhone})
                  </option>
                ))}
              </select>
            </div>

            {targetStudent && (
              <div className={`p-3 ${isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/40 border-gray-800 text-gray-400"} border rounded-xl space-y-1 font-mono text-[11px]`}>
                <div>Parent: <span className={`${isLight ? "text-slate-900" : "text-white"} font-bold`}>{targetStudent.fatherName}</span></div>
                <div>Phone: <span className={`${isLight ? "text-emerald-700" : "text-emerald-400"} font-bold`}>{targetStudent.fatherPhone}</span></div>
                <div>Class: <span className={`${isLight ? "text-sky-700" : "text-sky-300"} font-bold`}>{targetStudent.className}</span></div>
              </div>
            )}

            <div>
              <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Customize Message Body</label>
              <textarea
                rows={5}
                value={currentPreview}
                onChange={(e) => setCustomMsg(e.target.value)}
                className={`w-full ${
                  isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                } border p-2.5 rounded-xl text-xs leading-relaxed resize-none focus:outline-none focus:border-emerald-500`}
              />
            </div>

            <button
              onClick={handleSend}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase rounded-xl transition flex items-center justify-center gap-2 text-xs shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              <Send size={15} />
              <span>Send WhatsApp Notification Now</span>
            </button>
          </div>
        </div>

        {/* Right: Real-time Smartphone Preview & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* WhatsApp Chat Preview Card */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl p-5 space-y-3`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-2`}>
              <h3 className={`text-xs font-black ${isLight ? "text-slate-900" : "text-white"} uppercase tracking-wider flex items-center gap-2`}>
                <MessageSquare size={14} className={isLight ? "text-emerald-600" : "text-emerald-400"} />
                <span>Live Smartphone WhatsApp Bubble Preview</span>
              </h3>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-gray-500"}`}>End-to-End Encrypted</span>
            </div>

            <div className={`${isLight ? "bg-slate-100 border-slate-300" : "bg-[#0a1014] border-[#1f2c34]"} border p-4 rounded-2xl max-w-lg mx-auto shadow-2xl relative`}>
              <div className={`flex items-center gap-2.5 pb-3 mb-3 border-b ${isLight ? "border-slate-200" : "border-[#1f2c34]"}`}>
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-black text-white text-xs">
                  MT
                </div>
                <div>
                  <div className={`text-xs font-bold ${isLight ? "text-slate-900" : "text-white"}`}>MT Core Model School Official</div>
                  <div className={`text-[9px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400 font-semibold"}`}>Verified Official Institution</div>
                </div>
              </div>

              {/* Chat Bubble */}
              <div className="bg-[#005c4b] text-white p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed shadow-md space-y-2">
                <p className="whitespace-pre-line">{currentPreview}</p>
                <div className="text-[9px] text-emerald-200/70 text-right font-mono flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  <span>✓✓</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Log History */}
          <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-xl`}>
            <div className={`p-4 border-b ${isLight ? "border-slate-100 bg-slate-50/80" : "border-gray-800 bg-black/40"} flex justify-between items-center`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-xs uppercase tracking-wider`}>
                Recent WhatsApp Dispatches &amp; Logs ({whatsappLogs.length})
              </h3>
              <span className={`text-[10px] ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} font-mono`}>100% Delivery Rate</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/20"} font-mono text-[10px]`}>
                    <th className="p-3 font-bold">Recipient Parent</th>
                    <th className="p-3 font-bold">Phone Number</th>
                    <th className="p-3 font-bold">Category</th>
                    <th className="p-3 font-bold">Message Snippet</th>
                    <th className="p-3 font-bold">Sent Time</th>
                    <th className="p-3 font-bold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100 text-slate-700" : "divide-gray-800/50"} font-mono text-[10px]`}>
                  {whatsappLogs.map((log) => (
                    <tr key={log.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                      <td className={`p-3 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{log.recipientName}</td>
                      <td className={`p-3 font-bold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>{log.recipientPhone}</td>
                      <td className="p-3 font-sans">
                        <span className={`${
                          isLight ? "bg-emerald-50 text-emerald-800 border-emerald-300" : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        } border px-2 py-0.5 rounded text-[9px] font-bold`}>
                          {log.category}
                        </span>
                      </td>
                      <td className={`p-3 font-sans ${isLight ? "text-slate-600 font-medium" : "text-gray-300"} max-w-xs truncate`}>{log.message}</td>
                      <td className={`p-3 ${isLight ? "text-slate-500" : "text-gray-400"}`}>{log.sentAt}</td>
                      <td className="p-3 text-center">
                        <span className={`${
                          isLight ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-emerald-400 bg-emerald-500/10"
                        } font-bold px-2 py-0.5 rounded`}>
                          ✓✓ {log.status}
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
    </div>
  );
}
