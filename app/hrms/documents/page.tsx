"use client";

import React, { useState, useEffect, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  FileArchive,
  Plus,
  Search,
  Filter,
  FileText,
  ShieldCheck,
  Calendar,
  Lock,
  Download,
  AlertTriangle,
  X,
  Building2,
  User
} from "lucide-react";

interface HRDocument {
  id: string;
  documentCode: string;
  employeeId?: string;
  employeeName?: string;
  title: string;
  type: "Contract" | "NDA" | "CNIC" | "Experience Letter" | "Offer Letter" | "Warning Letter" | "Policy" | "Other";
  description?: string;
  fileName: string;
  fileSize?: string;
  uploadedBy: string;
  uploadedAt: string;
  expiresAt?: string;
  isConfidential: boolean;
  status: "Active" | "Expired" | "Archived";
}

export default function HRDocumentsPage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [documents, setDocuments] = useState<HRDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [tab, setTab] = useState<"Company" | "Employee">("Company");
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    if (currentUser?.tenantId) {
      const key = `hr_documents_${currentUser.tenantId}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setDocuments(JSON.parse(saved));
      } else {
        const initial: HRDocument[] = [
          {
            id: "DOC-1",
            documentCode: "DOC-001",
            title: "Corporate HR Policy & Employee Code of Conduct 2025",
            type: "Policy",
            description: "Standard operating procedures, attendance guidelines, and code of ethics.",
            fileName: "MT_Core_HR_Policy_2025.pdf",
            fileSize: "2.4 MB",
            uploadedBy: "Executive HR",
            uploadedAt: "2025-01-01",
            isConfidential: false,
            status: "Active"
          },
          {
            id: "DOC-2",
            documentCode: "DOC-002",
            title: "Standard Employment & Non-Disclosure Agreement (NDA)",
            type: "NDA",
            description: "Template legal contract for technical and operational hires.",
            fileName: "Standard_NDA_Template_v2.docx",
            fileSize: "680 KB",
            uploadedBy: "Legal & Compliance",
            uploadedAt: "2025-01-10",
            isConfidential: true,
            status: "Active"
          },
          {
            id: "DOC-3",
            documentCode: "DOC-003",
            employeeId: hrEmployees[0]?.id || "EMP-001",
            employeeName: hrEmployees[0]?.name || "Sample Employee",
            title: "Employment Contract — Lead Engineer",
            type: "Contract",
            description: "Signed executive employment agreement.",
            fileName: "Contract_Mian_Talal_Signed.pdf",
            fileSize: "1.8 MB",
            uploadedBy: "HR Talent Ops",
            uploadedAt: "2025-01-15",
            expiresAt: "2026-01-15",
            isConfidential: true,
            status: "Active"
          }
        ];
        setDocuments(initial);
        localStorage.setItem(key, JSON.stringify(initial));
      }
    }
  }, [currentUser?.tenantId, hrEmployees]);

  const saveDocuments = (data: HRDocument[]) => {
    setDocuments(data);
    if (currentUser?.tenantId) {
      localStorage.setItem(`hr_documents_${currentUser.tenantId}`, JSON.stringify(data));
    }
  };

  const [form, setForm] = useState({
    title: "",
    type: "Contract" as HRDocument["type"],
    employeeId: "",
    description: "",
    fileName: "",
    expiresAt: "",
    isConfidential: false
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    const count = documents.length + 1;
    const emp = hrEmployees.find((e) => e.id === form.employeeId);

    const newDoc: HRDocument = {
      id: `DOC-${Date.now()}`,
      documentCode: `DOC-${String(count).padStart(3, "0")}`,
      title: form.title,
      type: form.type,
      employeeId: emp?.id,
      employeeName: emp?.name,
      description: form.description,
      fileName: form.fileName || `${form.title.replace(/\s+/g, "_")}.pdf`,
      fileSize: "1.2 MB",
      uploadedBy: currentUser?.name || "HR Admin",
      uploadedAt: new Date().toISOString().split("T")[0],
      expiresAt: form.expiresAt || undefined,
      isConfidential: form.isConfidential,
      status: "Active"
    };

    saveDocuments([newDoc, ...documents]);
    setShowUploadModal(false);
    setForm({
      title: "",
      type: "Contract",
      employeeId: "",
      description: "",
      fileName: "",
      expiresAt: "",
      isConfidential: false
    });
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const isCompanyDoc = !doc.employeeId;
      const matchTab = tab === "Company" ? isCompanyDoc : !isCompanyDoc;
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        (doc.employeeName && doc.employeeName.toLowerCase().includes(q));
      const matchType = selectedType === "All" || doc.type === selectedType;
      return matchTab && matchSearch && matchType;
    });
  }, [documents, tab, searchQuery, selectedType]);

  const companyDocsCount = documents.filter((d) => !d.employeeId).length;
  const employeeDocsCount = documents.filter((d) => d.employeeId).length;

  return (
    <div className="flex min-h-screen bg-[#05080d] text-gray-100 font-sans">
      <HRMSSidebar />
      <main className="flex-grow p-6 space-y-6 overflow-y-auto max-h-screen">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <FileArchive size={22} className="text-emerald-400" />
              Document Vault & Policy Repository
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Secure digital repository for company policies, NDAs, employee contracts, and verification documents.
            </p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40"
          >
            <Plus size={15} /> Upload Document
          </button>
        </div>

        {/* Tab & Filter bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setTab("Company")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
                tab === "Company"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              <Building2 size={14} /> Company Policies ({companyDocsCount})
            </button>
            <button
              onClick={() => setTab("Employee")}
              className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl transition ${
                tab === "Employee"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
              }`}
            >
              <User size={14} /> Staff Records ({employeeDocsCount})
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-black border border-gray-800 text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Types</option>
              <option value="Policy">Policy</option>
              <option value="Contract">Contract</option>
              <option value="NDA">NDA</option>
              <option value="CNIC">CNIC / ID</option>
              <option value="Experience Letter">Experience Letter</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.length === 0 ? (
            <div className="col-span-full p-12 text-center text-gray-500 bg-[#0b0f17] border border-gray-800 rounded-2xl">
              No documents found in this vault section.
            </div>
          ) : (
            filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition group"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileText size={20} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {doc.isConfidential && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20">
                          <Lock size={10} /> Confidential
                        </span>
                      )}
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                        {doc.type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-white group-hover:text-emerald-400 transition">{doc.title}</h2>
                    {doc.employeeName && (
                      <p className="text-[11px] text-emerald-400 font-bold mt-0.5">Staff: {doc.employeeName}</p>
                    )}
                    {doc.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{doc.description}</p>}
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800/80">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>{doc.fileName}</span>
                    <span>{doc.fileSize}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[10px] text-gray-500">Uploaded {doc.uploadedAt}</span>
                    <button
                      onClick={() => alert(`Downloading ${doc.fileName}...`)}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition border border-emerald-500/20"
                    >
                      <Download size={13} /> Download
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0c1018] border border-gray-700 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileArchive size={16} className="text-emerald-400" />
                Upload Document to Vault
              </h2>
              <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-4 space-y-3.5">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Document Title</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Employee Contract, CNIC Front & Back"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Document Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Policy">Company Policy</option>
                    <option value="Contract">Employment Contract</option>
                    <option value="NDA">NDA Agreement</option>
                    <option value="CNIC">CNIC / ID Card</option>
                    <option value="Experience Letter">Experience Letter</option>
                    <option value="Offer Letter">Offer Letter</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Assign to Staff</label>
                  <select
                    value={form.employeeId}
                    onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">None (Company Document)</option>
                    {hrEmployees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} &bull; {emp.department}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">File Name</label>
                <input
                  type="text"
                  placeholder="e.g. Agreement_2025.pdf"
                  value={form.fileName}
                  onChange={(e) => setForm({ ...form, fileName: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary or details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-black border border-gray-800 text-white text-xs p-2.5 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="confidentialDoc"
                  checked={form.isConfidential}
                  onChange={(e) => setForm({ ...form, isConfidential: e.target.checked })}
                  className="rounded bg-black border-gray-800 text-emerald-500"
                />
                <label htmlFor="confidentialDoc" className="text-xs text-gray-300 font-bold cursor-pointer">
                  Mark as confidential (restricted HR access)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs p-3 rounded-xl transition mt-2 shadow-lg shadow-emerald-950/50"
              >
                Upload & Secure Document
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
