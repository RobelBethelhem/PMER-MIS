import { useState } from "react";
import { FileEdit, Save, Send, ChevronDown, CheckCircle2, AlertTriangle, XCircle, Users, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage, DataSubmission, SUBMISSIONS_KEY, addAuditEntry } from "@/hooks/use-store";

/* ───────────────────────── constants ───────────────────────── */

const BRANCHES = ["Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali"];
const PERIODS = ["Monthly", "Quarterly"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const QUARTERS = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Oct–Dec)"];
const YEARS = ["2024", "2025", "2026"];

interface IndicatorDef {
  name: string;
  target: number;
}

const INDICATORS: IndicatorDef[] = [
  { name: "Community health volunteers trained", target: 450 },
  { name: "First aid posts established", target: 15 },
  { name: "People reached with health messaging", target: 120000 },
  { name: "Waterborne disease reduction %", target: 60 },
  { name: "Households receiving micro-grants", target: 500 },
  { name: "Emergency simulation exercises", target: 8 },
  { name: "Blood units collected", target: 35000 },
  { name: "IDPs receiving psychosocial support", target: 1000 },
  { name: "Beneficiaries receiving food assistance", target: 10000 },
  { name: "Water points constructed", target: 30 },
];

/* ───────────────────── inline components ───────────────────── */

function TrafficBadge({ value }: { value: number }) {
  if (value >= 90)
    return (
      <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-200">
        On Track
      </span>
    );
  if (value >= 70)
    return (
      <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-200">
        At Risk
      </span>
    );
  return (
    <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-200">
      Critical
    </span>
  );
}

/* ────────────────── row‑level state shape ──────────────────── */

interface RowState {
  actual: string;
  note: string;
  male: string;
  female: string;
}

function emptyRow(): RowState {
  return { actual: "", note: "", male: "", female: "" };
}

function buildInitialRows(): RowState[] {
  return INDICATORS.map(() => emptyRow());
}

/* ═══════════════════════════════════════════════════════════════
   DataEntry page
   ═══════════════════════════════════════════════════════════════ */

export default function DataEntry() {
  const { toast } = useToast();

  /* ── step 1 state ── */
  const [branch, setBranch] = useState("");
  const [period, setPeriod] = useState("");
  const [subPeriod, setSubPeriod] = useState("");
  const [year, setYear] = useState("");

  /* ── step 2 state ── */
  const [rows, setRows] = useState<RowState[]>(buildInitialRows);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  /* ── derived ── */
  const step1Complete = branch !== "" && period !== "" && subPeriod !== "" && year !== "";

  const completedCount = rows.filter((r) => r.actual !== "").length;
  const progressPct = (completedCount / INDICATORS.length) * 100;

  /* ── helpers ── */

  function updateRow(index: number, patch: Partial<RowState>) {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
    // clear submitted flag so live validation refreshes
    if (submitted) setSubmitted(false);
  }

  function achievement(index: number): number | null {
    const val = parseFloat(rows[index].actual);
    if (isNaN(val)) return null;
    const target = INDICATORS[index].target;
    if (target === 0) return 0;
    return Math.round((val / target) * 100);
  }

  function validate(): string[] {
    const errs: string[] = [];
    rows.forEach((r, i) => {
      if (r.actual === "") {
        errs.push(`Row ${i + 1} ("${INDICATORS[i].name}"): Actual value is required.`);
      } else {
        const ach = achievement(i);
        if (ach !== null && ach < 80 && r.note.trim() === "") {
          errs.push(
            `Row ${i + 1} ("${INDICATORS[i].name}"): Variance note is required when achievement is below 80%.`
          );
        }
      }
    });
    return errs;
  }

  function handleSubmit() {
    setSubmitted(true);
    const errs = validate();
    setErrors(errs);
    if (errs.length > 0) {
      toast({ title: "Validation Failed", description: `${errs.length} issue(s) need your attention.`, variant: "destructive" });
      return;
    }

    // Save to localStorage
    const submission: DataSubmission = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      branch: branch,
      periodType: period,
      period: subPeriod,
      year: year,
      entries: INDICATORS.map((ind, i) => ({
        indicator: ind.name,
        target: ind.target,
        actual: Number(rows[i].actual) || 0,
        achievement: rows[i].actual ? Math.round((Number(rows[i].actual) / ind.target) * 100) : 0,
        male: Number(rows[i].male) || 0,
        female: Number(rows[i].female) || 0,
        note: rows[i].note,
      })),
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };

    const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    existing.unshift(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));

    addAuditEntry({
      user: JSON.parse(localStorage.getItem("pmer_auth") || '{"name":"Admin"}').name,
      action: `Submitted ${period} indicator data for ${branch}`,
      type: "data_entry",
      module: "Monitoring",
    });

    toast({ title: "Data Submitted", description: "All indicator data has been submitted successfully." });
    // reset
    setBranch("");
    setPeriod("");
    setSubPeriod("");
    setYear("");
    setRows(buildInitialRows());
    setErrors([]);
    setSubmitted(false);
  }

  function handleDraft() {
    // Save draft to localStorage
    const submission: DataSubmission = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      branch: branch,
      periodType: period,
      period: subPeriod,
      year: year,
      entries: INDICATORS.map((ind, i) => ({
        indicator: ind.name,
        target: ind.target,
        actual: Number(rows[i].actual) || 0,
        achievement: rows[i].actual ? Math.round((Number(rows[i].actual) / ind.target) * 100) : 0,
        male: Number(rows[i].male) || 0,
        female: Number(rows[i].female) || 0,
        note: rows[i].note,
      })),
      submittedAt: new Date().toISOString(),
      status: "draft",
    };

    const existing = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || "[]");
    existing.unshift(submission);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(existing));

    addAuditEntry({
      user: JSON.parse(localStorage.getItem("pmer_auth") || '{"name":"Admin"}').name,
      action: `Saved draft ${period} indicator data for ${branch}`,
      type: "data_entry",
      module: "Monitoring",
    });

    toast({ title: "Draft Saved", description: "Draft saved successfully" });
  }

  /* ── format helpers ── */
  function fmtTarget(n: number) {
    return n >= 1000 ? n.toLocaleString() : String(n);
  }

  /* ═══════════════════════════ render ═══════════════════════════ */

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Hero ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">
              Branch Reporting
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">
              Indicator Entry
            </span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
            Data <span className="text-[#E11D48] italic">Collection</span>
          </h1>
          <p className="text-slate-500 font-medium mt-6 max-w-2xl">
            Enter actual performance values for branch-level indicators. All fields are validated before submission
            to ensure data quality and completeness.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Progress bar ── */}
      <div className="ercs-card-premium p-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Completion Progress
          </span>
          <span className="text-sm font-bold text-slate-700">
            {completedCount} of {INDICATORS.length} indicators completed
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressPct}%`,
              background: progressPct === 100 ? "#10b981" : "#E11D48",
            }}
          />
        </div>
      </div>

      {/* ══════════════ STEP 1 — Filters ══════════════ */}
      <div className="ercs-card-premium p-10 mb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <FileEdit className="w-5 h-5 text-[#E11D48]" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Step 1 — Select Reporting Context</h2>
            <p className="text-xs text-slate-400 font-medium">Choose branch, period type, period, and year</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Branch */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Branch
            </label>
            <div className="relative">
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select branch...</option>
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Period type */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Period Type
            </label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setSubPeriod(""); // reset sub when type changes
                }}
                className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select period...</option>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Month or Quarter */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              {period === "Quarterly" ? "Quarter" : "Month"}
            </label>
            <div className="relative">
              <select
                value={subPeriod}
                onChange={(e) => setSubPeriod(e.target.value)}
                disabled={period === ""}
                className={cn(
                  "w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer",
                  period === "" && "opacity-50 cursor-not-allowed"
                )}
              >
                <option value="">
                  {period === "Quarterly" ? "Select quarter..." : "Select month..."}
                </option>
                {(period === "Quarterly" ? QUARTERS : MONTHS).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
              Year
            </label>
            <div className="relative">
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200 pl-4 pr-10 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                <option value="">Select year...</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* context summary */}
        {step1Complete && (
          <div className="mt-8 flex items-center gap-3 px-6 py-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-sm font-semibold text-emerald-700">
              Reporting for <span className="font-black">{branch}</span> &mdash;{" "}
              {subPeriod} {year} ({period})
            </span>
          </div>
        )}
      </div>

      {/* ══════════════ STEP 2 — Indicator Table ══════════════ */}
      {step1Complete && (
        <>
          <div className="ercs-card-premium p-0 overflow-hidden mb-10 shadow-xl shadow-slate-200/50">
            <div className="px-10 py-8 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#E11D48]" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Step 2 — Enter Indicator Data</h2>
                <p className="text-xs text-slate-400 font-medium">
                  Fill in actual values. Variance notes are required when achievement falls below 80%.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] w-8">
                      #
                    </th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] min-w-[260px]">
                      Indicator Name
                    </th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Target
                    </th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Actual
                    </th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Achievement %
                    </th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[120px]">
                      Disaggregation
                    </th>
                    <th className="px-6 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest min-w-[220px]">
                      Variance Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {INDICATORS.map((ind, i) => {
                    const ach = achievement(i);
                    const needsNote = ach !== null && ach < 80;
                    const missingActual = submitted && rows[i].actual === "";
                    const missingNote = submitted && needsNote && rows[i].note.trim() === "";

                    return (
                      <tr
                        key={i}
                        className={cn(
                          "border-b border-slate-50 transition-colors",
                          i % 2 === 0 ? "bg-white" : "bg-slate-50/20",
                          (missingActual || missingNote) && "bg-rose-50/40"
                        )}
                      >
                        {/* # */}
                        <td className="px-6 py-5 text-xs font-bold text-slate-300">{i + 1}</td>

                        {/* Indicator name */}
                        <td className="px-6 py-5">
                          <span className="text-sm font-semibold text-slate-800">{ind.name}</span>
                        </td>

                        {/* Target (read-only) */}
                        <td className="px-6 py-5 text-center">
                          <span className="text-sm font-bold text-slate-600">{fmtTarget(ind.target)}</span>
                        </td>

                        {/* Actual (editable) */}
                        <td className="px-6 py-5">
                          <input
                            type="number"
                            min="0"
                            value={rows[i].actual}
                            onChange={(e) => updateRow(i, { actual: e.target.value })}
                            placeholder="0"
                            className={cn(
                              "w-28 mx-auto block bg-slate-50/50 border pl-4 pr-4 py-3 rounded-2xl text-sm font-medium text-center focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none",
                              missingActual ? "border-rose-400 bg-rose-50" : "border-slate-200"
                            )}
                          />
                          {missingActual && (
                            <p className="text-[10px] text-rose-500 font-bold text-center mt-1">Required</p>
                          )}
                        </td>

                        {/* Achievement % */}
                        <td className="px-6 py-5 text-center">
                          {ach !== null ? (
                            <span
                              className={cn(
                                "text-sm font-black",
                                ach >= 90
                                  ? "text-emerald-600"
                                  : ach >= 70
                                  ? "text-amber-600"
                                  : "text-rose-600"
                              )}
                            >
                              {ach}%
                            </span>
                          ) : (
                            <span className="text-xs text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Traffic light */}
                        <td className="px-6 py-5 text-center">
                          {ach !== null ? (
                            <TrafficBadge value={ach} />
                          ) : (
                            <span className="text-xs text-slate-300">&mdash;</span>
                          )}
                        </td>

                        {/* Disaggregation */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 justify-center">
                            <div className="flex flex-col items-center gap-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Users className="w-3 h-3" /> M
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={rows[i].male}
                                onChange={(e) => updateRow(i, { male: e.target.value })}
                                placeholder="0"
                                className="w-16 bg-slate-50/50 border border-slate-200 px-2 py-2 rounded-xl text-xs font-medium text-center focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Users className="w-3 h-3" /> F
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={rows[i].female}
                                onChange={(e) => updateRow(i, { female: e.target.value })}
                                placeholder="0"
                                className="w-16 bg-slate-50/50 border border-slate-200 px-2 py-2 rounded-xl text-xs font-medium text-center focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
                              />
                            </div>
                          </div>
                        </td>

                        {/* Variance note */}
                        <td className="px-6 py-5">
                          <textarea
                            value={rows[i].note}
                            onChange={(e) => updateRow(i, { note: e.target.value })}
                            rows={2}
                            placeholder={needsNote ? "Required — explain variance..." : "Optional note..."}
                            className={cn(
                              "w-full bg-slate-50/50 border pl-4 pr-4 py-3 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none resize-none",
                              needsNote && rows[i].note.trim() === ""
                                ? "border-rose-400 bg-rose-50/60 placeholder:text-rose-400"
                                : "border-slate-200",
                              missingNote && "ring-2 ring-rose-400/30"
                            )}
                          />
                          {missingNote && (
                            <p className="text-[10px] text-rose-500 font-bold mt-1">Required (achievement &lt;80%)</p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Validation errors ── */}
          {submitted && errors.length > 0 && (
            <div className="ercs-card-premium p-8 mb-10 border-rose-200 bg-rose-50/30">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-black text-rose-700">
                  {errors.length} validation error{errors.length > 1 ? "s" : ""}
                </h3>
              </div>
              <ul className="space-y-1">
                {errors.map((err, idx) => (
                  <li key={idx} className="text-xs text-rose-600 font-medium flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Action buttons ── */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={handleDraft}
              className="btn-secondary-ercs flex items-center gap-3"
            >
              <Save className="w-4 h-4" />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="btn-primary-ercs flex items-center gap-3"
            >
              <Send className="w-4 h-4" />
              Submit Data
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── small icon used in table header (avoids extra import) ── */
function Activity(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" />
    </svg>
  );
}
