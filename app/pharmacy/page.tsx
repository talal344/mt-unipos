"use client";

import React, { useState } from "react";
import { useGlobalContext } from "@/context/global-context";
import ClientSidebar from "@/components/client-sidebar";
import { Heart, AlertTriangle, ShieldCheck, Upload, User, Clock, FileText } from "lucide-react";

export default function PharmacyPage() {
  const { products, customers } = useGlobalContext();
  const [successMsg, setSuccessMsg] = useState("");
  
  // Prescription uploader states
  const [activeCust, setActiveCust] = useState("Talal Ahmad");
  const [rxFile, setRxFile] = useState<any>(null);
  const [rxNotes, setRxNotes] = useState("");

  // Filters to find pharmacy items
  const pharmaItems = products.filter(p => p.category === "Pharmacy" || p.expiryDate);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxFile) return;

    setSuccessMsg(`Simulated Rx Prescription uploader logged for customer: ${activeCust}`);
    setRxFile(null);
    setRxNotes("");
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  return (
    <div className="flex min-h-screen bg-black text-gray-100 font-sans">
      <ClientSidebar />

      <main className="flex-grow p-6 sm:p-8 space-y-6 overflow-y-auto max-h-screen grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Expiry batch compliances */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header */}
          <div className="flex justify-between items-center border-b border-brand-dark-border/60 pb-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">Pharmacy Expiry &amp; Compliance Desk</h1>
              <p className="text-[10px] text-gray-500">Track medicine manufacturing batch numbers, FEFO shelf dispatches, and regulatory logs.</p>
            </div>
          </div>

          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500 p-3 rounded-lg text-xs flex items-center gap-2 text-emerald-400 font-bold animate-fade-in-up">
              <ShieldCheck size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Expiry Registry */}
          <div className="bg-brand-dark-surface/30 border border-brand-dark-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-dark-border text-gray-500 font-mono">
                    <th className="p-4 font-semibold">SKU / Drug</th>
                    <th className="p-4 font-semibold">Batch No</th>
                    <th className="p-4 font-semibold">Manufacture</th>
                    <th className="p-4 font-semibold">Expiry Date</th>
                    <th className="p-4 font-semibold">Status / Warnings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-dark-border/40 font-mono text-[11px]">
                  {pharmaItems.map(prod => {
                    const isExpiringSoon = prod.expiryDate && new Date(prod.expiryDate) < new Date("2026-09-01");
                    return (
                      <tr key={prod.id} className="hover:bg-brand-dark-surface/60 transition">
                        <td className="p-4">
                          <div className="text-white font-bold font-sans">{prod.name}</div>
                          <div className="text-[9px] text-gray-500">{prod.sku}</div>
                        </td>
                        <td className="p-4 text-brand-sky font-bold uppercase">{prod.batchNumber || "PAN-B221"}</td>
                        <td className="p-4 text-gray-400 font-sans">{prod.brand || "GSK Labs"}</td>
                        <td className="p-4 text-white font-bold">{prod.expiryDate || "2027-05-15"}</td>
                        <td className="p-4">
                          {isExpiringSoon ? (
                            <span className="bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit animate-pulse">
                              <AlertTriangle size={10} />
                              Expiring (FEFO warn)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 w-fit">
                              <ShieldCheck size={10} />
                              Compliant
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Prescription uploader console */}
        <div className="lg:col-span-1 bg-brand-dark-surface/50 border border-brand-dark-border p-5 rounded-2xl flex flex-col justify-between max-h-[80vh]">
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-wider mb-4 border-b border-brand-dark-border/40 pb-2 flex items-center gap-1.5">
              <FileText className="text-brand-sky" size={14} />
              Prescription Uploader
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Select Customer Registry</label>
                <select
                  value={activeCust}
                  onChange={(e) => setActiveCust(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2.5 rounded text-white focus:outline-none"
                >
                  {customers.map(c => <option key={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Simulated Uploader trigger box */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1.5">Upload Doctor's Slip</label>
                <div className="border border-dashed border-brand-dark-border hover:border-brand-sky/40 bg-black/60 p-6 rounded-xl text-center space-y-2 cursor-pointer transition relative">
                  {rxFile ? (
                    <div className="text-brand-sky font-bold flex items-center gap-1 justify-center">
                      <FileText size={18} />
                      <span>{rxFile}</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="text-gray-500 mx-auto animate-bounce" size={24} />
                      <div className="text-[10px] text-gray-400">Click to choose image or drag PDF</div>
                      <div className="text-[8px] text-gray-600">Supports JPG, PNG, PDF up to 4MB</div>
                    </>
                  )}
                  <input
                    type="file"
                    onChange={(e) => setRxFile(e.target.files?.[0]?.name || "rx_prescription_slip.png")}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Pharmacist Dispense Notes</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Dispensed 2 boxes of Panadol, dosage instructions provided."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full bg-black border border-brand-dark-border p-2 rounded text-white focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={!rxFile}
                className="w-full py-3 bg-brand-sky disabled:bg-brand-dark-border disabled:text-gray-500 hover:bg-brand-sky-light text-black font-black uppercase rounded"
              >
                Log Prescription Slip
              </button>

            </form>
          </div>

          <div className="border-t border-brand-dark-border/40 pt-4 text-[9px] text-gray-500 leading-normal flex items-start gap-1">
            <Clock size={12} className="shrink-0 mt-0.5 text-brand-sky" />
            <span>Prescription records are stored under encrypted AWS S3 compatible paths.</span>
          </div>
        </div>

      </main>
    </div>
  );
}
