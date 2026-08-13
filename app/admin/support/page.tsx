"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import AdminSidebar from "@/components/admin-sidebar";
import { MessageSquare, AlertCircle, CheckCircle2, CornerDownRight, Send, Trash, Trash2 } from "lucide-react";

export default function AdminSupportPage() {
  const { 
    supportTickets, 
    replyToTicket, 
    registerTenant, 
    updateSupportTicket, 
    deleteSupportTicket, 
    deleteSupportTicketReply 
  } = useGlobalContext();

  const [activeTab, setActiveTab] = useState<"tickets" | "messages">("tickets");
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [provisionVertical, setProvisionVertical] = useState("Restaurant");

  const isMessageOrSuggestion = (category: string) => {
    return category === "Suggestion" || category === "Feature Request" || category === "Problem"; // Wait, "Problem" can go to tickets or messages depending on category, but let's check.
    // The prompt says: "1st have ticket where only issues resolve discuss and 2nd is message"
    // So "Issues" (Billing, Technical, POS Terminal, Inventory) go to 1st tab (tickets).
    // "Suggestions", "Feature Requests" or generic messages go to 2nd tab (messages).
  };

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
  
  // Update state if we fall back to auto-selected
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
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <AdminSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets Queue list */}
        <div className="lg:col-span-1 bg-brand-dark-surface/50 border border-brand-dark-border p-4 rounded-2xl flex flex-col max-h-[85vh]">
          
          {/* Section title */}
          <h2 className="text-sm font-black text-white uppercase tracking-wider mb-3 pb-2 border-b border-brand-dark-border/40">
            Supports tickets
          </h2>

          {/* Part Switcher (Tabs) */}
          <div className="grid grid-cols-2 gap-2 mb-4 p-1 bg-black/60 border border-brand-dark-border/60 rounded-xl">
            <button
              onClick={() => {
                setActiveTab("tickets");
                const first = issuesTickets[0];
                setSelectedTicketId(first ? first.id : null);
              }}
              className={`py-2 text-[10px] uppercase font-bold tracking-wider rounded-lg transition ${
                activeTab === "tickets"
                  ? "bg-purple-600/25 border border-purple-500/50 text-white"
                  : "text-gray-400 hover:text-white"
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
                  ? "bg-purple-600/25 border border-purple-500/50 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              2nd: Messages (Suggestions)
            </button>
          </div>
          
          {/* Queue List */}
          <div className="space-y-3 overflow-y-auto flex-grow pr-1">
            {currentTabTickets.length === 0 ? (
              <div className="text-center py-12 px-4 bg-black/40 border border-brand-dark-border/40 rounded-xl">
                <MessageSquare className="text-gray-600 mx-auto mb-2" size={24} />
                <p className="text-[11px] text-gray-500 font-medium">No tickets found in this tab.</p>
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
                        ? "bg-purple-600/10 border-purple-500 text-white"
                        : "bg-black/60 border-brand-dark-border hover:border-brand-sky/20"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1.5 font-mono">
                      <span className="text-purple-400 font-bold">{t.id}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                        t.priority === "High" ? "bg-red-500/10 text-red-400" :
                        t.priority === "Medium" ? "bg-amber-500/10 text-amber-400" :
                        "bg-gray-500/10 text-gray-400"
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-xs leading-snug truncate">{t.subject}</h4>
                    <div className="flex justify-between items-center mt-1 text-[9px] text-gray-500">
                      <span className="truncate max-w-[70%]">{t.businessName}</span>
                      <span className="font-semibold text-[8px] bg-purple-500/10 px-1 py-0.2 rounded text-purple-400 uppercase tracking-wide">
                        {t.category}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-brand-dark-border/30 text-[9px] text-gray-400 font-mono">
                      <span>{t.date}</span>
                      <span className={`font-bold ${t.status === "Open" ? "text-red-400 animate-pulse" : "text-emerald-400"}`}>
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
            <div className="bg-brand-dark-surface/40 border border-brand-dark-border p-6 rounded-2xl flex flex-col justify-between flex-grow h-full overflow-hidden">
              
              {/* Ticket Top bar */}
              <div className="border-b border-brand-dark-border pb-4 mb-4 flex justify-between items-start">
                <div className="flex-grow">
                  <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                    <span className="text-purple-400 font-bold">Ticket ID: {selectedTicket.id}</span>
                    <span className="text-gray-500">Issued Date: {selectedTicket.date}</span>
                  </div>
                  <h3 className="text-base font-black text-white leading-tight">{selectedTicket.subject}</h3>
                  <div className="flex gap-4 mt-2 text-[10px]">
                    <div><span className="text-gray-500">From Client:</span> <span className="text-white font-bold">{selectedTicket.businessName}</span></div>
                    <div><span className="text-gray-500">Category:</span> <span className="text-brand-sky font-bold uppercase">{selectedTicket.category}</span></div>
                  </div>
                </div>

                {/* Delete entire conversation */}
                <button
                  onClick={handleDeleteConversation}
                  title="Delete entire conversation"
                  className="ml-4 p-2.5 bg-red-500/10 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-400 rounded-xl transition flex items-center gap-1 text-[10px] font-black uppercase tracking-wider shrink-0"
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
                        isAdmin ? "bg-purple-600 text-white" : "bg-brand-sky text-black"
                      }`}>
                        {isAdmin ? "AD" : "CL"}
                      </div>
                      
                      <div className="group relative">
                        <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                          isAdmin
                            ? "bg-purple-600/10 border-purple-500/30 text-white rounded-tr-none"
                            : "bg-black/60 border-brand-dark-border text-gray-300 rounded-tl-none"
                        }`}>
                          <div className="flex justify-between gap-6 text-[9px] text-gray-500 font-mono">
                            <span className={isAdmin ? "text-purple-400 font-bold" : "text-brand-sky font-bold"}>
                              {rep.sender === "Admin" ? "SaaS Support desk" : selectedTicket.businessName}
                            </span>
                            <span>{rep.date}</span>
                          </div>
                          <p className="whitespace-pre-line">{rep.message}</p>
                        </div>

                        {/* Delete individual message */}
                        <button
                          onClick={() => handleDeleteReply(idx)}
                          title="Delete this message"
                          className="absolute top-1 -right-7 opacity-0 group-hover:opacity-100 p-1 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded transition cursor-pointer"
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
                <div className="bg-brand-sky/10 border border-brand-sky/30 rounded-xl p-4 mb-4">
                  <h4 className="text-brand-sky font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Software Provisioning Request
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500 block mb-1">Requested By</span>
                      <span className="text-white font-semibold">{selectedTicket.softwareRequestData.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Nature of Business</span>
                      <span className="text-white font-semibold">{selectedTicket.softwareRequestData.businessNature}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block mb-1">Additional Features Required</span>
                      <span className="text-white font-semibold">{selectedTicket.softwareRequestData.features}</span>
                    </div>
                  </div>
                  {selectedTicket.status !== "Resolved" && (
                    <div className="mt-4 border-t border-brand-sky/20 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 font-bold uppercase block">Assign POS Vertical Module</label>
                        <select
                          value={provisionVertical}
                          onChange={(e) => setProvisionVertical(e.target.value)}
                          className="bg-black border border-brand-dark-border text-white text-xs p-2 rounded focus:border-brand-sky focus:outline-none"
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
                        className="w-full sm:w-auto bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs px-6 py-2.5 rounded transition shadow-lg shadow-brand-sky/20"
                      >
                        Approve &amp; Provision Credentials
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Reply box form */}
              <form onSubmit={handleReplySubmit} className="bg-black/60 border border-brand-dark-border p-3.5 rounded-xl space-y-3">
                <textarea
                  required
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type support reply or solution steps..."
                  className="w-full bg-brand-dark-surface border border-brand-dark-border/80 p-2.5 rounded text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-gray-500">Press send to dispatch solution to client inbox.</span>
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
            <div className="bg-brand-dark-surface/20 border border-brand-dark-border rounded-2xl flex items-center justify-center p-8 text-center h-full">
              <div>
                <MessageSquare className="text-gray-600 mx-auto mb-3" size={32} />
                <p className="text-xs text-gray-500 italic">Select a support ticket from the queue list to answer client queries.</p>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
