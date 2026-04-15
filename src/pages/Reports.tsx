<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reportTemplates } from "@/data/mockData";
import { FileText, Download, FileSpreadsheet, FileType } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Automated report templates and exports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map(rt => (
          <Card key={rt.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary/60" />
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">{rt.frequency}</Badge>
                  {rt.donorSpecific && <Badge className="bg-traffic-yellow/20 text-foreground text-[10px]">{rt.donorCode}</Badge>}
                </div>
              </div>
              <CardTitle className="text-base mt-2">{rt.name}</CardTitle>
              <CardDescription className="text-xs">{rt.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs flex-1"><Download className="h-3 w-3 mr-1" /> PDF</Button>
                <Button size="sm" variant="outline" className="text-xs flex-1"><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Button>
                <Button size="sm" variant="outline" className="text-xs flex-1"><FileType className="h-3 w-3 mr-1" /> Word</Button>
              </div>
            </CardContent>
          </Card>
=======
import React from "react";
import { 
  FileText, Search, Plus, Download, 
  RotateCw, ChevronRight, File, 
  FileSpreadsheet, FileBox
} from "lucide-react";
import { cn } from "@/lib/utils";

const reports = [
  { 
    title: "Monthly Narrative Report", 
    desc: "Auto-populated narrative report with key achievements and challenges", 
    category: "MONTHLY", 
    categoryColor: "text-blue-600 bg-blue-50"
  },
  { 
    title: "Quarterly Consolidated Report", 
    desc: "Comprehensive quarterly report with indicator performance and financials", 
    category: "QUARTERLY", 
    categoryColor: "text-violet-600 bg-violet-50"
  },
  { 
    title: "Semi-Annual Report", 
    desc: "Mid-year review with progress against annual targets", 
    category: "SEMI-ANNUAL", 
    categoryColor: "text-slate-600 bg-slate-50"
  },
  { 
    title: "Annual Statistical Summary", 
    desc: "End-of-year statistical summary with trend analysis", 
    category: "ANNUAL", 
    categoryColor: "text-amber-600 bg-amber-50"
  },
  { 
    title: "IFRC Federation Report", 
    desc: "Donor-specific report template for IFRC", 
    category: "QUARTERLY", 
    donor: "IFRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-violet-600 bg-violet-50"
  },
  { 
    title: "ICRC Cooperation Report", 
    desc: "Donor-specific report for ICRC cooperation activities", 
    category: "SEMI-ANNUAL", 
    donor: "ICRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-slate-600 bg-slate-50"
  },
  { 
    title: "Norwegian RC Partnership Report", 
    desc: "Partnership report for Norwegian Red Cross funded programs", 
    category: "QUARTERLY", 
    donor: "NRC",
    donorColor: "text-amber-700 bg-amber-100",
    categoryColor: "text-violet-600 bg-violet-50"
  },
];

export default function Reports() {
  return (
    <div className="page-container pb-20">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-violet-600 font-black text-[10px] uppercase tracking-[0.2em]">Reporting Suite</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="hero-title text-5xl">Performance</h1>
              <h1 className="hero-title text-5xl text-[#E11D48] italic">Intelligence</h1>
              <p className="hero-subtitle mt-6">
                Standardized donor and internal reporting templates with automated data synchronization.
              </p>
            </div>

            <button className="btn-secondary-ercs flex items-center gap-3 px-8">
              <RotateCw className="w-5 h-5 text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Sync Repositories</span>
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Reports Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {reports.map((report, i) => (
          <div key={i} className="ercs-card-premium p-8 flex flex-col group hover-lift cursor-pointer">
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

            <div className="grid grid-cols-3 gap-3">
               {["PDF", "EXCEL", "WORD"].map((type) => (
                 <button key={type} className="py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 hover:bg-white hover:text-[#E11D48] hover:border-[#E11D48]/30 transition-all active:scale-95 shadow-sm">
                   {type}
                 </button>
               ))}
            </div>
          </div>
>>>>>>> e0b16a6 (commit)
        ))}
      </div>
    </div>
  );
}
