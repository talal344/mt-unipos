"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { MessageSquare, AlertCircle, CheckCircle2, Send, PlusCircle, HelpCircle, ArrowRight } from "lucide-react";

export default function HelpSupportPage() {
  const { currentUser, supportTickets, createNewTicket, replyToTicket, theme } = useGlobalContext();
  const isLight = theme === "light";

  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // New ticket form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"Problem" | "Suggestion" | "Feature Request" | "Billing" | "Technical" | "POS Terminal" | "Inventory">("Problem");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  // Authentication check
  if (!currentUser) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        <div className="text-center p-6 bg-brand-dark-surface/40 border border-brand-dark-border rounded-2xl max-w-sm">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={40} />
          <h3 className="text-white font-bold text-base mb-2">Access Denied</h3>
          <p className="text-xs mb-4">Please log in to your tenant account to access Help & Support desk.</p>
          <a href="/login" className="inline-block px-5 py-2 bg-brand-sky hover:bg-brand-sky-light text-black font-black text-xs uppercase rounded-xl transition">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // Filter support tickets belonging to the current tenant
  const myTickets = supportTickets.filter(t => t.tenantId === currentUser.tenantId);

  // Handle reply submission
  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    replyToTicket(selectedTicketId, replyText.trim(), "Client");
    setReplyText("");
  };

  // Handle new ticket creation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newTicket = createNewTicket(subject.trim(), description.trim(), category, priority);
    if (newTicket) {
      setSelectedTicketId(newTicket.id);
    }
    
    // Reset form
    setSubject("");
    setDescription("");
    setCategory("Problem");
    setPriority("Medium");
    setShowCreateForm(false);
  };

  const selectedTicket = myTickets.find(t => t.id === selectedTicketId);

  return (
    <div className={`flex min-h-screen font-sans ${isLight ? "bg-slate-100 text-slate-900" : "bg-black text-gray-100"}`}>
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Tickets History List */}
        <div className={`lg:col-span-1 border p-4 rounded-2xl flex flex-col max-h-[85vh] ${
          isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/50 border-brand-dark-border text-gray-100"
        }`}>
          
          <div className={`flex justify-between items-center mb-4 border-b pb-3 ${isLight ? "border-slate-200" : "border-brand-dark-border/40"}`}>
            <h2 className={`text-sm font-black uppercase tracking-wider ${isLight ? "text-slate-900" : "text-white"}`}>Help Desk</h2>
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setSelectedTicketId(null);
              }}
              className="flex items-center gap-1 text-[11px] font-black uppercase text-brand-sky hover:text-brand-sky-light transition bg-brand-sky/10 border border-brand-sky/20 px-2.5 py-1 rounded-lg"
            >
              <PlusCircle size={12} />
              New Ticket
            </button>
          </div>
          
          <div className="space-y-3 overflow-y-auto flex-grow pr-1">
            {myTickets.length === 0 ? (
              <div className={`text-center py-12 px-4 border rounded-xl ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/40 border-brand-dark-border/40 text-gray-400"
              }`}>
                <HelpCircle className={isLight ? "text-slate-400 mx-auto mb-2" : "text-gray-600 mx-auto mb-2"} size={24} />
                <p className={`text-[11px] font-medium ${isLight ? "text-slate-600" : "text-gray-500"}`}>No tickets raised yet.</p>
                <p className={`text-[9px] mt-1 ${isLight ? "text-slate-400" : "text-gray-600"}`}>Have suggestions or facing issues? Generate a new ticket above.</p>
              </div>
            ) : (
              myTickets.map(t => {
                const isActive = t.id === selectedTicketId && !showCreateForm;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTicketId(t.id);
                      setShowCreateForm(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isActive
                        ? isLight ? "bg-sky-50 border-sky-500 text-slate-900 shadow-xs" : "bg-brand-sky/10 border-brand-sky text-white"
                        : isLight ? "bg-white border-slate-200 hover:border-sky-300 text-slate-900" : "bg-black/60 border-brand-dark-border hover:border-brand-sky/20 text-gray-100"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1.5 font-mono">
                      <span className="text-sky-600 font-bold">{t.id}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[8px] ${
                        t.priority === "High" ? "bg-red-500/10 text-red-600" :
                        t.priority === "Medium" ? "bg-amber-500/10 text-amber-600" :
                        "bg-gray-500/10 text-gray-500"
                      }`}>
                        {t.priority}
                      </span>
                    </div>
                    <h4 className={`font-bold text-xs leading-snug truncate ${isLight ? "text-slate-900" : "text-white"}`}>{t.subject}</h4>
                    <div className={`flex justify-between items-center mt-3 pt-2 border-t text-[9px] font-mono ${isLight ? "border-slate-200 text-slate-500" : "border-brand-dark-border/30 text-gray-400"}`}>
                      <span className={`font-bold uppercase text-[8px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>{t.category}</span>
                      <span className={`font-bold ${t.status === "Open" ? "text-red-500 animate-pulse" : "text-emerald-600"}`}>
                        {t.status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Form / Chat Conversation thread */}
        <div className="lg:col-span-2 flex flex-col max-h-[85vh]">
          
          {showCreateForm ? (
            /* Create Ticket Form */
            <div className={`border p-6 rounded-2xl flex flex-col justify-between flex-grow h-full overflow-y-auto ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              <div>
                <h3 className={`text-base font-black border-b pb-3 mb-4 ${isLight ? "text-slate-900 border-slate-200" : "text-white border-brand-dark-border"}`}>
                  Raise Support Ticket or Suggestion
                </h3>

                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        Category / Request Type
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className={`w-full text-xs p-2.5 rounded-lg border font-bold focus:outline-none ${
                          isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                        }`}
                      >
                        <option value="Problem">Problem / Bug Report</option>
                        <option value="Suggestion">Suggestion</option>
                        <option value="Feature Request">Feature Request</option>
                        <option value="Technical">Technical Issue</option>
                        <option value="Billing">Billing & Plan Inquiry</option>
                        <option value="POS Terminal">POS Terminal Issue</option>
                        <option value="Inventory">Inventory Sync Issue</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                        Priority Level
                      </label>
                      <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as any)}
                        className={`w-full text-xs p-2.5 rounded-lg border font-bold focus:outline-none ${
                          isLight ? "bg-white border-slate-300 text-slate-900 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                        }`}
                      >
                        <option value="Low">Low (General Feedback)</option>
                        <option value="Medium">Medium (Affecting Operations)</option>
                        <option value="High">High (Terminal Down/Blocker)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      Subject
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. System slowness in Main Branch, Request for FBR integration"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border font-bold focus:outline-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-[10px] uppercase tracking-wider font-bold mb-1 ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                      Detailed Description / Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      placeholder="Describe your issue, suggestion, or requested features in detail. Include any reproduction steps or context."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border font-bold focus:outline-none resize-none ${
                        isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-black border-brand-dark-border text-white focus:border-brand-sky"
                      }`}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className={`px-4 py-2 border rounded-lg text-xs font-bold transition ${
                        isLight ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" : "bg-black border-brand-dark-border text-gray-400 hover:text-white"
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase rounded-lg transition shadow-lg"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : selectedTicket ? (
            /* Ticket Discussion Thread */
            <div className={`border p-6 rounded-2xl flex flex-col justify-between flex-grow h-full overflow-hidden ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/40 border-brand-dark-border text-gray-100"
            }`}>
              
              {/* Top bar info */}
              <div className={`border-b pb-4 mb-4 ${isLight ? "border-slate-200" : "border-brand-dark-border"}`}>
                <div className="flex justify-between items-center text-[10px] font-mono mb-2">
                  <span className="text-sky-600 font-bold">Ticket ID: {selectedTicket.id}</span>
                  <span className={isLight ? "text-slate-500" : "text-gray-400"}>Issued Date: {selectedTicket.date}</span>
                </div>
                <h3 className={`text-base font-black leading-tight ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.subject}</h3>
                <div className="flex gap-4 mt-2 text-[10px]">
                  <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Category:</span> <span className="text-sky-600 font-bold uppercase">{selectedTicket.category}</span></div>
                  <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Priority:</span> <span className={`font-bold ${isLight ? "text-slate-900" : "text-white"}`}>{selectedTicket.priority}</span></div>
                  <div><span className={isLight ? "text-slate-500" : "text-gray-500"}>Status:</span> <span className={selectedTicket.status === "Open" ? "text-red-500" : "text-emerald-600 font-bold"}>{selectedTicket.status}</span></div>
                </div>
              </div>

              {/* Chat replies */}
              <div className="flex-grow overflow-y-auto space-y-4 pr-1 mb-4 max-h-[45vh]">
                {selectedTicket.replies.map((rep, idx) => {
                  const isAdmin = rep.sender === "Admin";
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 max-w-[85%] ${!isAdmin ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isAdmin ? "bg-purple-600 text-white" : "bg-sky-600 text-white"
                      }`}>
                        {isAdmin ? "AD" : "CL"}
                      </div>
                      
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
                        !isAdmin
                          ? isLight ? "bg-sky-50 border-sky-200 text-slate-900 rounded-tr-none" : "bg-brand-sky/10 border-brand-sky/30 text-white rounded-tr-none"
                          : isLight ? "bg-slate-100 border-slate-200 text-slate-900 rounded-tl-none" : "bg-black/60 border-brand-dark-border text-gray-300 rounded-tl-none"
                      }`}>
                        <div className="flex justify-between gap-6 text-[9px] font-mono">
                          <span className={isAdmin ? "text-purple-600 font-bold" : "text-sky-600 font-bold"}>
                            {rep.sender === "Admin" ? "SaaS Super Admin" : "You"}
                          </span>
                          <span className={isLight ? "text-slate-400" : "text-gray-500"}>{rep.date}</span>
                        </div>
                        <p className="whitespace-pre-line">{rep.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              {selectedTicket.status === "Resolved" ? (
                <div className={`border rounded-xl p-3.5 text-center text-xs ${
                  isLight ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}>
                  <CheckCircle2 className="mx-auto mb-1" size={16} />
                  This ticket has been marked as <strong>Resolved</strong>. You can still message if the problem persists.
                </div>
              ) : null}

              <form onSubmit={handleReplySubmit} className={`border p-3.5 rounded-xl space-y-3 mt-2 ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-900" : "bg-black/60 border-brand-dark-border text-gray-100"
              }`}>
                <textarea
                  required
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type message to super admin..."
                  className={`w-full p-2.5 rounded text-xs font-bold border focus:outline-none resize-none ${
                    isLight ? "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-sky-500" : "bg-brand-dark-surface border-brand-dark-border/80 text-white focus:border-brand-sky"
                  }`}
                />
                <div className="flex justify-between items-center">
                  <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-gray-500"}`}>Replies are delivered instantly to Super Admin.</span>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase rounded flex items-center gap-1.5 shadow-lg transition"
                  >
                    <Send size={12} />
                    Send Reply
                  </button>
                </div>
              </form>

            </div>
          ) : (
            /* Placeholder state */
            <div className={`border rounded-2xl flex items-center justify-center p-8 text-center h-full ${
              isLight ? "bg-white border-slate-200 shadow-xs text-slate-900" : "bg-brand-dark-surface/20 border-brand-dark-border text-gray-100"
            }`}>
              <div>
                <MessageSquare className={isLight ? "text-slate-400 mx-auto mb-3" : "text-gray-600 mx-auto mb-3"} size={32} />
                <p className={`text-xs italic ${isLight ? "text-slate-500" : "text-gray-500"}`}>Select a ticket from the left queue or click "New Ticket" to contact support.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="mt-4 inline-flex items-center gap-2 text-xs font-black bg-sky-600 text-white px-4 py-2 rounded-xl hover:bg-sky-500 transition shadow-lg"
                >
                  Create a ticket now <ArrowRight size={12} />
                </button>
              </div>
            </div>
          )}

        </div>

      </main>
    </div>
  );
}
