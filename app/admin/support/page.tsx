"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import { MessageSquare, CheckCircle, CheckCircle2, Send, Trash, Trash2, Sparkles } from "lucide-react";

export default function AdminSupportPage() {
  const { 
    supportTickets, 
    replyToTicket, 
    registerTenant, 
    updateSupportTicket, 
    deleteSupportTicket, 
    deleteSupportTicketReply,
    theme 
  } = useGlobalContext();
  const isLight = theme === "light";

  const [activeTab, setActiveTab] = useState<"tickets" | "messages">("tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [provisionVertical, setProvisionVertical] = useState("Restaurant");

  // Divide tickets
  const issuesTickets = supportTickets.filter(t => 
    t.category !== "Suggestion" && t.category !== "Feature Request"
  );
  const feedbackMessages = supportTickets.filter(t => 
    t.category === "Suggestion" || t.category === "Feature Request"
  );

  const currentTabTickets = activeTab === "tickets" ? issuesTickets : feedbackMessages;

  // Auto-select first ticket of active tab if none is selected
  const selectedTicket = supportTickets.find(t => t.id === selectedTicketId) || currentTabTickets[0];
  
  if (selectedTicket && selectedTicket.id !== selectedTicketId) {
    setSelectedTicketId(selectedTicket.id);
  }

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyText.trim()) return;

    replyToTicket(selectedTicket.id, replyText.trim(), "Admin");
    setReplyText("");
  };

  const handleDeleteConversation = () => {
    if (!selectedTicket) return;
    if (window.confirm("Are you sure you want to delete this entire conversation?")) {
      deleteSupportTicket(selectedTicket.id);
      setSelectedTicketId(null);
    }
  };

  const handleDeleteReply = (idx: number) => {
    if (!selectedTicket) return;
    if (window.confirm("Are you sure you want to delete this message?")) {
      deleteSupportTicketReply(selectedTicket.id, idx);
    }
  };

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <AdminSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets Queue list */}
        <div className={`lg:col-span-1 border p-4 rounded-2xl flex flex-col max-h-[85vh] ${
          isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
        }`}>
          
          {/* Section title */}
          <h2 className={`text-sm font-black uppercase tracking-wider mb-3 pb-2 border-b ${
            isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border/40"
          }`}>
            Support Queue
          </h2>

          {/* Part Switcher (Tabs) */}
          <div className={`grid grid-cols-2 gap-2 mb-4 p-1 rounded-xl border ${
            isLight ? "bg-slate-100 border-slate-200" : "bg-black/60 border-brand-dark-border/60"
          }`}>
            <button
              onClick={() => {
                setActiveTab("tickets");
                const first = issuesTickets[0];
                setSelectedTicketId(first ? first.id : null);
              }}
              className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition ${
                activeTab === "tickets"
                  ? "bg-purple-600 border border-purple-500 text-white shadow-xs"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}
            >
              1st: Tickets (Issues)
            </button>
            <button
              onClick={() => {
                setActiveTab("messages");
                const first = feedbackMessages[0];
                setSelectedTicketId(first ? first.id : null);
              }}
              className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition ${
                activeTab === "messages"
                  ? "bg-purple-600 border border-purple-500 text-white shadow-xs"
                  : isLight ? "text-slate-600 hover:text-slate-900" : "text-gray-400 hover:text-white"
              }`}
            >
              2nd: Messages (Feedback)
            </button>
          </div>
          
          {/* Queue List */}
          <div className="space-y-3 overflow-y-auto flex-grow pr-1">
            {currentTabTickets.length === 0 ? (
              <div className={`text-center py-12 px-4 border rounded-xl ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-black/40 border-brand-dark-border/40 text-gray-500"
              }`}>
                <MessageSquare className="mx-auto mb-2 opacity-50" size={24} />
                <p className="text-[11px] font-medium">No tickets found in this queue.</p>
              </div>
            ) : (
              currentTabTickets.map(t => {
                const isActive = t.id === selectedTicket?.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isActive
                        ? isLight
                          ? "bg-purple-100/90 border-purple-400 text-slate-900 font-bold shadow-xs"
                          : "bg-purple-600/10 border-purple-500 text-white font-bold"
                        : isLight
                        ? "bg-white border-slate-200 text-slate-700 hover:border-purple-300 hover:bg-purple-50/50"
                        : "bg-black/60 border-brand-dark-border hover:border-sky-500/20 text-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1.5 font-mono">
                      <span className="text-purple-500 font-bold">{t.id}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                        t.priority === "High" ? "bg-red-500/10 text-red-500" :
                        t.priority === "Medium" ? "bg-amber-500/10 text-amber-500" :
                        "bg-gray-500/10 text-gray-500"
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className={`font-bold text-xs leading-snug truncate ${isLight ? "text-slate-900" : "text-white"}`}>{t.subject}</h4>
                    <div className="flex justify-between items-center mt-1 text-[9px]">
                      <span className={`truncate max-w-[70%] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{t.businessName}</span>
                      <span className="font-semibold text-[8px] bg-purple-500/10 px-1 py-0.2 rounded text-purple-500 uppercase tracking-wide">
                        {t.category}
                      </span>
                    </div>
                    
                    <div className={`flex justify-between items-center mt-3 pt-2 border-t text-[9px] font-mono ${
                      isLight ? "border-slate-200 text-slate-400" : "border-brand-dark-border/30 text-gray-400"
                    }`}>
                      <span>{t.date}</span>
                      <span className={`font-bold ${t.status === "Open" ? "text-red-500 animate-pulse" : "text-emerald-500"}`}>
                        {t.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation details thread */}
        <div className="lg:col-span-2 flex flex-col max-h-[85vh]">
          {selectedTicket ? (
            <div className={`border p-6 rounded-2xl flex flex-col justify-between flex-grow h-full overflow-hidden ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              
              {/* Ticket Top bar */}
              <div className={`border-b pb-4 mb-4 flex justify-between items-start ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                    <span className="text-purple-500 font-bold">Ticket ID: {selectedTicket.id}</span>
                    <span className={isLight ? "text-slate-400" : "text-gray-500"}>Issued Date: {selectedTicket.date}</span>
                  </div>
                  <h3 className={`text-base font-black leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.subject}</h3>
                  <div className="flex gap-4 mt-2 text-[10px]">
                    <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>From Client:</span> <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.businessName}</span></div>
                    <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Category:</span> <span className="text-sky-500 font-bold uppercase">{selectedTicket.category}</span></div>
                  </div>
                </div>

                {/* Delete entire conversation */}
                <button
                  onClick={handleDeleteConversation}
                  title="Delete entire conversation"
                  className="ml-4 p-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition flex items-center gap-1 text-[10px] font-black uppercase tracking-wider shrink-0"
                >
                  <Trash2 size={13} />
                  Delete Thread
                </button>
              </div>

              {/* Chat Thread */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4 max-h-[45vh]">
                {selectedTicket.replies.map((rep, idx) => {
                  const isAdmin = rep.sender === "Admin";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAdmin ? "bg-purple-600 text-white" : "bg-sky-500 text-white"
                      }`}>
                        {isAdmin ? "AD" : "CL"}
                      </div>
                      
                      <div className="group relative">
                        <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                          isAdmin
                            ? "bg-purple-600/10 border-purple-500/30 text-white rounded-tr-none"
                            : isLight
                            ? "bg-slate-100 border-slate-200 text-slate-900 rounded-tl-none"
                            : "bg-black/60 border-brand-dark-border text-gray-300 rounded-tl-none"
                        }`}>
                          <div className="flex justify-between gap-6 text-[9px] font-mono">
                            <span className={isAdmin ? "text-purple-500 font-bold" : "text-sky-500 font-bold"}>
                              {rep.sender === "Admin" ? "SaaS Support desk" : selectedTicket.businessName}
                            </span>
                            <span className={isLight ? "text-slate-400" : "text-gray-500"}>{rep.date}</span>
                          </div>
                          <p className="whitespace-pre-line">{rep.message}</p>
                        </div>

                        {/* Delete individual message */}
                        <button
                          onClick={() => handleDeleteReply(idx)}
                          title="Delete this message"
                          className="absolute top-1 -right-7 opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer"
                        >
                          <Trash size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Software Request Info (if applicable) */}
              {selectedTicket.softwareRequestData && (
                <div className={`border rounded-xl p-4 mb-4 ${
                  isLight ? "bg-sky-50/80 border-sky-200 text-slate-900" : "bg-sky-500/10 border-sky-500/30 text-white"
                }`}>
                  <h4 className="text-sky-500 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Software Provisioning Request
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className={`block mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Requested By</span>
                      <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.softwareRequestData.name}</span>
                    </div>
                    <div>
                      <span className={`block mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Nature of Business</span>
                      <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.softwareRequestData.businessNature}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`block mb-1 ${isLight ? "text-slate-500" : "text-gray-500"}`}>Additional Features Required</span>
                      <span className={`font-semibold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.softwareRequestData.features}</span>
                    </div>
                  </div>
                  {selectedTicket.status !== "Resolved" && (
                    <div className="mt-4 border-t border-sky-500/20 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <label className={`text-[10px] font-bold uppercase block ${isLight ? "text-slate-600" : "text-gray-400"}`}>Assign POS Vertical Module</label>
                        <select
                          value={provisionVertical}
                          onChange={(e) => setProvisionVertical(e.target.value)}
                          className={`border text-xs p-2 rounded focus:border-sky-500 focus:outline-none ${
                            isLight ? "bg-white border-slate-300 text-slate-900" : "bg-black border-brand-dark-border text-white"
                          }`}
                        >
                          <option value="Restaurant">Restaurant / F&B POS</option>
                          <option value="Retail">Retail Store POS</option>
                          <option value="Pharmacy">Pharmacy / Medical POS</option>
                          <option value="Bookstore">Bookstore POS</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          const name = selectedTicket.softwareRequestData?.name || "Client";
                          const username = name.split(" ")[0].toLowerCase() + "@mtcore.xyz";
                          const password = "Pass@" + Math.floor(1000 + Math.random() * 9000);
                          
                          const newTenantId = registerTenant({
                            businessName: `${name}'s ${provisionVertical}`,
                            ownerName: name,
                            email: username,
                            phone: "+00 0000 0000",
                            businessType: provisionVertical,
                            plan: "Professional",
                            billingCycle: "monthly",
                            defaultCurrency: "PKR",
                            credentialPresets: [
                              { id: `CRED-${Math.floor(1000 + Math.random() * 9000)}`, label: "Super Admin", email: username, pass: password, role: "Owner" }
                            ]
                          });

                          const replyMessage = `Your ${provisionVertical} POS is ready! Here are your credentials:\n\nLogin URL: /login\nWorkspace ID: ${newTenantId}\nUsername: ${username}\nPassword: ${password}\n\nPlease keep these credentials safe. Welcome to MT Core — The core technology behind your business.`;
                          replyToTicket(selectedTicket.id, replyMessage, "Admin");
                          updateSupportTicket(selectedTicket.id, { status: "Resolved" });
                        }}
                        className="w-full sm:w-auto bg-sky-500 hover:bg-sky-400 text-white font-black text-xs px-6 py-2.5 rounded transition shadow-lg"
                      >
                        Approve &amp; Provision Credentials
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reply box form */}
              <form onSubmit={handleReplySubmit} className={`border p-3.5 rounded-xl space-y-3 ${
                isLight ? "bg-slate-50 border-slate-200" : "bg-black/60 border-brand-dark-border"
              }`}>
                <textarea
                  required
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type support reply or solution steps..."
                  className={`w-full border p-2.5 rounded text-xs focus:outline-none focus:border-purple-500 resize-none ${
                    isLight ? "bg-white border-slate-300 text-slate-900 placeholder-slate-400" : "bg-brand-dark-surface border-brand-dark-border/80 text-white placeholder-gray-500"
                  }`}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Press send to dispatch solution to client inbox.</span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase rounded flex items-center gap-1.5 shadow"
                  >
                    <Send size={12} />
                    Dispatch Reply
                  </button>
                </div>
              </form>

            </div>
          ) : (
            <div className={`border rounded-2xl flex items-center justify-center p-8 text-center h-full ${
              isLight ? "bg-white border-slate-200 text-slate-500" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-500"
            }`}>
              <div>
                <MessageSquare className="mx-auto mb-3 opacity-40" size={32} />
                <p className="text-xs italic">Select a support ticket from the queue list to answer client queries.</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
