"use client";

import React, { useState } from "react";
import { useSMS, LibraryBook } from "@/context/sms-context";
import {
  Library,
  Plus,
  Search,
  BookOpen,
  CheckCircle2,
  Clock,
  UserCheck
} from "lucide-react";

export default function SMSLibraryPage() {
  const { theme, libraryBooks, issuedBooks, issueBook, returnBook, students } = useSMS();
  const isLight = theme === "light";

  const [search, setSearch] = useState("");
  const [issueModalBook, setIssueModalBook] = useState<LibraryBook | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || "");
  const [dueDate, setDueDate] = useState("2026-08-30");

  const filteredBooks = libraryBooks.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      b.accessionNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueModalBook || !selectedStudentId) return;
    issueBook(issueModalBook.id, selectedStudentId, dueDate);
    setIssueModalBook(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Library className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Library Accession Catalog &amp; Book Circulation</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Catalog school books, manage student loans, track overdue returns, and issue library clearance cards.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLight ? "text-slate-400" : "text-gray-500"}`} />
        <input
          type="text"
          placeholder="Search book title, author, accession #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full ${
            isLight
              ? "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-sky-500 shadow-xs"
              : "bg-[#0b121e] border-[#1e293b] text-white placeholder-gray-500 focus:border-sky-500"
          } border pl-9 pr-3 py-2.5 rounded-xl text-xs focus:outline-none`}
        />
      </div>

      {/* Books Table */}
      <div className={`${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} border rounded-2xl overflow-hidden shadow-2xl`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[11px]`}>
                <th className="p-4 font-bold">Accession #</th>
                <th className="p-4 font-bold">Book Title</th>
                <th className="p-4 font-bold">Author</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Shelf Location</th>
                <th className="p-4 font-bold text-center">Available / Total</th>
                <th className="p-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} font-mono text-[11px]`}>
              {filteredBooks.map((b) => (
                <tr key={b.id} className={`${isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"} transition`}>
                  <td className={`p-4 font-bold ${isLight ? "text-sky-700" : "text-sky-400"}`}>{b.accessionNo}</td>
                  <td className={`p-4 font-sans font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{b.title}</td>
                  <td className={`p-4 font-sans ${isLight ? "text-slate-700" : "text-gray-300"}`}>{b.author}</td>
                  <td className="p-4 font-sans">
                    <span className={`${
                      isLight ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-sky-500/10 text-sky-300 border-sky-500/20"
                    } border px-2 py-0.5 rounded text-[10px] font-bold`}>
                      {b.category}
                    </span>
                  </td>
                  <td className={`p-4 ${isLight ? "text-slate-600" : "text-gray-400"}`}>{b.shelfNumber}</td>
                  <td className="p-4 text-center">
                    <span className={`${
                      isLight ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    } border px-2.5 py-1 rounded-lg font-bold`}>
                      {b.availableCopies} / {b.totalCopies}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      disabled={b.availableCopies <= 0}
                      onClick={() => setIssueModalBook(b)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 text-white rounded-lg font-bold text-[10px] transition cursor-pointer shadow-xs"
                    >
                      Issue to Student
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Modal */}
      {issueModalBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up`}>
            <div className={`flex justify-between items-center border-b ${isLight ? "border-slate-100" : "border-gray-800"} pb-3 mb-4`}>
              <h3 className={`font-black ${isLight ? "text-slate-900" : "text-white"} text-sm`}>Issue Library Book</h3>
              <button onClick={() => setIssueModalBook(null)} className={`${isLight ? "text-slate-400 hover:text-slate-800" : "text-gray-400 hover:text-white"} cursor-pointer`}>
                ✕
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 text-xs">
              <div className={`${isLight ? "bg-slate-50 border-slate-200" : "bg-black/40 border-gray-800"} border rounded-xl p-3 space-y-1`}>
                <div className={`font-bold ${isLight ? "text-slate-900" : "text-white"} text-sm`}>{issueModalBook.title}</div>
                <div className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"}`}>{issueModalBook.author} • Shelf: {issueModalBook.shelfNumber}</div>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} mb-1`}>Select Student</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.firstName} {st.lastName} (Roll #{st.rollNo} • {st.className})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Return Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-2.5 rounded-xl font-bold`}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Confirm Book Issue
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
