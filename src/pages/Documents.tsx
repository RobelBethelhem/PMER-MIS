<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, File, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const folders = [
  { name: "Needs Assessments", count: 12, updated: "Jun 2025" },
  { name: "Baseline Surveys", count: 8, updated: "May 2025" },
  { name: "Quarterly Monitoring Reports", count: 24, updated: "Jun 2025" },
  { name: "Evaluation Reports", count: 6, updated: "Apr 2025" },
  { name: "Logframes & AOPs", count: 18, updated: "Jun 2025" },
  { name: "Donor Reports", count: 15, updated: "Jun 2025" },
  { name: "PDM Tools", count: 9, updated: "Mar 2025" },
  { name: "ToRs & Guidelines", count: 11, updated: "Feb 2025" },
=======
import React from "react";
import { 
  FolderOpen, Search, Plus, FileText, 
  BarChart, PieChart, ClipboardList, Target,
  Download, Clock, ChevronRight, FileCheck,
  Briefcase
} from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Documents", value: "103", icon: FolderOpen, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "Assessments", value: "20", icon: ClipboardList, color: "text-blue-500", bg: "bg-blue-50" },
  { label: "Reports", value: "39", icon: BarChart, color: "text-amber-500", bg: "bg-amber-50" },
  { label: "Planning Docs", value: "18", icon: Target, color: "text-emerald-500", bg: "bg-emerald-50" },
];

const archives = [
  { title: "Needs Assessments", category: "ASSESSMENT", count: 12, date: "Jun 2025", icon: FolderOpen, color: "text-blue-500", bg: "bg-blue-50" },
  { title: "Baseline Surveys", category: "ASSESSMENT", count: 8, date: "May 2025", icon: FolderOpen, color: "text-rose-500", bg: "bg-rose-50", titleColor: "text-rose-600" },
  { title: "Quarterly Monitoring Reports", category: "REPORTING", count: 24, date: "Jun 2025", icon: FolderOpen, color: "text-rose-500", bg: "bg-rose-50" },
  { title: "Evaluation Reports", category: "EVALUATION", count: 6, date: "Apr 2025", icon: FolderOpen, color: "text-violet-500", bg: "bg-violet-50" },
  { title: "Logframes & AOPs", category: "PLANNING", count: 18, date: "Jun 2025", icon: FolderOpen, color: "text-emerald-500", bg: "bg-emerald-50" },
  { title: "Donor Reports", category: "REPORTING", count: 15, date: "Jun 2025", icon: FolderOpen, color: "text-rose-500", bg: "bg-rose-50" },
  { title: "PDM Tools", category: "TOOLS", count: 9, date: "Mar 2025", icon: FolderOpen, color: "text-amber-500", bg: "bg-amber-50" },
  { title: "ToRs & Guidelines", category: "GUIDELINES", count: 11, date: "Feb 2025", icon: FolderOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
>>>>>>> e0b16a6 (commit)
];

export default function Documents() {
  return (
<<<<<<< HEAD
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Repository</h1>
        <p className="text-sm text-muted-foreground">Centralized knowledge and document management</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map(f => (
          <Card key={f.name} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <FolderOpen className="h-8 w-8 text-primary/60 mb-3" />
              <p className="font-medium text-sm">{f.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]">{f.count} files</Badge>
                <span className="text-[10px] text-muted-foreground">Updated {f.updated}</span>
              </div>
            </CardContent>
          </Card>
=======
    <div className="page-container pb-20">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Digital Archives</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="hero-title text-6xl">Knowledge</h1>
              <h1 className="hero-title text-6xl text-[#E11D48] italic">Repository</h1>
              <p className="hero-subtitle mt-6">
                Centralized institutional knowledge base for the PMER lifecycle and Society-wide resources.
              </p>
            </div>

            <div className="flex items-center gap-4 w-full lg:w-auto">
               <div className="relative group flex-1 lg:w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-200 font-medium text-sm transition-all"
                    placeholder="Search institutional archives..."
                  />
               </div>
               <button className="btn-primary-ercs flex items-center gap-2 px-8">
                 <Plus className="w-5 h-5" />
                 <span>New Archive</span>
               </button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="ercs-card-premium p-8 flex items-center gap-6 group hover-lift">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label mb-0">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Archives Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {archives.map((archive, i) => (
          <div key={i} className="ercs-card-premium p-8 flex flex-col group hover-lift cursor-pointer">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-10 shadow-sm", archive.bg)}>
               <archive.icon className={cn("w-5 h-5", archive.color)} />
            </div>
            
            <h2 className={cn("text-lg font-black tracking-tight leading-tight mb-4", archive.titleColor || "text-slate-800")}>
              {archive.title}
            </h2>
            
            <div className="mb-8">
               <span className={cn(
                 "px-2.5 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase",
                 archive.category === "ASSESSMENT" ? "bg-blue-50 text-blue-600" :
                 archive.category === "REPORTING" ? "bg-rose-50 text-rose-600" :
                 archive.category === "EVALUATION" ? "bg-violet-50 text-violet-600" :
                 archive.category === "PLANNING" ? "bg-emerald-50 text-emerald-600" :
                 "bg-slate-100 text-slate-500"
               )}>
                 {archive.category}
               </span>
            </div>

            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-2 text-slate-400">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{archive.count} Documents</span>
               </div>
               <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{archive.date}</span>
               </div>
            </div>
          </div>
>>>>>>> e0b16a6 (commit)
        ))}
      </div>
    </div>
  );
}
