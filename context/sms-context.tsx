"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// ─── TYPES & INTERFACES ───────────────────────────────────────────────────────

export type SMSRole = "Owner" | "Principal" | "Teacher" | "Student" | "Parent" | "HR" | "Finance";

export interface CampusWing {
  id: string;
  name: string;
  headName: string;
  totalClasses: number;
}

export interface SMSCampus {
  id: string;
  name: string;
  code: string;
  principalName: string;
  phone: string;
  address: string;
  wings: CampusWing[];
}

export interface SMSAcademicSession {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface SMSClassSection {
  id: string;
  classId: string;
  className: string;
  sectionName: string;
  wing: string;
  classTeacherId?: string;
  classTeacherName?: string;
  crBoyName?: string;
  grGirlName?: string;
  roomNumber: string;
  capacity: number;
  enrolledCount: number;
}

export interface StudentRecord {
  id: string;
  admissionNo: string;
  rollNo: string;
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
  houseName?: "Jinnah House" | "Iqbal House" | "Sir Syed House" | "Liaquat House";
  
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
  hostelRoom?: string;
  
  // Medical & Remarks
  medicalNotes?: string;
  allergies?: string;
  previousSchool?: string;
}

export interface TeacherRecord {
  id: string;
  employeeCode: string;
  fullName: string;
  gender: "Male" | "Female";
  qualification: string;
  designation: string;
  department: "Science" | "Mathematics" | "English" | "Urdu / Islamiyat" | "Computer Science" | "Social Sciences" | "Primary Wing";
  phone: string;
  email: string;
  joiningDate: string;
  salary: number;
  assignedClasses: string[];
  assignedSubjects: string[];
  status: "Active" | "On Leave" | "Resigned";
  isClassIncharge?: boolean;
  inchargeClassSection?: string;
  rating?: number;
}

export interface SMSAttendanceRecord {
  id: string;
  date: string;
  type: "Student" | "Staff";
  referenceId: string;
  name: string;
  className?: string;
  sectionName?: string;
  status: "Present" | "Absent" | "Late" | "Leave";
  timeIn?: string;
  remarks?: string;
}

export interface SMSExamTerm {
  id: string;
  title: string;
  session: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "In Progress" | "Results Declared";
  weightagePercentage: number;
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
  sectionPosition?: number;
  classPosition?: number;
  remarks?: string;
}

export interface SMSFeeVoucher {
  id: string;
  challanNo: string;
  studentId: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  className: string;
  sectionName: string;
  month: string;
  issueDate: string;
  dueDate: string;
  tuitionFee: number;
  transportFee: number;
  examFee: number;
  discountConcession: number;
  lateFine: number;
  totalPayable: number;
  status: "Unpaid" | "Paid" | "Overdue" | "Partial";
  paidAmount?: number;
  paidDate?: string;
  paymentMethod?: string;
  bankBranch?: string;
}

export interface QuestionBankItem {
  id: string;
  subject: string;
  className: string;
  chapter: string;
  topic?: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "Short" | "Long" | "FillBlanks";
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  marks: number;
}

export interface GeneratedPaper {
  id: string;
  title: string;
  className: string;
  subject: string;
  session: string;
  timeAllowed: string;
  totalMarks: number;
  instructions: string[];
  sections: {
    sectionTitle: string;
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
  periodNumber: number;
  timeSlot: string;
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
  routeCode: string;
  routeName: string;
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

// ─── NEW ENTERPRISE MODULE INTERFACES ─────────────────────────────────────────

export interface WhatsAppLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  studentAdmissionNo?: string;
  category: "Absence Alert" | "Fee Voucher" | "Result Declared" | "Event Notice" | "Disciplinary";
  message: string;
  sentAt: string;
  status: "Delivered" | "Sent" | "Failed";
}

export interface GateVisitor {
  id: string;
  visitorPassNo: string;
  fullName: string;
  cnic: string;
  phone: string;
  purpose: "Meeting Principal" | "Fee Deposit" | "Student Pickup" | "Vendor / Contractor" | "Admission Enquiry";
  personToMeet: string;
  checkInTime: string;
  checkOutTime?: string;
  status: "Inside Campus" | "Checked Out";
  vehicleNo?: string;
  badgeNumber: string;
}

export interface GatePunchLog {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  sectionName: string;
  punchType: "Entry (Morning Gate)" | "Exit (Dismissal)";
  timestamp: string;
  gateName: "Main Gate Turnstile 1" | "Gate 2 (Junior Wing)";
  alertStatus: "WhatsApp Dispatched" | "Logged";
}

export interface OnlineAdmissionApplicant {
  id: string;
  applicationNo: string;
  applicantName: string;
  appliedClass: string;
  fatherName: string;
  fatherPhone: string;
  fatherCnic: string;
  previousSchool: string;
  testScore?: number;
  interviewScore?: number;
  status: "Under Review" | "Test Scheduled" | "Shortlisted" | "Merit List 1" | "Merit List 2" | "Admission Granted" | "Rejected";
  appliedDate: string;
  meritRank?: number;
}

export interface HouseRecord {
  id: string;
  name: "Jinnah House" | "Iqbal House" | "Sir Syed House" | "Liaquat House";
  color: string;
  motto: string;
  houseMaster: string;
  totalPoints: number;
  trophiesCount: number;
}

export interface HousePointEvent {
  id: string;
  houseName: "Jinnah House" | "Iqbal House" | "Sir Syed House" | "Liaquat House";
  studentName: string;
  studentId: string;
  eventType: "Academic Distinction" | "Sports Gala Gold" | "Debate Championship" | "Discipline Infraction (-)" | "Cleanliness Drive";
  points: number;
  date: string;
  awardedBy: string;
}

export interface PTMSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  className: string;
  date: string;
  timeSlot: string;
  studentId?: string;
  studentName?: string;
  parentName?: string;
  status: "Available" | "Booked" | "Completed";
  teacherRemarks?: string;
}

export interface HostelRoom {
  id: string;
  buildingName: "Jinnah Hostel Block A" | "Iqbal Hostel Block B";
  roomNumber: string;
  floor: string;
  totalBeds: number;
  occupiedBeds: number;
  monthlyFee: number;
  wardenName: string;
}

export interface MessMenuItem {
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface ClinicVisit {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  complaint: string;
  treatment: string;
  attendedBy: string;
  parentNotified: boolean;
}

export interface OMRGradingResult {
  id: string;
  studentId: string;
  studentName: string;
  admissionNo: string;
  className: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unattempted: number;
  score: number;
  percentage: number;
  gradedAt: string;
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
  
  // Enterprise Module State
  whatsappLogs: WhatsAppLog[];
  gateVisitors: GateVisitor[];
  gatePunchLogs: GatePunchLog[];
  onlineApplicants: OnlineAdmissionApplicant[];
  houses: HouseRecord[];
  housePointEvents: HousePointEvent[];
  ptmSlots: PTMSlot[];
  hostelRooms: HostelRoom[];
  messMenu: MessMenuItem[];
  clinicVisits: ClinicVisit[];
  omrResults: OMRGradingResult[];
  
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
  
  // Enterprise Module Actions
  sendWhatsAppAlert: (phone: string, recipientName: string, category: WhatsAppLog["category"], message: string, studentAdmissionNo?: string) => void;
  registerGateVisitor: (visitor: Omit<GateVisitor, "id" | "visitorPassNo" | "checkInTime" | "status">) => GateVisitor;
  checkoutGateVisitor: (id: string) => void;
  punchGateCard: (studentId: string, type: "Entry (Morning Gate)" | "Exit (Dismissal)") => void;
  updateApplicantStatus: (id: string, status: OnlineAdmissionApplicant["status"], testScore?: number, interviewScore?: number) => void;
  awardHousePoints: (event: Omit<HousePointEvent, "id" | "date">) => void;
  bookPTMSlot: (slotId: string, studentId: string, studentName: string, parentName: string) => void;
  logClinicVisit: (visit: Omit<ClinicVisit, "id" | "date" | "time">) => void;
  gradeOMRSheet: (studentId: string, subject: string, answers: Record<number, string>, key: Record<number, string>) => OMRGradingResult;
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
    houseName: "Jinnah House",
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
    houseName: "Iqbal House",
    fatherName: "Muhammad Aslam",
    fatherCnic: "35202-4433221-1",
    fatherPhone: "03004455667",
    fatherOccupation: "Chartered Accountant",
    emergencyContact: "03004455667",
    residentialAddress: "Flat 12, Gulberg Heights, Lahore",
    guardianEmail: "aslam.ca@gmail.com",
    feeCategory: "Sibling Concession (20%)",
    customMonthlyFee: 14800,
    transportEnrolled: false
  },
  {
    id: "STU-003",
    admissionNo: "ADM-2026-0043",
    rollNo: "03",
    firstName: "Hamza",
    lastName: "Shafiq",
    gender: "Male",
    dob: "2010-02-28",
    bFormOrCnic: "35202-9988112-3",
    bloodGroup: "A+",
    campusId: "CAMP-01",
    classId: "C9",
    className: "Class 9 (Science)",
    sectionId: "CLS-9-A",
    sectionName: "Section A (Newton)",
    admissionDate: "2024-04-15",
    status: "Active",
    houseName: "Sir Syed House",
    fatherName: "Shafiq Ur Rehman",
    fatherCnic: "35202-3322114-5",
    fatherPhone: "03225566778",
    emergencyContact: "03225566778",
    residentialAddress: "Sector Y, Phase 3, DHA, Lahore",
    guardianEmail: "shafiq@pktextile.com",
    feeCategory: "Staff Child (50%)",
    customMonthlyFee: 9250,
    transportEnrolled: true,
    busRoute: "BUS-02 (DHA Phase 5 - Gulberg)"
  }
];

const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: "TCH-01",
    employeeCode: "TCH-2026-01",
    fullName: "Sir Shahid Mehmood",
    gender: "Male",
    qualification: "M.Sc. Physics (Punjab University)",
    designation: "Head of Science & Physics Master",
    department: "Science",
    phone: "03001234567",
    email: "shahid.physics@mtcoreschool.edu.pk",
    joiningDate: "2020-03-01",
    salary: 110000,
    assignedClasses: ["Class 9 (Science)", "Class 10 (Matric Science)"],
    assignedSubjects: ["Physics"],
    status: "Active",
    isClassIncharge: true,
    inchargeClassSection: "Class 9 (Science) - Section A",
    rating: 4.9
  },
  {
    id: "TCH-02",
    employeeCode: "TCH-2026-02",
    fullName: "Sir Nasir Abbas",
    gender: "Male",
    qualification: "M.Phil Applied Mathematics",
    designation: "Senior Mathematics Specialist",
    department: "Mathematics",
    phone: "03129876543",
    email: "nasir.math@mtcoreschool.edu.pk",
    joiningDate: "2019-08-15",
    salary: 105000,
    assignedClasses: ["Class 9 (Science)", "Class 10 (Matric Science)", "FSc Pre-Medical (Part 1)"],
    assignedSubjects: ["Mathematics"],
    status: "Active",
    isClassIncharge: true,
    inchargeClassSection: "Class 10 (Matric Science) - Section A",
    rating: 4.8
  },
  {
    id: "TCH-03",
    employeeCode: "TCH-2026-03",
    fullName: "Mrs. Tahira Batool",
    gender: "Female",
    qualification: "M.A. English Literature",
    designation: "Senior English Lecturer",
    department: "English",
    phone: "03334567890",
    email: "tahira.eng@mtcoreschool.edu.pk",
    joiningDate: "2021-01-10",
    salary: 95000,
    assignedClasses: ["Class 1", "Class 5", "Class 9 (Science)"],
    assignedSubjects: ["English Grammar", "English Literature"],
    status: "Active",
    isClassIncharge: true,
    inchargeClassSection: "Class 1 - Section A",
    rating: 4.7
  }
];

const INITIAL_HOUSES: HouseRecord[] = [
  { id: "H-1", name: "Jinnah House", color: "#16a34a", motto: "Unity, Faith, Discipline", houseMaster: "Sir Shahid Mehmood", totalPoints: 1240, trophiesCount: 8 },
  { id: "H-2", name: "Iqbal House", color: "#0284c7", motto: "Khudi & Eagle Vision", houseMaster: "Sir Nasir Abbas", totalPoints: 1180, trophiesCount: 6 },
  { id: "H-3", name: "Sir Syed House", color: "#9333ea", motto: "Knowledge & Progress", houseMaster: "Dr. Rizwan Bashir", totalPoints: 1310, trophiesCount: 9 },
  { id: "H-4", name: "Liaquat House", color: "#e11d48", motto: "Devotion & Service", houseMaster: "Mrs. Tahira Batool", totalPoints: 1120, trophiesCount: 5 }
];

const INITIAL_HOUSE_EVENTS: HousePointEvent[] = [
  { id: "EV-01", houseName: "Sir Syed House", studentName: "Ahmed Talal", studentId: "STU-001", eventType: "Academic Distinction", points: 50, date: "2026-08-14", awardedBy: "Principal Office" },
  { id: "EV-02", houseName: "Jinnah House", studentName: "Zoya Aslam", studentId: "STU-002", eventType: "Debate Championship", points: 40, date: "2026-08-12", awardedBy: "English Dept" }
];

const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [
  {
    id: "WA-01",
    recipientPhone: "03396399895",
    recipientName: "Mian Talal Ahmad",
    studentAdmissionNo: "ADM-2026-0041",
    category: "Fee Voucher",
    message: "Respected Parent, Fee Challan #CHL-2026-0801 for Ahmed Talal (Class 9) amounting to Rs 18,500 has been generated. Due Date: 10th Aug 2026.",
    sentAt: "2026-08-01 09:30 AM",
    status: "Delivered"
  },
  {
    id: "WA-02",
    recipientPhone: "03396399895",
    recipientName: "Mian Talal Ahmad",
    studentAdmissionNo: "ADM-2026-0041",
    category: "Result Declared",
    message: "Congratulations! Ahmed Talal has secured 1st Position in Class 9 (Newton) in Midterm Exam 2026 with 98% (A+). View result card in parent app.",
    sentAt: "2026-08-15 11:00 AM",
    status: "Delivered"
  }
];

const INITIAL_GATE_VISITORS: GateVisitor[] = [
  {
    id: "VIS-01",
    visitorPassNo: "VP-2026-091",
    fullName: "Muhammad Tariq",
    cnic: "35201-9988112-1",
    phone: "03009988776",
    purpose: "Meeting Principal",
    personToMeet: "Prof. Muhammad Aslam",
    checkInTime: "10:15 AM",
    status: "Inside Campus",
    vehicleNo: "LEA-2024",
    badgeNumber: "BADGE-14"
  }
];

const INITIAL_GATE_PUNCHES: GatePunchLog[] = [
  {
    id: "GP-01",
    studentId: "STU-001",
    studentName: "Ahmed Talal",
    admissionNo: "ADM-2026-0041",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    punchType: "Entry (Morning Gate)",
    timestamp: "07:48 AM",
    gateName: "Main Gate Turnstile 1",
    alertStatus: "WhatsApp Dispatched"
  }
];

const INITIAL_ONLINE_APPLICANTS: OnlineAdmissionApplicant[] = [
  {
    id: "APP-01",
    applicationNo: "ONLINE-ADM-8821",
    applicantName: "Daniyal Raza",
    appliedClass: "Class 9 (Science)",
    fatherName: "Raza Ali",
    fatherPhone: "03214455667",
    fatherCnic: "35202-9988221-1",
    previousSchool: "Beaconhouse School System",
    testScore: 88,
    interviewScore: 92,
    status: "Merit List 1",
    appliedDate: "2026-08-05",
    meritRank: 1
  },
  {
    id: "APP-02",
    applicationNo: "ONLINE-ADM-8822",
    applicantName: "Hania Imran",
    appliedClass: "Class 9 (Science)",
    fatherName: "Imran Yousaf",
    fatherPhone: "03335566778",
    fatherCnic: "35202-4433112-9",
    previousSchool: "Roots Millennium",
    testScore: 82,
    interviewScore: 85,
    status: "Shortlisted",
    appliedDate: "2026-08-08",
    meritRank: 4
  }
];

const INITIAL_PTM_SLOTS: PTMSlot[] = [
  { id: "PTM-01", teacherId: "TCH-01", teacherName: "Sir Shahid Mehmood", className: "Class 9 (Science)", date: "2026-08-20", timeSlot: "09:00 AM - 09:15 AM", studentId: "STU-001", studentName: "Ahmed Talal", parentName: "Mian Talal Ahmad", status: "Booked", teacherRemarks: "Consistently top performer. Ready for national olympiad." },
  { id: "PTM-02", teacherId: "TCH-01", teacherName: "Sir Shahid Mehmood", className: "Class 9 (Science)", date: "2026-08-20", timeSlot: "09:15 AM - 09:30 AM", status: "Available" },
  { id: "PTM-03", teacherId: "TCH-02", teacherName: "Sir Nasir Abbas", className: "Class 10 (Matric)", date: "2026-08-20", timeSlot: "09:00 AM - 09:15 AM", status: "Available" }
];

const INITIAL_HOSTEL_ROOMS: HostelRoom[] = [
  { id: "HR-101", buildingName: "Jinnah Hostel Block A", roomNumber: "Room 101 (Triple)", floor: "1st Floor", totalBeds: 3, occupiedBeds: 2, monthlyFee: 25000, wardenName: "Sir Abdul Qadir" },
  { id: "HR-102", buildingName: "Jinnah Hostel Block A", roomNumber: "Room 102 (Double)", floor: "1st Floor", totalBeds: 2, occupiedBeds: 2, monthlyFee: 30000, wardenName: "Sir Abdul Qadir" },
  { id: "HR-201", buildingName: "Iqbal Hostel Block B", roomNumber: "Room 201 (Double Deluxe)", floor: "2nd Floor", totalBeds: 2, occupiedBeds: 1, monthlyFee: 32000, wardenName: "Sir Masood Akhtar" }
];

const INITIAL_MESS_MENU: MessMenuItem[] = [
  { day: "Monday", breakfast: "Egg Omelette, Paratha, Milk Tea", lunch: "Chicken Karahi, Roti, Salad", dinner: "Daal Chawal, Shami Kabab, Kheer" },
  { day: "Tuesday", breakfast: "Halwa Puri, Chana, Tea", lunch: "Beef Biryani, Raita", dinner: "Mix Vegetables, Chicken Roast, Roti" },
  { day: "Wednesday", breakfast: "French Toast, Butter Jam, Coffee", lunch: "Aloo Gosht, Zeera Rice", dinner: "Chicken Pulao, Mint Raita" },
  { day: "Thursday", breakfast: "Boiled Eggs, Cheese Slice, Bread", lunch: "Daal Mash, Tandoori Roti", dinner: "Chicken Handi, Naan, Gulab Jamun" },
  { day: "Friday", breakfast: "Chana Paratha, Tea", lunch: "Special Mutton Biryani, Salad", dinner: "Chicken Haleem, Naan" },
  { day: "Saturday", breakfast: "Pancake / Waffle, Milk", lunch: "White Chana Pulao, Shami", dinner: "Chicken BBQ, Paratha, Mint Chutney" },
  { day: "Sunday", breakfast: "Nihari / Siri Paye, Kulcha", lunch: "Chicken Manchurian, Fried Rice", dinner: "Kadhai Gosht, Roghani Naan, Custard" }
];

const INITIAL_CLINIC_VISITS: ClinicVisit[] = [
  { id: "CL-01", studentId: "STU-001", studentName: "Ahmed Talal", className: "Class 9 (Science)", date: "2026-08-11", time: "11:20 AM", complaint: "Mild headache after sports period", treatment: "Oral hydration and rest in infirmary for 20 mins. Relieved.", attendedBy: "Staff Nurse Shazia", parentNotified: false }
];

const INITIAL_EXAM_TERMS: SMSExamTerm[] = [
  { id: "EXM-MID-2026", title: "Midterm Terminal Examination 2026", session: "2025-2026", startDate: "2026-08-10", endDate: "2026-08-22", status: "Results Declared", weightagePercentage: 40 },
  { id: "EXM-FIN-2026", title: "Annual Final Board Examination 2026", session: "2025-2026", startDate: "2026-02-15", endDate: "2026-03-05", status: "Upcoming", weightagePercentage: 60 }
];

const INITIAL_MARKS: SMSMarksEntry[] = [
  { id: "MRK-01", examId: "EXM-MID-2026", examTitle: "Midterm Terminal Examination 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Physics", totalMarks: 100, obtainedMarks: 98, percentage: 98, grade: "A+", sectionPosition: 1, classPosition: 1, remarks: "Top score in Federal Board syllabus" },
  { id: "MRK-02", examId: "EXM-MID-2026", examTitle: "Midterm Terminal Examination 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "Mathematics", totalMarks: 100, obtainedMarks: 99, percentage: 99, grade: "A+", sectionPosition: 1, classPosition: 1, remarks: "Flawless mathematical proof steps" },
  { id: "MRK-03", examId: "EXM-MID-2026", examTitle: "Midterm Terminal Examination 2026", studentId: "STU-001", admissionNo: "ADM-2026-0041", rollNo: "01", studentName: "Ahmed Talal", className: "Class 9 (Science)", sectionName: "Section A (Newton)", subject: "English Grammar", totalMarks: 100, obtainedMarks: 97, percentage: 97, grade: "A+", sectionPosition: 1, classPosition: 1, remarks: "Excellent essay composition" }
];

const INITIAL_FEE_VOUCHERS: SMSFeeVoucher[] = [
  {
    id: "FEE-01",
    challanNo: "CHL-2026-0801",
    studentId: "STU-001",
    admissionNo: "ADM-2026-0041",
    studentName: "Ahmed Talal",
    fatherName: "Mian Talal Ahmad",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    month: "August 2026",
    issueDate: "2026-08-01",
    dueDate: "2026-08-10",
    tuitionFee: 18500,
    transportFee: 3500,
    examFee: 1000,
    discountConcession: 0,
    lateFine: 0,
    totalPayable: 23000,
    status: "Paid",
    paidAmount: 23000,
    paidDate: "2026-08-04",
    paymentMethod: "Bank Transfer (Meezan Bank)",
    bankBranch: "Main Boulevard Gulberg Branch"
  },
  {
    id: "FEE-02",
    challanNo: "CHL-2026-0802",
    studentId: "STU-002",
    admissionNo: "ADM-2026-0042",
    studentName: "Zoya Aslam",
    fatherName: "Muhammad Aslam",
    className: "Class 9 (Science)",
    sectionName: "Section A (Newton)",
    month: "August 2026",
    issueDate: "2026-08-01",
    dueDate: "2026-08-10",
    tuitionFee: 18500,
    transportFee: 0,
    examFee: 1000,
    discountConcession: 3700,
    lateFine: 0,
    totalPayable: 15800,
    status: "Unpaid"
  }
];

const INITIAL_QUESTION_BANK: QuestionBankItem[] = [
  { id: "QB-01", subject: "Physics", className: "Class 9 (Science)", chapter: "Kinematics", difficulty: "Medium", type: "MCQ", questionText: "The rate of change of displacement is known as:", options: ["Speed", "Velocity", "Acceleration", "Momentum"], correctAnswer: "Velocity", marks: 1 },
  { id: "QB-02", subject: "Physics", className: "Class 9 (Science)", chapter: "Dynamics", difficulty: "Medium", type: "Short", questionText: "State Newton's Second Law of Motion and derive its formula F = ma.", marks: 4 },
  { id: "QB-03", subject: "Physics", className: "Class 9 (Science)", chapter: "Gravitation", difficulty: "Hard", type: "Long", questionText: "State Newton's Law of Universal Gravitation and determine the mass of the earth using this law.", marks: 8 }
];

const INITIAL_TIMETABLE: TimetablePeriod[] = [
  { id: "TT-01", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 1, timeSlot: "08:00 AM - 08:45 AM", subject: "Physics", teacherId: "TCH-01", teacherName: "Sir Shahid Mehmood", room: "Physics Lab 1" },
  { id: "TT-02", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 2, timeSlot: "08:45 AM - 09:30 AM", subject: "Mathematics", teacherId: "TCH-02", teacherName: "Sir Nasir Abbas", room: "Hall 301" },
  { id: "TT-03", className: "Class 9 (Science)", sectionName: "Section A (Newton)", day: "Monday", periodNumber: 3, timeSlot: "09:30 AM - 10:15 AM", subject: "English Grammar", teacherId: "TCH-03", teacherName: "Mrs. Tahira Batool", room: "Hall 301" }
];

const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  { id: "BK-01", accessionNo: "ACC-PHY-0101", title: "Fundamentals of Physics (Halliday & Resnick 10th Ed)", author: "Jearl Walker", category: "Science", totalCopies: 15, availableCopies: 12, shelfNumber: "Shelf S-04" },
  { id: "BK-02", accessionNo: "ACC-MTH-0202", title: "Calculus & Analytical Geometry", author: "George B. Thomas", category: "Mathematics", totalCopies: 20, availableCopies: 18, shelfNumber: "Shelf M-02" },
  { id: "BK-03", accessionNo: "ACC-LIT-0303", title: "A Brief History of Time", author: "Stephen Hawking", category: "Science", totalCopies: 8, availableCopies: 5, shelfNumber: "Shelf S-01" }
];

const INITIAL_TRANSPORT: TransportRoute[] = [
  { id: "TR-01", routeCode: "BUS-01", routeName: "Wapda Town - Valencia - Model Town - Gulberg Main", driverName: "Muhammad Hanif", driverPhone: "03001122334", vehicleNumber: "LEG-8921 (Toyota Coaster)", totalSeats: 30, assignedStudentsCount: 28, monthlyFeePerStudent: 3500 },
  { id: "TR-02", routeCode: "BUS-02", routeName: "DHA Phase 5 - Phase 3 - Cavalry - Gulberg Main", driverName: "Rashid Ali", driverPhone: "03214455667", vehicleNumber: "LEE-4455 (Hino Minibus)", totalSeats: 35, assignedStudentsCount: 32, monthlyFeePerStudent: 4000 }
];

const INITIAL_NOTICES: SchoolNotice[] = [
  { id: "NOT-01", title: "Independence Day Gala & All-Pakistan Bilingual Declamation", category: "Event", targetAudience: "All", date: "2026-08-14", content: "All students are cordially invited to participate in the National Declamation and Science Exhibition on 14th August in the Central Auditorium.", isPinned: true },
  { id: "NOT-02", title: "Annual Science Olympiad Registration Open", category: "Academic", targetAudience: "Students", date: "2026-08-10", content: "Registrations for BISE National Science Olympiad 2026 are now open. Interested students contact Sir Shahid Mehmood before 25th August.", isPinned: false }
];

// ─── PROVIDER COMPONENT ───────────────────────────────────────────────────────

export function SMSProvider({ children }: { children: ReactNode }) {
  const [activeRole, setActiveRole] = useState<SMSRole>("Owner");
  const [selectedCampus, setSelectedCampus] = useState<string>("CAMP-01");
  const [selectedSession, setSelectedSession] = useState<string>("SESS-2025-26");

  // State Collections
  const [campuses, setCampuses] = useState<SMSCampus[]>(INITIAL_CAMPUSES);
  const [sessions, setSessions] = useState<SMSAcademicSession[]>(INITIAL_SESSIONS);
  const [classes, setClasses] = useState<SMSClassSection[]>(INITIAL_CLASSES);
  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<TeacherRecord[]>(INITIAL_TEACHERS);
  const [attendance, setAttendance] = useState<SMSAttendanceRecord[]>([]);
  const [examTerms, setExamTerms] = useState<SMSExamTerm[]>(INITIAL_EXAM_TERMS);
  const [marks, setMarks] = useState<SMSMarksEntry[]>(INITIAL_MARKS);
  const [feeVouchers, setFeeVouchers] = useState<SMSFeeVoucher[]>(INITIAL_FEE_VOUCHERS);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>(INITIAL_QUESTION_BANK);
  const [generatedPapers, setGeneratedPapers] = useState<GeneratedPaper[]>([]);
  const [timetable, setTimetable] = useState<TimetablePeriod[]>(INITIAL_TIMETABLE);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(INITIAL_LIBRARY_BOOKS);
  const [issuedBooks, setIssuedBooks] = useState<LibraryIssuedRecord[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(INITIAL_TRANSPORT);
  const [notices, setNotices] = useState<SchoolNotice[]>(INITIAL_NOTICES);

  // Enterprise Module State
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>(INITIAL_WHATSAPP_LOGS);
  const [gateVisitors, setGateVisitors] = useState<GateVisitor[]>(INITIAL_GATE_VISITORS);
  const [gatePunchLogs, setGatePunchLogs] = useState<GatePunchLog[]>(INITIAL_GATE_PUNCHES);
  const [onlineApplicants, setOnlineApplicants] = useState<OnlineAdmissionApplicant[]>(INITIAL_ONLINE_APPLICANTS);
  const [houses, setHouses] = useState<HouseRecord[]>(INITIAL_HOUSES);
  const [housePointEvents, setHousePointEvents] = useState<HousePointEvent[]>(INITIAL_HOUSE_EVENTS);
  const [ptmSlots, setPtmSlots] = useState<PTMSlot[]>(INITIAL_PTM_SLOTS);
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>(INITIAL_HOSTEL_ROOMS);
  const [messMenu, setMessMenu] = useState<MessMenuItem[]>(INITIAL_MESS_MENU);
  const [clinicVisits, setClinicVisits] = useState<ClinicVisit[]>(INITIAL_CLINIC_VISITS);
  const [omrResults, setOmrResults] = useState<OMRGradingResult[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const storedStudents = localStorage.getItem("mt_sms_students");
      if (storedStudents) setStudents(JSON.parse(storedStudents));

      const storedClasses = localStorage.getItem("mt_sms_classes");
      if (storedClasses) setClasses(JSON.parse(storedClasses));

      const storedMarks = localStorage.getItem("mt_sms_marks");
      if (storedMarks) setMarks(JSON.parse(storedMarks));

      const storedFee = localStorage.getItem("mt_sms_feevouchers");
      if (storedFee) setFeeVouchers(JSON.parse(storedFee));

      const storedPapers = localStorage.getItem("mt_sms_papers");
      if (storedPapers) setGeneratedPapers(JSON.parse(storedPapers));

      const storedWA = localStorage.getItem("mt_sms_whatsapp");
      if (storedWA) setWhatsappLogs(JSON.parse(storedWA));

      const storedVisitors = localStorage.getItem("mt_sms_visitors");
      if (storedVisitors) setGateVisitors(JSON.parse(storedVisitors));

      const storedApplicants = localStorage.getItem("mt_sms_applicants");
      if (storedApplicants) setOnlineApplicants(JSON.parse(storedApplicants));
    } catch (e) {
      console.warn("Could not load SMS local storage data:", e);
    }
  }, []);

  // Helper to persist
  const persist = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      supabase.from("unipos_global").upsert({ key, value: data }).then(() => {});
    } catch {}
  };

  // ── ACTIONS ──

  const addStudent = (studentData: Omit<StudentRecord, "id" | "admissionNo">): StudentRecord => {
    const nextNo = `ADM-2026-${String(students.length + 101).padStart(4, "0")}`;
    const newStudent: StudentRecord = {
      ...studentData,
      id: `STU-${Date.now()}`,
      admissionNo: nextNo
    };
    const updated = [newStudent, ...students];
    setStudents(updated);
    persist("mt_sms_students", updated);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<StudentRecord>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStudents(updated);
    persist("mt_sms_students", updated);
  };

  const deleteStudent = (id: string) => {
    const updated = students.filter((s) => s.id !== id);
    setStudents(updated);
    persist("mt_sms_students", updated);
  };

  const promoteStudentsBatch = (
    sourceClass: string,
    sourceSection: string,
    targetClass: string,
    targetSection: string
  ) => {
    const updated = students.map((s) => {
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
    setStudents(updated);
    persist("mt_sms_students", updated);
  };

  const issueSchoolLeavingCertificate = (studentId: string, reason: string) => {
    const updated = students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            status: "Alumni" as const,
            medicalNotes: `${s.medicalNotes || ""} [SLC Issued: ${reason}]`
          }
        : s
    );
    setStudents(updated);
    persist("mt_sms_students", updated);
  };

  const addTeacher = (teacherData: Omit<TeacherRecord, "id" | "employeeCode">): TeacherRecord => {
    const nextCode = `TCH-2026-${String(teachers.length + 1).padStart(2, "0")}`;
    const newTeacher: TeacherRecord = {
      ...teacherData,
      id: `TCH-${Date.now()}`,
      employeeCode: nextCode
    };
    const updated = [...teachers, newTeacher];
    setTeachers(updated);
    persist("mt_sms_teachers", updated);
    return newTeacher;
  };

  const updateTeacher = (id: string, updates: Partial<TeacherRecord>) => {
    const updated = teachers.map((t) => (t.id === id ? { ...t, ...updates } : t));
    setTeachers(updated);
    persist("mt_sms_teachers", updated);
  };

  const addClassSection = (secData: Omit<SMSClassSection, "id" | "enrolledCount">): SMSClassSection => {
    const newSec: SMSClassSection = {
      ...secData,
      id: `CLS-${Date.now()}`,
      enrolledCount: 0
    };
    const updated = [...classes, newSec];
    setClasses(updated);
    persist("mt_sms_classes", updated);
    return newSec;
  };

  const updateClassSection = (id: string, updates: Partial<SMSClassSection>) => {
    const updated = classes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setClasses(updated);
    persist("mt_sms_classes", updated);
  };

  const markAttendanceBatch = (records: Omit<SMSAttendanceRecord, "id">[]) => {
    const stamped = records.map((r) => ({ ...r, id: `ATT-${Date.now()}-${Math.random()}` }));
    setAttendance((prev) => [...stamped, ...prev]);
  };

  const addExamTerm = (termData: Omit<SMSExamTerm, "id">): SMSExamTerm => {
    const newTerm: SMSExamTerm = { ...termData, id: `EXM-${Date.now()}` };
    const updated = [...examTerms, newTerm];
    setExamTerms(updated);
    return newTerm;
  };

  const saveMarksBatch = (entries: Omit<SMSMarksEntry, "id">[]) => {
    const stamped = entries.map((e) => ({ ...e, id: `MRK-${Date.now()}-${Math.random()}` }));
    const updated = [...stamped, ...marks];
    setMarks(updated);
    persist("mt_sms_marks", updated);
  };

  const generateMonthlyChallans = (className: string, month: string, dueDate: string): number => {
    const targetStudents = students.filter((s) => s.className === className && s.status === "Active");
    const newVouchers: SMSFeeVoucher[] = targetStudents.map((s, idx) => {
      const tuition = s.customMonthlyFee || 18500;
      const transport = s.transportEnrolled ? 3500 : 0;
      const exam = 1000;
      const disc = s.feeCategory.includes("20%") ? tuition * 0.2 : s.feeCategory.includes("50%") ? tuition * 0.5 : 0;
      const total = tuition + transport + exam - disc;

      return {
        id: `FEE-${Date.now()}-${idx}`,
        challanNo: `CHL-2026-${String(feeVouchers.length + idx + 1).padStart(4, "0")}`,
        studentId: s.id,
        admissionNo: s.admissionNo,
        studentName: `${s.firstName} ${s.lastName}`,
        fatherName: s.fatherName,
        className: s.className,
        sectionName: s.sectionName,
        month,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate,
        tuitionFee: tuition,
        transportFee: transport,
        examFee: exam,
        discountConcession: disc,
        lateFine: 0,
        totalPayable: total,
        status: "Unpaid"
      };
    });

    const updated = [...newVouchers, ...feeVouchers];
    setFeeVouchers(updated);
    persist("mt_sms_feevouchers", updated);
    return newVouchers.length;
  };

  const collectFeeChallan = (challanNo: string, amount: number, paymentMethod: string, bankBranch?: string) => {
    const updated = feeVouchers.map((v) => {
      if (v.challanNo === challanNo) {
        return {
          ...v,
          status: "Paid" as const,
          paidAmount: amount,
          paidDate: new Date().toISOString().split("T")[0],
          paymentMethod,
          bankBranch: bankBranch || "Main Cashier Desk"
        };
      }
      return v;
    });
    setFeeVouchers(updated);
    persist("mt_sms_feevouchers", updated);
  };

  const addQuestionToBank = (qData: Omit<QuestionBankItem, "id">): QuestionBankItem => {
    const newQ: QuestionBankItem = { ...qData, id: `QB-${Date.now()}` };
    const updated = [newQ, ...questionBank];
    setQuestionBank(updated);
    return newQ;
  };

  const createGeneratedPaper = (paperData: Omit<GeneratedPaper, "id" | "createdAt">): GeneratedPaper => {
    const newPaper: GeneratedPaper = {
      ...paperData,
      id: `PPR-${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [newPaper, ...generatedPapers];
    setGeneratedPapers(updated);
    persist("mt_sms_papers", updated);
    return newPaper;
  };

  const issueBook = (bookId: string, studentId: string, dueDate: string) => {
    const book = libraryBooks.find((b) => b.id === bookId);
    const student = students.find((s) => s.id === studentId);
    if (!book || !student || book.availableCopies <= 0) return;

    const newIssue: LibraryIssuedRecord = {
      id: `ISS-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      studentId,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate,
      fineAmount: 0,
      status: "Issued"
    };

    setIssuedBooks([newIssue, ...issuedBooks]);
    setLibraryBooks(libraryBooks.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b)));
  };

  const returnBook = (issueId: string) => {
    const record = issuedBooks.find((i) => i.id === issueId);
    if (!record) return;

    setIssuedBooks(
      issuedBooks.map((i) =>
        i.id === issueId ? { ...i, status: "Returned", returnDate: new Date().toISOString().split("T")[0] } : i
      )
    );
    setLibraryBooks(
      libraryBooks.map((b) => (b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b))
    );
  };

  const addNotice = (nData: Omit<SchoolNotice, "id" | "date">): SchoolNotice => {
    const newNotice: SchoolNotice = {
      ...nData,
      id: `NOT-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    setNotices([newNotice, ...notices]);
    return newNotice;
  };

  // Enterprise Module Actions
  const sendWhatsAppAlert = (
    phone: string,
    recipientName: string,
    category: WhatsAppLog["category"],
    message: string,
    studentAdmissionNo?: string
  ) => {
    const newLog: WhatsAppLog = {
      id: `WA-${Date.now()}`,
      recipientPhone: phone,
      recipientName,
      studentAdmissionNo,
      category,
      message,
      sentAt: new Date().toLocaleString(),
      status: "Delivered"
    };
    const updated = [newLog, ...whatsappLogs];
    setWhatsappLogs(updated);
    persist("mt_sms_whatsapp", updated);
  };

  const registerGateVisitor = (
    visitorData: Omit<GateVisitor, "id" | "visitorPassNo" | "checkInTime" | "status">
  ): GateVisitor => {
    const newVisitor: GateVisitor = {
      ...visitorData,
      id: `VIS-${Date.now()}`,
      visitorPassNo: `VP-${Date.now().toString().slice(-4)}`,
      checkInTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      status: "Inside Campus"
    };
    const updated = [newVisitor, ...gateVisitors];
    setGateVisitors(updated);
    persist("mt_sms_visitors", updated);
    return newVisitor;
  };

  const checkoutGateVisitor = (id: string) => {
    const updated = gateVisitors.map((v) =>
      v.id === id
        ? {
            ...v,
            status: "Checked Out" as const,
            checkOutTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        : v
    );
    setGateVisitors(updated);
    persist("mt_sms_visitors", updated);
  };

  const punchGateCard = (studentId: string, type: "Entry (Morning Gate)" | "Exit (Dismissal)") => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    const punch: GatePunchLog = {
      id: `GP-${Date.now()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNo: student.admissionNo,
      className: student.className,
      sectionName: student.sectionName,
      punchType: type,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      gateName: "Main Gate Turnstile 1",
      alertStatus: "WhatsApp Dispatched"
    };
    setGatePunchLogs([punch, ...gatePunchLogs]);

    // Also auto-dispatch WhatsApp alert to parent
    if (student.fatherPhone) {
      sendWhatsAppAlert(
        student.fatherPhone,
        student.fatherName,
        "Absence Alert",
        `Assalam-o-Alaikum, your child ${student.firstName} (${student.admissionNo}) has successfully scanned RFID at ${punch.gateName} at ${punch.timestamp} [${type}].`,
        student.admissionNo
      );
    }
  };

  const updateApplicantStatus = (
    id: string,
    status: OnlineAdmissionApplicant["status"],
    testScore?: number,
    interviewScore?: number
  ) => {
    const updated = onlineApplicants.map((a) =>
      a.id === id
        ? {
            ...a,
            status,
            testScore: testScore !== undefined ? testScore : a.testScore,
            interviewScore: interviewScore !== undefined ? interviewScore : a.interviewScore
          }
        : a
    );
    setOnlineApplicants(updated);
    persist("mt_sms_applicants", updated);
  };

  const awardHousePoints = (event: Omit<HousePointEvent, "id" | "date">) => {
    const newEvent: HousePointEvent = {
      ...event,
      id: `EV-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };
    setHousePointEvents([newEvent, ...housePointEvents]);
    setHouses(
      houses.map((h) => (h.name === event.houseName ? { ...h, totalPoints: h.totalPoints + event.points } : h))
    );
  };

  const bookPTMSlot = (slotId: string, studentId: string, studentName: string, parentName: string) => {
    setPtmSlots(
      ptmSlots.map((s) =>
        s.id === slotId
          ? { ...s, status: "Booked", studentId, studentName, parentName }
          : s
      )
    );
  };

  const logClinicVisit = (visit: Omit<ClinicVisit, "id" | "date" | "time">) => {
    const newVisit: ClinicVisit = {
      ...visit,
      id: `CL-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
    setClinicVisits([newVisit, ...clinicVisits]);
  };

  const gradeOMRSheet = (
    studentId: string,
    subject: string,
    answers: Record<number, string>,
    key: Record<number, string>
  ): OMRGradingResult => {
    const student = students.find((s) => s.id === studentId);
    let correct = 0;
    let wrong = 0;
    let unattempted = 0;

    const totalQ = Object.keys(key).length || 20;

    for (let i = 1; i <= totalQ; i++) {
      const studentAns = answers[i];
      const correctAns = key[i];
      if (!studentAns) unattempted++;
      else if (studentAns === correctAns) correct++;
      else wrong++;
    }

    const pct = Math.round((correct / totalQ) * 100);

    const result: OMRGradingResult = {
      id: `OMR-${Date.now()}`,
      studentId,
      studentName: student ? `${student.firstName} ${student.lastName}` : "Student",
      admissionNo: student?.admissionNo || "ADM-2026-XXXX",
      className: student?.className || "Class 9",
      subject,
      totalQuestions: totalQ,
      correctAnswers: correct,
      wrongAnswers: wrong,
      unattempted,
      score: correct,
      percentage: pct,
      gradedAt: new Date().toLocaleString()
    };

    setOmrResults([result, ...omrResults]);
    return result;
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
        whatsappLogs,
        gateVisitors,
        gatePunchLogs,
        onlineApplicants,
        houses,
        housePointEvents,
        ptmSlots,
        hostelRooms,
        messMenu,
        clinicVisits,
        omrResults,
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
        addNotice,
        sendWhatsAppAlert,
        registerGateVisitor,
        checkoutGateVisitor,
        punchGateCard,
        updateApplicantStatus,
        awardHousePoints,
        bookPTMSlot,
        logClinicVisit,
        gradeOMRSheet
      }}
    >
      {children}
    </SMSContext.Provider>
  );
}

export function useSMS() {
  const context = useContext(SMSContext);
  if (!context) {
    throw new Error("useSMS must be used within an SMSProvider");
  }
  return context;
}
