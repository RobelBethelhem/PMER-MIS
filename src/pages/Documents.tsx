import React, { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft, FolderOpen, FileText, Upload, Search, Plus,
  Download, Eye, Trash2, Clock, User, Filter, ChevronRight, File,
  BarChart, ClipboardList, Target
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { addAuditEntry } from "@/hooks/use-store";

/* ─────────────────────────── Types ─────────────────────────── */

interface DocFile {
  id: string;
  title: string;
  author: string;
  date: string;
  branch: string;
  size: string;
  status: "approved" | "draft" | "review";
  type: string;
  archiveCategory: string;
}

interface Archive {
  title: string;
  category: string;
  count: number;
  date: string;
  icon: string;
  color: string;
  bg: string;
  titleColor?: string;
}

/* ─────────────────────────── Constants ─────────────────────────── */

const DOCUMENTS_KEY = "pmer_documents";
const DOC_FILES_KEY = "pmer_doc_files";
const RECENT_UPLOADS_KEY = "pmer_recent_uploads";

const CATEGORY_OPTIONS = ["Assessment", "Reporting", "Evaluation", "Planning", "Tools", "Guidelines", "Policy", "Template"];
const BRANCH_OPTIONS = ["HQ National", "Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali"];
const YEAR_OPTIONS = ["2023", "2024", "2025", "2026"];

const categoryToArchive: Record<string, string> = {
  Assessment: "ASSESSMENT",
  Reporting: "REPORTING",
  Evaluation: "EVALUATION",
  Planning: "PLANNING",
  Tools: "TOOLS",
  Guidelines: "GUIDELINES",
  Policy: "GUIDELINES",
  Template: "TOOLS",
};

const archiveCategoryToUploadCategory: Record<string, string> = {
  ASSESSMENT: "Assessment",
  REPORTING: "Reporting",
  EVALUATION: "Evaluation",
  PLANNING: "Planning",
  TOOLS: "Tools",
  GUIDELINES: "Guidelines",
};

const defaultArchives: Archive[] = [
  { title: "Needs Assessments", category: "ASSESSMENT", count: 12, date: "Jun 2025", icon: "FolderOpen", color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Baseline Surveys", category: "ASSESSMENT", count: 8, date: "May 2025", icon: "FolderOpen", color: "text-rose-500", bg: "bg-rose-50", titleColor: "text-rose-600" },
  { title: "Quarterly Monitoring Reports", category: "REPORTING", count: 24, date: "Jun 2025", icon: "FolderOpen", color: "text-rose-500", bg: "bg-rose-50" },
  { title: "Evaluation Reports", category: "EVALUATION", count: 6, date: "Apr 2025", icon: "FolderOpen", color: "text-violet-500", bg: "bg-violet-50" },
  { title: "Logframes & AOPs", category: "PLANNING", count: 18, date: "Jun 2025", icon: "FolderOpen", color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Donor Reports", category: "REPORTING", count: 15, date: "Jun 2025", icon: "FolderOpen", color: "text-rose-500", bg: "bg-rose-50" },
  { title: "PDM Tools", category: "TOOLS", count: 9, date: "Mar 2025", icon: "FolderOpen", color: "text-amber-500", bg: "bg-amber-50" },
  { title: "ToRs & Guidelines", category: "GUIDELINES", count: 11, date: "Feb 2025", icon: "FolderOpen", color: "text-indigo-500", bg: "bg-indigo-50" },
];

/* ─────────────────────────── Mock document generation ─────────────────────────── */

const AUTHORS = [
  "Abebe Kebede", "Sara Tadesse", "Daniel Bekele", "Meron Hailu",
  "Yohannes Gebre", "Hiwot Alemu", "Tesfaye Worku", "Rahel Solomon",
  "Dawit Mengistu", "Bethlehem Assefa", "Samuel Girma", "Tigist Lemma",
];

const BRANCHES = ["Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali"];

const randomPick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomSize = () => `${(Math.random() * 8 + 0.3).toFixed(1)} MB`;
const randomStatus = (): "approved" | "draft" | "review" => randomPick(["approved", "approved", "approved", "draft", "review"]);
const randomType = (): string => randomPick(["PDF", "PDF", "PDF", "DOCX", "XLSX"]);

function generateSeedDocuments(): DocFile[] {
  const docs: DocFile[] = [];
  let id = 1;

  const mkId = () => `seed-${id++}`;
  const mkDate = (m: number, y: number) => `${y}-${String(m).padStart(2, "0")}-${String(Math.floor(Math.random() * 25) + 1).padStart(2, "0")}`;

  // ── Needs Assessments (12) ──
  const naTitle = (branch: string, label: string, q: string) => `${branch} ${label} ${q}`;
  const naTitles = [
    "Addis Ababa Community Needs Assessment Q1 2025",
    "Amhara Emergency Needs Assessment Feb 2025",
    "Oromia Rapid Needs Assessment Mar 2025",
    "SNNPR Household Needs Assessment Q1 2025",
    "Tigray Post-Conflict Needs Assessment Jan 2025",
    "Somali Drought Impact Needs Assessment Q1 2025",
    "Addis Ababa Urban Vulnerability Assessment Apr 2025",
    "Amhara Multi-Sector Needs Assessment Q2 2025",
    "Oromia Food Security Needs Assessment May 2025",
    "SNNPR Health Needs Assessment Q2 2025",
    "Tigray Education Needs Assessment Jun 2025",
    "Somali Displacement Needs Assessment Jun 2025",
  ];
  naTitles.forEach((t, i) => {
    docs.push({
      id: mkId(), title: t, author: AUTHORS[i % AUTHORS.length],
      date: mkDate(Math.floor(i / 2) + 1, 2025), branch: BRANCHES[i % 6],
      size: randomSize(), status: randomStatus(), type: randomType(),
      archiveCategory: "Needs Assessments",
    });
  });

  // ── Baseline Surveys (8) ──
  const bsTitles = [
    "Health Baseline Survey - Addis Ababa 2025",
    "WASH Baseline Assessment - Amhara 2025",
    "Nutrition Baseline Survey - Oromia 2025",
    "Livelihoods Baseline Assessment - SNNPR 2025",
    "Education Baseline Survey - Tigray 2025",
    "Shelter Baseline Assessment - Somali 2025",
    "Protection Baseline Survey - Addis Ababa 2025",
    "DRR Baseline Assessment - Amhara 2025",
  ];
  bsTitles.forEach((t, i) => {
    docs.push({
      id: mkId(), title: t, author: AUTHORS[(i + 3) % AUTHORS.length],
      date: mkDate(Math.floor(i / 2) + 2, 2025), branch: BRANCHES[i % 6],
      size: randomSize(), status: randomStatus(), type: randomType(),
      archiveCategory: "Baseline Surveys",
    });
  });

  // ── Quarterly Monitoring Reports (24) → 4 quarters x 6 branches ──
  const quarters = ["Q1", "Q2", "Q3", "Q4"];
  quarters.forEach((q, qi) => {
    BRANCHES.forEach((branch, bi) => {
      docs.push({
        id: mkId(), title: `${q} 2025 Monitoring Report - ${branch}`,
        author: AUTHORS[(qi * 6 + bi) % AUTHORS.length],
        date: mkDate(qi * 3 + 2, 2025), branch,
        size: randomSize(), status: qi < 2 ? "approved" : randomStatus(), type: "PDF",
        archiveCategory: "Quarterly Monitoring Reports",
      });
    });
  });

  // ── Evaluation Reports (6) ──
  const erTitles = [
    "Mid-Term Evaluation - DRR Program 2025",
    "End-Line Evaluation - Health Resilience Project",
    "Impact Evaluation - WASH Initiative Amhara",
    "Process Evaluation - Livelihood Recovery Oromia",
    "Summative Evaluation - Education Program Tigray",
    "Real-Time Evaluation - Emergency Response Somali",
  ];
  erTitles.forEach((t, i) => {
    docs.push({
      id: mkId(), title: t, author: AUTHORS[(i + 5) % AUTHORS.length],
      date: mkDate(i + 1, 2025), branch: BRANCHES[i % 6],
      size: randomSize(), status: randomStatus(), type: randomType(),
      archiveCategory: "Evaluation Reports",
    });
  });

  // ── Logframes & AOPs (18) ──
  const lfPrograms = ["DRR", "Health", "WASH", "Nutrition", "Education", "Livelihoods"];
  const lfTypes = ["Logframe", "Annual Operating Plan", "Results Framework"];
  lfPrograms.forEach((prog, pi) => {
    lfTypes.forEach((lt, ti) => {
      docs.push({
        id: mkId(), title: `${prog} ${lt} - FY2025`,
        author: AUTHORS[(pi + ti) % AUTHORS.length],
        date: mkDate(ti + 1, 2025), branch: BRANCHES[pi % 6],
        size: randomSize(), status: randomStatus(), type: ti === 2 ? "XLSX" : "DOCX",
        archiveCategory: "Logframes & AOPs",
      });
    });
  });

  // ── Donor Reports (15) ──
  const donors = ["ICRC", "IFRC", "USAID", "EU Humanitarian", "UNICEF"];
  const drPeriods = ["Q1 2025", "Q2 2025", "Annual 2024"];
  donors.forEach((d, di) => {
    drPeriods.forEach((p, pi) => {
      docs.push({
        id: mkId(), title: `${d} Donor Report - ${p}`,
        author: AUTHORS[(di + pi + 2) % AUTHORS.length],
        date: mkDate(pi * 3 + 3, pi === 2 ? 2024 : 2025), branch: "HQ National",
        size: randomSize(), status: pi === 0 ? "approved" : randomStatus(), type: "PDF",
        archiveCategory: "Donor Reports",
      });
    });
  });

  // ── PDM Tools (9) ──
  const pdmTitles = [
    "Post-Distribution Monitoring Tool - Food Aid",
    "PDM Questionnaire - NFI Distribution",
    "PDM Survey Template - Cash Transfer",
    "PDM Analysis Framework - Shelter Kits",
    "Post-Distribution Monitoring Guide - Seeds",
    "PDM Checklist - Hygiene Kit Distribution",
    "PDM Data Collection Tool - Emergency Relief",
    "PDM Reporting Template - Multi-Sector",
    "PDM Quality Assurance Checklist",
  ];
  pdmTitles.forEach((t, i) => {
    docs.push({
      id: mkId(), title: t, author: AUTHORS[(i + 7) % AUTHORS.length],
      date: mkDate(Math.min(i + 1, 12), 2025), branch: i < 6 ? BRANCHES[i] : "HQ National",
      size: randomSize(), status: randomStatus(), type: i % 3 === 2 ? "XLSX" : randomType(),
      archiveCategory: "PDM Tools",
    });
  });

  // ── ToRs & Guidelines (11) ──
  const tgTitles = [
    "Terms of Reference - Mid-Term Evaluation DRR",
    "PMER Guidelines Manual 2025",
    "Data Collection Standard Operating Procedures",
    "Ethical Guidelines for Research & Evaluation",
    "ToR Template - Baseline Survey",
    "Indicator Reference Guide - Health Programs",
    "ToR - End-Line Evaluation WASH Project",
    "Monitoring Field Visit Guidelines",
    "Data Quality Assurance Protocol",
    "ToR - Real-Time Evaluation Framework",
    "Reporting Standards & Templates Guide",
  ];
  tgTitles.forEach((t, i) => {
    docs.push({
      id: mkId(), title: t, author: AUTHORS[(i + 4) % AUTHORS.length],
      date: mkDate(Math.min(i + 1, 12), 2025), branch: "HQ National",
      size: randomSize(), status: i < 4 ? "approved" : randomStatus(), type: i % 4 === 0 ? "DOCX" : "PDF",
      archiveCategory: "ToRs & Guidelines",
    });
  });

  return docs;
}

/* ─────────────────────────── Component ─────────────────────────── */

export default function Documents() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [selectedArchive, setSelectedArchive] = useState<Archive | null>(null);
  const [detailSearch, setDetailSearch] = useState("");

  // ── localStorage-backed archives ──
  const [archives, setArchives] = useState<Archive[]>(() => {
    try {
      const stored = localStorage.getItem(DOCUMENTS_KEY);
      return stored ? JSON.parse(stored) : defaultArchives;
    } catch { return defaultArchives; }
  });

  // ── localStorage-backed document files ──
  const [docFiles, setDocFiles] = useState<DocFile[]>(() => {
    try {
      const stored = localStorage.getItem(DOC_FILES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return generateSeedDocuments();
    } catch { return generateSeedDocuments(); }
  });

  // ── Recent uploads ──
  const [recentUploads, setRecentUploads] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(RECENT_UPLOADS_KEY) || "[]");
    } catch { return []; }
  });

  // Persist
  useEffect(() => { localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(archives)); }, [archives]);
  useEffect(() => { localStorage.setItem(DOC_FILES_KEY, JSON.stringify(docFiles)); }, [docFiles]);
  useEffect(() => { localStorage.setItem(RECENT_UPLOADS_KEY, JSON.stringify(recentUploads)); }, [recentUploads]);

  // Seed on first load
  useEffect(() => {
    if (!localStorage.getItem(DOCUMENTS_KEY)) localStorage.setItem(DOCUMENTS_KEY, JSON.stringify(defaultArchives));
  }, []);

  // ── New document form ──
  const [newDoc, setNewDoc] = useState({
    title: "", category: "Assessment", project: "", branch: "HQ National", year: "2025", description: "",
  });

  const handleUpload = () => {
    if (!newDoc.title.trim()) {
      toast({ title: "Missing title", description: "Document title is required.", variant: "destructive" });
      return;
    }
    // Increment matching archive card count
    const archiveCat = categoryToArchive[newDoc.category] || "TOOLS";
    setArchives((prev) => prev.map((a) =>
      a.category === archiveCat ? { ...a, count: a.count + 1 } : a
    ));

    // Find the matching archive title to assign archiveCategory
    const matchingArchive = archives.find((a) => a.category === archiveCat);
    const archiveName = matchingArchive ? matchingArchive.title : "PDM Tools";

    // Create the individual document file record
    const newDocFile: DocFile = {
      id: `upload-${Date.now()}`,
      title: newDoc.title.trim(),
      author: "System Admin",
      date: new Date().toISOString().slice(0, 10),
      branch: newDoc.branch,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      status: "draft",
      type: fileName ? fileName.split(".").pop()?.toUpperCase() || "PDF" : "PDF",
      archiveCategory: archiveName,
    };
    setDocFiles((prev) => [newDocFile, ...prev]);

    // Add to recent uploads
    const upload = {
      id: Date.now().toString(),
      title: newDoc.title.trim(),
      category: newDoc.category,
      branch: newDoc.branch,
      year: newDoc.year,
      project: newDoc.project,
      fileName: fileName || "document.pdf",
      uploadedAt: new Date().toISOString().replace("T", " ").slice(0, 16),
    };
    setRecentUploads((prev) => [upload, ...prev].slice(0, 20));

    addAuditEntry({ user: "System Admin", action: `Uploaded document: ${newDoc.title.trim()}`, type: "data_entry", module: "Documents" });
    toast({ title: "Document uploaded", description: `"${newDoc.title.trim()}" has been archived successfully.`, variant: "success" });
    setNewDoc({ title: "", category: "Assessment", project: "", branch: "HQ National", year: "2025", description: "" });
    setFileName("");
    setUploadOpen(false);
  };

  // ── Filtered archives by search ──
  const filteredArchives = useMemo(() => {
    if (!searchQuery.trim()) return archives;
    const q = searchQuery.toLowerCase();
    return archives.filter((a) =>
      a.title.toLowerCase().includes(q) || a.category.toLowerCase().includes(q)
    );
  }, [archives, searchQuery]);

  // ── Documents for selected archive ──
  const archiveDocuments = useMemo(() => {
    if (!selectedArchive) return [];
    let filtered = docFiles.filter((d) => d.archiveCategory === selectedArchive.title);
    if (detailSearch.trim()) {
      const q = detailSearch.toLowerCase();
      filtered = filtered.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q) ||
        d.branch.toLowerCase().includes(q) ||
        d.status.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [selectedArchive, docFiles, detailSearch]);

  // ── Dynamic stats ──
  const totalDocs = archives.reduce((sum, a) => sum + a.count, 0);
  const assessments = archives.filter((a) => a.category === "ASSESSMENT").reduce((s, a) => s + a.count, 0);
  const reports = archives.filter((a) => a.category === "REPORTING").reduce((s, a) => s + a.count, 0);
  const planning = archives.filter((a) => a.category === "PLANNING").reduce((s, a) => s + a.count, 0);

  const computedStats = [
    { label: "Total Documents", value: String(totalDocs), icon: FolderOpen, color: "text-rose-500", bg: "bg-rose-50" },
    { label: "Assessments", value: String(assessments), icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50" },
    { label: "Reports", value: String(reports), icon: BarChart, color: "text-amber-500", bg: "bg-amber-50" },
    { label: "Planning Docs", value: String(planning), icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
  ];

  // ── Action handlers ──
  const handleViewDoc = (doc: DocFile) => {
    toast({ title: "Opening document...", description: `Viewing "${doc.title}"`, variant: "default" });
  };

  const handleDownloadDoc = (doc: DocFile) => {
    const content = `PMER-MIS Document Export\n\nTitle: ${doc.title}\nAuthor: ${doc.author}\nBranch: ${doc.branch}\nDate: ${doc.date}\nStatus: ${doc.status}\nType: ${doc.type}\n\n---\nThis is a mock document export generated by the PMER-MIS system.\nThe actual document content would be retrieved from the document management server.`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: `"${doc.title}" is downloading.`, variant: "success" });
  };

  const handleDeleteDoc = (doc: DocFile) => {
    setDocFiles((prev) => prev.filter((d) => d.id !== doc.id));
    // Decrement matching archive count
    setArchives((prev) => prev.map((a) =>
      a.title === doc.archiveCategory ? { ...a, count: Math.max(0, a.count - 1) } : a
    ));
    addAuditEntry({ user: "System Admin", action: `Deleted document: ${doc.title}`, type: "data_entry", module: "Documents" });
    toast({ title: "Document deleted", description: `"${doc.title}" has been removed.`, variant: "destructive" });
  };

  const handleArchiveClick = (archive: Archive) => {
    setSelectedArchive(archive);
    setDetailSearch("");
  };

  const handleBackToGallery = () => {
    setSelectedArchive(null);
    setDetailSearch("");
  };

  // ── Status badge helper ──
  const statusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">Approved</span>;
      case "draft":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase bg-amber-50 text-amber-600 border border-amber-100">Draft</span>;
      case "review":
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase bg-blue-50 text-blue-600 border border-blue-100">Under Review</span>;
      default:
        return null;
    }
  };

  // ── File type badge helper ──
  const typeBadge = (fileType: string) => {
    switch (fileType) {
      case "PDF":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-rose-50 text-rose-500 border border-rose-100"><File className="w-3 h-3" />PDF</span>;
      case "DOCX":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-blue-50 text-blue-500 border border-blue-100"><File className="w-3 h-3" />DOCX</span>;
      case "XLSX":
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-emerald-50 text-emerald-500 border border-emerald-100"><File className="w-3 h-3" />XLSX</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black tracking-wider uppercase bg-slate-50 text-slate-500 border border-slate-100"><File className="w-3 h-3" />{fileType}</span>;
    }
  };

  // ── Category badge color helper ──
  const categoryBadgeClass = (cat: string) => {
    switch (cat) {
      case "ASSESSMENT": return "bg-blue-50 text-blue-600";
      case "REPORTING": return "bg-rose-50 text-rose-600";
      case "EVALUATION": return "bg-violet-50 text-violet-600";
      case "PLANNING": return "bg-emerald-50 text-emerald-600";
      case "TOOLS": return "bg-amber-50 text-amber-600";
      case "GUIDELINES": return "bg-indigo-50 text-indigo-600";
      default: return "bg-slate-100 text-slate-500";
    }
  };

  /* ════════════════════════════════════════════════════════════════
     ARCHIVE DETAIL VIEW
     ════════════════════════════════════════════════════════════════ */
  if (selectedArchive) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
        {/* ── Detail Hero ── */}
        <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8">
              <button
                onClick={handleBackToGallery}
                className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:border-rose-200 transition-all shadow-sm"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase", categoryBadgeClass(selectedArchive.category))}>
                    {selectedArchive.category}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {archiveDocuments.length} Documents
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight">{selectedArchive.title}</h1>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8">
              <div className="relative group flex-1 max-w-lg">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={detailSearch}
                  onChange={(e) => setDetailSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all"
                  placeholder="Search documents in this archive..."
                />
              </div>
              <button onClick={() => setUploadOpen(true)} className="btn-primary-ercs flex items-center gap-2 px-8">
                <Upload className="w-5 h-5" />
                <span>Upload Document</span>
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        </div>

        {/* ── Documents Table ── */}
        <div className="ercs-card-premium overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">Documents</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">
                {archiveDocuments.length} document{archiveDocuments.length !== 1 ? "s" : ""} in this archive
                {detailSearch.trim() && <span className="text-blue-500"> (filtered)</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Filter className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-wider">
                {archiveDocuments.filter((d) => d.status === "approved").length} Approved
              </span>
            </div>
          </div>

          {archiveDocuments.length === 0 ? (
            <div className="p-16 text-center">
              <FolderOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h4 className="text-lg font-black text-slate-400 mb-2">No documents found</h4>
              <p className="text-sm text-slate-400 font-medium">
                {detailSearch.trim()
                  ? "Try adjusting your search query."
                  : "Upload a document to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Title</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Author</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date Uploaded</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Branch</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Size</th>
                    <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {archiveDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          {typeBadge(doc.type)}
                          <span className="text-sm font-black text-slate-800 leading-tight">{doc.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-300" />
                          <span className="text-[13px] font-bold text-slate-600">{doc.author}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-medium text-slate-400 font-mono">{doc.date}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[13px] font-black text-slate-800">{doc.branch}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[12px] font-medium text-slate-400">{doc.size}</span>
                      </td>
                      <td className="px-6 py-5">
                        {statusBadge(doc.status)}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDoc(doc)}
                            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50 transition-all"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadDoc(doc)}
                            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-emerald-500 hover:border-emerald-200 hover:bg-emerald-50 transition-all"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc)}
                            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Dialog (also available from detail view) */}
        {renderUploadDialog()}
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     UPLOAD DIALOG (shared between both views)
     ════════════════════════════════════════════════════════════════ */
  function renderUploadDialog() {
    return (
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">Upload Document</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Add a new document to the institutional knowledge repository</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Document Title</label>
              <input
                value={newDoc.title}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Q2 Monitoring Report - Oromia"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Category</label>
              <select
                value={newDoc.category}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Project / Program</label>
              <input
                value={newDoc.project}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, project: e.target.value }))}
                placeholder="e.g. ICRC Disaster Response"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Branch</label>
                <select
                  value={newDoc.branch}
                  onChange={(e) => setNewDoc((prev) => ({ ...prev, branch: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
                >
                  {BRANCH_OPTIONS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Year</label>
                <select
                  value={newDoc.year}
                  onChange={(e) => setNewDoc((prev) => ({ ...prev, year: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
                >
                  {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea
                value={newDoc.description}
                onChange={(e) => setNewDoc((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Brief description of the document content..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">File Upload</label>
              <label className="flex items-center gap-3 w-full bg-slate-50 border border-dashed border-slate-300 rounded-2xl px-4 py-3.5 cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all">
                <Upload className="w-5 h-5 text-slate-400" />
                <span className="text-sm font-medium text-slate-500">{fileName || "Choose a file..."}</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setFileName(file ? file.name : "");
                  }}
                />
              </label>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setUploadOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
              <button type="button" onClick={handleUpload} className="btn-primary-ercs flex-1">Upload Document</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  /* ════════════════════════════════════════════════════════════════
     ARCHIVE GALLERY VIEW (default)
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Digital Archives</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight">Knowledge</h1>
              <h1 className="text-6xl font-black text-[#E11D48] italic tracking-tight">Repository</h1>
              <p className="text-lg font-medium text-slate-500 mt-6 max-w-xl">
                Centralized institutional knowledge base for the PMER lifecycle and Society-wide resources.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative group flex-1 lg:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all"
                  placeholder="Search institutional archives..."
                />
              </div>
              <button onClick={() => setUploadOpen(true)} className="btn-primary-ercs flex items-center gap-2 px-8">
                <Plus className="w-5 h-5" />
                <span>New Archive</span>
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {computedStats.map((stat, i) => (
          <div key={i} className="ercs-card-premium p-8 flex items-center gap-6 group hover-lift">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Archives Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {filteredArchives.map((archive, i) => (
          <div
            key={i}
            onClick={() => handleArchiveClick(archive)}
            className="ercs-card-premium p-8 flex flex-col group hover-lift cursor-pointer"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-10 shadow-sm", archive.bg)}>
              <FolderOpen className={cn("w-5 h-5", archive.color)} />
            </div>

            <h2 className={cn("text-lg font-black tracking-tight leading-tight mb-4", archive.titleColor || "text-slate-800")}>
              {archive.title}
            </h2>

            <div className="mb-8">
              <span className={cn(
                "px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase",
                categoryBadgeClass(archive.category)
              )}>
                {archive.category}
              </span>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{archive.count} Documents</span>
              </div>
              <div className="flex items-center gap-1 text-slate-300 group-hover:text-[#E11D48] transition-colors">
                <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Uploads ── */}
      {recentUploads.length > 0 && (
        <div className="ercs-card-premium overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Recent Uploads</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Last 5 documents added to the knowledge repository</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Branch</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Year</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Uploaded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentUploads.slice(0, 5).map((doc: any) => (
                  <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-rose-400" />
                        <span className="text-sm font-black text-slate-800">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        {doc.category}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-black text-slate-800">{doc.branch}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-medium text-slate-500">{doc.year}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[12px] font-medium text-slate-400 font-mono">{doc.uploadedAt}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Upload Document Dialog ── */}
      {renderUploadDialog()}
    </div>
  );
}
