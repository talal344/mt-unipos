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

export interface SMSClassSubject {
  id: string;
  className: string;
  subjectName: string;
  type: "Compulsory" | "Elective"; // Compulsory (Lazmi) vs Elective (Ikhtiari/Optional)
  totalMarks: number;
  passingMarks: number;
  teacherName?: string;
}

export interface SMSBellTiming {
  id: string;
  name: string;
  start: string;
  end: string;
  type: "Assembly" | "Class" | "Break" | "Prayer" | "Dismissal";
}

export const DEFAULT_BELL_TIMINGS: SMSBellTiming[] = [
  { id: "bt-1", name: "Morning Assembly", start: "07:45 AM", end: "08:00 AM", type: "Assembly" },
  { id: "bt-2", name: "Period 1", start: "08:00 AM", end: "08:45 AM", type: "Class" },
  { id: "bt-3", name: "Period 2", start: "08:45 AM", end: "09:30 AM", type: "Class" },
  { id: "bt-4", name: "Period 3", start: "09:30 AM", end: "10:15 AM", type: "Class" },
  { id: "bt-5", name: "Period 4", start: "10:15 AM", end: "11:00 AM", type: "Class" },
  { id: "bt-6", name: "Recess / Break", start: "11:00 AM", end: "11:30 AM", type: "Break" },
  { id: "bt-7", name: "Period 5", start: "11:30 AM", end: "12:15 PM", type: "Class" },
  { id: "bt-8", name: "Period 6", start: "12:15 PM", end: "01:00 PM", type: "Class" },
  { id: "bt-9", name: "Period 7 (Final)", start: "01:00 PM", end: "01:45 PM", type: "Class" }
];

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
  classId?: string;
  className: string;
  sectionId?: string;
  sectionName: string;
  admissionDate: string;
  status: "Active" | "Promoted" | "Struck Off" | "Alumni" | "Suspended";
  avatar?: string;
  houseName?: "Jinnah House" | "Iqbal House" | "Sir Syed House" | "Liaquat House";
  
  // Guardian / Parent Info
  fatherName: string;
  fatherCnic?: string;
  fatherPhone: string;
  fatherOccupation?: string;
  motherName?: string;
  motherPhone?: string;
  emergencyContact?: string;
  residentialAddress?: string;
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
  type?: "Student" | "Staff";
  referenceId?: string;
  name?: string;
  studentId?: string;
  studentName?: string;
  admissionNo?: string;
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
  examTitle?: string;
  studentId: string;
  admissionNo: string;
  rollNo?: string;
  studentName: string;
  className: string;
  sectionName?: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage?: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  sectionPosition?: number;
  classPosition?: number;
  remarks?: string;
  comments?: string;
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
  session?: string;
  timeAllowed: string;
  totalMarks: number;
  mcqCount?: number;
  shortCount?: number;
  shortAttempt?: number;
  longCount?: number;
  longAttempt?: number;
  instructions?: string[];
  sections?: {
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

export interface SMSUserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  password: string;
  role: SMSRole;
  linkedEntityId?: string; // studentId or teacherId
  linkedEntityName?: string;
  linkedStudentIds?: string[]; // for parent users linked to multiple sibling students
  phone?: string;
  status: "Active" | "Suspended" | "Pending";
  createdAt: string;
  lastLogin?: string;
}

// ─── CONTEXT PROPS ────────────────────────────────────────────────────────────

interface SMSContextType {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  toggleTheme: () => void;
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
  classSubjects: SMSClassSubject[];
  students: StudentRecord[];
  teachers: TeacherRecord[];
  users: SMSUserAccount[];
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
  addStudent: (student: Omit<StudentRecord, "id" | "admissionNo"> & { admissionNo?: string }) => StudentRecord;
  updateStudent: (id: string, updates: Partial<StudentRecord>) => void;
  deleteStudent: (id: string) => void;
  promoteStudentsBatch: (sourceClass: string, sourceSection: string, targetClass: string, targetSection: string) => void;
  issueSchoolLeavingCertificate: (studentId: string, reason: string) => void;
  
  // Teacher Actions
  addTeacher: (teacher: Omit<TeacherRecord, "id" | "employeeCode">) => TeacherRecord;
  updateTeacher: (id: string, updates: Partial<TeacherRecord>) => void;
  deleteTeacher: (id: string) => void;
  
  // User Management Actions
  addUserAccount: (user: Omit<SMSUserAccount, "id" | "createdAt">) => SMSUserAccount;
  updateUserAccount: (id: string, updates: Partial<SMSUserAccount>) => void;
  deleteUserAccount: (id: string) => void;
  generateStudentCredentialsBatch: () => number;
  generateTeacherCredentialsBatch: () => number;

  // Class & Section & Subject Actions
  addClassSection: (section: Omit<SMSClassSection, "id" | "enrolledCount">) => SMSClassSection;
  updateClassSection: (id: string, updates: Partial<SMSClassSection>) => void;
  deleteClassSection: (id: string) => void;
  reassignStudentSection: (studentId: string, targetClassId: string, targetClassName: string, targetSectionId: string, targetSectionName: string) => void;
  addClassSubject: (subject: Omit<SMSClassSubject, "id">) => SMSClassSubject;
  updateClassSubject: (id: string, updates: Partial<SMSClassSubject>) => void;
  deleteClassSubject: (id: string) => void;
  bulkImportClassesAndSubjects: (
    importedClasses: Omit<SMSClassSection, "id" | "enrolledCount">[],
    importedSubjects: Omit<SMSClassSubject, "id">[]
  ) => { classCount: number; subjectCount: number };
  
  // Timetable Actions
  bellTimings: SMSBellTiming[];
  addBellTiming: (timing: Omit<SMSBellTiming, "id">) => SMSBellTiming;
  updateBellTiming: (id: string, updates: Partial<SMSBellTiming>) => void;
  deleteBellTiming: (id: string) => void;
  resetBellTimings: () => void;
  addTimetablePeriod: (period: Omit<TimetablePeriod, "id">) => TimetablePeriod;
  updateTimetablePeriod: (id: string, updates: Partial<TimetablePeriod>) => void;
  deleteTimetablePeriod: (id: string) => void;
  
  // Attendance Actions
  markAttendanceBatch: (records: Omit<SMSAttendanceRecord, "id">[]) => void;
  
  // Exam & Marks Actions
  addExamTerm: (term: Omit<SMSExamTerm, "id">) => SMSExamTerm;
  saveMarksBatch: (entries: Omit<SMSMarksEntry, "id">[]) => void;
  
  // Fee Actions
  generateMonthlyChallans: (className: string, month: string, dueDate: string) => number;
  collectFeeChallan: (challanNo: string, amount: number, paymentMethod: string, bankBranch?: string) => void;
  deleteFeeChallan: (id: string) => void;
  purgeDuplicateChallans: () => number;
  
  // Paper Generator
  addQuestionToBank: (q: Omit<QuestionBankItem, "id">) => QuestionBankItem;
  createGeneratedPaper: (paper: Omit<GeneratedPaper, "id" | "createdAt">) => GeneratedPaper;
  
  // Library Actions
  issueBook: (bookId: string, studentId: string, dueDate: string) => void;
  returnBook: (issueId: string) => void;
  
  // Notice Actions
  addNotice: (notice: Omit<SchoolNotice, "id" | "date">) => SchoolNotice;
  deleteNotice: (id: string) => void;
  
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
  addCampusWing: (campusId: string, wing: { name: string; headName: string; totalClasses?: number }) => void;
  deleteCampusWing: (campusId: string, wingId: string) => void;
  clearAllDemoData: () => void;
}

const SMSContext = createContext<SMSContextType | undefined>(undefined);

// ─── CLEAN INITIAL DATA (ZERO DEMO DATA) ──────────────────────────────────────

const INITIAL_CAMPUSES: SMSCampus[] = [
  {
    id: "CAMP-01",
    name: "Main Campus",
    code: "CAMP-01",
    principalName: "Principal Office",
    phone: "",
    address: "",
    wings: []
  }
];

const INITIAL_SESSIONS: SMSAcademicSession[] = [
  { id: "SESS-2026-27", name: "Academic Session 2026–2027", startDate: "2026-08-01", endDate: "2027-06-30", isCurrent: true }
];

const INITIAL_CLASSES: SMSClassSection[] = [];
const INITIAL_STUDENTS: StudentRecord[] = [];
const INITIAL_TEACHERS: TeacherRecord[] = [];
const INITIAL_USERS: SMSUserAccount[] = [];
const INITIAL_HOUSES: HouseRecord[] = [];
const INITIAL_HOUSE_EVENTS: HousePointEvent[] = [];
const INITIAL_WHATSAPP_LOGS: WhatsAppLog[] = [];
const INITIAL_GATE_VISITORS: GateVisitor[] = [];
const INITIAL_GATE_PUNCHES: GatePunchLog[] = [];
const INITIAL_ONLINE_APPLICANTS: OnlineAdmissionApplicant[] = [];
const INITIAL_PTM_SLOTS: PTMSlot[] = [];
const INITIAL_HOSTEL_ROOMS: HostelRoom[] = [];
const INITIAL_MESS_MENU: MessMenuItem[] = [];
const INITIAL_CLINIC_VISITS: ClinicVisit[] = [];
const INITIAL_EXAM_TERMS: SMSExamTerm[] = [];
const INITIAL_MARKS: SMSMarksEntry[] = [];
const INITIAL_FEE_VOUCHERS: SMSFeeVoucher[] = [];
const INITIAL_QUESTION_BANK: QuestionBankItem[] = [];
const INITIAL_TIMETABLE: TimetablePeriod[] = [];
const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [];
const INITIAL_TRANSPORT: TransportRoute[] = [];
const INITIAL_NOTICES: SchoolNotice[] = [];

// ─── PROVIDER COMPONENT ───────────────────────────────────────────────────────

export function SMSProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<"light" | "dark">("light");
  const [activeRole, setActiveRole] = useState<SMSRole>("Owner");
  const [selectedCampus, setSelectedCampus] = useState<string>("CAMP-01");
  const [selectedSession, setSelectedSession] = useState<string>("SESS-2026-27");

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("mt_sms_theme", newTheme);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  // State Collections (Strictly Fresh / Empty)
  const [campuses, setCampuses] = useState<SMSCampus[]>(INITIAL_CAMPUSES);
  const [sessions, setSessions] = useState<SMSAcademicSession[]>(INITIAL_SESSIONS);
  const [classes, setClasses] = useState<SMSClassSection[]>([]);
  const [classSubjects, setClassSubjects] = useState<SMSClassSubject[]>([]);
  const [bellTimings, setBellTimings] = useState<SMSBellTiming[]>(DEFAULT_BELL_TIMINGS);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [users, setUsers] = useState<SMSUserAccount[]>([]);
  const [attendance, setAttendance] = useState<SMSAttendanceRecord[]>([]);
  const [examTerms, setExamTerms] = useState<SMSExamTerm[]>([]);
  const [marks, setMarks] = useState<SMSMarksEntry[]>([]);
  const [feeVouchers, setFeeVouchers] = useState<SMSFeeVoucher[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [generatedPapers, setGeneratedPapers] = useState<GeneratedPaper[]>([]);
  const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [issuedBooks, setIssuedBooks] = useState<LibraryIssuedRecord[]>([]);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>([]);
  const [notices, setNotices] = useState<SchoolNotice[]>([]);

  // Enterprise Module State
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppLog[]>([]);
  const [gateVisitors, setGateVisitors] = useState<GateVisitor[]>([]);
  const [gatePunchLogs, setGatePunchLogs] = useState<GatePunchLog[]>([]);
  const [onlineApplicants, setOnlineApplicants] = useState<OnlineAdmissionApplicant[]>([]);
  const [houses, setHouses] = useState<HouseRecord[]>([]);
  const [housePointEvents, setHousePointEvents] = useState<HousePointEvent[]>([]);
  const [ptmSlots, setPtmSlots] = useState<PTMSlot[]>([]);
  const [hostelRooms, setHostelRooms] = useState<HostelRoom[]>([]);
  const [messMenu, setMessMenu] = useState<MessMenuItem[]>([]);
  const [clinicVisits, setClinicVisits] = useState<ClinicVisit[]>([]);
  const [omrResults, setOmrResults] = useState<OMRGradingResult[]>([]);

  // Load from localStorage with clean slate migration
  useEffect(() => {
    try {
      const storedTheme = localStorage.getItem("mt_sms_theme");
      if (storedTheme === "light" || storedTheme === "dark") setThemeState(storedTheme);

      // Automated migration: Wipe legacy mock keys if present
      const cleanVersion = localStorage.getItem("mt_sms_clean_slate_v3");
      if (cleanVersion !== "true") {
        const legacyKeys = [
          "mt_sms_campuses", "mt_sms_sessions", "mt_sms_classes", "mt_sms_students",
          "mt_sms_teachers", "mt_sms_users", "mt_sms_attendance", "mt_sms_examterms",
          "mt_sms_marks", "mt_sms_feevouchers", "mt_sms_questions", "mt_sms_papers",
          "mt_sms_timetable", "mt_sms_books", "mt_sms_issuedbooks", "mt_sms_transport",
          "mt_sms_notices", "mt_sms_whatsapp", "mt_sms_visitors", "mt_sms_punches",
          "mt_sms_applicants", "mt_sms_houses", "mt_sms_houseevents", "mt_sms_ptmslots",
          "mt_sms_hostelrooms", "mt_sms_messmenu", "mt_sms_clinic", "mt_sms_omr"
        ];
        legacyKeys.forEach((k) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        });
        localStorage.setItem("mt_sms_clean_slate_v3", "true");
        return;
      }

      const loadOrEmpty = (key: string, setter: (val: any) => void) => {
        const item = localStorage.getItem(key);
        if (item !== null) {
          try {
            setter(JSON.parse(item));
          } catch {}
        }
      };

      // Load students with guaranteed unique Admission ID check
      const storedStudents = localStorage.getItem("mt_sms_students");
      if (storedStudents !== null) {
        try {
          const parsed: StudentRecord[] = JSON.parse(storedStudents);
          const seen = new Set<string>();
          let seq = 101;
          const cleanStudents = parsed.map((st) => {
            if (!st.admissionNo || seen.has(st.admissionNo)) {
              while (seen.has(`ADM-2026-${String(seq).padStart(4, "0")}`)) {
                seq++;
              }
              const uniqueId = `ADM-2026-${String(seq).padStart(4, "0")}`;
              seen.add(uniqueId);
              seq++;
              return { ...st, admissionNo: uniqueId };
            }
            seen.add(st.admissionNo);
            return st;
          });
          setStudents(cleanStudents);
        } catch {}
      }

      loadOrEmpty("mt_sms_campuses", setCampuses);
      loadOrEmpty("mt_sms_sessions", setSessions);
      loadOrEmpty("mt_sms_classes", setClasses);
      loadOrEmpty("mt_sms_class_subjects", setClassSubjects);
      loadOrEmpty("mt_sms_bell_timings", setBellTimings);
      loadOrEmpty("mt_sms_teachers", setTeachers);
      loadOrEmpty("mt_sms_users", setUsers);
      loadOrEmpty("mt_sms_attendance", setAttendance);
      loadOrEmpty("mt_sms_examterms", setExamTerms);
      loadOrEmpty("mt_sms_marks", setMarks);
      loadOrEmpty("mt_sms_feevouchers", setFeeVouchers);
      loadOrEmpty("mt_sms_questions", setQuestionBank);
      loadOrEmpty("mt_sms_papers", setGeneratedPapers);
      loadOrEmpty("mt_sms_timetable", setTimetable);
      loadOrEmpty("mt_sms_books", setLibraryBooks);
      loadOrEmpty("mt_sms_issuedbooks", setIssuedBooks);
      loadOrEmpty("mt_sms_transport", setTransportRoutes);
      loadOrEmpty("mt_sms_notices", setNotices);
      loadOrEmpty("mt_sms_whatsapp", setWhatsappLogs);
      loadOrEmpty("mt_sms_visitors", setGateVisitors);
      loadOrEmpty("mt_sms_punches", setGatePunchLogs);
      loadOrEmpty("mt_sms_applicants", setOnlineApplicants);
      loadOrEmpty("mt_sms_houses", setHouses);
      loadOrEmpty("mt_sms_houseevents", setHousePointEvents);
      loadOrEmpty("mt_sms_ptmslots", setPtmSlots);
      loadOrEmpty("mt_sms_hostelrooms", setHostelRooms);
      loadOrEmpty("mt_sms_messmenu", setMessMenu);
      loadOrEmpty("mt_sms_clinic", setClinicVisits);
      loadOrEmpty("mt_sms_omr", setOmrResults);
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

  const addStudent = (studentData: Omit<StudentRecord, "id" | "admissionNo"> & { admissionNo?: string }): StudentRecord => {
    let nextSeq = 101;
    try {
      const storedSeq = parseInt(localStorage.getItem("mt_sms_admission_seq") || "100", 10);
      const existingSeqs = students
        .map((s) => {
          const match = s.admissionNo?.match(/(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n) && n > 0);
      const maxExisting = existingSeqs.length > 0 ? Math.max(...existingSeqs) : 100;
      nextSeq = Math.max(storedSeq + 1, maxExisting + 1, 101);
      localStorage.setItem("mt_sms_admission_seq", String(nextSeq));
    } catch {
      nextSeq = 101 + students.length;
    }

    const uniqueAdmNo = studentData.admissionNo || `ADM-2026-${String(nextSeq).padStart(4, "0")}`;
    const newStudent: StudentRecord = {
      ...studentData,
      id: `STU-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      admissionNo: uniqueAdmNo
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

  const deleteTeacher = (id: string) => {
    const updated = teachers.filter((t) => t.id !== id);
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

  const deleteClassSection = (id: string) => {
    const updated = classes.filter((c) => c.id !== id);
    setClasses(updated);
    persist("mt_sms_classes", updated);
  };

  const reassignStudentSection = (
    studentId: string,
    targetClassId: string,
    targetClassName: string,
    targetSectionId: string,
    targetSectionName: string
  ) => {
    const updated = students.map((s) =>
      s.id === studentId
        ? {
            ...s,
            classId: targetClassId,
            className: targetClassName,
            sectionId: targetSectionId,
            sectionName: targetSectionName
          }
        : s
    );
    setStudents(updated);
    persist("mt_sms_students", updated);
  };

  const addClassSubject = (subData: Omit<SMSClassSubject, "id">): SMSClassSubject => {
    const newSub: SMSClassSubject = {
      ...subData,
      id: `SUB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
    };
    const updated = [...classSubjects, newSub];
    setClassSubjects(updated);
    persist("mt_sms_class_subjects", updated);
    return newSub;
  };

  const updateClassSubject = (id: string, updates: Partial<SMSClassSubject>) => {
    const updated = classSubjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setClassSubjects(updated);
    persist("mt_sms_class_subjects", updated);
  };

  const deleteClassSubject = (id: string) => {
    const updated = classSubjects.filter((s) => s.id !== id);
    setClassSubjects(updated);
    persist("mt_sms_class_subjects", updated);
  };

  const bulkImportClassesAndSubjects = (
    importedClasses: Omit<SMSClassSection, "id" | "enrolledCount">[],
    importedSubjects: Omit<SMSClassSubject, "id">[]
  ) => {
    let addedClasses: SMSClassSection[] = [...classes];
    let addedSubjects: SMSClassSubject[] = [...classSubjects];

    importedClasses.forEach((c) => {
      const exists = addedClasses.some(
        (existing) =>
          existing.className.trim().toLowerCase() === c.className.trim().toLowerCase() &&
          existing.sectionName.trim().toLowerCase() === c.sectionName.trim().toLowerCase()
      );
      if (!exists && c.className && c.sectionName) {
        addedClasses.push({
          ...c,
          id: `CLS-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
          enrolledCount: 0
        });
      }
    });

    importedSubjects.forEach((s) => {
      const exists = addedSubjects.some(
        (existing) =>
          existing.className.trim().toLowerCase() === s.className.trim().toLowerCase() &&
          existing.subjectName.trim().toLowerCase() === s.subjectName.trim().toLowerCase()
      );
      if (!exists && s.className && s.subjectName) {
        addedSubjects.push({
          ...s,
          id: `SUB-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`
        });
      }
    });

    setClasses(addedClasses);
    persist("mt_sms_classes", addedClasses);
    setClassSubjects(addedSubjects);
    persist("mt_sms_class_subjects", addedSubjects);

    return {
      classCount: importedClasses.length,
      subjectCount: importedSubjects.length
    };
  };

  const addBellTiming = (timingData: Omit<SMSBellTiming, "id">): SMSBellTiming => {
    const newTiming: SMSBellTiming = { ...timingData, id: `BT-${Date.now()}` };
    const updated = [...bellTimings, newTiming];
    setBellTimings(updated);
    persist("mt_sms_bell_timings", updated);
    return newTiming;
  };

  const updateBellTiming = (id: string, updates: Partial<SMSBellTiming>) => {
    const updated = bellTimings.map((bt) => (bt.id === id ? { ...bt, ...updates } : bt));
    setBellTimings(updated);
    persist("mt_sms_bell_timings", updated);
  };

  const deleteBellTiming = (id: string) => {
    const updated = bellTimings.filter((bt) => bt.id !== id);
    setBellTimings(updated);
    persist("mt_sms_bell_timings", updated);
  };

  const resetBellTimings = () => {
    setBellTimings(DEFAULT_BELL_TIMINGS);
    persist("mt_sms_bell_timings", DEFAULT_BELL_TIMINGS);
  };

  const addTimetablePeriod = (periodData: Omit<TimetablePeriod, "id">): TimetablePeriod => {
    const newPeriod: TimetablePeriod = {
      ...periodData,
      id: `TT-${Date.now()}`
    };
    const updated = [...timetable, newPeriod];
    setTimetable(updated);
    persist("mt_sms_timetable", updated);
    return newPeriod;
  };

  const updateTimetablePeriod = (id: string, updates: Partial<TimetablePeriod>) => {
    const updated = timetable.map((tt) => (tt.id === id ? { ...tt, ...updates } : tt));
    setTimetable(updated);
    persist("mt_sms_timetable", updated);
  };

  const deleteTimetablePeriod = (id: string) => {
    const updated = timetable.filter((tt) => tt.id !== id);
    setTimetable(updated);
    persist("mt_sms_timetable", updated);
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
    
    // Check if student already has a challan for this specific billing month
    const eligibleStudents = targetStudents.filter((s) => {
      const alreadyHasChallan = feeVouchers.some(
        (v) => (v.studentId === s.id || v.admissionNo === s.admissionNo) && v.month.trim().toLowerCase() === month.trim().toLowerCase()
      );
      return !alreadyHasChallan;
    });

    if (eligibleStudents.length === 0) {
      return 0;
    }

    const newVouchers: SMSFeeVoucher[] = eligibleStudents.map((s, idx) => {
      const tuition = s.customMonthlyFee || 18500;
      const transport = s.transportEnrolled ? 3500 : 0;
      const exam = 1000;
      const disc = s.feeCategory.includes("20%") ? tuition * 0.2 : s.feeCategory.includes("50%") ? tuition * 0.5 : 0;
      const total = tuition + transport + exam - disc;

      return {
        id: `FEE-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
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

  const deleteFeeChallan = (id: string) => {
    const updated = feeVouchers.filter((v) => v.id !== id && v.challanNo !== id);
    setFeeVouchers(updated);
    persist("mt_sms_feevouchers", updated);
  };

  const purgeDuplicateChallans = (): number => {
    const seen = new Set<string>();
    const uniqueVouchers: SMSFeeVoucher[] = [];
    let removedCount = 0;

    feeVouchers.forEach((v) => {
      const key = `${v.studentId || v.admissionNo}_${v.month.trim().toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueVouchers.push(v);
      } else {
        removedCount++;
      }
    });

    setFeeVouchers(uniqueVouchers);
    persist("mt_sms_feevouchers", uniqueVouchers);
    return removedCount;
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

  const createGeneratedPaper = (paperData: any): GeneratedPaper => {
    const defaultSections = [
      {
        sectionTitle: "SECTION-A (Objective MCQs) — 12 Marks",
        instructions: "Choose the correct option. Cutting and overwriting is not allowed.",
        questions: [
          { qNo: "Q1", text: "Rate of change of displacement is called:", marks: 1, options: ["Speed", "Velocity", "Acceleration", "Force"] },
          { qNo: "Q2", text: "Value of 'g' at the surface of Earth is approximately:", marks: 1, options: ["9.8 m/s²", "10 m/s²", "8.9 m/s²", "9.2 m/s²"] },
          { qNo: "Q3", text: "SI unit of momentum is:", marks: 1, options: ["N s", "kg m/s²", "Joule", "Watt"] }
        ]
      },
      {
        sectionTitle: "SECTION-B (Short Answer Questions) — 30 Marks",
        instructions: "Attempt any FIVE questions. All questions carry equal marks.",
        questions: [
          { qNo: "Q2(i)", text: "Differentiate between scalar and vector quantities with two examples each.", marks: 3 },
          { qNo: "Q2(ii)", text: "State Newton's Second Law of Motion and derive F = ma.", marks: 3 },
          { qNo: "Q2(iii)", text: "What is centripetal acceleration? Write its mathematical formula.", marks: 3 },
          { qNo: "Q2(iv)", text: "Define inertia and give one everyday example.", marks: 3 },
          { qNo: "Q2(v)", text: "A car starts from rest with acceleration of 2 m/s². Find speed after 10 seconds.", marks: 3 }
        ]
      },
      {
        sectionTitle: "SECTION-C (Detailed Long Questions) — 18 Marks",
        instructions: "Attempt any TWO questions.",
        questions: [
          { qNo: "Q3", text: "Derive third equation of motion (2aS = vf² - vi²) with the help of speed-time graph.", marks: 9 },
          { qNo: "Q4", text: "State and prove the Law of Conservation of Momentum for an isolated system.", marks: 9 }
        ]
      }
    ];

    const newPaper: GeneratedPaper = {
      ...paperData,
      id: `PPR-${Date.now()}`,
      session: paperData.session || "2025-2026",
      instructions: paperData.instructions || ["Read all instructions carefully.", "Use black/blue pen only."],
      sections: paperData.sections || defaultSections,
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

  const deleteNotice = (id: string) => {
    const updated = notices.filter((n) => n.id !== id);
    setNotices(updated);
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

  const clearAllDemoData = () => {
    const emptyCampuses: SMSCampus[] = [
      { id: "CAMP-01", name: "Main Campus", code: "CAMP-01", principalName: "Principal Office", phone: "", address: "", wings: [] }
    ];
    const emptySessions: SMSAcademicSession[] = [
      { id: "SESS-2026-27", name: "Academic Session 2026–2027", startDate: "2026-08-01", endDate: "2027-06-30", isCurrent: true }
    ];

    setCampuses(emptyCampuses);
    setSessions(emptySessions);
    setClasses([]);
    setStudents([]);
    setTeachers([]);
    setUsers([]);
    setAttendance([]);
    setExamTerms([]);
    setMarks([]);
    setFeeVouchers([]);
    setQuestionBank([]);
    setGeneratedPapers([]);
    setTimetable([]);
    setLibraryBooks([]);
    setIssuedBooks([]);
    setTransportRoutes([]);
    setNotices([]);
    setWhatsappLogs([]);
    setGateVisitors([]);
    setGatePunchLogs([]);
    setOnlineApplicants([]);
    setHouses([]);
    setHousePointEvents([]);
    setPtmSlots([]);
    setHostelRooms([]);
    setMessMenu([]);
    setClinicVisits([]);
    setOmrResults([]);

    const allKeys = [
      "mt_sms_campuses", "mt_sms_sessions", "mt_sms_classes", "mt_sms_students",
      "mt_sms_teachers", "mt_sms_users", "mt_sms_attendance", "mt_sms_examterms",
      "mt_sms_marks", "mt_sms_feevouchers", "mt_sms_questions", "mt_sms_papers",
      "mt_sms_timetable", "mt_sms_books", "mt_sms_issuedbooks", "mt_sms_transport",
      "mt_sms_notices", "mt_sms_whatsapp", "mt_sms_visitors", "mt_sms_punches",
      "mt_sms_applicants", "mt_sms_houses", "mt_sms_houseevents", "mt_sms_ptmslots",
      "mt_sms_hostelrooms", "mt_sms_messmenu", "mt_sms_clinic", "mt_sms_omr"
    ];

    if (typeof window !== "undefined") {
      allKeys.forEach((k) => {
        try {
          localStorage.removeItem(k);
        } catch {}
      });
      localStorage.setItem("mt_sms_clean_slate_v3", "true");
    }

    persist("mt_sms_campuses", emptyCampuses);
    persist("mt_sms_sessions", emptySessions);
    persist("mt_sms_classes", []);
    persist("mt_sms_students", []);
    persist("mt_sms_teachers", []);
    persist("mt_sms_users", []);
    persist("mt_sms_attendance", []);
    persist("mt_sms_examterms", []);
    persist("mt_sms_marks", []);
    persist("mt_sms_feevouchers", []);
    persist("mt_sms_questions", []);
    persist("mt_sms_papers", []);
    persist("mt_sms_timetable", []);
    persist("mt_sms_books", []);
    persist("mt_sms_issuedbooks", []);
    persist("mt_sms_transport", []);
    persist("mt_sms_notices", []);
    persist("mt_sms_whatsapp", []);
    persist("mt_sms_visitors", []);
    persist("mt_sms_punches", []);
    persist("mt_sms_applicants", []);
    persist("mt_sms_houses", []);
    persist("mt_sms_houseevents", []);
    persist("mt_sms_ptmslots", []);
    persist("mt_sms_hostelrooms", []);
    persist("mt_sms_messmenu", []);
    persist("mt_sms_clinic", []);
    persist("mt_sms_omr", []);
  };

  const addUserAccount = (userData: Omit<SMSUserAccount, "id" | "createdAt">): SMSUserAccount => {
    const newUser: SMSUserAccount = {
      ...userData,
      id: `USR-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      createdAt: new Date().toISOString().split("T")[0]
    };
    const updated = [newUser, ...users];
    setUsers(updated);
    persist("mt_sms_users", updated);
    return newUser;
  };

  const updateUserAccount = (id: string, updates: Partial<SMSUserAccount>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
    setUsers(updated);
    persist("mt_sms_users", updated);
  };

  const deleteUserAccount = (id: string) => {
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    persist("mt_sms_users", updated);
  };

  const generateStudentCredentialsBatch = (): number => {
    let createdCount = 0;
    const newUsers = [...users];
    
    students.forEach((st) => {
      // 1. Check if student already has a user account
      const studentExists = newUsers.some((u) => u.role === "Student" && u.linkedEntityId === st.id);
      if (!studentExists) {
        const cleanAdm = st.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, "");
        const studentUser: SMSUserAccount = {
          id: `USR-STU-${st.id}`,
          username: cleanAdm,
          fullName: `${st.firstName} ${st.lastName}`,
          email: `${cleanAdm}@student.mtcore.edu.pk`,
          password: `Student@${st.rollNo.padStart(2, "0")}`,
          role: "Student",
          linkedEntityId: st.id,
          linkedEntityName: `${st.firstName} ${st.lastName}`,
          phone: st.fatherPhone,
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0]
        };
        newUsers.push(studentUser);
        createdCount++;
      }

      // 2. Check if parent already has a user account
      const parentExists = newUsers.some((u) => u.role === "Parent" && (u.linkedEntityId === st.id || (st.fatherPhone && u.phone === st.fatherPhone)));
      if (!parentExists) {
        const cleanAdm = st.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, "");
        const parentUser: SMSUserAccount = {
          id: `USR-PAR-${st.id}`,
          username: `p_${cleanAdm}`,
          fullName: `${st.fatherName} (P/O ${st.firstName})`,
          email: `parent.${cleanAdm}@parent.mtcore.edu.pk`,
          password: `Parent@${st.rollNo.padStart(2, "0")}`,
          role: "Parent",
          linkedEntityId: st.id,
          linkedEntityName: `${st.firstName} ${st.lastName}`,
          phone: st.fatherPhone,
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0]
        };
        newUsers.push(parentUser);
        createdCount++;
      }
    });

    setUsers(newUsers);
    persist("mt_sms_users", newUsers);
    return createdCount;
  };

  const generateTeacherCredentialsBatch = (): number => {
    let createdCount = 0;
    const newUsers = [...users];

    teachers.forEach((t) => {
      const exists = newUsers.some((u) => u.role === "Teacher" && (u.linkedEntityId === t.id || u.email === t.email));
      if (!exists) {
        const cleanCode = t.employeeCode.toLowerCase().replace(/[^a-z0-9]/g, "");
        const teacherUser: SMSUserAccount = {
          id: `USR-TCH-${t.id}`,
          username: cleanCode,
          fullName: t.fullName,
          email: t.email || `${cleanCode}@faculty.mtcore.edu.pk`,
          password: `Faculty@123`,
          role: "Teacher",
          linkedEntityId: t.id,
          linkedEntityName: t.fullName,
          phone: t.phone,
          status: "Active",
          createdAt: new Date().toISOString().split("T")[0]
        };
        newUsers.push(teacherUser);
        createdCount++;
      }
    });

    setUsers(newUsers);
    persist("mt_sms_users", newUsers);
    return createdCount;
  };

  const addCampusWing = (campusId: string, wing: { name: string; headName: string; totalClasses?: number }) => {
    const updated = campuses.map((c) => {
      if (c.id === campusId) {
        const newWing: CampusWing = {
          id: `W-${Date.now().toString().slice(-4)}`,
          name: wing.name,
          headName: wing.headName,
          totalClasses: wing.totalClasses || 0
        };
        return {
          ...c,
          wings: [...c.wings, newWing]
        };
      }
      return c;
    });
    setCampuses(updated);
    persist("mt_sms_campuses", updated);
  };

  const deleteCampusWing = (campusId: string, wingId: string) => {
    const updated = campuses.map((c) => {
      if (c.id === campusId) {
        return {
          ...c,
          wings: c.wings.filter((w) => w.id !== wingId)
        };
      }
      return c;
    });
    setCampuses(updated);
    persist("mt_sms_campuses", updated);
  };

  return (
    <SMSContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        activeRole,
        setActiveRole,
        selectedCampus,
        setSelectedCampus,
        selectedSession,
        setSelectedSession,
        campuses,
        sessions,
        classes,
        classSubjects,
        students,
        teachers,
        users,
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
        deleteTeacher,
        addUserAccount,
        updateUserAccount,
        deleteUserAccount,
        generateStudentCredentialsBatch,
        generateTeacherCredentialsBatch,
        addClassSection,
        updateClassSection,
        deleteClassSection,
        reassignStudentSection,
        addClassSubject,
        updateClassSubject,
        deleteClassSubject,
        bulkImportClassesAndSubjects,
        bellTimings,
        addBellTiming,
        updateBellTiming,
        deleteBellTiming,
        resetBellTimings,
        addTimetablePeriod,
        updateTimetablePeriod,
        deleteTimetablePeriod,
        markAttendanceBatch,
        addExamTerm,
        saveMarksBatch,
        generateMonthlyChallans,
        collectFeeChallan,
        deleteFeeChallan,
        purgeDuplicateChallans,
        addQuestionToBank,
        createGeneratedPaper,
        issueBook,
        returnBook,
        addNotice,
        deleteNotice,
        sendWhatsAppAlert,
        registerGateVisitor,
        checkoutGateVisitor,
        punchGateCard,
        updateApplicantStatus,
        awardHousePoints,
        bookPTMSlot,
        logClinicVisit,
        gradeOMRSheet,
        addCampusWing,
        deleteCampusWing,
        clearAllDemoData
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
