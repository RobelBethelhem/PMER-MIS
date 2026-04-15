import React, { useState } from "react";
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Filter,
  RefreshCw,
  ArrowRight,
  Shield,
  Layers,
  TrendingUp,
  Users,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ───────────────────────── constants ───────────────────────── */

const REGIONS = ["All", "Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali"];
const PROGRAMS = ["All", "Health", "WASH", "DRR", "Livelihood"];
const DONORS = ["All", "IFRC", "ICRC", "Norwegian RC"];
const TIME_PERIODS = ["All", "Monthly", "Quarterly", "Semi-Annual", "Annual"];

interface BranchRow {
  branch: string;
  monthly: "Submitted" | "Overdue";
  quarterly: "Submitted" | "Pending";
  status: "Complete" | "Partial" | "Overdue";
  lastSubmitted: string;
  quality: number;
  program: string;
  donor: string;
}

const BRANCH_DATA: BranchRow[] = [
  { branch: "Addis Ababa", monthly: "Submitted", quarterly: "Submitted", status: "Complete", lastSubmitted: "Jun 15, 2025", quality: 98, program: "Health", donor: "IFRC" },
  { branch: "Amhara", monthly: "Submitted", quarterly: "Pending", status: "Partial", lastSubmitted: "Jun 12, 2025", quality: 91, program: "WASH", donor: "ICRC" },
  { branch: "Oromia", monthly: "Submitted", quarterly: "Submitted", status: "Complete", lastSubmitted: "Jun 14, 2025", quality: 95, program: "DRR", donor: "Norwegian RC" },
  { branch: "SNNPR", monthly: "Submitted", quarterly: "Pending", status: "Partial", lastSubmitted: "Jun 10, 2025", quality: 89, program: "Livelihood", donor: "IFRC" },
  { branch: "Tigray", monthly: "Overdue", quarterly: "Pending", status: "Overdue", lastSubmitted: "May 28, 2025", quality: 82, program: "Health", donor: "ICRC" },
  { branch: "Somali", monthly: "Submitted", quarterly: "Submitted", status: "Complete", lastSubmitted: "Jun 13, 2025", quality: 93, program: "WASH", donor: "Norwegian RC" },
];

const DUPLICATES = [
  { id: 1, indicator: "Community health volunteers trained", branches: "Addis Ababa & Oromia", severity: "Medium" },
  { id: 2, indicator: "People reached with health messaging", branches: "Amhara & SNNPR", severity: "High" },
  { id: 3, indicator: "Blood units collected", branches: "Tigray & Somali", severity: "Low" },
];

const VALIDATION_CHECKS = [
  { name: "Data completeness check", passed: true },
  { name: "Cross-branch consistency", passed: true },
  { name: "Target vs. actual variance", passed: false },
  { name: "Disaggregation totals match", passed: true },
  { name: "Time-period alignment", passed: true },
  { name: "Duplicate indicator scan", passed: false },
];

/* ───────────────────── inline helpers ───────────────────── */

function StatusBadge({ status }: { status: "Complete" | "Partial" | "Overdue" }) {
  const styles = {
    Complete: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Partial: "bg-amber-50 text-amber-600 border-amber-200",
    Overdue: "bg-rose-50 text-rose-600 border-rose-200",
  };
  return (
    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", styles[status])}>
      {status}
    </span>
  );
}

function SubmissionBadge({ value }: { value: string }) {
  if (value === "Submitted")
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
        Submitted
      </span>
    );
  if (value === "Pending")
    return (
      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[9px] font-black uppercase tracking-widest border border-amber-200">
        Pending
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[9px] font-black uppercase tracking-widest border border-rose-200">
      Overdue
    </span>
  );
}

function QualityValue({ quality }: { quality: number }) {
  const color = quality >= 90 ? "text-emerald-600" : quality >= 80 ? "text-amber-600" : "text-rose-600";
  return <span className={cn("text-sm font-black", color)}>{quality}%</span>;
}

/* ═══════════════════════════════════════════════════════════════
   Consolidation page
   ═══════════════════════════════════════════════════════════════ */

export default function Consolidation() {
  /* ── filter state ── */
  const [region, setRegion] = useState("All");
  const [program, setProgram] = useState("All");
  const [donor, setDonor] = useState("All");
  const [timePeriod, setTimePeriod] = useState("All");

  /* ── derived filtered data ── */
  const filteredData = BRANCH_DATA.filter((row) => {
    if (region !== "All" && row.branch !== region) return false;
    if (program !== "All" && row.program !== program) return false;
    if (donor !== "All" && row.donor !== donor) return false;
    if (timePeriod === "Monthly" && row.monthly === "Overdue") return true;
    if (timePeriod === "Monthly") return row.monthly === "Submitted";
    if (timePeriod === "Quarterly" && row.quarterly === "Pending") return true;
    if (timePeriod === "Quarterly") return row.quarterly === "Submitted";
    return true;
  });

  /* ── stat card data ── */
  const stats = [
    { label: "Total Submissions", value: "42", icon: Database, bg: "bg-blue-50", iconColor: "text-blue-500" },
    { label: "Branches Reporting", value: "6/6", icon: Layers, bg: "bg-emerald-50", iconColor: "text-emerald-500" },
    { label: "Data Quality Score", value: "94.2%", icon: Shield, bg: "bg-violet-50", iconColor: "text-violet-500" },
    { label: "Duplicate Flags", value: "3", icon: AlertTriangle, bg: "bg-amber-50", iconColor: "text-amber-500" },
  ];

  /* ── national aggregation summary ── */
  const aggregationStats = [
    { label: "Total Indicators Tracked", value: "72", icon: Activity },
    { label: "Average Achievement", value: "74.8%", icon: TrendingUp },
    { label: "Consolidated Beneficiaries", value: "145,280", icon: Users },
    { label: "Active Programs", value: "18", icon: Layers },
  ];

  const passedChecks = VALIDATION_CHECKS.filter((c) => c.passed).length;
  const failedChecks = VALIDATION_CHECKS.filter((c) => !c.passed).length;

  /* ═══════════════════════════ render ═══════════════════════════ */

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Hero ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">
              Module D
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
              National Aggregation Engine
            </span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
            Data <span className="text-[#E11D48] italic">Consolidation</span>
          </h1>
          <p className="text-slate-500 font-medium mt-6 max-w-2xl">
            Aggregate and consolidate branch-level data into national reports. Monitor submission
            status, detect duplicates, and ensure data quality across all branches.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat) => (
          <div key={stat.label} className="ercs-card-premium p-8 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  {stat.label}
                </p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
              <div
                className={cn(
                  "w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500",
                  stat.bg
                )}
              >
                <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtering Bar ── */}
      <div className="ercs-card-premium p-8 mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#E11D48]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Filter Submissions</h2>
            <p className="text-xs text-slate-400 font-medium">Narrow down branch data by region, program, donor, or time period</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Region */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Region
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Program */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Program
            </label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
            >
              {PROGRAMS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Donor */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Donor
            </label>
            <select
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
            >
              {DONORS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Time Period */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Time Period
            </label>
            <select
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
            >
              {TIME_PERIODS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Branch Submission Status Table ── */}
      <div className="ercs-card-premium p-0 overflow-hidden mb-10 shadow-xl shadow-slate-200/50">
        <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-[#E11D48]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Branch Submission Status</h2>
              <p className="text-xs text-slate-400 font-medium">
                Real-time reporting status for all branches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Branch
                </th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Monthly
                </th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Quarterly
                </th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Status
                </th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Last Submitted
                </th>
                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  Quality
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm font-semibold text-slate-400">No branches match the current filters.</p>
                  </td>
                </tr>
              ) : (
                filteredData.map((row, i) => (
                  <tr
                    key={row.branch}
                    className={cn(
                      "border-b border-slate-50 transition-colors hover:bg-slate-50/60",
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/20"
                    )}
                  >
                    <td className="px-6 py-5">
                      <span className="text-sm font-semibold text-slate-800">{row.branch}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <SubmissionBadge value={row.monthly} />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <SubmissionBadge value={row.quarterly} />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <StatusBadge status={row.status} />
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="text-sm font-medium text-slate-600">{row.lastSubmitted}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <QualityValue quality={row.quality} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Data Quality Section ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {/* Duplicate Detection */}
        <div className="ercs-card-premium p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">Duplicate Detection</h2>
              <p className="text-xs text-slate-400 font-medium">3 flagged duplicates requiring review</p>
            </div>
          </div>

          <div className="space-y-4">
            {DUPLICATES.map((dup) => {
              const severityStyle =
                dup.severity === "High"
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : dup.severity === "Medium"
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-slate-100 text-slate-500 border-slate-200";

              return (
                <div
                  key={dup.id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/60 border border-slate-100"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{dup.indicator}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Branches: {dup.branches}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ml-4",
                      severityStyle
                    )}
                  >
                    {dup.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validation Summary */}
        <div className="ercs-card-premium p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Validation Summary</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {passedChecks} passed, {failedChecks} failed
                </p>
              </div>
            </div>
            {/* Real-time aggregation indicator */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Real-time
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {VALIDATION_CHECKS.map((check) => (
              <div
                key={check.name}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border",
                  check.passed
                    ? "bg-emerald-50/40 border-emerald-100"
                    : "bg-rose-50/40 border-rose-100"
                )}
              >
                <div className="flex items-center gap-3">
                  {check.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <span className="text-sm font-semibold text-slate-700">{check.name}</span>
                </div>
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                    check.passed
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-rose-50 text-rose-600 border-rose-200"
                  )}
                >
                  {check.passed ? "Passed" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── National Aggregation Summary ── */}
      <div className="ercs-card-premium p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-[#E11D48]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">National Aggregation Summary</h2>
            <p className="text-xs text-slate-400 font-medium">
              Consolidated metrics across all branches and programs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aggregationStats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 rounded-2xl bg-slate-50/60 border border-slate-100 group hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <stat.icon className="w-5 h-5 text-[#E11D48]" />
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                {stat.label}
              </p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
