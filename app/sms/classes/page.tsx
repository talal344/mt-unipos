"use client";

import React, { useState, useMemo, useRef } from "react";
import { useSMS, SMSClassSection, SMSClassSubject, StudentRecord } from "@/context/sms-context";
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ArrowRightLeft,
  X,
  ShieldCheck,
  Search,
  Sparkles,
  GraduationCap,
  Download,
  Upload,
  FileSpreadsheet,
  BookOpen,
  Layers,
  ChevronRight,
  HelpCircle
} from "lucide-react";

export default function SMSClassesPage() {
  const {
    theme,
    classes,
    classSubjects,
    students,
    teachers,
    addClassSection,
    updateClassSection,
    deleteClassSection,
    addClassSubject,
    updateClassSubject,
    deleteClassSubject,
    bulkImportClassesAndSubjects,
    reassignStudentSection
  } = useSMS();

  const isLight = theme === "light";

  // Active Tab: 'classes' | 'subjects' | 'transfer'
  const [activeTab, setActiveTab] = useState<"classes" | "subjects" | "transfer">("classes");

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Modals
  const [showClassModal, setShowClassModal] = useState(false);
  const [editingClass, setEditingClass] = useState<SMSClassSection | null>(null);

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SMSClassSubject | null>(null);

  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelPasteText, setExcelPasteText] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reassign Student Modal State
  const [reassignTargetStudent, setReassignTargetStudent] = useState<StudentRecord | null>(null);
  const [targetClassSectionId, setTargetClassSectionId] = useState(classes[1]?.id || classes[0]?.id || "");

  // Form State for Class & Section
  const [classForm, setClassForm] = useState({
    classId: "C1",
    className: "",
    sectionName: "A",
    wing: "Primary & Middle Wing",
    roomNumber: "Room 1",
    capacity: 35,
    classTeacherName: "",
    crBoyName: "",
    grGirlName: "",
    // Quick add subjects when creating a class
    quickSubjects: ""
  });

  // Form State for Subject
  const [subjectForm, setSubjectForm] = useState<{
    className: string;
    subjectName: string;
    type: "Compulsory" | "Elective";
    totalMarks: number;
    passingMarks: number;
    teacherName: string;
  }>({
    className: classes[0]?.className || "One",
    subjectName: "",
    type: "Compulsory",
    totalMarks: 100,
    passingMarks: 40,
    teacherName: ""
  });

  // Unique list of configured classes
  const uniqueClassNames = useMemo(() => {
    const list = Array.from(new Set(classes.map((c) => c.className))).filter(Boolean);
    return list.length > 0 ? list : ["One"];
  }, [classes]);

  // Group classes by Class Name
  const groupedClasses = useMemo(() => {
    const map: Record<string, SMSClassSection[]> = {};
    classes.forEach((c) => {
      if (!map[c.className]) map[c.className] = [];
      map[c.className].push(c);
    });
    return map;
  }, [classes]);

  // Filtered Subjects
  const filteredSubjects = useMemo(() => {
    return classSubjects.filter((sub) => {
      const matchClass = selectedClassFilter === "All" || sub.className === selectedClassFilter;
      const matchSearch = !search || sub.subjectName.toLowerCase().includes(search.toLowerCase()) || sub.className.toLowerCase().includes(search.toLowerCase());
      return matchClass && matchSearch;
    });
  }, [classSubjects, selectedClassFilter, search]);

  // ==========================================
  // EXCEL / CSV TEMPLATE DOWNLOAD HANDLER
  // ==========================================
  const handleDownloadExcelTemplate = () => {
    const headers = ["Class Name", "Section Name", "Subject Name", "Subject Type (Compulsory/Elective)", "Total Marks", "Passing Marks", "Campus Wing", "Room Number", "Capacity"];
    const sampleRows = [
      ["One", "A", "English", "Compulsory", "100", "40", "Primary Wing", "Room 1", "35"],
      ["One", "A", "Urdu", "Compulsory", "100", "40", "Primary Wing", "Room 1", "35"],
      ["One", "A", "Mathematics", "Compulsory", "100", "40", "Primary Wing", "Room 1", "35"],
      ["One", "A", "General Science", "Compulsory", "100", "40", "Primary Wing", "Room 1", "35"],
      ["One", "A", "Islamic Studies", "Compulsory", "100", "40", "Primary Wing", "Room 1", "35"],
      ["2nd", "A", "English", "Compulsory", "100", "40", "Primary Wing", "Room 2", "35"],
      ["2nd", "A", "Mathematics", "Compulsory", "100", "40", "Primary Wing", "Room 2", "35"],
      ["3rd", "A", "English", "Compulsory", "100", "40", "Middle Wing", "Room 3", "35"],
      ["4th", "A", "English", "Compulsory", "100", "40", "Middle Wing", "Room 4", "35"],
      ["5th", "A", "English", "Compulsory", "100", "40", "Middle Wing", "Room 5", "35"],
      ["9th", "A", "Physics", "Compulsory", "75", "25", "Senior Wing", "Room 101", "40"],
      ["9th", "A", "Chemistry", "Compulsory", "75", "25", "Senior Wing", "Room 101", "40"],
      ["9th", "A", "Biology", "Elective", "75", "25", "Senior Wing", "Bio Lab", "40"],
      ["9th", "A", "Computer Science", "Elective", "75", "25", "Senior Wing", "Computer Lab", "40"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...sampleRows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "SMS_Classes_Sections_Subjects_Template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMsg("📥 Excel/CSV Sample Template Downloaded!");
    setTimeout(() => setToastMsg(""), 3500);
  };

  // ==========================================
  // EXCEL / CSV IMPORT PARSER & HANDLER
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setExcelPasteText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessExcelImport = () => {
    if (!excelPasteText.trim()) return;

    const lines = excelPasteText.trim().split("\n");
    const parsedClasses: Omit<SMSClassSection, "id" | "enrolledCount">[] = [];
    const parsedSubjects: Omit<SMSClassSubject, "id">[] = [];

    // Check if line 1 is header
    const startIndex = lines[0]?.toLowerCase().includes("class") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Support CSV comma separation or Tab separation
      const cols = line.includes("\t") ? line.split("\t") : line.split(",");
      const className = cols[0]?.trim();
      const sectionName = cols[1]?.trim() || "A";
      const subjectName = cols[2]?.trim();
      const subjectTypeRaw = cols[3]?.trim().toLowerCase();
      const type: "Compulsory" | "Elective" = subjectTypeRaw?.includes("elec") || subjectTypeRaw?.includes("opt") ? "Elective" : "Compulsory";
      const totalMarks = parseInt(cols[4]?.trim() || "100", 10) || 100;
      const passingMarks = parseInt(cols[5]?.trim() || "40", 10) || 40;
      const wing = cols[6]?.trim() || "General Wing";
      const roomNumber = cols[7]?.trim() || `Room ${i + 1}`;
      const capacity = parseInt(cols[8]?.trim() || "35", 10) || 35;

      if (className) {
        // Add Class Section
        const classExists = parsedClasses.some((c) => c.className === className && c.sectionName === sectionName);
        if (!classExists) {
          parsedClasses.push({
            classId: `C-${className.replace(/\s+/g, "")}`,
            className,
            sectionName,
            wing,
            roomNumber,
            capacity,
            classTeacherName: "",
            crBoyName: "",
            grGirlName: ""
          });
        }

        // Add Subject if present
        if (subjectName) {
          const subExists = parsedSubjects.some((s) => s.className === className && s.subjectName === subjectName);
          if (!subExists) {
            parsedSubjects.push({
              className,
              subjectName,
              type,
              totalMarks,
              passingMarks
            });
          }
        }
      }
    }

    const result = bulkImportClassesAndSubjects(parsedClasses, parsedSubjects);
    setShowExcelModal(false);
    setExcelPasteText("");
    setToastMsg(`✅ Imported ${result.classCount} Classes/Sections & ${result.subjectCount} Subjects from Excel!`);
    setTimeout(() => setToastMsg(""), 4500);
  };

  // ==========================================
  // MANUAL CLASS & SECTION HANDLERS
  // ==========================================
  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassForm({
      classId: `C${Math.floor(10 + Math.random() * 90)}`,
      className: "",
      sectionName: "A",
      wing: "Primary & Middle Wing",
      roomNumber: `Room ${classes.length + 1}`,
      capacity: 35,
      classTeacherName: "",
      crBoyName: "",
      grGirlName: "",
      quickSubjects: "English, Urdu, Mathematics, General Science, Islamiat"
    });
    setShowClassModal(true);
  };

  const handleOpenEditClass = (c: SMSClassSection) => {
    setEditingClass(c);
    setClassForm({
      classId: c.classId,
      className: c.className,
      sectionName: c.sectionName,
      wing: c.wing,
      roomNumber: c.roomNumber,
      capacity: c.capacity,
      classTeacherName: c.classTeacherName || "",
      crBoyName: c.crBoyName || "",
      grGirlName: c.grGirlName || "",
      quickSubjects: ""
    });
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.className || !classForm.sectionName) return;

    if (editingClass) {
      updateClassSection(editingClass.id, {
        className: classForm.className,
        sectionName: classForm.sectionName,
        wing: classForm.wing,
        roomNumber: classForm.roomNumber,
        capacity: classForm.capacity,
        classTeacherName: classForm.classTeacherName,
        crBoyName: classForm.crBoyName,
        grGirlName: classForm.grGirlName
      });
      setToastMsg(`✅ Class section "${classForm.className} (${classForm.sectionName})" updated!`);
    } else {
      const created = addClassSection({
        classId: classForm.classId,
        className: classForm.className,
        sectionName: classForm.sectionName,
        wing: classForm.wing,
        roomNumber: classForm.roomNumber,
        capacity: classForm.capacity,
        classTeacherName: classForm.classTeacherName,
        crBoyName: classForm.crBoyName,
        grGirlName: classForm.grGirlName
      });

      // Quick add subjects if provided
      if (classForm.quickSubjects.trim()) {
        const subList = classForm.quickSubjects.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
        subList.forEach((sName) => {
          addClassSubject({
            className: classForm.className,
            subjectName: sName,
            type: "Compulsory",
            totalMarks: 100,
            passingMarks: 40
          });
        });
      }

      setToastMsg(`✅ Class "${classForm.className} (${classForm.sectionName})" & subjects created!`);
    }

    setShowClassModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeleteClass = (c: SMSClassSection) => {
    if (confirm(`Are you sure you want to remove Class "${c.className}" Section "${c.sectionName}"?`)) {
      deleteClassSection(c.id);
      setToastMsg(`🗑️ Class Section removed.`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  // ==========================================
  // MANUAL SUBJECT HANDLERS
  // ==========================================
  const handleOpenAddSubject = (presetClass?: string) => {
    setEditingSubject(null);
    setSubjectForm({
      className: presetClass || uniqueClassNames[0] || "One",
      subjectName: "",
      type: "Compulsory",
      totalMarks: 100,
      passingMarks: 40,
      teacherName: ""
    });
    setShowSubjectModal(true);
  };

  const handleOpenEditSubject = (sub: SMSClassSubject) => {
    setEditingSubject(sub);
    setSubjectForm({
      className: sub.className,
      subjectName: sub.subjectName,
      type: sub.type,
      totalMarks: sub.totalMarks,
      passingMarks: sub.passingMarks,
      teacherName: sub.teacherName || ""
    });
    setShowSubjectModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.className || !subjectForm.subjectName) return;

    if (editingSubject) {
      updateClassSubject(editingSubject.id, subjectForm);
      setToastMsg(`✅ Subject "${subjectForm.subjectName}" updated for ${subjectForm.className}!`);
    } else {
      addClassSubject(subjectForm);
      setToastMsg(`✅ Added "${subjectForm.subjectName}" (${subjectForm.type}) to ${subjectForm.className}!`);
    }
    setShowSubjectModal(false);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const handleDeleteSubject = (sub: SMSClassSubject) => {
    if (confirm(`Delete subject "${sub.subjectName}" from ${sub.className}?`)) {
      deleteClassSubject(sub.id);
      setToastMsg(`🗑️ Subject deleted.`);
      setTimeout(() => setToastMsg(""), 3500);
    }
  };

  // Student Section Reassignment
  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignTargetStudent) return;

    const targetSec = classes.find((c) => c.id === targetClassSectionId);
    if (!targetSec) return;

    reassignStudentSection(
      reassignTargetStudent.id,
      targetSec.id,
      targetSec.className,
      targetSec.id,
      targetSec.sectionName
    );

    setToastMsg(`✅ ${reassignTargetStudent.firstName} shifted to ${targetSec.className} (${targetSec.sectionName})!`);
    setReassignTargetStudent(null);
    setTimeout(() => setToastMsg(""), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Page Header with Master Action Buttons */}
      <div className={`flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b ${isLight ? "border-slate-200" : "border-gray-800"} pb-5`}>
        <div>
          <h1 className={`text-xl font-black tracking-tight ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
            <Building2 className={isLight ? "text-sky-600" : "text-sky-400"} size={24} />
            <span>Academic Classes, Sections &amp; Subject Curriculum Hub</span>
          </h1>
          <p className={`text-xs ${isLight ? "text-slate-600 font-medium" : "text-gray-400"}`}>
            Configure classes, allocate sections, set compulsory/elective subjects, or upload entire school academic structure via Excel.
          </p>
        </div>

        {/* Master Action Hub */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Download Sample Excel */}
          <button
            onClick={handleDownloadExcelTemplate}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${
              isLight
                ? "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                : "bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            } border text-xs font-bold transition cursor-pointer shadow-xs`}
            title="Download Sample Excel template to fill classes, sections and subjects"
          >
            <Download size={14} className="text-emerald-500" />
            <span>Sample Excel Template</span>
          </button>

          {/* Import via Excel */}
          <button
            onClick={() => setShowExcelModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition cursor-pointer"
          >
            <FileSpreadsheet size={14} />
            <span>Excel / CSV Bulk Uploader</span>
          </button>

          {/* Manual Add Subject */}
          <button
            onClick={() => handleOpenAddSubject()}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl ${
              isLight ? "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300" : "bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-white border-amber-500/30"
            } border text-xs font-bold transition cursor-pointer`}
          >
            <BookOpen size={14} />
            <span>+ Add Subject</span>
          </button>

          {/* Manual Add Class */}
          <button
            onClick={handleOpenAddClass}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-sky-600/20 transition cursor-pointer"
          >
            <Plus size={15} />
            <span>+ Add Class &amp; Section</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("classes")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "classes"
              ? "bg-sky-600 text-white shadow-md"
              : isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <Building2 size={14} />
          <span>Classes &amp; Sections Overview ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "subjects"
              ? "bg-purple-600 text-white shadow-md"
              : isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <BookOpen size={14} />
          <span>Subject Curriculum &amp; Electives ({classSubjects.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("transfer")}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "transfer"
              ? "bg-emerald-600 text-white shadow-md"
              : isLight
              ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
              : "bg-gray-800 hover:bg-gray-700 text-gray-300"
          }`}
        >
          <ArrowRightLeft size={14} />
          <span>Student Section Transfer / Shifting</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CLASSES & SECTIONS OVERVIEW                                        */}
      {/* ========================================================================= */}
      {activeTab === "classes" && (
        <div className="space-y-4">
          {Object.keys(groupedClasses).length === 0 ? (
            <div className={`p-12 text-center rounded-3xl border ${isLight ? "bg-white border-slate-200 text-slate-500" : "bg-[#0b121e] border-[#1e293b] text-gray-400"} shadow-sm`}>
              <Building2 size={40} className="mx-auto mb-3 text-sky-500 opacity-60" />
              <h3 className="font-bold text-sm">No Classes or Sections Configured</h3>
              <p className="text-xs mt-1 text-gray-500">
                Click <b>"+ Add Class &amp; Section"</b> or use <b>"Excel / CSV Bulk Uploader"</b> above to import all school classes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {Object.entries(groupedClasses).map(([className, secList]) => {
                const classSubList = classSubjects.filter((s) => s.className === className);
                const totalStudentsInClass = students.filter((s) => s.className === className && s.status === "Active").length;

                return (
                  <div
                    key={className}
                    className={`rounded-3xl border ${
                      isLight ? "bg-white border-slate-200 shadow-sm hover:shadow-md" : "bg-[#0b121e] border-[#1e293b] hover:border-sky-500/30"
                    } p-5 transition flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      {/* Class Title Header */}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center font-black text-sm">
                              {className.charAt(0)}
                            </span>
                            <h3 className={`text-base font-black ${isLight ? "text-slate-900" : "text-white"}`}>{className}</h3>
                          </div>
                          <span className={`text-[10px] ${isLight ? "text-slate-500" : "text-gray-400"} mt-0.5 block`}>
                            {secList[0]?.wing || "General Wing"} &bull; {totalStudentsInClass} Enrolled Students
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenAddSubject(className)}
                          className={`p-1.5 rounded-lg text-xs font-bold ${
                            isLight ? "bg-amber-50 hover:bg-amber-100 text-amber-800" : "bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-white"
                          } transition cursor-pointer flex items-center gap-1`}
                          title="Add Subject to this class"
                        >
                          <BookOpen size={12} />
                          <span className="text-[10px]">+ Subject</span>
                        </button>
                      </div>

                      {/* Sections Pills */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800/80 space-y-2">
                        <span className={`text-[10px] uppercase font-bold ${isLight ? "text-sky-700" : "text-sky-400"} block`}>
                          Configured Sections ({secList.length}):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {secList.map((sec) => (
                            <div
                              key={sec.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${
                                isLight ? "bg-slate-50 border-slate-200 text-slate-800" : "bg-black/40 border-gray-800 text-white"
                              }`}
                            >
                              <span className="text-sky-600 font-mono">Section {sec.sectionName}</span>
                              <span className="text-[10px] text-gray-400 font-normal">({sec.roomNumber})</span>
                              <div className="flex items-center gap-1 ml-1">
                                <button
                                  onClick={() => handleOpenEditClass(sec)}
                                  className="text-slate-400 hover:text-sky-600 transition"
                                  title="Edit Section"
                                >
                                  <Edit2 size={11} />
                                </button>
                                <button
                                  onClick={() => handleDeleteClass(sec)}
                                  className="text-slate-400 hover:text-red-600 transition"
                                  title="Delete Section"
                                >
                                  <Trash2 size={11} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Subjects Configured in this Class */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-gray-800/80 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className={`${isLight ? "text-purple-700" : "text-purple-400"} uppercase`}>
                            Subjects ({classSubList.length}):
                          </span>
                          <span className="text-gray-400">{classSubList.filter((s) => s.type === "Compulsory").length} Compulsory &bull; {classSubList.filter((s) => s.type === "Elective").length} Elective</span>
                        </div>

                        {classSubList.length === 0 ? (
                          <p className="text-[11px] text-gray-400 italic">No subjects added. Click "+ Subject" to configure curriculum.</p>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {classSubList.map((sub) => (
                              <span
                                key={sub.id}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                                  sub.type === "Compulsory"
                                    ? isLight
                                      ? "bg-purple-50 text-purple-700 border-purple-200"
                                      : "bg-purple-500/10 text-purple-300 border-purple-500/20"
                                    : isLight
                                    ? "bg-amber-50 text-amber-800 border-amber-200"
                                    : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                                }`}
                              >
                                {sub.subjectName} {sub.type === "Elective" ? "(Opt)" : ""}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        handleOpenAddClass();
                        setClassForm((prev) => ({ ...prev, className }));
                      }}
                      className={`w-full py-2 rounded-xl text-center text-xs font-bold transition cursor-pointer border ${
                        isLight ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200" : "bg-white/5 hover:bg-white/10 text-gray-300 border-gray-800"
                      }`}
                    >
                      + Add Another Section to {className}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SUBJECT CURRICULUM & ELECTIVES DIRECTORY                           */}
      {/* ========================================================================= */}
      {activeTab === "subjects" && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className={`font-bold ${isLight ? "text-slate-700" : "text-gray-300"}`}>Filter by Class:</span>
              <button
                onClick={() => setSelectedClassFilter("All")}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  selectedClassFilter === "All"
                    ? "bg-purple-600 text-white"
                    : isLight
                    ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }`}
              >
                All Classes ({classSubjects.length})
              </button>
              {uniqueClassNames.map((cName) => (
                <button
                  key={cName}
                  onClick={() => setSelectedClassFilter(cName)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                    selectedClassFilter === cName
                      ? "bg-purple-600 text-white"
                      : isLight
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                >
                  {cName}
                </button>
              ))}
            </div>

            <div className="relative max-w-xs w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subject name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`w-full ${
                  isLight ? "bg-white border-slate-200 text-slate-900" : "bg-[#0b121e] border-[#1e293b] text-white"
                } border pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none`}
              />
            </div>
          </div>

          {/* Subjects Table */}
          <div className={`rounded-3xl border ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-[#0b121e] border-[#1e293b]"} overflow-hidden shadow-sm`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                    <th className="p-4">Class</th>
                    <th className="p-4">Subject Name</th>
                    <th className="p-4 text-center">Curriculum Type</th>
                    <th className="p-4 text-center">Total Marks</th>
                    <th className="p-4 text-center">Passing Marks</th>
                    <th className="p-4">Assigned Master Teacher</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
                  {filteredSubjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`p-10 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic`}>
                        No subjects found matching filter. Click "+ Add Subject" or use Excel Uploader.
                      </td>
                    </tr>
                  ) : (
                    filteredSubjects.map((sub) => (
                      <tr key={sub.id} className={isLight ? "hover:bg-slate-50/80" : "hover:bg-white/[0.02]"}>
                        <td className="p-4 font-bold text-sky-600">{sub.className}</td>
                        <td className="p-4 font-black">{sub.subjectName}</td>
                        <td className="p-4 text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              sub.type === "Compulsory"
                                ? isLight
                                  ? "bg-purple-50 text-purple-700 border-purple-300"
                                  : "bg-purple-500/10 text-purple-300 border-purple-500/30"
                                : isLight
                                ? "bg-amber-50 text-amber-800 border-amber-300"
                                : "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            }`}
                          >
                            {sub.type === "Compulsory" ? "🔒 Compulsory (Lazmi)" : "✨ Elective / Chooseable (Ikhtiari)"}
                          </span>
                        </td>
                        <td className="p-4 text-center font-mono font-bold">{sub.totalMarks}</td>
                        <td className="p-4 text-center font-mono font-bold text-emerald-600">{sub.passingMarks}</td>
                        <td className="p-4 text-gray-400">{sub.teacherName || "—"}</td>
                        <td className="p-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenEditSubject(sub)}
                              className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition cursor-pointer"
                              title="Edit Subject"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubject(sub)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                              title="Delete Subject"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: STUDENT SECTION TRANSFER / SHIFTING                                */}
      {/* ========================================================================= */}
      {activeTab === "transfer" && (
        <div className="space-y-4">
          <div className={`p-6 rounded-3xl border ${isLight ? "bg-white border-slate-200" : "bg-[#0b121e] border-[#1e293b]"} space-y-4`}>
            <h3 className={`text-sm font-black ${isLight ? "text-slate-900" : "text-white"} flex items-center gap-2`}>
              <ArrowRightLeft className="text-emerald-600" size={16} />
              <span>Shift Student to another Class or Section</span>
            </h3>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-gray-400"}`}>
              Select any enrolled student and move their official enrollment to a different class or section without losing attendance or fee history.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className={`border-b ${isLight ? "border-slate-200 text-slate-600 bg-slate-100/70" : "border-gray-800 text-gray-400 bg-black/40"} font-mono text-[10px]`}>
                    <th className="p-3">Roll #</th>
                    <th className="p-3">Admission ID</th>
                    <th className="p-3">Student Name</th>
                    <th className="p-3">Current Class</th>
                    <th className="p-3">Current Section</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isLight ? "divide-slate-100" : "divide-gray-800/50"} text-xs`}>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`p-8 text-center ${isLight ? "text-slate-400" : "text-gray-500"} italic`}>
                        No students enrolled yet.
                      </td>
                    </tr>
                  ) : (
                    students.map((st) => (
                      <tr key={st.id} className={isLight ? "hover:bg-slate-50" : "hover:bg-white/[0.02]"}>
                        <td className="p-3 font-mono font-bold">{st.rollNo}</td>
                        <td className="p-3 font-mono font-bold text-sky-600">{st.admissionNo}</td>
                        <td className="p-3 font-bold">{st.firstName} {st.lastName}</td>
                        <td className="p-3">{st.className}</td>
                        <td className="p-3 font-bold text-emerald-600">{st.sectionName}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setReassignTargetStudent(st)}
                            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            Shift Section
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EXCEL / CSV BULK UPLOADER MODAL                                  */}
      {/* ========================================================================= */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"} border rounded-3xl w-full max-w-2xl shadow-2xl p-6 my-8 animate-fade-in-up space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-purple-600" size={20} />
                <h3 className="font-black text-sm">Excel / CSV Bulk Academic Structure Uploader</h3>
              </div>
              <button onClick={() => setShowExcelModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className={isLight ? "text-slate-600" : "text-gray-400"}>
                Upload a CSV file or paste tabular data with columns: <br />
                <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black font-mono text-[10px] text-purple-600">
                  Class Name | Section | Subject Name | Subject Type (Compulsory/Elective) | Total Marks | Passing Marks
                </code>
              </p>

              {/* File Upload Box */}
              <div className="flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload size={14} />
                  <span>Choose CSV File</span>
                </button>
                <span className="text-[11px] text-gray-500">or paste Excel cells below:</span>
              </div>

              {/* Text Area */}
              <div>
                <textarea
                  rows={8}
                  placeholder={`One, A, English, Compulsory, 100, 40\nOne, A, Mathematics, Compulsory, 100, 40\n9th, A, Computer Science, Elective, 75, 25`}
                  value={excelPasteText}
                  onChange={(e) => setExcelPasteText(e.target.value)}
                  className={`w-full ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white" : "bg-black border-gray-800 text-white"
                  } border p-3 rounded-2xl font-mono text-xs focus:outline-none focus:border-purple-500`}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={handleDownloadExcelTemplate}
                  className="text-xs text-sky-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Download size={13} />
                  <span>Download Sample CSV Template</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowExcelModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-gray-800 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleProcessExcelImport}
                    disabled={!excelPasteText.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 cursor-pointer disabled:opacity-50"
                  >
                    Confirm &amp; Import All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD / EDIT CLASS & SECTION MODAL                                 */}
      {/* ========================================================================= */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"} border rounded-3xl w-full max-w-lg shadow-2xl p-6 my-8 animate-fade-in-up space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-3">
              <h3 className="font-black text-sm">{editingClass ? "Edit Class Section" : "Add New Class & Section"}</h3>
              <button onClick={() => setShowClassModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Class Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. One, 2nd, 3rd, 9th"
                    value={classForm.className}
                    onChange={(e) => setClassForm({ ...classForm, className: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Section Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A, B, C, Newton, Rose"
                    value={classForm.sectionName}
                    onChange={(e) => setClassForm({ ...classForm, sectionName: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Campus Wing</label>
                  <select
                    value={classForm.wing}
                    onChange={(e) => setClassForm({ ...classForm, wing: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  >
                    <option value="Primary Wing">Primary Wing (Playgroup to 5th)</option>
                    <option value="Middle Wing">Middle Wing (6th to 8th)</option>
                    <option value="Senior Boys Wing">Senior Boys Wing (9th &amp; 10th)</option>
                    <option value="Senior Girls Wing">Senior Girls Wing (9th &amp; 10th)</option>
                    <option value="College &amp; Higher Secondary">College &amp; Higher Secondary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Room Number</label>
                  <input
                    type="text"
                    placeholder="Room 1"
                    value={classForm.roomNumber}
                    onChange={(e) => setClassForm({ ...classForm, roomNumber: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Class Incharge Teacher & Max Capacity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-emerald-700 mb-1">
                    Class Incharge Teacher (Select from Faculty)
                  </label>
                  <select
                    value={classForm.classTeacherName}
                    onChange={(e) => setClassForm({ ...classForm, classTeacherName: e.target.value })}
                    className={`w-full border p-2.5 rounded-xl font-bold ${
                      isLight ? "bg-slate-50 text-slate-900 border-slate-300" : "bg-black text-white border-gray-800"
                    }`}
                  >
                    <option value="">-- Select Class Incharge Teacher --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.fullName}>
                        {t.fullName} ({t.employeeCode} &bull; {t.department})
                      </option>
                    ))}
                  </select>
                  {teachers.length === 0 && (
                    <p className="text-[10px] text-amber-600 mt-1">No faculty members found. Add teachers in Teachers Matrix.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Max Capacity (Seats)</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={classForm.capacity}
                    onChange={(e) => setClassForm({ ...classForm, capacity: parseInt(e.target.value, 10) || 35 })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              {/* Student Leadership (Boy CR & Girl GR) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Appointed Boy CR</label>
                  <input
                    type="text"
                    placeholder="e.g. Daniyal Tariq"
                    value={classForm.crBoyName}
                    onChange={(e) => setClassForm({ ...classForm, crBoyName: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-rose-600 mb-1">Appointed Girl GR</label>
                  <input
                    type="text"
                    placeholder="e.g. Ayesha Noor"
                    value={classForm.grGirlName}
                    onChange={(e) => setClassForm({ ...classForm, grGirlName: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              {!editingClass && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-purple-700 mb-1">
                    Quick Add Subjects (Comma Separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. English, Urdu, Mathematics, General Science, Islamiat"
                    value={classForm.quickSubjects}
                    onChange={(e) => setClassForm({ ...classForm, quickSubjects: e.target.value })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">These compulsory subjects will be created automatically for this class.</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Class Section
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD / EDIT SUBJECT MODAL                                         */}
      {/* ========================================================================= */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white text-slate-900" : "bg-[#0b121e] border-purple-500/40 text-white"} border rounded-3xl w-full max-w-md shadow-2xl p-6 my-8 animate-fade-in-up space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-3">
              <h3 className="font-black text-sm">{editingSubject ? "Edit Subject" : "Add Subject to Class"}</h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Target Class *</label>
                <select
                  value={subjectForm.className}
                  onChange={(e) => setSubjectForm({ ...subjectForm, className: e.target.value })}
                  className="w-full border p-2.5 rounded-xl font-bold"
                >
                  {uniqueClassNames.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-purple-700 mb-1">Subject Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics, English, Computer Science"
                  value={subjectForm.subjectName}
                  onChange={(e) => setSubjectForm({ ...subjectForm, subjectName: e.target.value })}
                  className="w-full border p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Curriculum Category *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubjectForm({ ...subjectForm, type: "Compulsory" })}
                    className={`py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      subjectForm.type === "Compulsory"
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : isLight
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-gray-800 text-gray-300 border-gray-700"
                    }`}
                  >
                    🔒 Compulsory (Lazmi)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubjectForm({ ...subjectForm, type: "Elective" })}
                    className={`py-2 rounded-xl border font-bold text-xs transition cursor-pointer ${
                      subjectForm.type === "Elective"
                        ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                        : isLight
                        ? "bg-slate-100 text-slate-700 border-slate-200"
                        : "bg-gray-800 text-gray-300 border-gray-700"
                    }`}
                  >
                    ✨ Elective (Chooseable)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={subjectForm.totalMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, totalMarks: parseInt(e.target.value, 10) || 100 })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Passing Marks</label>
                  <input
                    type="number"
                    value={subjectForm.passingMarks}
                    onChange={(e) => setSubjectForm({ ...subjectForm, passingMarks: parseInt(e.target.value, 10) || 40 })}
                    className="w-full border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Save Subject Record
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SECTION REASSIGN MODAL                                           */}
      {/* ========================================================================= */}
      {reassignTargetStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className={`${isLight ? "bg-white text-slate-900" : "bg-[#0b121e] border-sky-500/40 text-white"} border rounded-3xl w-full max-w-md shadow-2xl p-6 animate-fade-in-up space-y-4`}>
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-gray-800 pb-3">
              <h3 className="font-black text-sm">Shift Student Section</h3>
              <button onClick={() => setReassignTargetStudent(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-black/30 rounded-xl space-y-1">
                <div>Student: <b>{reassignTargetStudent.firstName} {reassignTargetStudent.lastName}</b></div>
                <div>Current: <b>{reassignTargetStudent.className} ({reassignTargetStudent.sectionName})</b></div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-sky-700 mb-1">Target Class &amp; Section *</label>
                <select
                  value={targetClassSectionId}
                  onChange={(e) => setTargetClassSectionId(e.target.value)}
                  className="w-full border p-2.5 rounded-xl font-bold"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.className} - Section {c.sectionName} ({c.wing})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase rounded-xl transition text-xs shadow-lg cursor-pointer"
              >
                Confirm Shift Section
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
