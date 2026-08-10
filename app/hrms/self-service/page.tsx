"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import { 
  User, Calendar, Clock, DollarSign, FileText, 
  Download, Plus, X, Briefcase, CalendarDays 
} from "lucide-react";

export default function SelfServicePortalPage() {
  const { 
    hrEmployees, 
    hrAttendance, 
    hrLeaves, 
    hrPayrolls, 
    hrAppraisals,
    submitHRLeave
  } = useGlobalContext();

  // In a real app, this comes from auth context. Using first employee as dummy for self-service
  const currentUser = hrEmployees[0] || null;

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "Casual" as const,
    startDate: "",
    endDate: "",
    reason: ""
  });

  const myAttendance = useMemo(() => {
    if (!currentUser) return [];
    return hrAttendance.filter(a => a.employeeId === currentUser.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 30);
  }, [hrAttendance, currentUser]);

  const myLeaves = useMemo(() => {
    if (!currentUser) return [];
    return hrLeaves.filter(l => l.employeeId === currentUser.id);
  }, [hrLeaves, currentUser]);

  const myPayslips = useMemo(() => {
    if (!currentUser) return [];
    const slips: any[] = [];
    hrPayrolls.forEach(batch => {
      const item = batch.items.find(i => i.employeeId === currentUser.id);
      if (item) {
        slips.push({ month: batch.month, ...item, status: batch.status });
      }
    });
    return slips.sort((a,b) => b.month.localeCompare(a.month));
  }, [hrPayrolls, currentUser]);

  const myAppraisals = useMemo(() => {
    if (!currentUser) return [];
    return hrAppraisals.filter(a => a.employeeId === currentUser.id);
  }, [hrAppraisals, currentUser]);

  const leaveStats = useMemo(() => {
    const stats = {
      Casual: { total: 12, used: 0 },
      Sick: { total: 10, used: 0 },
      Annual: { total: 15, used: 0 }
    };
    
    myLeaves.forEach(l => {
      if (l.status === "Approved" && (l.leaveType === "Casual" || l.leaveType === "Sick" || l.leaveType === "Annual")) {
        stats[l.leaveType].used += l.totalDays;
      }
    });
    
    return stats;
  }, [myLeaves]);

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    const start = new Date(leaveForm.startDate);
    const end = new Date(leaveForm.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    submitHRLeave({
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      leaveType: leaveForm.leaveType,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      totalDays,
      reason: leaveForm.reason
    });
    
    setShowLeaveModal(false);
    setLeaveForm({ leaveType: "Casual", startDate: "", endDate: "", reason: "" });
  };

  const printPayslip = () => {
    window.print();
  };

  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
        <HRMSSidebar />
        <main className="flex-grow p-6 flex items-center justify-center">
          <p className="text-gray-500">No active employee found to show self-service data.</p>
        </main>
      </div>
    );
  }

  const hourStr = new Date().getHours();
  const greeting = hourStr < 12 ? "Morning" : hourStr < 18 ? "Afternoon" : "Evening";

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans self-service-print-fix">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          body { background: white !important; color: black !important; }
          .self-service-print-fix { background: white !important; }
        }
      `}} />
      <div className="no-print w-full flex">
        <HRMSSidebar />
        
        <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-800 pb-5">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                Good {greeting}, {currentUser.name.split(" ")[0]}! 👋
              </h1>
              <p className="text-xs text-sky-400 font-bold">
                Employee Self-Service Portal
              </p>
            </div>
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition"
            >
              <Plus size={14} /> Request Leave
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile & Leave Balances */}
            <div className="space-y-6">
              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white">{currentUser.name}</h2>
                    <p className="text-xs text-sky-400 font-bold">{currentUser.designation}</p>
                    <p className="text-[10px] text-gray-500">{currentUser.department}</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs font-mono text-gray-400 border-t border-gray-800/50 pt-4">
                  <div className="flex justify-between"><span>Emp Code:</span> <span className="text-white">{currentUser.employeeCode}</span></div>
                  <div className="flex justify-between"><span>Email:</span> <span className="text-white">{currentUser.email}</span></div>
                  <div className="flex justify-between"><span>Joined:</span> <span className="text-white">{currentUser.joiningDate}</span></div>
                  <div className="flex justify-between"><span>Type:</span> <span className="text-white">{currentUser.employmentType}</span></div>
                </div>
              </div>

              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <Briefcase size={16} className="text-sky-400" />
                  Leave Balances
                </h3>
                <div className="space-y-4">
                  {Object.entries(leaveStats).map(([type, stats]) => {
                    const remaining = stats.total - stats.used;
                    const percent = (stats.used / stats.total) * 100;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-bold text-gray-300">{type} Leave</span>
                          <span className="text-gray-500">{remaining} remaining (of {stats.total})</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${remaining < 3 ? 'bg-red-500' : 'bg-sky-500'}`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Attendance & Payslips */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl p-5 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-4 flex items-center gap-2">
                  <CalendarDays size={16} className="text-emerald-400" />
                  Recent Attendance (Last 30 Days)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {myAttendance.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No attendance records found.</p>
                  ) : (
                    myAttendance.map(a => (
                      <div 
                        key={a.id} 
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black cursor-help border
                          ${a.status === 'Present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            a.status === 'Absent' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            a.status === 'Late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                            'bg-sky-500/10 text-sky-400 border-sky-500/30'
                          }
                        `}
                        title={`${a.date}: ${a.status} (${a.checkIn || 'No CI'} - ${a.checkOut || 'No CO'})`}
                      >
                        {a.date.split("-")[2]}
                      </div>
                    ))
                  )}
                </div>
                <div className="mt-4 flex gap-4 text-[10px] text-gray-500 font-bold uppercase">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Present</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> Late</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> Absent</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-sky-500"></div> Leave</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <DollarSign size={16} className="text-green-400" />
                      My Payslips
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-800/60 p-2">
                    {myPayslips.length === 0 ? (
                      <p className="p-4 text-xs text-gray-500 italic">No payslips available.</p>
                    ) : (
                      myPayslips.map((slip, i) => (
                        <div key={i} className="p-3 flex justify-between items-center hover:bg-gray-800/30 rounded-xl transition">
                          <div>
                            <p className="text-xs font-bold text-white">{slip.month}</p>
                            <p className="text-[10px] text-gray-500">Net: Rs {slip.netSalary.toLocaleString()}</p>
                          </div>
                          <button onClick={printPayslip} className="text-gray-400 hover:text-sky-400 transition bg-black p-2 rounded-lg border border-gray-800">
                            <Download size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="bg-[#0b0f17] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-gray-800 bg-black/40 flex justify-between items-center">
                    <h3 className="font-bold text-white text-sm flex items-center gap-2">
                      <Award size={16} className="text-amber-400" />
                      My Appraisals
                    </h3>
                  </div>
                  <div className="divide-y divide-gray-800/60 p-2">
                    {myAppraisals.length === 0 ? (
                      <p className="p-4 text-xs text-gray-500 italic">No appraisals available.</p>
                    ) : (
                      myAppraisals.map((app, i) => (
                        <div key={i} className="p-3 hover:bg-gray-800/30 rounded-xl transition">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold text-white">{app.reviewPeriod}</p>
                            <span className="bg-amber-500/20 text-amber-400 text-[10px] px-1.5 py-0.5 rounded font-black">
                              {app.rating}/5
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 line-clamp-2">{app.comments}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Leave Request Modal */}
          {showLeaveModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 font-sans">
              <div className="bg-[#0b0f17] border border-sky-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-black/40">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-sky-400" />
                    <h3 className="font-bold text-white text-base">Request Time Off</h3>
                  </div>
                  <button onClick={() => setShowLeaveModal(false)} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleApplyLeave} className="p-6 space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Leave Type *</label>
                    <select
                      required
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value as any })}
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-bold"
                    >
                      <option value="Casual">Casual Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Annual">Annual Leave</option>
                      <option value="Unpaid">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Start Date *</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">End Date *</label>
                      <input
                        required
                        type="date"
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white font-mono [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Reason *</label>
                    <textarea
                      required
                      rows={3}
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="Briefly explain your reason for leave..."
                      className="w-full bg-black border border-gray-800 p-2.5 rounded-xl text-white resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowLeaveModal(false)}
                      className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Print View for Payslip */}
      <div className="hidden print-only p-10 max-w-4xl mx-auto bg-white text-black font-sans">
        <div className="text-center mb-10 border-b-2 border-black pb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest">MT UniPOS</h1>
          <p className="text-sm text-gray-600 font-bold uppercase tracking-widest mt-1">Salary Slip</p>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-10 text-sm">
          <div>
            <p><span className="font-bold inline-block w-32">Employee Name:</span> {currentUser.name}</p>
            <p><span className="font-bold inline-block w-32">Employee ID:</span> {currentUser.employeeCode}</p>
            <p><span className="font-bold inline-block w-32">Designation:</span> {currentUser.designation}</p>
          </div>
          <div>
            <p><span className="font-bold inline-block w-32">Department:</span> {currentUser.department}</p>
            <p><span className="font-bold inline-block w-32">Bank Name:</span> {currentUser.bankName || "N/A"}</p>
            <p><span className="font-bold inline-block w-32">Account No:</span> {currentUser.accountNumber || "N/A"}</p>
          </div>
        </div>

        <table className="w-full text-left border-collapse border border-black mb-10">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="p-3 border-r border-black uppercase text-xs">Earnings</th>
              <th className="p-3 border-r border-black uppercase text-xs text-right w-32">Amount</th>
              <th className="p-3 border-r border-black uppercase text-xs">Deductions</th>
              <th className="p-3 uppercase text-xs text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-3 border-r border-b border-black text-sm">Basic Salary</td>
              <td className="p-3 border-r border-b border-black text-sm text-right font-mono">{currentUser.basicSalary.toLocaleString()}</td>
              <td className="p-3 border-r border-b border-black text-sm text-gray-600">Tax</td>
              <td className="p-3 border-b border-black text-sm text-right font-mono">0</td>
            </tr>
            <tr>
              <td className="p-3 border-r border-b border-black font-bold uppercase text-xs bg-gray-50">Total Earnings</td>
              <td className="p-3 border-r border-b border-black font-bold text-right font-mono bg-gray-50">{currentUser.basicSalary.toLocaleString()}</td>
              <td className="p-3 border-r border-b border-black font-bold uppercase text-xs bg-gray-50">Total Deductions</td>
              <td className="p-3 border-b border-black font-bold text-right font-mono bg-gray-50">0</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end border-t-2 border-black pt-6">
          <p className="text-xs text-gray-500 max-w-sm">This is a computer generated document and does not require a physical signature.</p>
          <div className="text-right">
            <p className="text-sm font-bold uppercase mb-1">Net Pay</p>
            <p className="text-2xl font-black font-mono">Rs {currentUser.basicSalary.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
