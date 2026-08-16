"use client";

import React, { useState } from "react";
import { useSMS } from "@/context/sms-context";
import {
  BookOpen,
  Plus,
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  Bookmark,
  Share2,
  Clock,
  Trash2,
  X
} from "lucide-react";

interface LearningMaterial {
  id: string;
  title: string;
  subject: string;
  author: string;
  type: string;
  uploadedAt: string;
  downloads: number;
}

interface DailyDiaryItem {
  id: string;
  date: string;
  subject: string;
  homework: string;
  teacher: string;
  due: string;
}

export default function SMSLMSPage() {
  const { theme, classes, teachers } = useSMS();
  const isLight = theme === "light";

  const [selectedClass, setSelectedClass] = useState(classes[0]?.className || "Class 9 (Science)");

  // Clean empty state by default
  const [learningMaterials, setLearningMaterials] = useState<LearningMaterial[]>([]);
  const [dailyDiary, setDailyDiary] = useState<DailyDiaryItem[]>([]);

  // Modals
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showDiaryModal, setShowDiaryModal] = useState(false);

  const [materialForm, setMaterialForm] = useState({
    title: "",
    subject: "Physics",
    author: teachers[0]?.fullName || "Subject Master",
    type: "PDF Document (2.5 MB)"
  });

  const [diaryForm, setDiaryForm] = useState({
    subject: "Physics",
    homework: "",
    teacher: teachers[0]?.fullName || "Subject Faculty",
    due: new Date(Date.now() + 86400000).toISOString().split("T")[0]
  });

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.title) return;
    const newMat: LearningMaterial = {
      id: `MAT-${Date.now()}`,
      title: materialForm.title,
      subject: materialForm.subject,
      author: materialForm.author,
      type: materialForm.type,
      uploadedAt: new Date().toISOString().split("T")[0],
      downloads: 0
    };
    setLearningMaterials([newMat, ...learningMaterials]);
    setShowMaterialModal(false);
    setMaterialForm({
      title: "",
      subject: "Physics",
      author: teachers[0]?.fullName || "Subject Master",
      type: "PDF Document (2.5 MB)"
    });
  };

  const handleAddDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diaryForm.homework) return;
    const newDry: DailyDiaryItem = {
      id: `DRY-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      subject: diaryForm.subject,
      homework: diaryForm.homework,
      teacher: diaryForm.teacher,
      due: diaryForm.due
    };
    setDailyDiary([newDry, ...dailyDiary]);
    setShowDiaryModal(false);
    setDiaryForm({
      subject: "Physics",
      homework: "",
      teacher: teachers[0]?.fullName || "Subject Faculty",
      due: new Date(Date.now() + 86400000).toISOString().split("T")[0]
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-4`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <BookOpen className={isLight ? "text-sky-600" : "text-sky-400"} size={22} />
            <span>Digital Learning Repository &amp; Daily Homework Diary</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Publish digital lecture handouts, chapter worksheets, 10-year past papers, and daily classroom diary assignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowMaterialModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Upload Handout</span>
          </button>

          <button
            onClick={() => setShowDiaryModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Assign Daily Diary</span>
          </button>
        </div>
      </div>

      {/* Class Selector */}
      <div className="w-full sm:w-80">
        <label className={`block text-[10px] uppercase font-bold ${isLight ? "text-slate-500" : "text-gray-400"} mb-1`}>Target Class Handouts</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className={`w-full ${
            isLight ? "bg-white border-slate-200 text-slate-900 shadow-xs" : "bg-[#0b121e] border-[#1e293b] text-white"
          } border p-2.5 rounded-xl font-bold text-xs focus:outline-none focus:border-sky-500`}
        >
          {classes.length === 0 ? (
            <option value="">No Classes Enrolled Yet</option>
          ) : (
            classes.map((c) => (
              <option key={c.id} value={c.className}>
                {c.className} ({c.sectionName})
              </option>
            ))
          )}
        </select>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Materials */}
        <div className="space-y-3">
          <h3 className={`text-xs uppercase font-bold ${isLight ? "text-sky-700 font-bold" : "text-sky-400"} tracking-wider`}>
            Digital Notes &amp; Handouts ({learningMaterials.length})
          </h3>

          {learningMaterials.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center text-xs ${
              isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
            }`}>
              <FileText size={28} className="mx-auto mb-2 opacity-40 text-sky-500" />
              <p className="font-bold">No Lecture Notes Uploaded Yet</p>
              <p className="text-[11px] mt-1">Click "+ Upload Handout" to share study materials with students.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {learningMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className={`${
                    isLight ? "bg-white border-slate-200 hover:border-sky-400 shadow-sm" : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/40"
                  } border p-5 rounded-2xl space-y-3 transition group`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className={`text-[10px] font-bold ${
                      isLight ? "bg-sky-50 text-sky-700 border-sky-300" : "bg-sky-500/10 text-sky-400 border-sky-500/20"
                    } border px-2 py-0.5 rounded`}>
                      {mat.subject}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-500"} font-mono`}>{mat.uploadedAt}</span>
                      <button
                        onClick={() => setLearningMaterials(learningMaterials.filter((m) => m.id !== mat.id))}
                        className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className={`text-sm font-bold ${isLight ? "text-slate-900 group-hover:text-sky-600" : "text-white group-hover:text-sky-300"} transition`}>{mat.title}</h4>
                  <div className={`flex justify-between items-center text-xs ${isLight ? "text-slate-600" : "text-gray-400"}`}>
                    <span>By: <b className={isLight ? "text-slate-800" : "text-gray-200"}>{mat.author}</b></span>
                    <button
                      onClick={() => alert(`Downloading handout: ${mat.title}`)}
                      className={`flex items-center gap-1 ${isLight ? "text-sky-700 hover:text-sky-900" : "text-sky-400 hover:text-white"} font-bold text-[11px] cursor-pointer`}
                    >
                      <Download size={12} />
                      <span>Download Handout</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Diary */}
        <div className="space-y-3">
          <h3 className={`text-xs uppercase font-bold ${isLight ? "text-emerald-700 font-bold" : "text-emerald-400"} tracking-wider`}>
            Daily Classroom Diary &amp; Homework ({dailyDiary.length})
          </h3>

          {dailyDiary.length === 0 ? (
            <div className={`p-8 rounded-2xl border text-center text-xs ${
              isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-500"
            }`}>
              <BookOpen size={28} className="mx-auto mb-2 opacity-40 text-emerald-500" />
              <p className="font-bold">No Daily Diary Recorded</p>
              <p className="text-[11px] mt-1">Click "+ Assign Daily Diary" to publish homework assignments.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {dailyDiary.map((dry) => (
                <div key={dry.id} className={`${
                  isLight ? "bg-white border-emerald-200 shadow-sm" : "bg-[#0b121e] border-emerald-500/30"
                } border p-5 rounded-2xl space-y-3`}>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`${isLight ? "text-emerald-800" : "text-emerald-400"} font-bold font-mono`}>{dry.subject}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] ${
                        isLight ? "bg-red-50 text-red-700 border-red-200" : "bg-red-500/10 text-red-400 border-red-500/20"
                      } border px-2 py-0.5 rounded font-bold`}>
                        Due: {dry.due}
                      </span>
                      <button
                        onClick={() => setDailyDiary(dailyDiary.filter((d) => d.id !== dry.id))}
                        className={`${isLight ? "text-slate-400 hover:text-red-600" : "text-gray-500 hover:text-red-400"} cursor-pointer`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs ${isLight ? "text-slate-800" : "text-gray-200"} leading-relaxed font-sans`}>{dry.homework}</p>
                  <div className={`text-[10px] ${isLight ? "text-slate-500 border-slate-100" : "text-gray-500 border-gray-800"} border-t pt-2 flex justify-between`}>
                    <span>Assigned By: <b className={isLight ? "text-slate-700" : "text-gray-300"}>{dry.teacher}</b></span>
                    <span>Date: {dry.date}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Upload Learning Handout</h3>
              <button onClick={() => setShowMaterialModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Handout Title</label>
                <input
                  type="text"
                  placeholder="e.g. Chapter 2 Notes & Numerical Solutions"
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Physics"
                  value={materialForm.subject}
                  onChange={(e) => setMaterialForm({ ...materialForm, subject: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Save &amp; Publish Handout
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Diary Modal */}
      {showDiaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`${
            isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-emerald-500/40 text-white"
          } border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4`}>
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-sm">Assign Daily Homework Diary</h3>
              <button onClick={() => setShowDiaryModal(false)} className="cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddDiary} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Mathematics"
                  value={diaryForm.subject}
                  onChange={(e) => setDiaryForm({ ...diaryForm, subject: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Homework Details</label>
                <textarea
                  rows={3}
                  placeholder="Describe homework task..."
                  value={diaryForm.homework}
                  onChange={(e) => setDiaryForm({ ...diaryForm, homework: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold mb-1">Submission Due Date</label>
                <input
                  type="date"
                  value={diaryForm.due}
                  onChange={(e) => setDiaryForm({ ...diaryForm, due: e.target.value })}
                  className="w-full border p-2 rounded-xl"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
              >
                Publish Diary Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
