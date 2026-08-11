"use client";

import React, { useState, useMemo } from "react";
import HRMSSidebar from "@/components/hrms-sidebar";
import { useGlobalContext } from "@/context/global-context";
import {
  FileText,
  Search,
  Download,
  BookOpen,
  CheckCircle2,
  Shield,
  Clock,
  DollarSign,
  Laptop,
  AlertTriangle,
  HeartHandshake,
  Lock,
  Printer,
  ChevronRight,
  Sparkles,
  Building2,
  X,
  Eye
} from "lucide-react";

interface CompanyPolicy {
  id: string;
  policyCode: string;
  title: string;
  category: "Governance" | "HR & Workplace" | "Security & Tech" | "Finance & Perks" | "Asset & Operations";
  effectiveDate: string;
  version: string;
  summary: string;
  readTime: string;
  iconName: string;
  sections: {
    heading: string;
    content: string[];
  }[];
  keyRules: string[];
  penalties: string[];
}

export default function CompanyPoliciesPage() {
  const { currentUser, hrEmployees } = useGlobalContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activePolicy, setActivePolicy] = useState<CompanyPolicy | null>(null);
  const [acknowledgedPolicies, setAcknowledgedPolicies] = useState<Record<string, boolean>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("acknowledged_policies");
      return saved ? JSON.parse(saved) : {};
    }
    return {};
  });

  const handleAcknowledge = (id: string) => {
    const updated = { ...acknowledgedPolicies, [id]: true };
    setAcknowledgedPolicies(updated);
    localStorage.setItem("acknowledged_policies", JSON.stringify(updated));
  };

  const policies: CompanyPolicy[] = [
    {
      id: "POL-01",
      policyCode: "CORP-POL-001",
      title: "Corporate Code of Conduct & Workplace Ethics",
      category: "Governance",
      effectiveDate: "January 1, 2025",
      version: "v3.2",
      readTime: "4 mins",
      iconName: "Shield",
      summary: "Establishes standard ethical principles, professional integrity, non-discrimination, and zero tolerance for bribery or conflicts of interest.",
      sections: [
        {
          heading: "1. Core Ethical Principles",
          content: [
            "All employees, contractors, and executives must uphold the highest standards of honesty, fairness, and transparency in all business dealings.",
            "Employees are strictly prohibited from soliciting, accepting, or offering any form of bribe, kickback, or illicit gift from suppliers, customers, or partners."
          ]
        },
        {
          heading: "2. Conflict of Interest",
          content: [
            "Employees must not engage in any outside commercial activity or secondary employment that competes with MT-UniPOS or impairs job performance.",
            "Any familial or financial relationship with vendors or direct subordinates must be formally declared to the HR Department."
          ]
        },
        {
          heading: "3. Representation & Public Statements",
          content: [
            "Only authorized executive spokespersons may communicate with media or publish official statements regarding company operations.",
            "Employees posting on social media must clarify that their opinions are personal and do not represent the company."
          ]
        }
      ],
      keyRules: [
        "Zero tolerance for bribes, fraud, or kickbacks.",
        "Full disclosure of any secondary business or conflict of interest.",
        "Respectful communication across all internal communication channels."
      ],
      penalties: [
        "First infraction: Written warning and mandatory ethics retraining.",
        "Severe/repeated violations: Immediate termination for cause without severance benefits."
      ]
    },
    {
      id: "POL-02",
      policyCode: "CORP-POL-002",
      title: "Leave, Attendance & Remote Work Guidelines",
      category: "HR & Workplace",
      effectiveDate: "January 1, 2025",
      version: "v2.8",
      readTime: "5 mins",
      iconName: "Clock",
      summary: "Outlines working hours, standard shifts, annual leave accrual, sick leaves, emergency time-off, and Work-From-Home (WFH) eligibility.",
      sections: [
        {
          heading: "1. Standard Working Hours & Punctuality",
          content: [
            "The standard work week comprises 48 hours across scheduled shifts. Shift start times are strictly enforced via the digital biometric/POS attendance system.",
            "A grace period of 15 minutes is granted for morning check-ins. Three late arrivals in a calendar month constitute a half-day salary deduction."
          ]
        },
        {
          heading: "2. Annual & Sick Leave Entitlements",
          content: [
            "Full-time staff accrue 14 days of paid Annual Leave, 10 days of Sick Leave, and 10 days of Casual Leave per calendar year.",
            "Planned leaves exceeding 2 consecutive days require approval from the Department Head at least 5 business days in advance."
          ]
        },
        {
          heading: "3. Work From Home (WFH) Policy",
          content: [
            "Eligible technical and administrative staff may request up to 4 WFH days per month with prior manager approval.",
            "Staff on WFH must maintain uninterrupted internet connectivity and be available on Slack/Teams during designated business hours."
          ]
        }
      ],
      keyRules: [
        "Check-in within 15 minutes grace period.",
        "Submit planned leave requests 5 days prior.",
        "Consecutive unannounced absence for 3 days results in job abandonment review."
      ],
      penalties: [
        "Unapproved absence will be deducted as unpaid leave.",
        "Repeated absenteeism leads to formal disciplinary notice."
      ]
    },
    {
      id: "POL-03",
      policyCode: "CORP-POL-003",
      title: "Anti-Harassment, Equal Opportunity & Dignity at Work",
      category: "HR & Workplace",
      effectiveDate: "January 1, 2025",
      version: "v2.0",
      readTime: "3 mins",
      iconName: "HeartHandshake",
      summary: "Ensures a safe, respectful, inclusive workplace free from sexual harassment, discrimination, verbal abuse, or bullying.",
      sections: [
        {
          heading: "1. Non-Discrimination Commitment",
          content: [
            "MT-UniPOS provides equal employment opportunities regardless of gender, race, religion, age, disability, or marital status.",
            "Hiring, promotions, salary increments, and terminations are determined solely on merit, competence, and performance."
          ]
        },
        {
          heading: "2. Zero Tolerance for Harassment",
          content: [
            "Harassment includes unwelcome physical contact, suggestive remarks, offensive jokes, intimidation, or abuse of hierarchical authority.",
            "Any employee experiencing or witnessing harassment is urged to submit a confidential report to the Internal Complaints Committee (ICC)."
          ]
        }
      ],
      keyRules: [
        "Absolute zero tolerance for sexual harassment or bullying.",
        "Strict whistleblower protection—no retaliation against reporters.",
        "Every complaint investigated confidentially within 7 business days."
      ],
      penalties: [
        "Immediate suspension pending inquiry.",
        "Proven harassment results in instant termination and referral to legal authorities."
      ]
    },
    {
      id: "POL-04",
      policyCode: "CORP-POL-004",
      title: "Information Security, Data Privacy & Client Confidentiality",
      category: "Security & Tech",
      effectiveDate: "February 1, 2025",
      version: "v4.1",
      readTime: "6 mins",
      iconName: "Lock",
      summary: "Governs data protection, customer credit card privacy, password hygiene, software installation, and NDA compliance.",
      sections: [
        {
          heading: "1. Confidentiality of Customer & Financial Data",
          content: [
            "Customer phone numbers, purchase history, and payment details stored within MT-UniPOS POS system are classified as Strictly Confidential.",
            "Exporting, photocopying, or transferring customer data to personal email or flash drives is a criminal breach of contract."
          ]
        },
        {
          heading: "2. Password & System Access Hygiene",
          content: [
            "Sharing login credentials, POS cashier PINs, or master supervisor keys is strictly forbidden. Each employee is held liable for actions taken under their ID.",
            "Passwords must be at least 10 characters with numbers and symbols, and must be changed every 90 days."
          ]
        },
        {
          heading: "3. Unauthorized Software & Devices",
          content: [
            "Installing unauthorized software, pirated tools, or peer-to-peer torrent clients on company computers is strictly prohibited.",
            "Only IT-approved antivirus and productivity suites may be executed."
          ]
        }
      ],
      keyRules: [
        "Never share your POS login PIN or system passwords.",
        "Customer records must never be exported to private devices.",
        "Lock screens whenever leaving workstation unattended."
      ],
      penalties: [
        "Data theft leads to criminal prosecution and immediate dismissal.",
        "Security negligence results in formal reprimand and credential revocation."
      ]
    },
    {
      id: "POL-05",
      policyCode: "CORP-POL-005",
      title: "Travel, Petty Cash & Business Expense Reimbursement",
      category: "Finance & Perks",
      effectiveDate: "January 1, 2025",
      version: "v2.5",
      readTime: "4 mins",
      iconName: "DollarSign",
      summary: "Guidelines for claiming legitimate business expenses, meal allowances, travel tickets, fuel claims, and petty cash advances.",
      sections: [
        {
          heading: "1. Eligible Business Expenses",
          content: [
            "Legitimate expenses incurred solely for company business (client entertainment, inter-branch travel, emergency store supplies) are reimbursable.",
            "All claims must be supported by original itemized tax invoices or digital receipts."
          ]
        },
        {
          heading: "2. Submission & Approval Timeline",
          content: [
            "Expense claims must be submitted via the HRMS Expense Hub within 15 days of the transaction date.",
            "Approved claims will be disbursed within 5 business days or credited with the next month's salary."
          ]
        }
      ],
      keyRules: [
        "Original receipts/photos required for all claims.",
        "Per diem limits: Maximum fuel and food allowances per tier.",
        "Submit claims within 15 days of expenditure."
      ],
      penalties: [
        "Submission of forged or duplicate receipts results in immediate suspension for fraud."
      ]
    },
    {
      id: "POL-06",
      policyCode: "CORP-POL-006",
      title: "Company Assets, Vehicle & Equipment Care",
      category: "Asset & Operations",
      effectiveDate: "January 1, 2025",
      version: "v2.1",
      readTime: "4 mins",
      iconName: "Laptop",
      summary: "Outlines employee responsibilities for company laptops, mobile phones, tools, corporate SIM cards, and company fleet vehicles.",
      sections: [
        {
          heading: "1. Asset Custody & Care",
          content: [
            "Employees are entrusted with company property and must exercise reasonable care to prevent loss, damage, or theft.",
            "Laptops must have full-disk encryption enabled and must not be left unattended in public vehicles or unsecured areas."
          ]
        },
        {
          heading: "2. Vehicle Usage & Fuel Logs",
          content: [
            "Company delivery bikes and vehicles may only be driven by authorized, licensed staff for approved business itineraries.",
            "Drivers must record daily odometer readings and fuel consumption in the Fleet Log."
          ]
        },
        {
          heading: "3. Return of Assets on Resignation / Offboarding",
          content: [
            "Upon departure, all physical assets, keys, SIM cards, and access badges must be surrendered to the IT/Admin department prior to final dues clearance."
          ]
        }
      ],
      keyRules: [
        "Immediate reporting of lost or stolen equipment within 2 hours.",
        "No personal unauthorized usage of company vehicles.",
        "Mandatory physical inspection upon asset handover."
      ],
      penalties: [
        "Negligent damage or unreturned items will be recovered from final salary settlement."
      ]
    },
    {
      id: "POL-07",
      policyCode: "CORP-POL-007",
      title: "Employee Loan, Salary Advance & Payroll Recovery",
      category: "Finance & Perks",
      effectiveDate: "January 1, 2025",
      version: "v1.9",
      readTime: "3 mins",
      iconName: "DollarSign",
      summary: "Outlines loan eligibility criteria, emergency salary advances, maximum borrowing caps, and automatic payroll recovery schedule.",
      sections: [
        {
          heading: "1. Eligibility Criteria",
          content: [
            "Permanent employees with at least 6 months of continuous service are eligible to apply for Interest-Free Company Loans.",
            "Emergency salary advances are capped at 50% of monthly basic salary."
          ]
        },
        {
          heading: "2. Automatic Payroll Recovery",
          content: [
            "Loan principal is divided into equal monthly installments (EMIs) and automatically recovered from payroll at month-end.",
            "Total monthly EMI deductions cannot exceed 35% of employee's gross monthly salary."
          ]
        }
      ],
      keyRules: [
        "Minimum 6 months tenure required for long-term loan.",
        "Zero interest / 100% Shariah compliant.",
        "Early payoff allowed without any penalty."
      ],
      penalties: [
        "Unsettled loan balance will be adjusted against final settlement gratuity upon exit."
      ]
    },
    {
      id: "POL-08",
      policyCode: "CORP-POL-008",
      title: "Disciplinary Procedure & Employee Grievance Redressal",
      category: "Governance",
      effectiveDate: "January 1, 2025",
      version: "v2.4",
      readTime: "5 mins",
      iconName: "AlertTriangle",
      summary: "Comprehensive protocol for reporting workplace grievances, conducting fair internal inquiries, issuing warning notices, and appeals.",
      sections: [
        {
          heading: "1. Progressive Disciplinary Stages",
          content: [
            "Stage 1: Informal verbal counseling by direct manager.",
            "Stage 2: Official Written Warning recorded in HRMS Disciplinary Vault.",
            "Stage 3: Formal Show Cause notice with 48 hours for employee written reply.",
            "Stage 4: Suspension or Termination following formal inquiry panel review."
          ]
        },
        {
          heading: "2. Employee Right to Appeal",
          content: [
            "Employees have the right to appeal any disciplinary decision within 7 business days to the Managing Director or HR Committee."
          ]
        }
      ],
      keyRules: [
        "Right to a fair hearing and written defense before any penalty.",
        "All disciplinary notices stored permanently in vault.",
        "Right to appeal within 7 business days."
      ],
      penalties: [
        "Fines or suspensions up to 14 days based on gravity of offense."
      ]
    }
  ];

  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.policyCode.toLowerCase().includes(q);
      const matchCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [policies, searchQuery, selectedCategory]);

  const handlePrint = (policy: CompanyPolicy) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const sectionsHtml = policy.sections
      .map(
        (s) => `
        <div style="margin-bottom: 20px;">
          <h3 style="color: #0f172a; font-size: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 8px;">${s.heading}</h3>
          ${s.content.map((c) => `<p style="color: #334155; font-size: 12px; line-height: 1.6; margin: 4px 0;">${c}</p>`).join("")}
        </div>
      `
      )
      .join("");

    const rulesHtml = policy.keyRules.map((r) => `<li style="margin-bottom: 4px;">${r}</li>`).join("");
    const penaltiesHtml = policy.penalties.map((p) => `<li style="margin-bottom: 4px;">${p}</li>`).join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${policy.title} - Official Corporate Policy</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #1e293b; }
          .header { border-bottom: 2px solid #059669; padding-bottom: 15px; margin-bottom: 25px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 20px; font-weight: 900; color: #059669; letter-spacing: -0.5px; }
          .meta { font-size: 11px; color: #64748b; font-family: monospace; }
          .title { font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 10px; }
          .badge { font-size: 10px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 3px 8px; border-radius: 4px; font-weight: bold; }
          .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-size: 12px; }
          .footer { margin-top: 50px; border-top: 1px solid #cbd5e1; padding-top: 15px; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">MT-UNIPOS GLOBAL</div>
            <div class="title">${policy.title}</div>
          </div>
          <div class="meta" style="text-align: right;">
            <div>Policy Ref: <strong>${policy.policyCode}</strong></div>
            <div>Version: ${policy.version} | Effective: ${policy.effectiveDate}</div>
          </div>
        </div>

        <div class="box">
          <strong>Policy Scope &amp; Summary:</strong><br/>
          ${policy.summary}
        </div>

        ${sectionsHtml}

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 25px;">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; font-size: 11px;">
            <strong style="color: #166534;">Core Mandatory Directives:</strong>
            <ul style="padding-left: 20px; margin-top: 6px; color: #14532d;">
              ${rulesHtml}
            </ul>
          </div>
          <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 12px; border-radius: 6px; font-size: 11px;">
            <strong style="color: #991b1b;">Non-Compliance Penalties:</strong>
            <ul style="padding-left: 20px; margin-top: 6px; color: #7f1d1d;">
              ${penaltiesHtml}
            </ul>
          </div>
        </div>

        <div class="footer">
          <div>Authorized by: Executive Committee &amp; HR Compliance Unit</div>
          <div>Confidential &amp; Proprietary &bull; MT-UniPOS Enterprise</div>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex h-screen bg-[#05080d] text-gray-100 font-sans overflow-hidden">
      <HRMSSidebar />

      <main className="flex-grow p-6 space-y-6 overflow-y-auto h-full relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-5">
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              <BookOpen size={22} className="text-emerald-400" />
              Company Policies &amp; Governance Center
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Official standard operating procedures, employee code of conduct, leave rules, and security guidelines.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
              {Object.keys(acknowledgedPolicies).length} / {policies.length} Policies Acknowledged
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0b0f17] border border-gray-800 p-3 rounded-2xl">
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
            {["All", "Governance", "HR & Workplace", "Security & Tech", "Finance & Perks", "Asset & Operations"].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-black/50 text-gray-400 border border-gray-800 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="relative w-full md:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search policies or rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black border border-gray-800 pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Policies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPolicies.map((pol) => {
            const isAck = acknowledgedPolicies[pol.id];

            return (
              <div
                key={pol.id}
                className="bg-[#0b0f17] border border-gray-800 hover:border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-4 transition group shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {pol.policyCode}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400">
                      {pol.category}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition">
                      {pol.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-3">{pol.summary}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-gray-800/80">
                  <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono">
                    <span>Effective: {pol.effectiveDate}</span>
                    <span>Read: {pol.readTime}</span>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    {isAck ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                        <CheckCircle2 size={14} /> Acknowledged
                      </span>
                    ) : (
                      <button
                        onClick={() => handleAcknowledge(pol.id)}
                        className="text-[10px] font-bold text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handlePrint(pol)}
                        title="Download / Print PDF"
                        className="p-1.5 rounded-lg bg-gray-800 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 border border-gray-700 transition cursor-pointer"
                      >
                        <Printer size={13} />
                      </button>
                      <button
                        onClick={() => setActivePolicy(pol)}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition border border-emerald-500/20 cursor-pointer"
                      >
                        <Eye size={13} /> Read Policy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Interactive Policy Reader Modal */}
      {activePolicy && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0b0f17] border border-emerald-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-fade-in-up">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-800 flex justify-between items-start bg-gradient-to-r from-emerald-950/20 via-transparent to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {activePolicy.policyCode}
                  </span>
                  <span className="text-[10px] font-bold text-gray-400">&bull; Version {activePolicy.version}</span>
                </div>
                <h2 className="text-base font-extrabold text-white mt-1">{activePolicy.title}</h2>
              </div>
              <button onClick={() => setActivePolicy(null)} className="text-gray-400 hover:text-white cursor-pointer p-1">
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-300 leading-relaxed font-sans">
              <div className="bg-black/60 border border-gray-800 p-3.5 rounded-xl">
                <strong className="text-white block mb-1">Scope &amp; Intent:</strong>
                <p className="text-gray-400">{activePolicy.summary}</p>
              </div>

              {/* Policy Sections */}
              <div className="space-y-4">
                {activePolicy.sections.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    <h3 className="font-bold text-emerald-400 text-sm border-b border-gray-800/80 pb-1">{sec.heading}</h3>
                    <div className="space-y-1.5 pl-2">
                      {sec.content.map((c, i) => (
                        <p key={i} className="text-gray-300 text-xs">
                          {c}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Key Rules & Penalties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-emerald-400 text-xs flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Mandatory Directives
                  </h4>
                  <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                    {activePolicy.keyRules.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-2">
                  <h4 className="font-extrabold text-red-400 text-xs flex items-center gap-1.5">
                    <AlertTriangle size={14} /> Breach Penalties
                  </h4>
                  <ul className="space-y-1 text-[11px] text-gray-300 list-disc list-inside">
                    {activePolicy.penalties.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-800 flex justify-between items-center bg-black/40">
              <button
                onClick={() => handlePrint(activePolicy)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                <Printer size={14} /> Print / Save PDF
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    handleAcknowledge(activePolicy.id);
                    setActivePolicy(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-black bg-emerald-400 hover:bg-emerald-300 px-4 py-2.5 rounded-xl transition cursor-pointer shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 size={14} /> I Have Read &amp; Acknowledge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
