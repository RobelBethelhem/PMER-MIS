// ── Branches ──
export const branches = [
  { id: "b1", name: "Addis Ababa", region: "Addis Ababa" },
  { id: "b2", name: "Amhara", region: "Amhara" },
  { id: "b3", name: "Oromia", region: "Oromia" },
  { id: "b4", name: "SNNPR", region: "SNNPR" },
  { id: "b5", name: "Tigray", region: "Tigray" },
  { id: "b6", name: "Somali", region: "Somali" },
] as const;

// ── Donors ──
export const donors = [
  { id: "d1", name: "IFRC", code: "IFRC" },
  { id: "d2", name: "ICRC", code: "ICRC" },
  { id: "d3", name: "Norwegian Red Cross", code: "NRC" },
] as const;

// ── Projects ──
export const projects = [
  { id: "p1", name: "Community Health & First Aid", donorId: "d1", sector: "Health", status: "Active" as const, branches: ["b1", "b2", "b3"], budget: 2_400_000, spent: 1_680_000 },
  { id: "p2", name: "Disaster Risk Reduction", donorId: "d2", sector: "DRR", status: "Active" as const, branches: ["b4", "b5"], budget: 1_800_000, spent: 900_000 },
  { id: "p3", name: "Livelihood Recovery Program", donorId: "d3", sector: "Livelihood", status: "Active" as const, branches: ["b5", "b6"], budget: 1_200_000, spent: 480_000 },
];

// ── AOP (Annual Operational Plans) ──
export type AOPStatus = "Draft" | "Submitted" | "Approved";
export interface AOP {
  id: string; year: number; branchId: string; status: AOPStatus;
  objectives: AOPObjective[];
}
export interface AOPObjective {
  id: string; title: string; activities: AOPActivity[];
}
export interface AOPActivity {
  id: string; title: string; startMonth: number; endMonth: number; budget: number; spent: number; responsible: string; milestones: string[];
}

export const aops: AOP[] = [
  {
    id: "aop1", year: 2025, branchId: "b1", status: "Approved",
    objectives: [
      {
        id: "obj1", title: "Strengthen community-based health services",
        activities: [
          { id: "a1", title: "Train 200 community health volunteers", startMonth: 1, endMonth: 4, budget: 120_000, spent: 115_000, responsible: "Health Dept", milestones: ["Training materials ready", "Training completed"] },
          { id: "a2", title: "Establish 10 first aid posts", startMonth: 3, endMonth: 8, budget: 200_000, spent: 140_000, responsible: "Health Dept", milestones: ["Sites identified", "Posts operational"] },
          { id: "a3", title: "Conduct community health awareness campaigns", startMonth: 2, endMonth: 12, budget: 80_000, spent: 55_000, responsible: "Communications", milestones: ["Campaign launched", "Mid-year review"] },
        ],
      },
      {
        id: "obj2", title: "Improve emergency preparedness capacity",
        activities: [
          { id: "a4", title: "Pre-position emergency supplies in 6 warehouses", startMonth: 1, endMonth: 3, budget: 350_000, spent: 340_000, responsible: "Logistics", milestones: ["Procurement done", "Distribution complete"] },
          { id: "a5", title: "Conduct simulation exercises", startMonth: 5, endMonth: 7, budget: 60_000, spent: 30_000, responsible: "DRR Dept", milestones: ["Exercise plan approved", "Exercise conducted"] },
        ],
      },
    ],
  },
  { id: "aop2", year: 2025, branchId: "b2", status: "Submitted", objectives: [{ id: "obj3", title: "Scale up livelihood interventions", activities: [{ id: "a6", title: "Provide micro-grants to 500 households", startMonth: 2, endMonth: 10, budget: 500_000, spent: 200_000, responsible: "Livelihood Unit", milestones: ["Beneficiary selection", "Grants disbursed"] }] }] },
  { id: "aop3", year: 2025, branchId: "b3", status: "Draft", objectives: [{ id: "obj4", title: "Enhance WASH services in rural areas", activities: [{ id: "a7", title: "Construct 20 water points", startMonth: 3, endMonth: 11, budget: 600_000, spent: 0, responsible: "WASH Dept", milestones: ["Design approved", "Construction started"] }] }] },
  { id: "aop4", year: 2025, branchId: "b4", status: "Approved", objectives: [{ id: "obj5", title: "Strengthen blood bank services", activities: [{ id: "a8", title: "Upgrade cold chain equipment", startMonth: 1, endMonth: 6, budget: 180_000, spent: 170_000, responsible: "Blood Bank", milestones: ["Equipment procured", "Installation done"] }] }] },
  { id: "aop5", year: 2025, branchId: "b5", status: "Submitted", objectives: [{ id: "obj6", title: "Post-conflict community resilience building", activities: [{ id: "a9", title: "Psychosocial support for 1,000 IDPs", startMonth: 1, endMonth: 12, budget: 250_000, spent: 120_000, responsible: "PSS Unit", milestones: ["Counselors deployed", "Mid-year assessment"] }] }] },
  { id: "aop6", year: 2025, branchId: "b6", status: "Draft", objectives: [{ id: "obj7", title: "Drought response and food security", activities: [{ id: "a10", title: "Distribute food assistance to 10,000 beneficiaries", startMonth: 1, endMonth: 6, budget: 800_000, spent: 300_000, responsible: "Relief Dept", milestones: ["Needs assessment", "First distribution"] }] }] },
];

// ── Indicators ──
export type IndicatorType = "Output" | "Outcome" | "Impact";
export interface Indicator {
  id: string; name: string; type: IndicatorType; sector: string; unit: string;
  baseline: number; annualTarget: number;
  branchData: { branchId: string; target: number; actual: number }[];
  disaggregation?: { male: number; female: number };
  quarterlyTrend: number[];
}

export const indicators: Indicator[] = [
  { id: "i1", name: "Community health volunteers trained", type: "Output", sector: "Health", unit: "People", baseline: 500, annualTarget: 700, branchData: [{ branchId: "b1", target: 200, actual: 195 }, { branchId: "b2", target: 150, actual: 120 }, { branchId: "b3", target: 100, actual: 85 }], disaggregation: { male: 180, female: 220 }, quarterlyTrend: [80, 160, 300, 400] },
  { id: "i2", name: "First aid posts established", type: "Output", sector: "Health", unit: "Posts", baseline: 15, annualTarget: 25, branchData: [{ branchId: "b1", target: 10, actual: 7 }, { branchId: "b4", target: 5, actual: 5 }], quarterlyTrend: [2, 5, 9, 12] },
  { id: "i3", name: "People reached with health messaging", type: "Outcome", sector: "Health", unit: "People", baseline: 50_000, annualTarget: 120_000, branchData: [{ branchId: "b1", target: 40_000, actual: 38_000 }, { branchId: "b2", target: 30_000, actual: 22_000 }, { branchId: "b3", target: 25_000, actual: 20_000 }, { branchId: "b6", target: 25_000, actual: 15_000 }], disaggregation: { male: 43_000, female: 52_000 }, quarterlyTrend: [20_000, 45_000, 70_000, 95_000] },
  { id: "i4", name: "Reduction in waterborne disease incidence (%)", type: "Impact", sector: "WASH", unit: "%", baseline: 0, annualTarget: 30, branchData: [{ branchId: "b3", target: 30, actual: 18 }, { branchId: "b6", target: 30, actual: 12 }], quarterlyTrend: [5, 10, 15, 18] },
  { id: "i5", name: "Households receiving micro-grants", type: "Output", sector: "Livelihood", unit: "Households", baseline: 0, annualTarget: 500, branchData: [{ branchId: "b2", target: 300, actual: 200 }, { branchId: "b5", target: 200, actual: 80 }], quarterlyTrend: [50, 120, 200, 280] },
  { id: "i6", name: "Emergency simulation exercises conducted", type: "Output", sector: "DRR", unit: "Exercises", baseline: 2, annualTarget: 8, branchData: [{ branchId: "b1", target: 3, actual: 2 }, { branchId: "b4", target: 3, actual: 3 }, { branchId: "b5", target: 2, actual: 1 }], quarterlyTrend: [1, 3, 4, 6] },
  { id: "i7", name: "Blood units collected", type: "Output", sector: "Health", unit: "Units", baseline: 20_000, annualTarget: 35_000, branchData: [{ branchId: "b1", target: 15_000, actual: 14_200 }, { branchId: "b4", target: 10_000, actual: 9_800 }, { branchId: "b2", target: 10_000, actual: 7_500 }], quarterlyTrend: [7_000, 15_000, 23_000, 31_500] },
  { id: "i8", name: "IDPs receiving psychosocial support", type: "Output", sector: "PSS", unit: "People", baseline: 0, annualTarget: 1_000, branchData: [{ branchId: "b5", target: 600, actual: 350 }, { branchId: "b6", target: 400, actual: 180 }], disaggregation: { male: 200, female: 330 }, quarterlyTrend: [80, 200, 380, 530] },
  { id: "i9", name: "Beneficiaries receiving food assistance", type: "Output", sector: "Relief", unit: "People", baseline: 0, annualTarget: 10_000, branchData: [{ branchId: "b5", target: 4_000, actual: 3_200 }, { branchId: "b6", target: 6_000, actual: 4_500 }], disaggregation: { male: 3_700, female: 4_000 }, quarterlyTrend: [2_000, 4_500, 6_000, 7_700] },
  { id: "i10", name: "Water points constructed", type: "Output", sector: "WASH", unit: "Points", baseline: 30, annualTarget: 50, branchData: [{ branchId: "b3", target: 20, actual: 8 }, { branchId: "b6", target: 10, actual: 5 }], quarterlyTrend: [2, 5, 9, 13] },
  { id: "i11", name: "Community resilience score improvement (%)", type: "Impact", sector: "DRR", unit: "%", baseline: 0, annualTarget: 20, branchData: [{ branchId: "b4", target: 20, actual: 15 }, { branchId: "b5", target: 20, actual: 10 }], quarterlyTrend: [3, 7, 11, 15] },
  { id: "i12", name: "Volunteers trained in disaster response", type: "Output", sector: "DRR", unit: "People", baseline: 300, annualTarget: 600, branchData: [{ branchId: "b1", target: 100, actual: 95 }, { branchId: "b4", target: 100, actual: 100 }, { branchId: "b5", target: 100, actual: 60 }], disaggregation: { male: 150, female: 105 }, quarterlyTrend: [50, 120, 190, 255] },
  { id: "i13", name: "Income increase among micro-grant recipients (%)", type: "Outcome", sector: "Livelihood", unit: "%", baseline: 0, annualTarget: 25, branchData: [{ branchId: "b2", target: 25, actual: 18 }, { branchId: "b5", target: 25, actual: 10 }], quarterlyTrend: [3, 8, 13, 18] },
  { id: "i14", name: "Schools with first aid kits", type: "Output", sector: "Health", unit: "Schools", baseline: 40, annualTarget: 100, branchData: [{ branchId: "b1", target: 30, actual: 28 }, { branchId: "b2", target: 20, actual: 15 }, { branchId: "b3", target: 20, actual: 12 }], quarterlyTrend: [10, 25, 40, 55] },
  { id: "i15", name: "Maternal mortality reduction in target areas (%)", type: "Impact", sector: "Health", unit: "%", baseline: 0, annualTarget: 15, branchData: [{ branchId: "b2", target: 15, actual: 8 }, { branchId: "b6", target: 15, actual: 5 }], quarterlyTrend: [1, 3, 5, 8] },
];

// ── Budget Data ──
export interface BudgetLine {
  id: string; activity: string; projectId: string; q1Planned: number; q1Actual: number; q2Planned: number; q2Actual: number; q3Planned: number; q3Actual: number; q4Planned: number; q4Actual: number;
}

export const budgetLines: BudgetLine[] = [
  { id: "bl1", activity: "Volunteer training", projectId: "p1", q1Planned: 30_000, q1Actual: 28_000, q2Planned: 30_000, q2Actual: 32_000, q3Planned: 30_000, q3Actual: 27_000, q4Planned: 30_000, q4Actual: 28_000 },
  { id: "bl2", activity: "First aid post construction", projectId: "p1", q1Planned: 50_000, q1Actual: 45_000, q2Planned: 50_000, q2Actual: 40_000, q3Planned: 50_000, q3Actual: 35_000, q4Planned: 50_000, q4Actual: 20_000 },
  { id: "bl3", activity: "Emergency supply pre-positioning", projectId: "p2", q1Planned: 120_000, q1Actual: 115_000, q2Planned: 80_000, q2Actual: 78_000, q3Planned: 80_000, q3Actual: 60_000, q4Planned: 80_000, q4Actual: 0 },
  { id: "bl4", activity: "Simulation exercises", projectId: "p2", q1Planned: 15_000, q1Actual: 14_000, q2Planned: 15_000, q2Actual: 16_000, q3Planned: 15_000, q3Actual: 0, q4Planned: 15_000, q4Actual: 0 },
  { id: "bl5", activity: "Micro-grants disbursement", projectId: "p3", q1Planned: 100_000, q1Actual: 90_000, q2Planned: 100_000, q2Actual: 80_000, q3Planned: 100_000, q3Actual: 60_000, q4Planned: 100_000, q4Actual: 0 },
  { id: "bl6", activity: "Livelihood skills training", projectId: "p3", q1Planned: 25_000, q1Actual: 22_000, q2Planned: 25_000, q2Actual: 20_000, q3Planned: 25_000, q3Actual: 18_000, q4Planned: 25_000, q4Actual: 0 },
  { id: "bl7", activity: "Health awareness campaigns", projectId: "p1", q1Planned: 20_000, q1Actual: 18_000, q2Planned: 20_000, q2Actual: 19_000, q3Planned: 20_000, q3Actual: 18_000, q4Planned: 20_000, q4Actual: 0 },
  { id: "bl8", activity: "PSS counselor deployment", projectId: "p2", q1Planned: 40_000, q1Actual: 38_000, q2Planned: 40_000, q2Actual: 35_000, q3Planned: 40_000, q3Actual: 30_000, q4Planned: 40_000, q4Actual: 0 },
];

// ── Users ──
export type UserRole = "Super Admin" | "PMER Admin" | "Branch Admin" | "Data Entry" | "Finance Officer" | "Read-only";
export interface MockUser {
  id: string; name: string; email: string; role: UserRole; branchId: string | null; lastLogin: string; active: boolean;
}

export const users: MockUser[] = [
  { id: "u1", name: "Abebe Tadesse", email: "abebe.t@ercs.org", role: "Super Admin", branchId: null, lastLogin: "2025-06-15 09:30", active: true },
  { id: "u2", name: "Tigist Hailu", email: "tigist.h@ercs.org", role: "PMER Admin", branchId: null, lastLogin: "2025-06-15 08:45", active: true },
  { id: "u3", name: "Dawit Alemayehu", email: "dawit.a@ercs.org", role: "Branch Admin", branchId: "b1", lastLogin: "2025-06-14 16:20", active: true },
  { id: "u4", name: "Hana Bekele", email: "hana.b@ercs.org", role: "Branch Admin", branchId: "b2", lastLogin: "2025-06-14 14:10", active: true },
  { id: "u5", name: "Yonas Girma", email: "yonas.g@ercs.org", role: "Data Entry", branchId: "b1", lastLogin: "2025-06-15 10:05", active: true },
  { id: "u6", name: "Meron Assefa", email: "meron.a@ercs.org", role: "Data Entry", branchId: "b3", lastLogin: "2025-06-13 11:30", active: true },
  { id: "u7", name: "Solomon Tekle", email: "solomon.t@ercs.org", role: "Finance Officer", branchId: null, lastLogin: "2025-06-15 07:50", active: true },
  { id: "u8", name: "Fatima Ahmed", email: "fatima.a@ercs.org", role: "Data Entry", branchId: "b6", lastLogin: "2025-06-12 09:00", active: true },
  { id: "u9", name: "Bereket Mesfin", email: "bereket.m@ercs.org", role: "Read-only", branchId: null, lastLogin: "2025-06-10 15:45", active: true },
  { id: "u10", name: "Sara Wondim", email: "sara.w@ercs.org", role: "Branch Admin", branchId: "b5", lastLogin: "2025-06-11 13:20", active: false },
];

// ── Audit Log ──
export interface AuditEntry {
  id: string; timestamp: string; userId: string; action: string; details: string;
}

export const auditLog: AuditEntry[] = [
  { id: "al1", timestamp: "2025-06-15 10:05", userId: "u5", action: "Data Entry", details: "Submitted monthly indicator data for Addis Ababa branch" },
  { id: "al2", timestamp: "2025-06-15 09:30", userId: "u1", action: "Login", details: "Super Admin logged in from 196.188.x.x" },
  { id: "al3", timestamp: "2025-06-14 16:20", userId: "u3", action: "Plan Approval", details: "Approved AOP for Addis Ababa branch (2025)" },
  { id: "al4", timestamp: "2025-06-14 14:10", userId: "u4", action: "Data Modification", details: "Updated Q2 indicator targets for Amhara branch" },
  { id: "al5", timestamp: "2025-06-13 11:30", userId: "u6", action: "Data Entry", details: "Entered beneficiary data for Oromia branch" },
  { id: "al6", timestamp: "2025-06-12 09:00", userId: "u8", action: "Data Entry", details: "Submitted food distribution report for Somali branch" },
  { id: "al7", timestamp: "2025-06-11 15:00", userId: "u7", action: "Budget Update", details: "Uploaded Q2 expenditure data for all projects" },
  { id: "al8", timestamp: "2025-06-11 13:20", userId: "u10", action: "Login", details: "Branch Admin login from Tigray" },
  { id: "al9", timestamp: "2025-06-10 15:45", userId: "u9", action: "Report View", details: "Viewed quarterly consolidated report" },
  { id: "al10", timestamp: "2025-06-10 10:00", userId: "u2", action: "Indicator Update", details: "Added new indicator: Maternal mortality reduction" },
];

// ── Report Templates ──
export interface ReportTemplate {
  id: string; name: string; frequency: string; description: string; donorSpecific: boolean; donorCode?: string;
}

export const reportTemplates: ReportTemplate[] = [
  { id: "r1", name: "Monthly Narrative Report", frequency: "Monthly", description: "Auto-populated narrative report with key achievements and challenges", donorSpecific: false },
  { id: "r2", name: "Quarterly Consolidated Report", frequency: "Quarterly", description: "Comprehensive quarterly report with indicator performance and financials", donorSpecific: false },
  { id: "r3", name: "Semi-Annual Report", frequency: "Semi-Annual", description: "Mid-year review with progress against annual targets", donorSpecific: false },
  { id: "r4", name: "Annual Statistical Summary", frequency: "Annual", description: "End-of-year statistical summary with trend analysis", donorSpecific: false },
  { id: "r5", name: "IFRC Federation Report", frequency: "Quarterly", description: "Donor-specific report template for IFRC", donorSpecific: true, donorCode: "IFRC" },
  { id: "r6", name: "ICRC Cooperation Report", frequency: "Semi-Annual", description: "Donor-specific report for ICRC cooperation activities", donorSpecific: true, donorCode: "ICRC" },
  { id: "r7", name: "Norwegian RC Partnership Report", frequency: "Quarterly", description: "Partnership report for Norwegian Red Cross funded programs", donorSpecific: true, donorCode: "NRC" },
];

// ── Logframe ──
export interface LogframeNode {
  id: string; level: "Strategic Priority" | "Outcome" | "Output" | "Activity"; title: string; children?: LogframeNode[];
}

export const logframe: LogframeNode[] = [
  {
    id: "sp1", level: "Strategic Priority", title: "Save lives and protect livelihoods in emergencies", children: [
      {
        id: "oc1", level: "Outcome", title: "Improved community preparedness and response capacity", children: [
          {
            id: "op1", level: "Output", title: "Trained volunteers and pre-positioned supplies", children: [
              { id: "act1", level: "Activity", title: "Train 200 community health volunteers" },
              { id: "act2", level: "Activity", title: "Pre-position emergency supplies in 6 warehouses" },
              { id: "act3", level: "Activity", title: "Conduct simulation exercises" },
            ],
          },
          {
            id: "op2", level: "Output", title: "Functional first aid posts in target communities", children: [
              { id: "act4", level: "Activity", title: "Establish 10 first aid posts" },
              { id: "act5", level: "Activity", title: "Distribute first aid kits to 100 schools" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sp2", level: "Strategic Priority", title: "Enable healthy and safe living", children: [
      {
        id: "oc2", level: "Outcome", title: "Reduced waterborne disease burden in target areas", children: [
          {
            id: "op3", level: "Output", title: "Improved WASH infrastructure", children: [
              { id: "act6", level: "Activity", title: "Construct 20 water points" },
              { id: "act7", level: "Activity", title: "Conduct hygiene promotion in 50 communities" },
            ],
          },
        ],
      },
      {
        id: "oc3", level: "Outcome", title: "Strengthened blood bank services nationwide", children: [
          {
            id: "op4", level: "Output", title: "Upgraded blood bank cold chain", children: [
              { id: "act8", level: "Activity", title: "Upgrade cold chain equipment in 5 centers" },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "sp3", level: "Strategic Priority", title: "Promote social inclusion and a culture of non-violence and peace", children: [
      {
        id: "oc4", level: "Outcome", title: "Improved psychosocial well-being of conflict-affected populations", children: [
          {
            id: "op5", level: "Output", title: "PSS services delivered to IDPs", children: [
              { id: "act9", level: "Activity", title: "Provide psychosocial support to 1,000 IDPs" },
              { id: "act10", level: "Activity", title: "Train 50 PSS counselors" },
            ],
          },
        ],
      },
    ],
  },
];

// ── Role Permissions ──
export const rolePermissions: Record<UserRole, Record<string, boolean>> = {
  "Super Admin": { "View Dashboard": true, "Manage Users": true, "Edit Indicators": true, "Approve Plans": true, "Enter Data": true, "View Reports": true, "Export Data": true, "Manage Budget": true, "System Settings": true },
  "PMER Admin": { "View Dashboard": true, "Manage Users": false, "Edit Indicators": true, "Approve Plans": true, "Enter Data": true, "View Reports": true, "Export Data": true, "Manage Budget": true, "System Settings": false },
  "Branch Admin": { "View Dashboard": true, "Manage Users": false, "Edit Indicators": false, "Approve Plans": true, "Enter Data": true, "View Reports": true, "Export Data": true, "Manage Budget": false, "System Settings": false },
  "Data Entry": { "View Dashboard": true, "Manage Users": false, "Edit Indicators": false, "Approve Plans": false, "Enter Data": true, "View Reports": true, "Export Data": false, "Manage Budget": false, "System Settings": false },
  "Finance Officer": { "View Dashboard": true, "Manage Users": false, "Edit Indicators": false, "Approve Plans": false, "Enter Data": false, "View Reports": true, "Export Data": true, "Manage Budget": true, "System Settings": false },
  "Read-only": { "View Dashboard": true, "Manage Users": false, "Edit Indicators": false, "Approve Plans": false, "Enter Data": false, "View Reports": true, "Export Data": false, "Manage Budget": false, "System Settings": false },
};

// ── Helper functions ──
export function getBranchName(id: string) {
  return branches.find(b => b.id === id)?.name ?? id;
}
export function getDonorName(id: string) {
  return donors.find(d => d.id === id)?.name ?? id;
}
export function getProjectDonor(projectId: string) {
  const p = projects.find(pr => pr.id === projectId);
  return p ? getDonorName(p.donorId) : "Unknown";
}
export function getTrafficColor(achievementPct: number): "green" | "yellow" | "red" {
  if (achievementPct >= 90) return "green";
  if (achievementPct >= 70) return "yellow";
  return "red";
}
