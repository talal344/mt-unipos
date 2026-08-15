"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────

export type SMSRole = "Owner" | "Principal" | "Teacher" | "Student" | "Parent" | "HR" | "Finance";

export interface CampusWing {
  id: string;
  name: string; // e.g. "Montessori & Junior Wing", "Senior Boys Wing", "Senior Girls Wing", "College Wing"
  headName: string;
  totalClasses: number;
}

export interface SMSCampus {
  id: string;
  name: string; // e.g. "Main Campus (Gulberg)", "City Campus (Model Town)"
  code: string;
  principalName: string;
  phone: string;
  address: string;
  wings: CampusWing[];
}

export interface SMSAcademicSession {
  id: string;
  name: string; // e.g. "2025-2026", "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SMSClassSection {
  id: string;
  classId: string;
  className: string; // e.g. "Class 9", "Class 10", "Playgroup"
  sectionName: string; // e.g. "Section A (Blue)", "Section B (Green)"
  wing: string;
  classTeacherId?: string;
  classTeacherName?: string;
  crBoyName?: string; // Class Representative (Boy)
  grGirlName?: string; // General Representative (Girl)
  roomNumber: string;
  capacity: number;
  enrolledCount: number;
}

export interface StudentRecord {
  id: string;
  admissionNo: string; // Unique Admission / GR No. e.g. "ADM-2026-0101"
  rollNo: string; // Class Roll Number e.g. "12"
  firstName: string;
  lastName: string;
  gender: "Male" | "Female" | "Other";
  dob: string;
  bFormOrCnic: string;
  bloodGroup?: string;
  campusId: string;
  classId: string;
  className: string;
  sectionId: string;
  sectionName: string;
  admissionDate: string;
  status: "Active" | "Promoted" | "Struck Off" | "Alumni" | "Suspended";
  avatar?: string;
  
  // Guardian / Parent Info
  fatherName: string;
  fatherCnic: string;
  fatherPhone: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  emergencyContact: string;
  residentialAddress: string;
  guardianEmail?: string;
  
  // Financial & Concession
  feeCategory: "Standard" | "Sibling Concession (20%)" | "Staff Child (50%)" | "Need Based 100% Scholarship" | "Merit Scholarship";
  customMonthlyFee?: number;
  transportEnrolled?: boolean;
  busRoute?: string;
  hostelEnrolled?: boolean;
  
  // Medical & Remarks
  medicalNotes?: string;
  previousSchool?: string;
}

export interface TeacherRecord {
  id: string;
  employeeCode: string; // e.g. "TCH-2026-01"
  fullName: string;
  gender: "Male" | "Female";
  qualification: string;
  designation: string; // e.g. "Senior Subject Specialist - Physics"
  department: "Science" | "Mathematics" | "English" | "Urdu / Islamiyat" | "Computer Science" | "Social Sciences" | "Primary Wing";
  phone: string;
  email: string;
  joiningDate: string;
  status: "Active" | "On Leave" | "Resigned";
  assignedClasses: { className: string; sectionName: string; subject: string }[];
  salaryMonthly: number;
}

export interface SMSAttendanceRecord {
  id: string;
  date: string;
  type: "Student" | "Staff";
  referenceId: string; // Student ID or Teacher ID
  name: string;
  className?: string;
  sectionName?: string;
  status: "Present" | "Absent" | "Late" | "Leave" | "Half Day";
  remarks?: string;
}

export interface SMSExamTerm {
  id: string;
  title: string; // e.g. "Midterm Examination 2026", "Final Term 2026", "Monthly Assessment (September)"
  session: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "In Progress" | "Completed" | "Published";
}

export interface SMSMarksEntry {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  admissionNo: string;
  rollNo: string;
  studentName: string;
  className: string;
  sectionName: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  remarks?: string;
}

export interface SMSFeeVoucher {
  id: string;
  challanNo: string; // e.g. "CHL-2026-0891"
  studentId: string;
  admissionNo: string;
  rollNo: string;
  studentName: string;
  className: string;
  sectionName: string;
  fatherName: string;
  month: string; // e.g. "August 2026"
  issueDate: string;
  dueDate: string;
  validityDate: string;
  
  // Breakdown
  tuitionFee: number;
  admissionFee: number;
  examFee: number;
  labFee: number;
  transportFee: number;
  hostelFee: number;
  otherCharges: number;
  discountConcession: number;
  fineLateFee: number;
  totalPayable: number;
  
  status: "Paid" | "Unpaid" | "Overdue" | "Partial";
  paidAmount: number;
  paymentDate?: string;
  paymentMethod?: string;
  bankBranch?: string;
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  className: string;
  chapter: string;
  type: "MCQ" | "Short" | "Long" | "FillInBlank";
  difficulty: "Easy" | "Medium" | "Hard";
  questionText: string;
  options?: string[]; // for MCQs
  correctAnswer?: string;
  marks: number;
}

export interface GeneratedPaper {
  id: string;
  title: string; // e.g. "Physics Final Term Examination Class 10"
  className: string;
  subject: string;
  session: string;
  timeAllowed: string; // e.g. "2 Hours 30 Minutes"
  totalMarks: number;
  instructions: string[];
  sections: {
    sectionTitle: string; // Section A (MCQs), Section B (Short), Section C (Long)
    instructions?: string;
    questions: { qNo: string; text: string; marks: number; options?: string[] }[];
  }[];
  createdAt: string;
}

export interface TimetablePeriod {
  id: string;
  className: string;
  sectionName: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  periodNumber: number; // 1 to 8
  timeSlot: string; // e.g. "08:00 AM - 08:45 AM"
  subject: string;
  teacherId: string;
  teacherName: string;
  room: string;
}

export interface LibraryBook {
  id: string;
  accessionNo: string;
  title: string;
  author: string;
  category: "Science" | "Literature" | "Mathematics" | "History" | "Islamic" | "General Knowledge";
  totalCopies: number;
  availableCopies: number;
  shelfNumber: string;
}

export interface LibraryIssuedRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  issuedDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: "Issued" | "Returned" | "Overdue";
}

export interface TransportRoute {
  id: string;
  routeCode: string; // e.g. "BUS-01"
  routeName: string; // e.g. "Wapda Town - Valencia - Main Campus"
  driverName: string;
  driverPhone: string;
  vehicleNumber: string;
  totalSeats: number;
  assignedStudentsCount: number;
  monthlyFeePerStudent: number;
}

export interface SchoolNotice {
  id: string;
  title: string;
  category: "Academic" | "Holiday" | "Exam" | "Urgent" | "Event" | "Sports";
  targetAudience: "All" | "Students" | "Parents" | "Teachers";
  date: string;
  content: string;
  attachmentName?: string;
  isPinned: boolean;
}

// ─── CONTEXT PROPS ────────────────────────────────────────────────────────────

interface SMSContextType {
  activeRole: SMSRole;
  setActiveRole: (role: SMSRole) => void;
  selectedCampus: string;
  setSelectedCampus: (campusId: string) => void;
  selectedSession: string;
  setSelectedSession: (sessionId: string) => void;
  
  // State Collections
  campuses: SMSCampus[];
  sessions: SMSAcademicSession[];
  classes: SMSClassSection[];
  students: StudentRecord[];
  teachers: TeacherRecord[];
  attendance: SMSAttendanceRecord[];
  examTerms: SMSExamTerm[];
  marks: SMSMarksEntry[];
  feeVouchers: SMSFeeVoucher[];
  questionBank: QuestionBankItem[];
  generatedPapers: GeneratedPaper[];
  timetable: TimetablePeriod[];
  libraryBooks: LibraryBook[];
  issuedBooks: LibraryIssuedRecord[];
  transportRoutes: TransportRoute[];
  notices: SchoolNotice[];
  
  // Student Actions
  addStudent: (student: Omit<StudentRecord, "id" | "admissionNo">) => StudentRecord;
  updateStudent: (id: string, updates: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  promoteStudentsBatch: (sourceClass: string, sourceSection: string, targetClass: string, targetSection: string) => void;
  issueSchoolLeavingCertificate: (studentId: string, reason: string) => void;
  
  // Teacher Actions
  addTeacher: (teacher: Omit<TeacherRecord, "id" | "employeeCode">) => TeacherRecord;
  updateTeacher: (id: string, updates: Partial<TeacherRecord>) => void;
  
  // Class & Section Actions
  addClassSection: (section: Omit<SMSClassSection, "id" | "enrolledCount">) => SMSClassSection;
  updateClassSection: (id: string, updates: Partial<SMSClassSection>) => void;
  
  // Attendance Actions
  markAttendanceBatch: (records: Omit<SMSAttendanceRecord, "id">[]) => void;
  
  // Exam & Marks Actions
  addExamTerm: (term: Omit<SMSExamTerm, "id">) => SMSExamTerm;
  saveMarksBatch: (entries: Omit<SMSMarksEntry, "id">[]) => void;
  
  // Fee Actions
  generateMonthlyChallans: (className: string, month: string, dueDate: string) => number;
  collectFeeChallan: (challanNo: string, amount: number, paymentMethod: string, bankBranch?: string) => void;
  
  // Paper Generator
  addQuestionToBank: (q: Omit<QuestionBankItem, "id">) => QuestionBankItem;
  createGeneratedPaper: (paper: Omit<GeneratedPaper, "id" | "createdAt">) => GeneratedPaper;
  
  // Library Actions
  issueBook: (bookId: string, studentId: string, dueDate: string) => void;
  returnBook: (issueId: string) => void;
  
  // Notice Actions
  addNotice: (notice: Omit<SchoolNotice, "id" | "date">) => SchoolNotice;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const INITIAL_CAMPUSES: SMSCampus[] = [
  {
    id: "CAMP-01",
    name: "Main Campus (Gulberg Heights)",
    code: "GUL-01",
    principalName: "Prof. Muhammad Aslam (M.Phil, Education)",
    phone: "042-35789011",
    address: "Block H, Gulberg III, Lahore",
    wings: [
      { id: "W-1", name: "Montessori & Early Years", headName: "Mrs. Naila Shah", totalClasses: 3 },
      { id: "W-2", name: "Junior Girls Wing", headName: "Ms. Hina Tariq", totalClasses: 5 },
      { id: "W-3", name: "Senior Boys Wing", headName: "Sir Kamran Rafique", totalClasses: 6 },
      { id: "W-4", name: "College & Higher Secondary", headName: "Dr. Tariq Mahmood", totalClasses: 4 }
    ]
  },
  {
    id: "CAMP-02",
    name: "City Executive Campus (Model Town)",
    code: "MT-02",
    principalName: "Dr. Farzana Naeem (Ph.D. Educational Leadership)",
    phone: "042-35841122",
    address: "Link Road, Model Town, Lahore",
    wings: [
      { id: "W-5", name: "Primary & Middle Wing", headName: "Mrs. Ayesha Malik", totalClasses: 8 },
      { id: "W-6", name: "Senior Cambridge O/A Levels", headName: "Sir Usman Ghani", totalClasses: 4 }
    ]
  }
];

const INITIAL_SESSIONS: SMSAcademicSession[] = [
  { id: "SESS-2025-26", name: "Academic Session 2025–2026", startDate: "2025-04-01", endDate: "2026-03-31", isCurrent: true },
  { id: "SESS-2026-27", name: "Academic Session 2026–2027", startDate: "2026-04-01", endDate: "2027-03-31", isCurrent: false }
];

const INITIAL_CLASSES: SMSClassSection[] = [
  { id: "CLS-PG-A", classId: "PG", className: "Playgroup", sectionName: "Section A (Butterflies)", wing: "Montessori & Early Years", classTeacherName: "Ms. Sadia Bilal", roomNumber: "Room 101", capacity: 25, enrolledCount: 20 },
  { id: "CLS-NUR-A", classId: "NUR", className: "Nursery", sectionName: "Section A (Dolphins)", wing: "Montessori & Early Years", classTeacherName: "Ms. Maria Khan", roomNumber: "Room 102", capacity: 25, enrolledCount: 22 },
  { id: "CLS-PREP-A", classId: "PREP", className: "Prep", sectionName: "Section A (Stars)", wing: "Montessori & Early Years", classTeacherName: "Ms. Zainab Bibi", roomNumber: "Room 103", capacity: 30, enrolledCount: 28 },
  { id: "CLS-1-A", classId: "C1", className: "Class 1", sectionName: "Section A (Rose)", wing: "Junior Girls Wing", classTeacherName: "Mrs. Tahira Batool", crBoyName: "Muhammad Ali", grGirlName: "Fatima Noor", roomNumber: "Room 201", capacity: 35, enrolledCount: 32 },
  { id: "CLS-5-A", classId: "C5", className: "Class 5", sectionName: "Section A (Jasmine)", wing: "Junior Girls Wing", classTeacherName: "Ms. Amna Riaz", crBoyName: "Hamza Shafiq", grGirlName: "Areeba Tariq", roomNumber: "Room 205", capacity: 35, enrolledCount: 30 },
  { id: "CLS-9-A", classId: "C9", className: "Class 9 (Science)", sectionName: "Section A (Newton)", wing: "Senior Boys Wing", classTeacherName: "Sir Shahid Mehmood", crBoyName: "Ahmed Talal (CR)", grGirlName: "Zoya Aslam (GR)", roomNumber: "Physics Lab Hall 1", capacity: 40, enrolledCount: 38 },
  { id: "CLS-10-A", classId: "C10", className: "Class 10 (Matric Science)", sectionName: "Section A (Einstein)", wing: "Senior Boys Wing", classTeacherName: "Sir Nasir Abbas", crBoyName: "Usman Zafar", grGirlName: "Maryam Bibi", roomNumber: "Main Hall 301", capacity: 45, enrolledCount: 42 },
  { id: "CLS-FSC-1", classId: "FSC1", className: "FSc Pre-Medical (Part 1)", sectionName: "Section Alpha", wing: "College & Higher Secondary", classTeacherName: "Dr. Rizwan Bashir", crBoyName: "Bilal Sajid", grGirlName: "Anaya Tariq", roomNumber: "Auditorium 401", capacity: 50, enrolledCount: 46 }
];

const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "STU-001",
    admissionNo: "ADM-2026-0041",
    rollNo: "01",
    firstName: "Ahmed",
    lastName: "Talal",
    gender: "Male",
    dob: "2010-08-14",
    bFormOrCnic: "35202-8921821-1",
    bloodGroup: "B+",
    campusId: "CAMP-01",
    classId: "C9",
    className: "Class 9 (Science)",
    sectionId: "CLS-9-A",
    sectionName: "Section A (Newton)",
    admissionDate: "2024-04-10",
    status: "Active",
    fatherName: "Mian Talal Ahmad",
    fatherCnic: "35202-1192837-9",
    fatherPhone: "03396399895",
    fatherOccupation: "CEO & Software Architect",
    motherName: "Mrs. Talal",
    motherPhone: "03219876543",
    emergencyContact: "03396399895 (Father)",
    residentialAddress: "House 42, Block C, Model Town, Lahore",
    guardianEmail: "miantalal2@gmail.com",
    feeCategory: "Standard",
    customMonthlyFee: 18500,
    transportEnrolled: true,
    busRoute: "BUS-01 (Wapda Town - Model Town - Gulberg)",
    medicalNotes: "No known allergies. Perfect vision.",
    previousSchool: "The City School (Lahore Campus)"
  },
  {
    id: "STU-002",
    admissionNo: "ADM-2026-0042",
    rollNo: "02",
    firstName: "Zoya",
    lastName: "Aslam",
    gender: "Female",
    dob: "2010-11-20",
    bFormOrCnic: "35202-7721832-4",
    bloodGroup: "O+",
    campusId: "CAMP-01",
    classId: "C9",
    className: "Class 9 (Science)",
    sectionId: "CLS-9-A",
    sectionName: "Section A (Newton)",
    admissionDate: "2024-04-12",
    status: "Active",
    fatherName: "Muhammad Aslam",
    fatherCnic: "35202-4433221-1",
    fatherPhone: "03004455667",
    fatherOccupation: "Chartered Accountant",
    emergencyContact: "03004455667",
    residentialAddress: "Flat 12, Gulberg Heights, Lahore",
    guardianEmail: "aslam.ca@gmail.com",
    feeCategory: "Sibling Concession (20%)",
    customMonthlyFee: 14800,
    transportEnrolled: false,
  },
  {
    id: "STU-003",
    admissionNo: "ADM-2026-0089",
    rollNo: "01",
    firstName: "Usman",
    lastName: "Zafar",
    gender: "Male",
    dob: "2009-05-18",
    bFormOrCnic: "35202-9911822-3",
    bloodGroup: "A+",
    campusId: "CAMP-01",
    classId: "C10",
    className: "Class 10 (Matric Science)",
    sectionId: "CLS-10-A",
    sectionName: "Section A (Einstein)",
    admissionDate: "2023-04-05",
    status: "Active",
    fatherName: "Zafar Iqbal",
    fatherCnic: "35202-7788990-1",
    fatherPhone: "03124567890",
    emergencyContact: "03124567890",
    residentialAddress: "House 91, Faisal Town, Lahore",
    feeCategory: "Merit Scholarship",
    customMonthlyFee: 0,
    transportEnrolled: true,
    busRoute: "BUS-02 (Faisal Town - Garden Town)",
  },
  {
    id: "STU-004",
    admissionNo: "ADM-2026-0120",
    rollNo: "01",
    firstName: "Fatima",
    lastName: "Noor",
    gender: "Female",
    dob: "2018-09-25",
    bFormOrCnic: "35202-5566778-2",
    bloodGroup: "AB+",
    campusId: "CAMP-01",
    classId: "C1",
    className: "Class 1",
    sectionId: "CLS-1-A",
    sectionName: "Section A (Rose)",
    admissionDate: "2025-04-01",
    status: "Active",
    fatherName: "Noor ul Hassan",
    fatherCnic: "35202-3344556-7",
    fatherPhone: "03451122334",
    emergencyContact: "03451122334",
    residentialAddress: "Johar Town Phase 2, Lahore",
    feeCategory: "Standard",
    customMonthlyFee: 12000,
  }
];

const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: "TCH-01",
    employeeCode: "TCH-2026-01",
    fullName: "Sir Shahid Mehmood",
    gender: "Male",
    qualification: "M.Sc. Physics (Punjab University)",
    designation: "Head of Science & Senior Physics Master",
    department: "Science",
    phone: "03214567891",
    email: "shahid.physics@school.edu.pk",
    joiningDate: "2021-08-15",
    status: "Active",
    salaryMonthly: 95000,
    assignedClasses: [
      { className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Physics" },
      { className: "Class 10 (Matric Science)", sectionName: "Section A (Einstein)", subject: "Physics" }
    ]
  },
  {
    id: "TCH-02",
    employeeCode: "TCH-2026-02",
    fullName: "Mrs. Tahira Batool",
    gender: "Female",
    qualification: "M.A. English Literature & B.Ed",
    designation: "Senior English Lecturer",
    department: "English",
    phone: "03338901234",
    email: "tahira.eng@school.edu.pk",
    joiningDate: "2022-02-01",
    status: "Active",
    salaryMonthly: 85000,
    assignedClasses: [
      { className: "Class 1", sectionName: "Section A (Rose)", subject: "English & Phonics" },
      { className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "English Grammar" }
    ]
  },
  {
    id: "TCH-03",
    employeeCode: "TCH-2026-03",
    fullName: "Sir Nasir Abbas",
    gender: "Male",
    qualification: "M.Sc. Mathematics & Gold Medalist",
    designation: "Mathematics Specialist",
    department: "Mathematics",
    phone: "03009876543",
    email: "nasir.math@school.edu.pk",
    joiningDate: "2020-09-10",
    status: "Active",
    salaryMonthly: 110000,
    assignedClasses: [
      { className: "Class 10 (Matric Science)", sectionName: "Section A (Einstein)", subject: "General Mathematics & Calculus" }
    ]
  }
];

const INITIAL_EXAMS: SMSExamTerm[] = [
  { id: "EXM-MID-2026", title: "Midterm Examinations 2026", session: "2025-2026", startDate: "2026-09-15", endDate: "2026-09-28", status: "Published" },
  { id: "EXM-FIN-2026", title: "Annual Final Board Examinations 2026", session: "2025-2026", startDate: "2026-03-10", endDate: "2026-03-25", status: "Upcoming" }
];

const INITIAL_MARKS: SMSMarksEntry[] = [
  { id: "MK-01", examId: "EXM-MID-2026", examTitle: "Midterm Examinations 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Physics", totalMarks: 100, obtainedMarks: 98, percentage: 98, grade: "A+", remarks: "Outstanding conceptual brilliance. 1st in Subject." },
  { id: "MK-02", examId: "EXM-MID-2026", examTitle: "Midterm Examinations 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Mathematics", totalMarks: 100, obtainedMarks: 100, percentage: 100, grade: "A+", remarks: "Perfect 100/100 score!" },
  { id: "MK-03", examId: "EXM-MID-2026", examTitle: "Midterm Examinations 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Chemistry", totalMarks: 100, obtainedMarks: 96, percentage: 96, grade: "A+", remarks: "Exceptional laboratory precision." },
  { id: "MK-04", examId: "EXM-MID-2026", examTitle: "Midterm Examinations 2026", studentId: "STU-002", admissionNo: "ADM-2026-0042", rollNo: "02", studentName: "Zoya Aslam", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Physics", totalMarks: 100, obtainedMarks: 91, percentage: 91, grade: "A+", remarks: "Excellent preparation." },
  { id: "MK-05", examId: "EXM-MID-2026", examTitle: "Midterm Examinations 2026", studentId: "STU-002", admissionNo: "ADM-2026-0042", rollNo: "02", studentName: "Zoya Aslam", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Mathematics", totalMarks: 100, obtainedMarks: 94, percentage: 94, grade: "A+", remarks: "Very strong analytical mind." }
];

const INITIAL_FEE_VOUCHERS: SMSFeeVoucher[] = [
  {
    id: "VCH-01",
    challanNo: "CHL-2026-0801",
    studentId: "STU-001",
    admissionNo: "ADM-2026-0041",
    rollNo: "01",
    studentName: "Ahmed Talal",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    fatherName: "Mian Talal Ahmad",
    month: "August 2026",
    issueDate: "2026-08-01",
    dueDate: "2026-08-10",
    validityDate: "2026-08-25",
    tuitionFee: 18500,
    admissionFee: 0,
    examFee: 1500,
    labFee: 1000,
    transportFee: 4000,
    hostelFee: 0,
    otherCharges: 500,
    discountConcession: 0,
    fineLateFee: 0,
    totalPayable: 25500,
    status: "Paid",
    paidAmount: 25500,
    paymentDate: "2026-08-04",
    paymentMethod: "Bank Transfer (Meezan Bank Online)",
    bankBranch: "Meezan Bank - Gulberg III Branch"
  },
  {
    id: "VCH-02",
    challanNo: "CHL-2026-0802",
    studentId: "STU-002",
    admissionNo: "ADM-2026-0042",
    rollNo: "02",
    studentName: "Zoya Aslam",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    fatherName: "Muhammad Aslam",
    month: "August 2026",
    issueDate: "2026-08-01",
    dueDate: "2026-08-10",
    validityDate: "2026-08-25",
    tuitionFee: 18500,
    admissionFee: 0,
    examFee: 1500,
    labFee: 1000,
    transportFee: 0,
    hostelFee: 0,
    otherCharges: 0,
    discountConcession: 3700, // 20% sibling discount
    fineLateFee: 0,
    totalPayable: 17300,
    status: "Paid",
    paidAmount: 17300,
    paymentDate: "2026-08-08",
    paymentMethod: "HBL Cash Counter",
    bankBranch: "HBL Main Market"
  },
  {
    id: "VCH-03",
    challanNo: "CHL-2026-0803",
    studentId: "STU-004",
    admissionNo: "ADM-2026-0120",
    rollNo: "01",
    studentName: "Fatima Noor",
    className: "Class 1",
    sectionName: "Section A (Rose)",
    fatherName: "Noor ul Hassan",
    month: "August 2026",
    issueDate: "2026-08-01",
    dueDate: "2026-08-10",
    validityDate: "2026-08-25",
    tuitionFee: 12000,
    admissionFee: 0,
    examFee: 0,
    labFee: 0,
    transportFee: 0,
    hostelFee: 0,
    otherCharges: 0,
    discountConcession: 0,
    fineLateFee: 500,
    totalPayable: 12500,
    status: "Unpaid",
    paidAmount: 0
  }
];

const INITIAL_QUESTIONS: QuestionBankItem[] = [
  {
    id: "Q-01",
    subject: "Physics",
    className: "Class 9 (Science)",
    chapter: "Kinematics & Motion",
    type: "MCQ",
    difficulty: "Easy",
    questionText: "Which of the following quantities is a vector quantity?",
    options: ["Speed", "Distance", "Velocity", "Time"],
    correctAnswer: "Velocity",
    marks: 1
  },
  {
    id: "Q-02",
    subject: "Physics",
    className: "Class 9 (Science)",
    chapter: "Dynamics & Newton's Laws",
    type: "Short",
    difficulty: "Medium",
    questionText: "State Newton's Second Law of Motion and derive the formula F = ma.",
    marks: 4
  },
  {
    id: "Q-03",
    subject: "Physics",
    className: "Class 9 (Science)",
    chapter: "Work, Power and Energy",
    type: "Long",
    difficulty: "Hard",
    questionText: "Define Kinetic Energy. Derive an analytical expression for the kinetic energy of a body of mass m moving with velocity v.",
    marks: 8
  }
];

const INITIAL_TIMETABLE: TimetablePeriod[] = [
  { id: "TT-01", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 1, timeSlot: "08:00 AM - 08:45 AM", subject: "Physics", teacherId: "TCH-01", teacherName: "Sir Shahid Mehmood", room: "Lab 1" },
  { id: "TT-02", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 2, timeSlot: "08:45 AM - 09:30 AM", subject: "Mathematics", teacherId: "TCH-03", teacherName: "Sir Nasir Abbas", room: "Room 301" },
  { id: "TT-03", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 3, timeSlot: "09:30 AM - 10:15 AM", subject: "English Grammar", teacherId: "TCH-02", teacherName: "Mrs. Tahira Batool", room: "Room 301" }
];

const INITIAL_BOOKS: LibraryBook[] = [
  { id: "BK-01", accessionNo: "LIB-1001", title: "Fundamentals of Physics (Halliday & Resnick)", author: "David Halliday", category: "Science", totalCopies: 15, availableCopies: 12, shelfNumber: "Shelf S-04" },
  { id: "BK-02", accessionNo: "LIB-1002", title: "Oxford Advanced Learner's Dictionary", author: "A.S. Hornby", category: "Literature", totalCopies: 20, availableCopies: 18, shelfNumber: "Shelf E-01" },
  { id: "BK-03", accessionNo: "LIB-1003", title: "Advanced Calculus & Analytical Geometry", author: "Dr. S.M. Yusuf", category: "Mathematics", totalCopies: 10, availableCopies: 8, shelfNumber: "Shelf M-02" }
];

const INITIAL_ROUTES: TransportRoute[] = [
  { id: "TR-01", routeCode: "BUS-01", routeName: "Wapda Town - Model Town - Gulberg Main Campus", driverName: "Muhammad Rafique", driverPhone: "0301-4455889", vehicleNumber: "LEG-8921 (Toyota Coaster)", totalSeats: 32, assignedStudentsCount: 28, monthlyFeePerStudent: 4000 },
  { id: "TR-02", routeCode: "BUS-02", routeName: "Faisal Town - Garden Town - Muslim Town", driverName: "Umer Farooq", driverPhone: "0322-9988776", vehicleNumber: "LEA-4512 (Hiace Grand)", totalSeats: 18, assignedStudentsCount: 16, monthlyFeePerStudent: 3500 }
];

const INITIAL_NOTICES: SchoolNotice[] = [
  { id: "NOT-01", title: "Annual Independence Day Celebration & Flag Hoisting Ceremony", category: "Event", targetAudience: "All", date: "2026-08-14", content: "All students, faculty members, and honorable parents are invited to the 79th Independence Day ceremony at the Main Auditorium at 08:30 AM sharp.", isPinned: true },
  { id: "NOT-02", title: "Midterm Examinations 2026 Date Sheet Announced", category: "Exam", targetAudience: "Students", date: "2026-08-10", content: "The formal date sheet for Midterm Exams starting from 15th September has been uploaded to the Student & Parent portals.", isPinned: true }
];

// ─── PROVIDER COMPONENT ───────────────────────────────────────────────────────

export const SMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<SMSRole>("Owner");
  const [selectedCampus, setSelectedCampus] = useState<string>("CAMP-01");
  const [selectedSession, setSelectedSession] = useState<string>("SESS-2025-26");

  const [campuses, setCampuses] = useState<SMSCampus[]>(INITIAL_CAMPUSES);
  const [sessions, setSessions] = useState<SMSAcademicSession[]>(INITIAL_SESSIONS);
  const [classes, setClasses] = useState<SMSClassSection[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<TeacherRecord[]>(INITIAL_TEACHERS);
  const [attendance, setAttendance] = useState<SMSAttendanceRecord[]>([]);
  const [examTerms, setExamTerms] = useState<SMSExamTerm[]>(INITIAL_EXAMS);
  const [marks, setMarks] = useState<SMSMarksEntry[]>(INITIAL_MARKS);
  const [feeVouchers, setFeeVouchers] = useState<SMSFeeVoucher[]>(INITIAL_FEE_VOUCHERS);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>(INITIAL_QUESTIONS);
  const [generatedPapers, setGeneratedPapers] = useState<GeneratedPaper[]>([]);
  const [timetable, setTimetable] = useState<TimetablePeriod[]>(INITIAL_TIMETABLE);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(INITIAL_BOOKS);
  const [issuedBooks, setIssuedBooks] = useState<LibraryIssuedRecord[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(INITIAL_ROUTES);
  const [notices, setNotices] = useState<SchoolNotice[]>(INITIAL_NOTICES);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedStudents = localStorage.getItem("mt_sms_students");
      if (savedStudents) setStudents(JSON.parse(savedStudents));
      
      const savedTeachers = localStorage.getItem("mt_sms_teachers");
      if (savedTeachers) setTeachers(JSON.parse(savedTeachers));

      const savedClasses = localStorage.getItem("mt_sms_classes");
      if (savedClasses) setClasses(JSON.parse(savedClasses));

      const savedVouchers = localStorage.getItem("mt_sms_vouchers");
      if (savedVouchers) setFeeVouchers(JSON.parse(savedVouchers));

      const savedMarks = localStorage.getItem("mt_sms_marks");
      if (savedMarks) setMarks(JSON.parse(savedMarks));

      const savedNotices = localStorage.getItem("mt_sms_notices");
      if (savedNotices) setNotices(JSON.parse(savedNotices));

      const savedQuestions = localStorage.getItem("mt_sms_questions");
      if (savedQuestions) setQuestionBank(JSON.parse(savedQuestions));

      const savedPapers = localStorage.getItem("mt_sms_papers");
      if (savedPapers) setGeneratedPapers(JSON.parse(savedPapers));
    } catch {}
  }, []);

  // Sync helpers
  const saveState = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      supabase.from("unipos_global").upsert({ key, value: data }).then(() => {});
    } catch {}
  };

  // Student Actions
  const addStudent = (studentData: Omit<StudentRecord, "id" | "admissionNo">): StudentRecord => {
    const year = new Date().getFullYear();
    const count = students.length + 1;
    const admissionNo = `ADM-${year}-${String(count).padStart(4, "0")}`;
    const newStudent: StudentRecord = {
      ...studentData,
      id: `STU-${Date.now()}`,
      admissionNo
    };
    const next = [newStudent, ...students];
    setStudents(next);
    saveState("mt_sms_students", next);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<StudentRecord>) => {
    const next = students.map(s => s.id === id ? { ...s, ...updates } : s);
    setStudents(next);
    saveState("mt_sms_students", next);
  };

  const deleteStudent = (id: string) => {
    const next = students.filter(s => s.id !== id);
    setStudents(next);
    saveState("mt_sms_students", next);
  };

  const promoteStudentsBatch = (sourceClass: string, sourceSection: string, targetClass: string, targetSection: string) => {
    const next = students.map(s => {
      if (s.className === sourceClass && s.sectionName === sourceSection && s.status === "Active") {
        return {
          ...s,
          className: targetClass,
          sectionName: targetSection,
          status: "Active" as const
        };
      }
      return s;
    });
    setStudents(next);
    saveState("mt_sms_students", next);
  };

  const issueSchoolLeavingCertificate = (studentId: string, reason: string) => {
    const next = students.map(s => {
      if (s.id === studentId) {
        return {
          ...s,
          status: "Alumni" as const,
          medicalNotes: `${s.medicalNotes || ""} [SLC Issued on ${new Date().toISOString().split("T")[0]}: ${reason}]`
        };
      }
      return s;
    });
    setStudents(next);
    saveState("mt_sms_students", next);
  };

  // Teacher Actions
  const addTeacher = (teacherData: Omit<TeacherRecord, "id" | "employeeCode">): TeacherRecord => {
    const code = `TCH-${new Date().getFullYear()}-${String(teachers.length + 1).padStart(2, "0")}`;
    const newTeacher: TeacherRecord = {
      ...teacherData,
      id: `TCH-${Date.now()}`,
      employeeCode: code
    };
    const next = [newTeacher, ...teachers];
    setTeachers(next);
    saveState("mt_sms_teachers", next);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<TeacherRecord>) => {
    const next = teachers.map(t => t.id === id ? { ...t, ...updates } : t);
    setTeachers(next);
    saveState("mt_sms_teachers", next);
  };

  // Class & Section Actions
  const addClassSection = (secData: Omit<SMSClassSection, "id" | "enrolledCount">): SMSClassSection => {
    const newSec: SMSClassSection = {
      ...secData,
      id: `CLS-${Date.now()}`,
      enrolledCount: 0
    };
    const next = [...classes, newSec];
    setClasses(next);
    saveState("mt_sms_classes", next);
    return newSec;
  };

  const updateClassSection = (id: string, updates: Partial<SMSClassSection>) => {
    const next = classes.map(c => c.id === id ? { ...c, ...updates } : c);
    setClasses(next);
    saveState("mt_sms_classes", next);
  };

  // Attendance Actions
  const markAttendanceBatch = (records: Omit<SMSAttendanceRecord, "id">[]) => {
    const newRecords: SMSAttendanceRecord[] = records.map(r => ({
      ...r,
      id: `ATT-${Date.now()}-${Math.random()}`
    }));
    const next = [...newRecords, ...attendance];
    setAttendance(next);
    saveState("mt_sms_attendance", next);
  };

  // Exam & Marks Actions
  const addExamTerm = (term: Omit<SMSExamTerm, "id">): SMSExamTerm => {
    const newTerm: SMSExamTerm = { ...term, id: `EXM-${Date.now()}` };
    const next = [newTerm, ...examTerms];
    setExamTerms(next);
    saveState("mt_sms_exams", next);
    return newTerm;
  };

  const saveMarksBatch = (entries: Omit<SMSMarksEntry, "id">[]) => {
    const newMarks: SMSMarksEntry[] = entries.map(e => ({
      ...e,
      id: `MK-${Date.now()}-${Math.random()}`
    }));
    const next = [...newMarks, ...marks];
    setMarks(next);
    saveState("mt_sms_marks", next);
  };

  // Fee Actions
  const generateMonthlyChallans = (className: string, month: string, dueDate: string): number => {
    const targetStudents = students.filter(s => s.className === className && s.status === "Active");
    const issueDate = new Date().toISOString().split("T")[0];
    const validityDate = new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    
    let generatedCount = 0;
    const newChallans: SMSFeeVoucher[] = [];

    targetStudents.forEach((st, idx) => {
      const tuition = st.customMonthlyFee ?? (st.className.includes("Class 9") || st.className.includes("Class 10") ? 18500 : 12000);
      const transport = st.transportEnrolled ? 4000 : 0;
      const challanNo = `CHL-${new Date().getFullYear()}-${String(feeVouchers.length + idx + 1).padStart(4, "0")}`;
      
      let concession = 0;
      if (st.feeCategory.includes("20%")) concession = tuition * 0.2;
      else if (st.feeCategory.includes("50%")) concession = tuition * 0.5;
      else if (st.feeCategory.includes("100%")) concession = tuition;

      const total = tuition + transport - concession;

      newChallans.push({
        id: `VCH-${Date.now()}-${idx}`,
        challanNo,
        studentId: st.id,
        admissionNo: st.admissionNo,
        rollNo: st.rollNo,
        studentName: `${st.firstName} ${st.lastName}`,
        className: st.className,
        sectionName: st.sectionName,
        fatherName: st.fatherName,
        month,
        issueDate,
        dueDate,
        validityDate,
        tuitionFee: tuition,
        admissionFee: 0,
        examFee: 0,
        labFee: 0,
        transportFee: transport,
        hostelFee: 0,
        otherCharges: 0,
        discountConcession: concession,
        fineLateFee: 0,
        totalPayable: Math.max(0, total),
        status: total === 0 ? "Paid" : "Unpaid",
        paidAmount: total === 0 ? 0 : 0
      });
      generatedCount++;
    });

    const next = [...newChallans, ...feeVouchers];
    setFeeVouchers(next);
    saveState("mt_sms_vouchers", next);
    return generatedCount;
  };

  const collectFeeChallan = (challanNo: string, amount: number, paymentMethod: string, bankBranch?: string) => {
    const next = feeVouchers.map(v => {
      if (v.challanNo === challanNo) {
        const total = v.totalPayable;
        const newPaid = (v.paidAmount || 0) + amount;
        const status: SMSFeeVoucher["status"] = newPaid >= total ? "Paid" : "Partial";
        return {
          ...v,
          paidAmount: newPaid,
          status,
          paymentDate: new Date().toISOString().split("T")[0],
          paymentMethod,
          bankBranch: bankBranch || "Main Cash Counter"
        };
      }
      return v;
    });
    setFeeVouchers(next);
    saveState("mt_sms_vouchers", next);
  };

  // Question Bank & Paper Generator
  const addQuestionToBank = (q: Omit<QuestionBankItem, "id">): QuestionBankItem => {
    const newQ: QuestionBankItem = { ...q, id: `Q-${Date.now()}` };
    const next = [newQ, ...questionBank];
    setQuestionBank(next);
    saveState("mt_sms_questions", next);
    return newQ;
  };

  const createGeneratedPaper = (paperData: Omit<GeneratedPaper, "id" | "createdAt">): GeneratedPaper => {
    const newPaper: GeneratedPaper = {
      ...paperData,
      id: `PPR-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const next = [newPaper, ...generatedPapers];
    setGeneratedPapers(next);
    saveState("mt_sms_papers", next);
    return newPaper;
  };

  // Library Actions
  const issueBook = (bookId: string, studentId: string, dueDate: string) => {
    const book = libraryBooks.find(b => b.id === bookId);
    const stu = students.find(s => s.id === studentId);
    if (!book || !stu || book.availableCopies <= 0) return;

    const newIssue: LibraryIssuedRecord = {
      id: `ISS-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      studentId,
      studentName: `${stu.firstName} ${stu.lastName}`,
      admissionNo: stu.admissionNo,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate,
      fineAmount: 0,
      status: "Issued"
    };

    setIssuedBooks(prev => [newIssue, ...prev]);
    setLibraryBooks(prev => prev.map(b => b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b));
  };

  const returnBook = (issueId: string) => {
    const record = issuedBooks.find(i => i.id === issueId);
    if (!record) return;

    setIssuedBooks(prev => prev.map(i => i.id === issueId ? { ...i, status: "Returned", returnDate: new Date().toISOString().split("T")[0] } : i));
    setLibraryBooks(prev => prev.map(b => b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b));
  };

  // Notice Actions
  const addNotice = (noticeData: Omit<SchoolNotice, "id" | "date">): SchoolNotice => {
    const newNotice: SchoolNotice = {
      ...noticeData,
      id: `NOT-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    const next = [newNotice, ...notices];
    setNotices(next);
    saveState("mt_sms_notices", next);
    return newNotice;
  };

  return (
    <SMSContext.Provider
      value={{
        activeRole,
        setActiveRole,
        selectedCampus,
        setSelectedCampus,
        selectedSession,
        setSelectedSession,
        campuses,
        sessions,
        classes,
        students,
        teachers,
        attendance,
        examTerms,
        marks,
        feeVouchers,
        questionBank,
        generatedPapers,
        timetable,
        libraryBooks,
        issuedBooks,
        transportRoutes,
        notices,
        addStudent,
        updateStudent,
        deleteStudent,
        promoteStudentsBatch,
        issueSchoolLeavingCertificate,
        addTeacher,
        updateTeacher,
        addClassSection,
        updateClassSection,
        markAttendanceBatch,
        addExamTerm,
        saveMarksBatch,
        generateMonthlyChallans,
        collectFeeChallan,
        addQuestionToBank,
        createGeneratedPaper,
        issueBook,
        returnBook,
        addNotice
      }}
    >
      {children}
    </SMSContext.Provider>
  );
};

export const useSMS = () => {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error("useSMS must be used within an SMSProvider");
  }
  return context;
};
