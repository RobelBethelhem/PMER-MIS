import React, { useState, useMemo } from "react";
import {
  FileText, Download, Plus, Search, ArrowUp, ArrowDown, X, Check,
  ChevronRight, Eye, Printer, FileSpreadsheet, File, GripVertical,
  Columns, LayoutTemplate, Clock, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { addAuditEntry } from "@/hooks/use-store";

// ────────────────────────────────────────────────────────────────
//  CONSTANTS
// ────────────────────────────────────────────────────────────────

const REPORTS_KEY = "pmer_generated_reports";
const TEMPLATES_KEY = "pmer_saved_templates";

const reportTemplates = [
  {
    title: "Monthly Narrative Report",
    desc: "Auto-populated narrative report with key achievements and challenges",
    category: "MONTHLY",
    categoryColor: "text-blue-600 bg-blue-50",
  },
  {
    title: "Quarterly Consolidated Report",
    desc: "Comprehensive quarterly report with indicator performance and financials",
    category: "QUARTERLY",
    categoryColor: "text-violet-600 bg-violet-50",
  },
  {
    title: "Semi-Annual Report",
    desc: "Mid-year review with progress against annual targets",
    category: "SEMI-ANNUAL",
    categoryColor: "text-slate-600 bg-slate-50",
  },
  {
    title: "Annual Statistical Summary",
    desc: "End-of-year statistical summary with trend analysis",
    category: "ANNUAL",
    categoryColor: "text-amber-600 bg-amber-50",
  },
  {
    title: "IFRC Federation Report",
    desc: "Donor-specific report template for IFRC",
    category: "QUARTERLY",
    donor: "IFRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-violet-600 bg-violet-50",
  },
  {
    title: "ICRC Cooperation Report",
    desc: "Donor-specific report for ICRC cooperation activities",
    category: "SEMI-ANNUAL",
    donor: "ICRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-slate-600 bg-slate-50",
  },
  {
    title: "Norwegian RC Partnership Report",
    desc: "Partnership report for Norwegian Red Cross funded programs",
    category: "QUARTERLY",
    donor: "NRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-violet-600 bg-violet-50",
  },
];

interface ColumnDef {
  id: string;
  label: string;
  category: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { id: "indicator", label: "Indicator Name", category: "Indicators" },
  { id: "code", label: "Indicator Code", category: "Indicators" },
  { id: "type", label: "Indicator Type", category: "Indicators" },
  { id: "target", label: "Target", category: "Performance" },
  { id: "actual", label: "Actual", category: "Performance" },
  { id: "achievement", label: "Achievement %", category: "Performance" },
  { id: "traffic", label: "Traffic Light", category: "Performance" },
  { id: "branch", label: "Branch", category: "Geography" },
  { id: "donor", label: "Donor", category: "Financial" },
  { id: "budget_alloc", label: "Budget Allocated", category: "Financial" },
  { id: "budget_spent", label: "Budget Spent", category: "Financial" },
  { id: "absorption", label: "Absorption Rate", category: "Financial" },
  { id: "male", label: "Male Count", category: "Disaggregation" },
  { id: "female", label: "Female Count", category: "Disaggregation" },
  { id: "total_benef", label: "Total Beneficiaries", category: "Disaggregation" },
  { id: "variance", label: "Variance", category: "Analysis" },
  { id: "variance_note", label: "Variance Explanation", category: "Analysis" },
  { id: "status", label: "Status", category: "Meta" },
  { id: "period", label: "Reporting Period", category: "Meta" },
  { id: "quality", label: "Data Quality Score", category: "Meta" },
];

const COLUMN_MAP = Object.fromEntries(ALL_COLUMNS.map((c) => [c.id, c]));

const CATEGORIES = [...new Set(ALL_COLUMNS.map((c) => c.category))];

const periodOptions: Record<string, string[]> = {
  "Monthly Narrative": [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026",
  ],
  "Quarterly Consolidated": ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026"],
  "Semi-Annual": ["H1 2026", "H2 2026"],
  "Annual Statistical": ["FY 2025", "FY 2026"],
  Custom: ["Q1 2026", "Q2 2026", "Q3 2026", "Q4 2026", "H1 2026", "H2 2026", "FY 2025", "FY 2026"],
};

const BRANCHES = ["Addis Ababa", "Amhara", "Oromia", "Tigray", "SNNPR", "Somali", "Afar", "Dire Dawa"];
const DONORS = ["IFRC", "ICRC", "Norwegian RC", "Finnish RC", "German RC"];

// ────────────────────────────────────────────────────────────────
//  SAMPLE DATA GENERATOR
// ────────────────────────────────────────────────────────────────

const SAMPLE_ROWS_RAW = [
  { indicator: "Health volunteers trained", code: "HLT-001", type: "Output", target: 450, actual: 400, branch: "Addis Ababa", donor: "IFRC", budget_alloc: 125000, budget_spent: 98000, male: 180, female: 220, variance_note: "Training venue delay" },
  { indicator: "First aid posts established", code: "HLT-002", type: "Output", target: 15, actual: 12, branch: "Amhara", donor: "ICRC", budget_alloc: 85000, budget_spent: 72000, male: 0, female: 0, variance_note: "Construction delays in 3 sites" },
  { indicator: "Households receiving micro-grants", code: "LIV-001", type: "Outcome", target: 500, actual: 478, branch: "Oromia", donor: "Norwegian RC", budget_alloc: 340000, budget_spent: 310000, male: 210, female: 268, variance_note: "Near target" },
  { indicator: "WASH facilities rehabilitated", code: "WSH-001", type: "Output", target: 40, actual: 32, branch: "Tigray", donor: "Finnish RC", budget_alloc: 220000, budget_spent: 175000, male: 0, female: 0, variance_note: "Access restrictions in 2 zones" },
  { indicator: "Community health sessions conducted", code: "HLT-003", type: "Activity", target: 200, actual: 178, branch: "SNNPR", donor: "IFRC", budget_alloc: 45000, budget_spent: 41000, male: 2800, female: 3600, variance_note: "Seasonal interruptions" },
  { indicator: "Disaster preparedness plans developed", code: "DRR-001", type: "Output", target: 12, actual: 12, branch: "Somali", donor: "German RC", budget_alloc: 60000, budget_spent: 58000, male: 0, female: 0, variance_note: "Completed on schedule" },
  { indicator: "Blood units collected", code: "BLD-001", type: "Output", target: 8000, actual: 7200, branch: "Addis Ababa", donor: "ICRC", budget_alloc: 180000, budget_spent: 165000, male: 4100, female: 3100, variance_note: "Donor fatigue in Q3" },
  { indicator: "Youth trained in first aid", code: "YTH-001", type: "Outcome", target: 1200, actual: 1050, branch: "Dire Dawa", donor: "Norwegian RC", budget_alloc: 92000, budget_spent: 80000, male: 520, female: 530, variance_note: "School calendar conflict" },
];

function getTrafficLight(pct: number): string {
  if (pct >= 90) return "\u{1F7E2} On Track";
  if (pct >= 75) return "\u{1F7E1} At Risk";
  return "\u{1F534} Critical";
}

function getStatusLabel(pct: number): string {
  if (pct >= 100) return "Completed";
  if (pct >= 90) return "On Track";
  if (pct >= 75) return "At Risk";
  return "Behind";
}

function getCellValue(colId: string, row: typeof SAMPLE_ROWS_RAW[number]): string {
  const pct = row.target > 0 ? Math.round((row.actual / row.target) * 100) : 0;
  const absorption = row.budget_alloc > 0 ? Math.round((row.budget_spent / row.budget_alloc) * 100) : 0;
  switch (colId) {
    case "indicator": return row.indicator;
    case "code": return row.code;
    case "type": return row.type;
    case "target": return row.target.toLocaleString();
    case "actual": return row.actual.toLocaleString();
    case "achievement": return `${pct}%`;
    case "traffic": return getTrafficLight(pct);
    case "branch": return row.branch;
    case "donor": return row.donor;
    case "budget_alloc": return `ETB ${row.budget_alloc.toLocaleString()}`;
    case "budget_spent": return `ETB ${row.budget_spent.toLocaleString()}`;
    case "absorption": return `${absorption}%`;
    case "male": return row.male.toLocaleString();
    case "female": return row.female.toLocaleString();
    case "total_benef": return (row.male + row.female).toLocaleString();
    case "variance": return `${pct >= 100 ? 0 : 100 - pct}%`;
    case "variance_note": return row.variance_note;
    case "status": return getStatusLabel(pct);
    case "period": return "Q1 2026";
    case "quality": return `${Math.min(100, 70 + Math.floor(Math.random() * 30))}%`;
    default: return "-";
  }
}

// ────────────────────────────────────────────────────────────────
//  INTERFACES
// ────────────────────────────────────────────────────────────────

interface GeneratedReport {
  id: string;
  reportTitle: string;
  reportType: string;
  period: string;
  branches: string[];
  donor: string;
  columns: string[];
  createdAt: string;
  status: "generated" | "exported";
}

interface SavedTemplate {
  id: string;
  name: string;
  columns: string[];
  reportType: string;
  savedAt: string;
}

// ────────────────────────────────────────────────────────────────
//  PERSISTENCE
// ────────────────────────────────────────────────────────────────

function loadGeneratedReports(): GeneratedReport[] {
  try { return JSON.parse(localStorage.getItem(REPORTS_KEY) || "[]"); } catch { return []; }
}

function loadSavedTemplates(): SavedTemplate[] {
  try { return JSON.parse(localStorage.getItem(TEMPLATES_KEY) || "[]"); } catch { return []; }
}

// ────────────────────────────────────────────────────────────────
//  EXPORT HELPERS
// ────────────────────────────────────────────────────────────────

function handleExportPDF() {
  toast({ title: "Exporting PDF", description: "Opening print dialog..." });
  addAuditEntry({ user: "Admin", action: "Exported report as PDF", type: "export", module: "Reports" });
  setTimeout(() => window.print(), 300);
}

function handleExportExcel(title: string, columns: string[], rows: typeof SAMPLE_ROWS_RAW) {
  const headers = columns.map((c) => COLUMN_MAP[c]?.label || c);
  const csvRows = rows.map((row) => columns.map((c) => {
    const val = getCellValue(c, row);
    // Escape commas/quotes for CSV
    return val.includes(",") || val.includes('"') ? `"${val.replace(/"/g, '""')}"` : val;
  }));
  const csv = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  addAuditEntry({ user: "Admin", action: `Exported report "${title}" as Excel/CSV`, type: "export", module: "Reports" });
  toast({ title: "Excel export complete", description: `Downloaded ${a.download}`, variant: "success" });
}

function handleExportWord(title: string, columns: string[], rows: typeof SAMPLE_ROWS_RAW) {
  const headers = columns.map((c) => COLUMN_MAP[c]?.label || c);
  let content = `ETHIOPIAN RED CROSS SOCIETY\nPMER REPORT\n\n${title}\nGenerated: ${new Date().toLocaleDateString()}\n\n`;
  content += headers.join("\t") + "\n";
  content += "-".repeat(headers.length * 20) + "\n";
  rows.forEach((row) => {
    content += columns.map((c) => getCellValue(c, row)).join("\t") + "\n";
  });
  content += "\n\nGenerated by PMER-MIS Report Builder";
  const blob = new Blob([content], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.doc`;
  a.click();
  URL.revokeObjectURL(url);
  addAuditEntry({ user: "Admin", action: `Exported report "${title}" as Word`, type: "export", module: "Reports" });
  toast({ title: "Word export complete", description: `Downloaded ${a.download}`, variant: "success" });
}

// ────────────────────────────────────────────────────────────────
//  MAIN COMPONENT
// ────────────────────────────────────────────────────────────────

type TabId = "templates" | "builder" | "history";

export default function Reports() {
  // ─── Tabs ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabId>("builder");

  // ─── Template preview dialog ──────────────────────────────
  const [previewTemplate, setPreviewTemplate] = useState<typeof reportTemplates[number] | null>(null);

  // ─── Generated reports ────────────────────────────────────
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>(loadGeneratedReports);

  // ─── Saved custom templates ───────────────────────────────
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(loadSavedTemplates);

  // ─── Builder: Step ─────────────────────────────────────────
  const [builderStep, setBuilderStep] = useState(1);

  // ─── Builder: Config (Step 1) ─────────────────────────────
  const [reportTitle, setReportTitle] = useState("PMER Performance Report");
  const [reportType, setReportType] = useState("Quarterly Consolidated");
  const [reportPeriod, setReportPeriod] = useState("Q1 2026");
  const [selectedBranches, setSelectedBranches] = useState<string[]>([]);
  const [donorFilter, setDonorFilter] = useState("All");

  // ─── Builder: Columns (Step 2) ─────────────────────────────
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "indicator", "branch", "target", "actual", "achievement", "traffic",
  ]);
  const [columnSearch, setColumnSearch] = useState("");

  // ─── Builder: Save template dialog ────────────────────────
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  // ─── History view dialog ──────────────────────────────────
  const [viewReport, setViewReport] = useState<GeneratedReport | null>(null);

  // ─── Column operations ────────────────────────────────────

  const addColumn = (id: string) => {
    if (!selectedColumns.includes(id)) {
      setSelectedColumns((prev) => [...prev, id]);
    }
  };

  const removeColumn = (id: string) => {
    setSelectedColumns((prev) => prev.filter((c) => c !== id));
  };

  const moveColumn = (id: string, dir: -1 | 1) => {
    setSelectedColumns((prev) => {
      const idx = prev.indexOf(id);
      if (idx < 0) return prev;
      const next = [...prev];
      const swapIdx = idx + dir;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  // ─── Available columns, grouped ───────────────────────────
  const availableByCategory = useMemo(() => {
    const q = columnSearch.toLowerCase();
    const groups: Record<string, ColumnDef[]> = {};
    for (const cat of CATEGORIES) groups[cat] = [];
    for (const col of ALL_COLUMNS) {
      if (q && !col.label.toLowerCase().includes(q) && !col.category.toLowerCase().includes(q)) continue;
      groups[col.category].push(col);
    }
    return groups;
  }, [columnSearch]);

  // ─── Generate / Save ──────────────────────────────────────

  const handleGenerate = () => {
    if (selectedColumns.length === 0) {
      toast({ title: "No columns selected", description: "Please select at least one column for your report.", variant: "destructive" });
      return;
    }
    const entry: GeneratedReport = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      reportTitle,
      reportType,
      period: reportPeriod,
      branches: selectedBranches.length > 0 ? selectedBranches : ["All"],
      donor: donorFilter,
      columns: selectedColumns,
      createdAt: new Date().toISOString(),
      status: "generated",
    };
    const updated = [entry, ...generatedReports];
    setGeneratedReports(updated);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    addAuditEntry({ user: "Admin", action: `Generated ${reportType} report: "${reportTitle}"`, type: "report", module: "Reports" });
    toast({ title: "Report generated successfully", description: `${reportType} report for ${reportPeriod} with ${selectedColumns.length} columns`, variant: "success" });
  };

  const handleSaveTemplate = () => {
    if (!saveTemplateName.trim()) return;
    const tpl: SavedTemplate = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      name: saveTemplateName.trim(),
      columns: selectedColumns,
      reportType,
      savedAt: new Date().toISOString(),
    };
    const updated = [tpl, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(updated));
    addAuditEntry({ user: "Admin", action: `Saved report template: "${saveTemplateName}"`, type: "report", module: "Reports" });
    toast({ title: "Template saved", description: `"${saveTemplateName}" saved with ${selectedColumns.length} columns`, variant: "success" });
    setSaveDialogOpen(false);
    setSaveTemplateName("");
  };

  const handleLoadTemplate = (tpl: SavedTemplate) => {
    setSelectedColumns(tpl.columns);
    setReportType(tpl.reportType);
    toast({ title: "Template loaded", description: `Loaded "${tpl.name}" with ${tpl.columns.length} columns` });
  };

  const handleDeleteReport = (id: string) => {
    const updated = generatedReports.filter((r) => r.id !== id);
    setGeneratedReports(updated);
    localStorage.setItem(REPORTS_KEY, JSON.stringify(updated));
    toast({ title: "Report deleted", description: "Report removed from history" });
  };

  // ─── Toggle branch selection ──────────────────────────────
  const toggleBranch = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  // ────────────────────────────────────────────────────────────
  //  TABS CONFIG
  // ────────────────────────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: "templates", label: "Report Templates", icon: <LayoutTemplate className="w-4 h-4" /> },
    { id: "builder", label: "Report Builder", icon: <Columns className="w-4 h-4" /> },
    { id: "history", label: "Generated Reports", icon: <Clock className="w-4 h-4" /> },
  ];

  // ────────────────────────────────────────────────────────────
  //  RENDER
  // ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">

      {/* ── Hero Section ─────────────────────────────────────── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.2em]">
              Reporting Suite
            </span>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="hero-title text-5xl">Performance</h1>
              <h1 className="hero-title text-5xl text-[#E11D48] italic">Intelligence</h1>
              <p className="hero-subtitle mt-6">
                Design, customize, and export comprehensive PMER reports with drag-and-drop column configuration.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden lg:block">
                <div className="text-3xl font-black text-slate-800">{generatedReports.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports Generated</div>
              </div>
              <div className="w-px h-12 bg-slate-200 hidden lg:block" />
              <div className="text-right hidden lg:block">
                <div className="text-3xl font-black text-slate-800">{savedTemplates.length}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Saved Templates</div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Tab Navigation ───────────────────────────────────── */}
      <div className="bg-slate-100/50 p-2 rounded-2xl w-fit mb-10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-lg shadow-slate-200/50"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.icon}
            {tab.label}
            {tab.id === "history" && generatedReports.length > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black">
                {generatedReports.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1: REPORT TEMPLATES
          ══════════════════════════════════════════════════════════ */}
      {activeTab === "templates" && (
        <div>
          {/* Saved custom templates */}
          {savedTemplates.length > 0 && (
            <div className="mb-10">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                Your Saved Templates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {savedTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      handleLoadTemplate(tpl);
                      setActiveTab("builder");
                      setBuilderStep(2);
                    }}
                    className="ercs-card-premium p-6 cursor-pointer hover-lift group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <Columns className="w-4 h-4" />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase text-emerald-600 bg-emerald-50">
                        CUSTOM
                      </span>
                    </div>
                    <h3 className="text-base font-black text-slate-800 mb-1">{tpl.name}</h3>
                    <p className="text-slate-500 text-xs font-medium">
                      {tpl.columns.length} columns &middot; {tpl.reportType}
                    </p>
                    <p className="text-slate-400 text-[10px] mt-2">
                      Saved {new Date(tpl.savedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
            Standard Report Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reportTemplates.map((report, i) => (
              <div
                key={i}
                onClick={() => setPreviewTemplate(report)}
                className="ercs-card-premium p-8 flex flex-col group hover-lift cursor-pointer"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-[#E11D48] shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black tracking-widest uppercase", report.categoryColor)}>
                      {report.category}
                    </span>
                    {report.donor && (
                      <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest uppercase", report.donorColor)}>
                        {report.donor}
                      </span>
                    )}
                  </div>
                </div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight leading-tight mb-4">
                  {report.title}
                </h2>
                <p className="text-slate-500 text-[13px] font-medium leading-relaxed mb-auto pb-10">
                  {report.desc}
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-violet-600 group-hover:text-[#E11D48] transition-colors">
                  <Eye className="w-3.5 h-3.5" />
                  Click to preview & export
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2: REPORT BUILDER
          ══════════════════════════════════════════════════════════ */}
      {activeTab === "builder" && (
        <div>
          {/* Step indicator */}
          <div className="flex items-center gap-4 mb-10">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <button
                  onClick={() => setBuilderStep(step)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 rounded-2xl text-sm font-bold transition-all",
                    builderStep === step
                      ? "bg-white shadow-lg shadow-slate-200/50 text-slate-900 ring-2 ring-rose-500/20"
                      : builderStep > step
                        ? "bg-emerald-50 text-emerald-700 cursor-pointer"
                        : "bg-slate-50 text-slate-400 cursor-pointer"
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black",
                    builderStep === step
                      ? "bg-[#E11D48] text-white"
                      : builderStep > step
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-200 text-slate-500"
                  )}>
                    {builderStep > step ? <Check className="w-3.5 h-3.5" /> : step}
                  </div>
                  {step === 1 && "Configure"}
                  {step === 2 && "Select Columns"}
                  {step === 3 && "Preview & Export"}
                </button>
                {step < 3 && (
                  <div className={cn(
                    "w-12 h-0.5 rounded-full",
                    builderStep > step ? "bg-emerald-400" : "bg-slate-200"
                  )} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* ─── Step 1: Configure Report ────────────────────── */}
          {builderStep === 1 && (
            <div className="ercs-card-premium p-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center">
                  <Filter className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800">Report Configuration</h3>
                  <p className="text-xs text-slate-400 font-medium">Set the basic parameters for your report</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Report Title */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Report Title
                  </label>
                  <input
                    type="text"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="Enter report title..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
                  />
                </div>

                {/* Report Type */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Report Type
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => {
                      setReportType(e.target.value);
                      setReportPeriod(periodOptions[e.target.value]?.[0] || "");
                    }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
                  >
                    {Object.keys(periodOptions).map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Period */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Reporting Period
                  </label>
                  <select
                    value={reportPeriod}
                    onChange={(e) => setReportPeriod(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
                  >
                    {(periodOptions[reportType] || []).map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Branch Multi-select */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Branches
                    {selectedBranches.length === 0 && (
                      <span className="ml-2 text-slate-300 normal-case tracking-normal">(none selected = All branches)</span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {BRANCHES.map((branch) => {
                      const isSelected = selectedBranches.includes(branch);
                      return (
                        <button
                          key={branch}
                          onClick={() => toggleBranch(branch)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                            isSelected
                              ? "bg-[#E11D48] text-white border-[#E11D48] shadow-lg shadow-rose-500/20"
                              : "bg-white border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600"
                          )}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1.5" />}
                          {branch}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Donor Filter */}
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                    Donor Filter
                  </label>
                  <select
                    value={donorFilter}
                    onChange={(e) => setDonorFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
                  >
                    <option value="All">All Donors</option>
                    {DONORS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-10">
                <button
                  onClick={() => setBuilderStep(2)}
                  className="btn-primary-ercs flex items-center gap-2 px-8"
                >
                  Next: Select Columns
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Select & Arrange Columns ────────────── */}
          {builderStep === 2 && (
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ── Available Columns Panel ───────────────────── */}
                <div className="ercs-card-premium p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">Available Columns</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Click to add to your report</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                      {ALL_COLUMNS.length - selectedColumns.length} available
                    </span>
                  </div>

                  {/* Search */}
                  <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                      type="text"
                      placeholder="Search columns..."
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
                    />
                  </div>

                  {/* Column groups */}
                  <div className="space-y-5 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                    {CATEGORIES.map((cat) => {
                      const cols = availableByCategory[cat];
                      if (!cols || cols.length === 0) return null;
                      return (
                        <div key={cat}>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">
                            {cat}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {cols.map((col) => {
                              const isSelected = selectedColumns.includes(col.id);
                              return (
                                <button
                                  key={col.id}
                                  onClick={() => !isSelected && addColumn(col.id)}
                                  disabled={isSelected}
                                  className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2",
                                    isSelected
                                      ? "bg-slate-50 border border-slate-100 text-slate-300 cursor-default"
                                      : "bg-white border border-slate-200 cursor-pointer hover:border-rose-300 hover:text-rose-600 hover:shadow-md hover:shadow-rose-500/10 active:scale-95"
                                  )}
                                >
                                  {isSelected ? (
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  ) : (
                                    <Plus className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  {col.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Selected Columns Panel ────────────────────── */}
                <div className="ercs-card-premium p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Columns className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-800">Selected Columns</h3>
                        <p className="text-[10px] text-slate-400 font-medium">Reorder with arrows, click X to remove</p>
                      </div>
                    </div>
                    <span className={cn(
                      "text-[10px] font-black px-3 py-1.5 rounded-lg",
                      selectedColumns.length > 0
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-slate-400 bg-slate-50"
                    )}>
                      {selectedColumns.length} selected
                    </span>
                  </div>

                  {selectedColumns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
                        <Columns className="w-7 h-7 text-slate-300" />
                      </div>
                      <p className="text-sm font-bold text-slate-400 mb-1">No columns selected</p>
                      <p className="text-xs text-slate-300">Click columns on the left to add them to your report</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
                      {selectedColumns.map((colId, idx) => {
                        const col = COLUMN_MAP[colId];
                        if (!col) return null;
                        return (
                          <div
                            key={colId}
                            className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-bold flex items-center gap-3 group hover:border-slate-300 transition-all"
                          >
                            {/* Drag handle (visual) */}
                            <GripVertical className="w-4 h-4 text-slate-200 flex-shrink-0" />

                            {/* Number */}
                            <span className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 flex-shrink-0">
                              {idx + 1}
                            </span>

                            {/* Label */}
                            <span className="flex-1 text-slate-700">{col.label}</span>

                            {/* Category badge */}
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest hidden sm:block">
                              {col.category}
                            </span>

                            {/* Move Up */}
                            <button
                              onClick={() => moveColumn(colId, -1)}
                              disabled={idx === 0}
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                idx === 0
                                  ? "text-slate-200 cursor-default"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-90"
                              )}
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => moveColumn(colId, 1)}
                              disabled={idx === selectedColumns.length - 1}
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center transition-all",
                                idx === selectedColumns.length - 1
                                  ? "text-slate-200 cursor-default"
                                  : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:scale-90"
                              )}
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Remove */}
                            <button
                              onClick={() => removeColumn(colId)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick actions */}
                  {selectedColumns.length > 0 && (
                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-100">
                      <button
                        onClick={() => setSelectedColumns([])}
                        className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        Clear All
                      </button>
                      <div className="w-px h-4 bg-slate-200" />
                      <button
                        onClick={() => setSelectedColumns(ALL_COLUMNS.map((c) => c.id))}
                        className="text-xs font-bold text-slate-400 hover:text-violet-600 transition-colors"
                      >
                        Select All
                      </button>
                      <div className="w-px h-4 bg-slate-200" />
                      <button
                        onClick={() => setSelectedColumns(["indicator", "branch", "target", "actual", "achievement", "traffic"])}
                        className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setBuilderStep(1)}
                  className="btn-secondary-ercs flex items-center gap-2 px-6"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back: Configure
                </button>
                <button
                  onClick={() => setBuilderStep(3)}
                  disabled={selectedColumns.length === 0}
                  className={cn(
                    "btn-primary-ercs flex items-center gap-2 px-8",
                    selectedColumns.length === 0 && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Next: Preview & Export
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 3: Preview & Export ─────────────────────── */}
          {builderStep === 3 && (
            <div>
              {/* Report header */}
              <div className="ercs-card-premium p-8 mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                        <Eye className="w-4 h-4 text-[#E11D48]" />
                      </div>
                      <h3 className="text-xl font-black text-slate-800">{reportTitle}</h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 ml-12">
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-violet-600 bg-violet-50">
                        {reportType}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50">
                        {reportPeriod}
                      </span>
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-50">
                        {selectedBranches.length > 0 ? selectedBranches.join(", ") : "All Branches"}
                      </span>
                      {donorFilter !== "All" && (
                        <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50">
                          {donorFilter}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50">
                        {selectedColumns.length} columns
                      </span>
                    </div>
                  </div>

                  {/* Export buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExportPDF}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-black hover:bg-red-100 transition-all active:scale-95"
                    >
                      <Printer className="w-4 h-4" />
                      PDF
                    </button>
                    <button
                      onClick={() => handleExportExcel(reportTitle, selectedColumns, SAMPLE_ROWS_RAW)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black hover:bg-emerald-100 transition-all active:scale-95"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExportWord(reportTitle, selectedColumns, SAMPLE_ROWS_RAW)}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black hover:bg-blue-100 transition-all active:scale-95"
                    >
                      <File className="w-4 h-4" />
                      Word
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview table */}
              <div className="ercs-card-premium overflow-hidden mb-8">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-10">
                          #
                        </th>
                        {selectedColumns.map((colId) => {
                          const col = COLUMN_MAP[colId];
                          if (!col) return null;
                          return (
                            <th
                              key={colId}
                              className="px-4 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap"
                            >
                              {col.label}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_ROWS_RAW.map((row, rowIdx) => (
                        <tr
                          key={rowIdx}
                          className={cn(
                            "border-b border-slate-50 hover:bg-slate-50/50 transition-colors",
                            rowIdx % 2 === 0 ? "bg-white" : "bg-slate-25"
                          )}
                        >
                          <td className="px-4 py-3.5 text-xs text-slate-300 font-bold">
                            {rowIdx + 1}
                          </td>
                          {selectedColumns.map((colId) => {
                            const value = getCellValue(colId, row);
                            const pct = row.target > 0 ? Math.round((row.actual / row.target) * 100) : 0;

                            // Special rendering for certain columns
                            if (colId === "traffic") {
                              return (
                                <td key={colId} className="px-4 py-3.5 text-xs font-bold whitespace-nowrap">
                                  {value}
                                </td>
                              );
                            }
                            if (colId === "achievement") {
                              return (
                                <td key={colId} className="px-4 py-3.5 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full rounded-full",
                                          pct >= 90 ? "bg-emerald-500" : pct >= 75 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${Math.min(100, pct)}%` }}
                                      />
                                    </div>
                                    <span className={cn(
                                      "text-xs font-black",
                                      pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-amber-600" : "text-red-600"
                                    )}>
                                      {value}
                                    </span>
                                  </div>
                                </td>
                              );
                            }
                            if (colId === "status") {
                              const statusColors: Record<string, string> = {
                                Completed: "text-emerald-600 bg-emerald-50",
                                "On Track": "text-emerald-600 bg-emerald-50",
                                "At Risk": "text-amber-600 bg-amber-50",
                                Behind: "text-red-600 bg-red-50",
                              };
                              return (
                                <td key={colId} className="px-4 py-3.5 whitespace-nowrap">
                                  <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                    statusColors[value] || "text-slate-500 bg-slate-50"
                                  )}>
                                    {value}
                                  </span>
                                </td>
                              );
                            }
                            if (colId === "quality") {
                              const qNum = parseInt(value);
                              return (
                                <td key={colId} className="px-4 py-3.5 whitespace-nowrap">
                                  <span className={cn(
                                    "text-xs font-black",
                                    qNum >= 90 ? "text-emerald-600" : qNum >= 75 ? "text-amber-600" : "text-red-600"
                                  )}>
                                    {value}
                                  </span>
                                </td>
                              );
                            }
                            return (
                              <td key={colId} className="px-4 py-3.5 text-sm text-slate-700 font-medium whitespace-nowrap">
                                {value}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table footer */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Showing {SAMPLE_ROWS_RAW.length} rows &middot; {selectedColumns.length} columns
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Sample data for preview purposes
                  </p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <button
                  onClick={() => setBuilderStep(2)}
                  className="btn-secondary-ercs flex items-center gap-2 px-6"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  Back: Edit Columns
                </button>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setSaveTemplateName(reportTitle);
                      setSaveDialogOpen(true);
                    }}
                    className="btn-secondary-ercs flex items-center gap-2 px-6"
                  >
                    <LayoutTemplate className="w-4 h-4" />
                    Save as Template
                  </button>
                  <button
                    onClick={() => {
                      handleGenerate();
                      setActiveTab("history");
                    }}
                    className="btn-primary-ercs flex items-center gap-2 px-8"
                  >
                    <Download className="w-4 h-4" />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 3: GENERATED REPORTS (HISTORY)
          ══════════════════════════════════════════════════════════ */}
      {activeTab === "history" && (
        <div>
          {generatedReports.length === 0 ? (
            <div className="ercs-card-premium p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-2">No reports generated yet</h3>
              <p className="text-sm text-slate-400 font-medium mb-8 max-w-md">
                Use the Report Builder to create your first custom report with drag-and-drop column selection.
              </p>
              <button
                onClick={() => { setActiveTab("builder"); setBuilderStep(1); }}
                className="btn-primary-ercs flex items-center gap-2 px-8"
              >
                <Plus className="w-4 h-4" />
                Create Your First Report
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedReports.map((report) => (
                <div key={report.id} className="ercs-card-premium p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-800">{report.reportTitle}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-violet-600 bg-violet-50">
                          {report.reportType}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600 bg-blue-50">
                          {report.period}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-50">
                          {report.branches.join(", ")}
                        </span>
                        {report.donor !== "All" && (
                          <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-amber-600 bg-amber-50">
                            {report.donor}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-300 font-medium">
                          {report.columns.length} columns
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      report.status === "exported"
                        ? "text-emerald-600 bg-emerald-50"
                        : "text-blue-600 bg-blue-50"
                    )}>
                      {report.status}
                    </span>

                    <button
                      onClick={() => setViewReport(report)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-violet-50 hover:text-violet-600 transition-all active:scale-90"
                      title="View report"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExportExcel(report.reportTitle, report.columns, SAMPLE_ROWS_RAW)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-90"
                      title="Download Excel"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteReport(report.id)}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                      title="Delete report"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          DIALOGS
          ══════════════════════════════════════════════════════════ */}

      {/* ── Template Preview Dialog ──────────────────────────── */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="sm:max-w-[800px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">
                {previewTemplate?.title}
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium">{previewTemplate?.desc}</p>
            </DialogHeader>
          </div>
          <div className="p-8">
            {/* Mini preview table */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Indicator", "Target", "Actual", "Achievement", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SAMPLE_ROWS_RAW.slice(0, 5).map((row, i) => {
                    const pct = row.target > 0 ? Math.round((row.actual / row.target) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-slate-50">
                        <td className="px-4 py-3 text-sm font-medium text-slate-700">{row.indicator}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{row.target.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{row.actual.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-bold">
                          <span className={cn(
                            pct >= 90 ? "text-emerald-600" : pct >= 75 ? "text-amber-600" : "text-red-600"
                          )}>
                            {pct}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-bold">{getTrafficLight(pct)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Export actions */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => {
                  handleExportPDF();
                  setPreviewTemplate(null);
                }}
                className="py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-black hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => {
                  if (previewTemplate) handleExportExcel(previewTemplate.title, ["indicator", "target", "actual", "achievement", "traffic"], SAMPLE_ROWS_RAW);
                  setPreviewTemplate(null);
                }}
                className="py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Export Excel
              </button>
              <button
                onClick={() => {
                  if (previewTemplate) handleExportWord(previewTemplate.title, ["indicator", "target", "actual", "achievement", "traffic"], SAMPLE_ROWS_RAW);
                  setPreviewTemplate(null);
                }}
                className="py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <File className="w-4 h-4" />
                Export Word
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Save Template Dialog ─────────────────────────────── */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">
                Save as Template
              </DialogTitle>
              <p className="text-slate-400 text-sm font-medium">
                Save your column configuration for reuse
              </p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Template Name
              </label>
              <input
                type="text"
                value={saveTemplateName}
                onChange={(e) => setSaveTemplateName(e.target.value)}
                placeholder="e.g. My Quarterly Report Layout"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">
                Columns Included
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedColumns.map((colId) => {
                  const col = COLUMN_MAP[colId];
                  if (!col) return null;
                  return (
                    <span key={colId} className="px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-600 bg-slate-100">
                      {col.label}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setSaveDialogOpen(false)} className="btn-secondary-ercs flex-1">
                Cancel
              </button>
              <button
                onClick={handleSaveTemplate}
                disabled={!saveTemplateName.trim()}
                className={cn(
                  "btn-primary-ercs flex-1",
                  !saveTemplateName.trim() && "opacity-50 cursor-not-allowed"
                )}
              >
                Save Template
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── View Report Dialog (History) ─────────────────────── */}
      <Dialog open={!!viewReport} onOpenChange={(open) => !open && setViewReport(null)}>
        <DialogContent className="sm:max-w-[900px] rounded-3xl p-0 border-none overflow-hidden max-h-[85vh]">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">
                {viewReport?.reportTitle}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-violet-300 bg-violet-500/20">
                  {viewReport?.reportType}
                </span>
                <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-300 bg-blue-500/20">
                  {viewReport?.period}
                </span>
                <span className="text-[10px] text-slate-400 font-medium ml-2">
                  Generated {viewReport ? new Date(viewReport.createdAt).toLocaleDateString() : ""}
                </span>
              </div>
            </DialogHeader>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {viewReport && (
              <>
                <div className="overflow-x-auto rounded-xl border border-slate-200 mb-6">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50">
                        <th className="px-3 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          #
                        </th>
                        {viewReport.columns.map((colId) => {
                          const col = COLUMN_MAP[colId];
                          if (!col) return null;
                          return (
                            <th key={colId} className="px-3 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                              {col.label}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {SAMPLE_ROWS_RAW.map((row, i) => (
                        <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                          <td className="px-3 py-2.5 text-xs text-slate-300 font-bold">{i + 1}</td>
                          {viewReport.columns.map((colId) => (
                            <td key={colId} className="px-3 py-2.5 text-xs text-slate-700 font-medium whitespace-nowrap">
                              {getCellValue(colId, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => {
                      handleExportPDF();
                      setViewReport(null);
                    }}
                    className="py-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-black hover:bg-red-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => {
                      if (viewReport) handleExportExcel(viewReport.reportTitle, viewReport.columns, SAMPLE_ROWS_RAW);
                      setViewReport(null);
                    }}
                    className="py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs font-black hover:bg-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                  </button>
                  <button
                    onClick={() => {
                      if (viewReport) handleExportWord(viewReport.reportTitle, viewReport.columns, SAMPLE_ROWS_RAW);
                      setViewReport(null);
                    }}
                    className="py-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black hover:bg-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <File className="w-4 h-4" />
                    Export Word
                  </button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
