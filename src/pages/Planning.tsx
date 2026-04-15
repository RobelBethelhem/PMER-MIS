import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Target, Plus, ChevronLeft, Calendar,
  Users, DollarSign, CheckCircle, Clock,
  FileEdit, Search, ListFilter, LayoutGrid,
  Download, ArrowRight, Activity, TrendingUp,
  MapPin, ShieldCheck, Zap, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { addAuditEntry } from "@/hooks/use-store";

// ── Plan interface and localStorage helpers ──
interface Plan {
  id: string;
  name: string;
  branch: string;
  year: string;
  status: "active" | "draft" | "review";
  description: string;
  priority: string;
  createdAt: string;
}

const STORAGE_KEY = "pmer_plans";

const DEFAULT_PLANS: Plan[] = [
  { id: "plan-aa-001", name: "Addis Ababa Annual Plan", branch: "Addis Ababa", year: "2025", status: "active", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Health & WASH", createdAt: "2024-11-15T08:00:00Z" },
  { id: "plan-am-002", name: "Amhara Annual Plan", branch: "Amhara", year: "2025", status: "draft", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Disaster Risk Mgt.", createdAt: "2024-12-01T08:00:00Z" },
  { id: "plan-or-003", name: "Oromia Annual Plan", branch: "Oromia", year: "2025", status: "draft", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Livelihoods", createdAt: "2024-12-10T08:00:00Z" },
  { id: "plan-sn-004", name: "SNNPR Annual Plan", branch: "SNNPR", year: "2025", status: "active", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Health & WASH", createdAt: "2024-11-20T08:00:00Z" },
  { id: "plan-tg-005", name: "Tigray Annual Plan", branch: "Tigray", year: "2025", status: "active", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Climate Resilience", createdAt: "2024-11-25T08:00:00Z" },
  { id: "plan-so-006", name: "Somali Annual Plan", branch: "Somali", year: "2025", status: "draft", description: "Regional implementation roadmap aligned with national disaster risk reduction and community health programming.", priority: "Disaster Risk Mgt.", createdAt: "2024-12-05T08:00:00Z" },
];

function loadPlans(): Plan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Plan[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLANS));
  return [...DEFAULT_PLANS];
}

function savePlans(plans: Plan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

const STATUS_COLOR: Record<string, string> = {
  active: "bg-emerald-500",
  draft: "bg-amber-500",
  review: "bg-blue-500",
};

const tabs = [
  { id: "objectives", label: "OBJECTIVES" },
  { id: "workplan", label: "WORKPLAN & TIMELINE" },
  { id: "targets", label: "PERIODIC TARGETS" },
  { id: "finance", label: "FINANCIAL RESOURCES" },
  { id: "theory", label: "THEORY OF CHANGE" },
];

export default function Planning() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(() => tabParam ? "Addis Ababa" : null);
  const [activeTab, setActiveTab] = useState(tabParam || "objectives");
  const [multiYearOpen, setMultiYearOpen] = useState(false);
  const [myForm, setMyForm] = useState({ title: "", startYear: "2025", endYear: "2027", priority: "Health & WASH", description: "" });
  const { toast: detailToast } = useToast();

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) {
      setActiveTab(t);
      if (!selectedPlan) setSelectedPlan("Addis Ababa");
    }
  }, [searchParams]);

  const handleDownloadAOP = () => {
    // Generate a text blob as a downloadable AOP document
    const content = `ANNUAL OPERATIONAL PLAN (AOP)\n${"=".repeat(40)}\n\nBranch: ${selectedPlan}\nFiscal Year: 2025\nStatus: Active\n\nStrategic Objectives:\n1. Strengthen community health volunteer network\n2. Expand first aid post coverage\n3. Improve disaster preparedness capacity\n4. Enhance WASH infrastructure\n5. Build livelihood resilience programs\n\nBudget Summary:\n- Total Allocated: ETB 5,400,000\n- Health & WASH: ETB 2,100,000\n- Disaster Risk Mgt: ETB 1,500,000\n- Livelihoods: ETB 1,000,000\n- Institutional Dev: ETB 800,000\n\nTimeline: January 2025 - December 2025\n\nApproved by: ERCS PMER Department\nGenerated: ${new Date().toLocaleDateString()}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AOP_${selectedPlan?.replace(/\s/g, "_")}_2025.txt`;
    a.click();
    URL.revokeObjectURL(url);
    detailToast({ title: "AOP Downloaded", description: `Full AOP for ${selectedPlan} 2025 has been exported.` });
    addAuditEntry({ user: "Admin", action: `Downloaded AOP for ${selectedPlan}`, type: "export", module: "Planning" });
  };

  const handleAddMultiYear = () => {
    if (!myForm.title) { detailToast({ title: "Missing title", description: "Please enter a plan title.", variant: "destructive" }); return; }
    const plans = loadPlans();
    const newPlan: Plan = {
      id: `plan-my-${Date.now()}`,
      name: myForm.title,
      branch: selectedPlan || "HQ National",
      year: `${myForm.startYear}-${myForm.endYear}`,
      status: "draft",
      description: myForm.description || `Multi-year strategic plan for ${selectedPlan} covering ${myForm.startYear}-${myForm.endYear}.`,
      priority: myForm.priority,
      createdAt: new Date().toISOString(),
    };
    savePlans([newPlan, ...plans]);
    addAuditEntry({ user: "Admin", action: `Created multi-year plan "${myForm.title}" for ${selectedPlan}`, type: "data_entry", module: "Planning" });
    detailToast({ title: "Multi-Year Plan Created", description: `${myForm.title} (${myForm.startYear}-${myForm.endYear}) has been added.` });
    setMyForm({ title: "", startYear: "2025", endYear: "2027", priority: "Health & WASH", description: "" });
    setMultiYearOpen(false);
  };

  if (!selectedPlan) {
    return <RegistryView onSelectPlan={setSelectedPlan} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Header ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-10">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-8">
            <button
               onClick={() => setSelectedPlan(null)}
               className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E11D48] shadow-sm transition-all"
            >
               <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2">
               <span className="px-3 py-1 rounded-full bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">Cycle Active</span>
               <span className="px-3 py-1 rounded-full bg-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200">Annual Operational Plan</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
                {selectedPlan} <span className="text-[#E11D48] italic">2025</span>
              </h1>
              <p className="text-slate-500 font-medium mt-6 max-w-xl">
                Detailed breakdown of strategic objectives, activities, and budget allocations for this operational cycle.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/60 p-2 rounded-2xl border border-white/80 backdrop-blur-sm self-start lg:self-center">
              <button onClick={handleDownloadAOP} className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
                 <Download className="w-4 h-4" /> Download Full AOP
              </button>
              <button onClick={() => setMultiYearOpen(true)} className="flex items-center gap-3 px-8 py-4 rounded-xl bg-[#E11D48] text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all">
                 <Plus className="w-5 h-5" />
                 Add Multi-Year Plan
              </button>
            </div>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Multi-Year Plan Dialog ── */}
      <Dialog open={multiYearOpen} onOpenChange={setMultiYearOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">Add Multi-Year Plan</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Create a strategic multi-year plan for {selectedPlan}</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Plan Title</label>
              <input type="text" placeholder="e.g. Community Resilience Strategy 2025-2027" value={myForm.title} onChange={e => setMyForm(f => ({ ...f, title: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Start Year</label>
                <select value={myForm.startYear} onChange={e => setMyForm(f => ({ ...f, startYear: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                  {["2024", "2025", "2026", "2027"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">End Year</label>
                <select value={myForm.endYear} onChange={e => setMyForm(f => ({ ...f, endYear: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                  {["2025", "2026", "2027", "2028", "2029", "2030"].map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Strategic Priority</label>
              <select value={myForm.priority} onChange={e => setMyForm(f => ({ ...f, priority: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                {["Health & WASH", "Disaster Risk Mgt.", "Climate Resilience", "Livelihoods", "Institutional Dev."].map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
              <textarea rows={3} placeholder="Describe the strategic objectives of this multi-year plan..." value={myForm.description} onChange={e => setMyForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none resize-none" />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setMultiYearOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
              <button onClick={handleAddMultiYear} className="btn-primary-ercs flex-1">Create Multi-Year Plan</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Tabs Navigation ── */}
      <div className="flex flex-wrap gap-2 mb-10 bg-slate-100/50 p-2 rounded-2xl w-fit">
         {tabs.map((tab) => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                 activeTab === tab.id 
                  ? "bg-white text-[#E11D48] shadow-sm" 
                  : "text-slate-400 hover:text-slate-600"
               )}
            >
               {tab.label}
            </button>
         ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
         {activeTab === "objectives" && <ObjectivesView />}
         {activeTab === "theory" && <TheoryOfChangeView />}
         {activeTab === "targets" && <PeriodicTargetsView />}
         {activeTab === "workplan" && <WorkplanView />}
         {activeTab === "finance" && <FinancialResourcesView />}
      </div>
    </div>
  );
}

function RegistryView({ onSelectPlan }: { onSelectPlan: (p: string) => void }) {
   const { toast } = useToast();
   const [plans, setPlans] = useState<Plan[]>(() => loadPlans());
   const [dialogOpen, setDialogOpen] = useState(false);
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedYear, setSelectedYear] = useState("All");

   // ── Form state ──
   const [formBranch, setFormBranch] = useState("");
   const [formYear, setFormYear] = useState("");
   const [formTitle, setFormTitle] = useState("");
   const [formPriority, setFormPriority] = useState("");
   const [formDescription, setFormDescription] = useState("");
   const [formStatus, setFormStatus] = useState<"active" | "draft" | "review">("draft");

   const resetForm = useCallback(() => {
      setFormBranch("");
      setFormYear("");
      setFormTitle("");
      setFormPriority("");
      setFormDescription("");
      setFormStatus("draft");
   }, []);

   const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault();
      if (!formBranch || !formYear || !formTitle || !formPriority) {
         toast({ title: "Validation Error", description: "Please fill in all required fields.", variant: "destructive" });
         return;
      }
      const newPlan: Plan = {
         id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
         name: formTitle,
         branch: formBranch,
         year: formYear,
         status: formStatus,
         description: formDescription || "No description provided.",
         priority: formPriority,
         createdAt: new Date().toISOString(),
      };
      const updated = [newPlan, ...plans];
      setPlans(updated);
      savePlans(updated);
      try {
         addAuditEntry({ user: "Current User", action: "Created planning cycle", module: "Planning", detail: `${formTitle} (${formBranch} ${formYear})` });
      } catch { /* audit not critical */ }
      toast({ title: "Plan Created", description: `"${formTitle}" has been added to the registry.`, variant: "success" });
      setDialogOpen(false);
      resetForm();
   }, [formBranch, formYear, formTitle, formPriority, formDescription, formStatus, plans, toast, resetForm]);

   // ── Filtering ──
   const filteredPlans = plans.filter(p => {
      const matchesSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = selectedYear === "All" || p.year === selectedYear;
      return matchesSearch && matchesYear;
   });

   const yearButtons = ["All", "2024", "2025", "2026", "2027"];

   // Sidebar stats (dynamic)
   const activeCount = plans.filter(p => p.status === "active").length;
   const draftCount = plans.filter(p => p.status === "draft").length;
   const reviewCount = plans.filter(p => p.status === "review").length;
   const totalCount = plans.length;

   return (
      <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
         {/* ── Hero section ── */}
         <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-[#E11D48] flex items-center justify-center text-white shadow-lg">
                     <Target className="w-5 h-5" />
                  </div>
                  <span className="text-[#E11D48] font-black text-[10px] uppercase tracking-[0.2em]">Institutional Registry</span>
               </div>

               <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div>
                     <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
                        Mission <span className="text-[#E11D48] italic">Planning</span>
                     </h1>
                     <p className="text-slate-500 font-medium mt-6 max-w-2xl">
                        Governance of institutional operational plans across the Society's national network and thematic sectors.
                     </p>
                  </div>

                  <button
                     onClick={() => { resetForm(); setDialogOpen(true); }}
                     className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-[#E11D48] text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all self-start lg:self-center"
                  >
                     <Plus className="w-5 h-5" />
                     New Planning Cycle
                  </button>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
         </div>

         {/* ── Lower Section with Sidebar ── */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

            {/* Sidebar Stats */}
            <div className="lg:col-span-3 space-y-8">
               <div className="ercs-card-premium p-8">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
                        <ShieldCheck className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Status Registry</span>
                  </div>

                  <div className="space-y-6">
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                           <span className="text-slate-400">Approved Level</span>
                           <span className="text-slate-800">{activeCount} / {totalCount}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all" style={{ width: totalCount > 0 ? `${(activeCount / totalCount) * 100}%` : "0%" }} />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                           <span className="text-slate-400">Drafting Phase</span>
                           <span className="text-slate-800">{draftCount} / {totalCount}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500 transition-all" style={{ width: totalCount > 0 ? `${(draftCount / totalCount) * 100}%` : "0%" }} />
                        </div>
                     </div>
                     {reviewCount > 0 && (
                        <div>
                           <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                              <span className="text-slate-400">Under Review</span>
                              <span className="text-slate-800">{reviewCount} / {totalCount}</span>
                           </div>
                           <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 transition-all" style={{ width: totalCount > 0 ? `${(reviewCount / totalCount) * 100}%` : "0%" }} />
                           </div>
                        </div>
                     )}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-100">
                     <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-4 h-4 text-rose-500" />
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Policy Insight</span>
                     </div>
                     <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                        Aggregated alignment score: <span className="text-slate-900 font-black">87.4%</span>. Overall Society compliance is high for the current fiscal cycle.
                     </p>
                  </div>
               </div>

               <div className="ercs-card-premium p-8">
                  <div className="flex items-center gap-4 mb-8">
                     <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100">
                        <LayoutGrid className="w-5 h-5" />
                     </div>
                     <span className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Strategic Pillars</span>
                  </div>
                  <div className="space-y-4">
                     {["Health & WASH", "Disaster Risk Mgt.", "Climate Resilience", "Livelihoods", "Institutional Dev."].map((p, i) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-800 transition-colors">{p}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Registry Grid */}
            <div className="lg:col-span-9 ercs-card-premium p-0 overflow-hidden min-h-[800px]">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                  <div className="relative group flex-1 max-w-xl">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <input
                        className="w-full bg-slate-50/50 border-none pl-12 pr-4 py-4 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-rose-500/20"
                        placeholder="Search Registry..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                     {yearButtons.map((yr) => (
                        <button
                           key={yr}
                           onClick={() => setSelectedYear(yr)}
                           className={cn(
                              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                              selectedYear === yr
                                 ? "bg-rose-600 text-white"
                                 : "text-slate-400 hover:text-slate-600"
                           )}
                        >
                           {yr}
                        </button>
                     ))}
                  </div>
               </div>

               {filteredPlans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                     <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-6">
                        <Search className="w-7 h-7 text-slate-300" />
                     </div>
                     <h3 className="text-lg font-black text-slate-400 mb-2">No Plans Found</h3>
                     <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest max-w-xs">
                        {searchQuery || selectedYear !== "All" ? "Try adjusting your search or year filter." : "Create your first planning cycle using the button above."}
                     </p>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-50">
                     {filteredPlans.map((b) => (
                        <div key={b.id} className="bg-white p-10 group hover:bg-slate-50/50 transition-all relative">
                           <div className="flex items-start justify-between mb-8">
                              <div className="flex items-center gap-3">
                                 <div className={cn("w-2 h-2 rounded-full", STATUS_COLOR[b.status] || "bg-slate-400")} />
                                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{b.branch}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-lg">{b.year}</span>
                                 <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border",
                                    b.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                    b.status === "review" ? "bg-blue-50 text-blue-600 border-blue-100" :
                                    "bg-amber-50 text-amber-600 border-amber-100"
                                 )}>{b.status}</span>
                              </div>
                           </div>

                           <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2">{b.name}</h3>
                           <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3">{b.priority}</p>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-[280px] line-clamp-2">
                              {b.description}
                           </p>

                           <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                 {[1, 2, 3].map(idx => (
                                    <div key={idx} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-400 uppercase">ER</div>
                                 ))}
                              </div>
                              <button
                                 onClick={() => onSelectPlan(b.branch)}
                                 className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all flex items-center gap-2"
                              >
                                 Open Plan <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* ── New Planning Cycle Dialog ── */}
         <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
               <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
                  <DialogHeader>
                     <DialogTitle className="text-white text-xl font-black tracking-tight">New Planning Cycle</DialogTitle>
                     <p className="text-slate-400 text-sm font-medium">Define a new operational plan for a branch or thematic area</p>
                  </DialogHeader>
               </div>
               <form onSubmit={handleSubmit} className="p-8 space-y-5">
                  {/* Branch Name */}
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Branch Name <span className="text-rose-500">*</span></label>
                     <select
                        value={formBranch}
                        onChange={(e) => setFormBranch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none"
                     >
                        <option value="">Select branch...</option>
                        {["Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali", "Dire Dawa", "Harari"].map(b => (
                           <option key={b} value={b}>{b}</option>
                        ))}
                     </select>
                  </div>

                  {/* Fiscal Year + Status row */}
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Fiscal Year <span className="text-rose-500">*</span></label>
                        <select
                           value={formYear}
                           onChange={(e) => setFormYear(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none"
                        >
                           <option value="">Select year...</option>
                           {["2024", "2025", "2026", "2027"].map(y => (
                              <option key={y} value={y}>{y}</option>
                           ))}
                        </select>
                     </div>
                     <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
                        <select
                           value={formStatus}
                           onChange={(e) => setFormStatus(e.target.value as "active" | "draft" | "review")}
                           className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none"
                        >
                           <option value="draft">Draft</option>
                           <option value="active">Active</option>
                           <option value="review">Under Review</option>
                        </select>
                     </div>
                  </div>

                  {/* Plan Title */}
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Plan Title <span className="text-rose-500">*</span></label>
                     <input
                        type="text"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g., Dire Dawa Annual Operational Plan 2026"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none placeholder:text-slate-300"
                     />
                  </div>

                  {/* Strategic Priority */}
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Strategic Priority <span className="text-rose-500">*</span></label>
                     <select
                        value={formPriority}
                        onChange={(e) => setFormPriority(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none"
                     >
                        <option value="">Select priority...</option>
                        {["Health & WASH", "Disaster Risk Mgt.", "Climate Resilience", "Livelihoods", "Institutional Dev."].map(p => (
                           <option key={p} value={p}>{p}</option>
                        ))}
                     </select>
                  </div>

                  {/* Description */}
                  <div>
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Description</label>
                     <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        rows={3}
                        placeholder="Brief description of the plan scope and objectives..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none resize-none placeholder:text-slate-300"
                     />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                     <button type="button" onClick={() => setDialogOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
                     <button type="submit" className="btn-primary-ercs flex-1">Create Plan</button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>
      </div>
   );
}

// ── View 1: Objectives ──
function ObjectivesView() {
   const objectives = [
      { 
         id: 1, 
         title: "Strengthen community-based health services", 
         activities: "3 total operational activities",
         progress: 33,
         items: [
            { label: "Train 200 community health...", status: "done" },
            { label: "Establish 10 first aid posts", status: "alert" },
            { label: "Conduct community health...", status: "pending" },
         ]
      },
      { 
         id: 2, 
         title: "Improve emergency preparedness capacity", 
         activities: "2 total operational activities",
         progress: 0,
         items: [
            { label: "Pre-position emergency supplies in...", status: "pending" },
            { label: "Conduct simulation exercises", status: "pending" },
         ]
      }
   ];

   return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {objectives.map((obj) => (
            <div key={obj.id} className="ercs-card-premium p-10 flex flex-col group hover-lift">
               <div className="flex items-start justify-between mb-10">
                  <span className="px-3 py-1 rounded-lg bg-rose-50 text-[10px] font-black text-rose-500 uppercase tracking-widest border border-rose-100">Objective {obj.id}</span>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full border border-slate-100 text-[11px] font-black text-slate-800">
                     {obj.progress}%
                  </div>
               </div>
               <h3 className="text-xl font-black text-slate-800 leading-tight mb-2 group-hover:text-[#E11D48] transition-colors">{obj.title}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">{obj.activities}</p>
               
               <div className="space-y-3 mt-auto">
                  {obj.items.map((item, i) => (
                     <div key={i} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 animate-in">
                        <div className={cn(
                           "w-6 h-6 rounded-full flex items-center justify-center border",
                           item.status === "done" ? "bg-emerald-50 border-emerald-500 text-emerald-500" :
                           item.status === "alert" ? "bg-rose-50 border-rose-500 text-rose-500 shadow-[0_0_12px_rgba(225,29,72,0.2)]" :
                           "bg-white border-slate-200 text-slate-300"
                        )}>
                           {item.status === "done" ? <CheckCircle className="w-3 h-3" /> : 
                            item.status === "alert" ? <AlertCircle className="w-3 h-3" /> :
                            <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                        <span className="text-[11px] font-black text-slate-600 truncate">{item.label}</span>
                        {item.status === "alert" && <AlertCircle className="w-3.5 h-3.5 text-rose-500 ml-auto" />}
                     </div>
                  ))}
               </div>
            </div>
         ))}
      </div>
   );
}

// ── View 2: Theory of Change (Logframe Hierarchy) ──
function TheoryOfChangeView() {
   const logframe = {
      strategic: "Strengthen community resilience through health, disaster preparedness, and sustainable livelihoods",
      outcomes: [
         {
            title: "Improved community health and WASH outcomes",
            code: "OC-1",
            outputs: [
               { title: "Health volunteers trained and deployed", code: "OP-1.1", activities: ["Recruit 450 volunteers", "Conduct 4-day training", "Deploy to 6 branches"] },
               { title: "First aid infrastructure established", code: "OP-1.2", activities: ["Identify 15 locations", "Setup first aid posts", "Equip with supplies"] },
            ]
         },
         {
            title: "Enhanced disaster preparedness capacity",
            code: "OC-2",
            outputs: [
               { title: "Emergency simulation exercises conducted", code: "OP-2.1", activities: ["Plan 8 simulations", "Coordinate with branches", "Document lessons learned"] },
               { title: "Early warning systems strengthened", code: "OP-2.2", activities: ["Assess existing systems", "Train community focal points", "Install alert mechanisms"] },
            ]
         },
      ]
   };

   return (
      <div className="ercs-card-premium p-10">
         {/* Header */}
         <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
               <Target className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Logframe Visualization</h2>
               <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                  Theory of Change hierarchy: Strategic Priority &rarr; Outcome &rarr; Output &rarr; Activity
               </p>
            </div>
         </div>

         {/* Level Legend */}
         <div className="flex flex-wrap items-center gap-6 mb-10 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
               <div className="w-4 h-2.5 rounded-sm bg-rose-500" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Strategic Priority</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-2.5 rounded-sm bg-blue-500" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Outcome</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-2.5 rounded-sm bg-emerald-500" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Output</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-4 h-2.5 rounded-sm bg-slate-400" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Activity</span>
            </div>
         </div>

         {/* ── Strategic Priority (Top Level) ── */}
         <div className="flex flex-col items-center">
            <div className="w-full max-w-3xl bg-gradient-to-r from-rose-500 to-rose-600 rounded-2xl p-8 shadow-xl shadow-rose-500/15 text-center relative">
               <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-[9px] font-black text-white uppercase tracking-widest mb-4">
                  Strategic Priority
               </span>
               <h3 className="text-lg font-black text-white leading-tight">{logframe.strategic}</h3>
            </div>

            {/* Connecting line from SP down */}
            <div className="w-0.5 h-10 bg-slate-200" />

            {/* Horizontal branch line */}
            <div className="relative w-full max-w-5xl">
               <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-slate-200" />

               {/* ── Outcomes (Second Level) ── */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-0">
                  {logframe.outcomes.map((outcome, oi) => (
                     <div key={oi} className="flex flex-col items-center">
                        {/* Vertical connector to horizontal line */}
                        <div className="w-0.5 h-10 bg-slate-200" />

                        {/* Outcome Card */}
                        <div className="w-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-500/15 relative">
                           <div className="flex items-start justify-between mb-3">
                              <span className="px-3 py-1 rounded-full bg-white/20 text-[9px] font-black text-white uppercase tracking-widest">
                                 Outcome
                              </span>
                              <span className="px-3 py-1 rounded-full bg-white/20 text-[10px] font-black text-white tracking-widest">
                                 {outcome.code}
                              </span>
                           </div>
                           <h4 className="text-sm font-black text-white leading-tight">{outcome.title}</h4>
                        </div>

                        {/* Connecting line from Outcome down */}
                        <div className="w-0.5 h-8 bg-slate-200" />

                        {/* ── Outputs (Third Level) ── */}
                        <div className="w-full space-y-6">
                           {outcome.outputs.map((output, pi) => (
                              <div key={pi} className="flex flex-col items-center">
                                 {pi > 0 && <div className="w-0.5 h-4 bg-slate-200 mb-0" />}

                                 {/* Output Card */}
                                 <div className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-5 shadow-md shadow-emerald-500/10 relative">
                                    <div className="flex items-start justify-between mb-2">
                                       <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black text-white uppercase tracking-widest">
                                          Output
                                       </span>
                                       <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[9px] font-black text-white tracking-widest">
                                          {output.code}
                                       </span>
                                    </div>
                                    <h5 className="text-[13px] font-black text-white leading-tight">{output.title}</h5>
                                 </div>

                                 {/* Connecting line from Output down to Activities */}
                                 <div className="w-0.5 h-4 bg-slate-200" />

                                 {/* ── Activities (Bottom Level) ── */}
                                 <div className="w-full space-y-2 pl-6">
                                    {output.activities.map((act, ai) => (
                                       <div key={ai} className="flex items-center gap-3">
                                          <div className="w-4 h-0 border-t-2 border-dashed border-slate-300 shrink-0" />
                                          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 flex items-center gap-3 hover:border-slate-300 hover:bg-white transition-all group">
                                             <span className="px-2 py-0.5 bg-slate-200 text-[7px] font-black text-slate-600 uppercase tracking-widest rounded shrink-0 group-hover:bg-slate-800 group-hover:text-white transition-all">
                                                ACT
                                             </span>
                                             <span className="text-[11px] font-black text-slate-600">{act}</span>
                                          </div>
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>

         {/* Footer note */}
         <div className="mt-12 pt-8 border-t border-slate-100 flex items-center gap-3">
            <Activity className="w-4 h-4 text-rose-400" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
               2 Outcomes &middot; 4 Outputs &middot; 12 Activities mapped to the strategic result framework
            </p>
         </div>
      </div>
   );
}

// ── View 3: Periodic Targets ──
function PeriodicTargetsView() {
   const indicators = [
      { name: "Community health volunteers trained", unit: "People", q1: [50, 50], q2: [100, 95], q3: [150, 0], q4: [150, 0], annual: 450, sector: "Health" },
      { name: "First aid posts established", unit: "Posts", q1: [2, 2], q2: [5, 4], q3: [5, 0], q4: [3, 0], annual: 15, sector: "Health" },
      { name: "Health awareness sessions conducted", unit: "Sessions", q1: [5, 5], q2: [10, 8], q3: [10, 0], q4: [5, 0], annual: 30, sector: "Health" },
      { name: "WASH facilities constructed/rehabilitated", unit: "Facilities", q1: [0, 0], q2: [3, 2], q3: [5, 0], q4: [4, 0], annual: 12, sector: "WASH" },
      { name: "Households with safe water access", unit: "HH", q1: [200, 180], q2: [500, 420], q3: [800, 0], q4: [500, 0], annual: 2000, sector: "WASH" },
      { name: "Emergency simulation exercises", unit: "Exercises", q1: [0, 0], q2: [2, 2], q3: [3, 0], q4: [3, 0], annual: 8, sector: "DRR" },
      { name: "Early warning focal points trained", unit: "People", q1: [10, 10], q2: [15, 12], q3: [15, 0], q4: [10, 0], annual: 50, sector: "DRR" },
      { name: "Micro-grant beneficiaries supported", unit: "People", q1: [0, 0], q2: [50, 35], q3: [75, 0], q4: [75, 0], annual: 200, sector: "Livelihood" },
      { name: "PSS sessions delivered to IDPs", unit: "Sessions", q1: [0, 0], q2: [0, 0], q3: [12, 0], q4: [12, 0], annual: 24, sector: "PSS" },
      { name: "Blood donation drives completed", unit: "Drives", q1: [0, 0], q2: [0, 0], q3: [2, 0], q4: [3, 0], annual: 5, sector: "Health" },
   ];

   const sectorColors: Record<string, string> = {
      Health: "bg-rose-50 text-rose-500 border-rose-100",
      WASH: "bg-cyan-50 text-cyan-600 border-cyan-100",
      DRR: "bg-amber-50 text-amber-600 border-amber-100",
      Livelihood: "bg-violet-50 text-violet-600 border-violet-100",
      PSS: "bg-teal-50 text-teal-600 border-teal-100",
   };

   const getAchievement = (row: typeof indicators[0]) => {
      const totalTarget = row.q1[0] + row.q2[0] + row.q3[0] + row.q4[0];
      const totalActual = row.q1[1] + row.q2[1] + row.q3[1] + row.q4[1];
      if (totalTarget === 0) return 0;
      return Math.round((totalActual / totalTarget) * 100);
   };

   return (
      <div className="ercs-card-premium p-0 overflow-hidden">
         <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
                  <Clock className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Quarterly Performance Monitor</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                     Target vs. Actual programmatic synchronization across the fiscal cycle.
                  </p>
               </div>
            </div>
            <div className="flex items-center gap-3">
               <span className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                  Q1-Q2 Reported
               </span>
               <span className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Q3-Q4 Pending
               </span>
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[300px]">Indicator</th>
                     <th className="px-3 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[60px]">Unit</th>
                     {["Q1", "Q2", "Q3", "Q4"].map(q => (
                        <th key={q} className="px-4 py-8 border-l border-slate-100 min-w-[140px]">
                           <p className={cn(
                              "text-center text-[10px] font-black uppercase tracking-widest mb-3",
                              (q === "Q1" || q === "Q2") ? "text-slate-600" : "text-slate-300"
                           )}>{q}</p>
                           <div className="flex justify-around text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="w-12 text-center">Target</span>
                              <span className="w-12 text-center">Actual</span>
                           </div>
                        </th>
                     ))}
                     <th className="px-4 py-8 border-l border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[80px]">Annual</th>
                     <th className="px-6 py-8 border-l border-slate-100 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[100px]">Achievement</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {indicators.map((row, i) => {
                     const achievement = getAchievement(row);
                     return (
                        <tr key={i} className="hover:bg-slate-50/30 transition-colors group">
                           <td className="px-8 py-7">
                              <div className="flex items-start gap-3">
                                 <span className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#E11D48] transition-colors">{row.name}</span>
                              </div>
                              <span className={cn(
                                 "inline-block mt-2 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                 sectorColors[row.sector] || "bg-slate-50 text-slate-500 border-slate-200"
                              )}>
                                 {row.sector}
                              </span>
                           </td>
                           <td className="px-3 py-7 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.unit}</td>
                           {(["q1", "q2", "q3", "q4"] as const).map((qKey) => {
                              const [t, a] = row[qKey];
                              const isPast = qKey === "q1" || qKey === "q2";
                              return (
                                 <td key={qKey} className="px-4 py-7 border-l border-slate-100">
                                    <div className="flex justify-around items-center">
                                       <span className={cn(
                                          "w-12 text-center font-black text-sm",
                                          isPast ? "text-slate-400" : "text-slate-200"
                                       )}>{t}</span>
                                       <span className={cn(
                                          "w-12 text-center font-black text-sm",
                                          !isPast ? "text-slate-100" :
                                          a === 0 && t === 0 ? "text-slate-100" :
                                          a >= t ? "text-emerald-500" :
                                          a >= t * 0.8 ? "text-amber-500" : "text-rose-500"
                                       )}>{isPast ? a : "-"}</span>
                                    </div>
                                 </td>
                              );
                           })}
                           <td className="px-4 py-7 border-l border-slate-100 text-center font-black text-sm text-slate-800">{row.annual.toLocaleString()}</td>
                           <td className="px-6 py-7 border-l border-slate-100">
                              <div className="flex items-center gap-3 justify-center">
                                 <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={cn(
                                       "h-full rounded-full transition-all",
                                       achievement >= 80 ? "bg-emerald-500" :
                                       achievement >= 50 ? "bg-amber-500" :
                                       achievement > 0 ? "bg-rose-500" : "bg-slate-200"
                                    )} style={{ width: `${Math.min(achievement, 100)}%` }} />
                                 </div>
                                 <span className={cn(
                                    "text-[11px] font-black",
                                    achievement >= 80 ? "text-emerald-600" :
                                    achievement >= 50 ? "text-amber-600" :
                                    achievement > 0 ? "text-rose-600" : "text-slate-300"
                                 )}>{achievement}%</span>
                              </div>
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>

         {/* Summary Footer */}
         <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center gap-8">
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Indicators</p>
               <p className="text-lg font-black text-slate-800">{indicators.length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">On Track (Q1-Q2)</p>
               <p className="text-lg font-black text-emerald-600">{indicators.filter(r => getAchievement(r) >= 80).length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Needs Attention</p>
               <p className="text-lg font-black text-amber-600">{indicators.filter(r => { const a = getAchievement(r); return a > 0 && a < 80; }).length}</p>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Not Started</p>
               <p className="text-lg font-black text-slate-300">{indicators.filter(r => getAchievement(r) === 0).length}</p>
            </div>
         </div>
      </div>
   );
}

// ── View 4: Workplan & Timeline (Gantt Chart) ──
function WorkplanView() {
   const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
   const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
   const todayMonth = 3; // April = index 3 (0-based)

   const activities = [
      { name: "Volunteer Recruitment & Training", start: 0, duration: 3, status: "completed" as const, team: "Health" },
      { name: "First Aid Post Setup", start: 1, duration: 4, status: "completed" as const, team: "Health" },
      { name: "Health Messaging Campaign", start: 2, duration: 5, status: "in-progress" as const, team: "Health" },
      { name: "WASH Baseline Survey", start: 3, duration: 2, status: "in-progress" as const, team: "WASH" },
      { name: "Water Point Construction", start: 4, duration: 6, status: "in-progress" as const, team: "WASH" },
      { name: "Emergency Simulation Drills", start: 5, duration: 3, status: "upcoming" as const, team: "DRR" },
      { name: "Micro-Grant Distribution", start: 3, duration: 4, status: "delayed" as const, team: "Livelihood" },
      { name: "Blood Drive Campaign", start: 7, duration: 3, status: "upcoming" as const, team: "Health" },
      { name: "Psychosocial Support Program", start: 6, duration: 4, status: "upcoming" as const, team: "PSS" },
      { name: "Mid-Year Review & Reporting", start: 5, duration: 1, status: "upcoming" as const, team: "PMER", milestone: true },
   ];

   const statusConfig = {
      completed: { bg: "bg-emerald-500", shadow: "shadow-emerald-500/20", border: "border-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", label: "Completed" },
      "in-progress": { bg: "bg-blue-500", shadow: "shadow-blue-500/20", border: "border-blue-500", text: "text-blue-600", light: "bg-blue-50", label: "In Progress" },
      delayed: { bg: "bg-rose-500", shadow: "shadow-rose-500/20", border: "border-rose-500", text: "text-rose-600", light: "bg-rose-50", label: "Delayed" },
      upcoming: { bg: "bg-slate-300", shadow: "shadow-slate-300/20", border: "border-slate-300", text: "text-slate-500", light: "bg-slate-50", label: "Upcoming" },
   };

   const teamColors: Record<string, string> = {
      Health: "bg-rose-50 text-rose-500 border-rose-100",
      WASH: "bg-cyan-50 text-cyan-600 border-cyan-100",
      DRR: "bg-amber-50 text-amber-600 border-amber-100",
      Livelihood: "bg-violet-50 text-violet-600 border-violet-100",
      PSS: "bg-teal-50 text-teal-600 border-teal-100",
      PMER: "bg-slate-100 text-slate-600 border-slate-200",
   };

   return (
      <div className="ercs-card-premium p-10">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <Calendar className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Implementation Gantt Chart</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                     Annual operational timeline with activity tracking across 12 months.
                  </p>
               </div>
            </div>
         </div>

         {/* Legend */}
         <div className="flex flex-wrap items-center gap-6 mb-8 p-4 bg-slate-50/50 rounded-xl border border-slate-100">
            {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => (
               <div key={key} className="flex items-center gap-2">
                  <div className={cn("w-4 h-2.5 rounded-sm", statusConfig[key].bg)} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{statusConfig[key].label}</span>
               </div>
            ))}
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
               <div className="w-3 h-3 rotate-45 bg-amber-400 border border-amber-500" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Milestone</span>
            </div>
            <div className="flex items-center gap-2 ml-4 pl-4 border-l border-slate-200">
               <div className="w-4 h-0 border-t-2 border-dashed border-rose-400" />
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Today</span>
            </div>
         </div>

         {/* Gantt Chart */}
         <div className="overflow-x-auto">
            <div className="min-w-[1100px]">
               {/* Month Header */}
               <div className="flex items-end border-b border-slate-200 pb-4">
                  <div className="w-1/4 shrink-0 pr-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Activity / Team</span>
                  </div>
                  <div className="flex-1 relative">
                     <div className="grid grid-cols-12">
                        {months.map((m, idx) => (
                           <div key={m} className={cn(
                              "text-center text-[10px] font-black uppercase tracking-widest py-2",
                              idx === todayMonth ? "text-rose-500" : "text-slate-400"
                           )}>
                              {m}
                           </div>
                        ))}
                     </div>
                  </div>
               </div>

               {/* Activity Rows */}
               <div className="relative">
                  {/* Today Marker - vertical dashed red line */}
                  <div
                     className="absolute top-0 bottom-0 z-20 border-l-2 border-dashed border-rose-400 pointer-events-none"
                     style={{ left: `calc(25% + ${((todayMonth + 0.5) / 12) * 75}%)` }}
                  >
                     <div className="absolute -top-1 -left-[7px] w-3 h-3 rounded-full bg-rose-400 border-2 border-white shadow-sm" />
                  </div>

                  {activities.map((a, i) => {
                     const cfg = statusConfig[a.status];
                     const barLeft = (a.start / 12) * 100;
                     const barWidth = (a.duration / 12) * 100;
                     const isMilestone = (a as any).milestone;

                     return (
                        <div
                           key={i}
                           className={cn(
                              "flex items-center border-b border-slate-50 transition-colors relative",
                              hoveredIdx === i ? "bg-slate-50/80" : "hover:bg-slate-50/40"
                           )}
                           onMouseEnter={() => setHoveredIdx(i)}
                           onMouseLeave={() => setHoveredIdx(null)}
                           style={{ minHeight: "60px" }}
                        >
                           {/* Left Column: Name + Team */}
                           <div className="w-1/4 shrink-0 pr-4 py-4">
                              <h4 className="text-[12px] font-black text-slate-800 leading-tight mb-2">{a.name}</h4>
                              <span className={cn(
                                 "inline-block px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                 teamColors[a.team] || "bg-slate-50 text-slate-500 border-slate-200"
                              )}>
                                 {a.team}
                              </span>
                           </div>

                           {/* Right: Timeline Grid + Bar */}
                           <div className="flex-1 relative h-14">
                              {/* Grid Lines */}
                              <div className="absolute inset-0 grid grid-cols-12">
                                 {Array.from({ length: 12 }).map((_, idx) => (
                                    <div key={idx} className={cn(
                                       "border-r h-full",
                                       idx === todayMonth - 1 ? "border-slate-100" : "border-slate-50"
                                    )} />
                                 ))}
                              </div>

                              {/* Gantt Bar */}
                              {isMilestone ? (
                                 <div
                                    className="absolute top-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
                                    style={{ left: `${barLeft + barWidth / 2}%` }}
                                 >
                                    <div className="w-5 h-5 rotate-45 bg-amber-400 border-2 border-amber-500 shadow-lg shadow-amber-400/30" />
                                 </div>
                              ) : (
                                 <div
                                    className={cn(
                                       "absolute top-1/2 -translate-y-1/2 h-3 rounded-full z-10 transition-all duration-300 shadow-lg",
                                       cfg.bg, cfg.shadow,
                                       hoveredIdx === i && "h-4"
                                    )}
                                    style={{ left: `${barLeft}%`, width: `${barWidth}%` }}
                                 >
                                    {/* Progress fill for in-progress items */}
                                    {a.status === "in-progress" && (
                                       <div className="absolute inset-0 rounded-full overflow-hidden">
                                          <div className="h-full bg-blue-600/30 rounded-full" style={{ width: "60%" }} />
                                       </div>
                                    )}

                                    {/* End cap */}
                                    <div className={cn(
                                       "absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white",
                                       cfg.bg
                                    )} />

                                    {/* Tooltip on hover */}
                                    {hoveredIdx === i && (
                                       <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl z-30 whitespace-nowrap pointer-events-none">
                                          <p className="text-[10px] font-black">{a.name}</p>
                                          <p className="text-[9px] text-slate-300 mt-0.5">
                                             {months[a.start]} - {months[Math.min(a.start + a.duration - 1, 11)]} &middot; {a.duration}mo &middot; {cfg.label}
                                          </p>
                                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                       </div>
                                    )}
                                 </div>
                              )}

                              {/* Milestone tooltip */}
                              {isMilestone && hoveredIdx === i && (
                                 <div
                                    className="absolute -top-10 z-30 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl whitespace-nowrap pointer-events-none"
                                    style={{ left: `${barLeft + barWidth / 2}%`, transform: "translateX(-50%)" }}
                                 >
                                    <p className="text-[10px] font-black">{a.name}</p>
                                    <p className="text-[9px] text-slate-300 mt-0.5">{months[a.start]} &middot; Milestone</p>
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-slate-900 rotate-45" />
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>

               {/* Summary Row */}
               <div className="flex items-center mt-6 pt-6 border-t border-slate-100">
                  <div className="w-1/4 shrink-0 pr-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        {activities.length} Activities &middot; {activities.filter(a => a.status === "completed").length} Completed
                     </span>
                  </div>
                  <div className="flex-1 flex items-center gap-6">
                     {(Object.keys(statusConfig) as Array<keyof typeof statusConfig>).map((key) => {
                        const count = activities.filter(a => a.status === key).length;
                        return (
                           <span key={key} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                              <span className={cn("inline-block w-2 h-2 rounded-full mr-1.5", statusConfig[key].bg)} />
                              {count} {statusConfig[key].label}
                           </span>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

// ── View 5: Financial Resources ──
function FinancialResourcesView() {
   const rows = [
      { id: "VRT", title: "Volunteer Recruitment & Training", donor: "ICRC", allocated: 280000, spent: 265000, sector: "Health" },
      { id: "FAP", title: "First Aid Post Setup", donor: "IFRC", allocated: 420000, spent: 380000, sector: "Health" },
      { id: "HMC", title: "Health Messaging Campaign", donor: "WHO", allocated: 150000, spent: 92000, sector: "Health" },
      { id: "WBS", title: "WASH Baseline Survey", donor: "UNICEF", allocated: 95000, spent: 88000, sector: "WASH" },
      { id: "WPC", title: "Water Point Construction", donor: "UNICEF", allocated: 680000, spent: 340000, sector: "WASH" },
      { id: "ESD", title: "Emergency Simulation Drills", donor: "ICRC", allocated: 120000, spent: 0, sector: "DRR" },
      { id: "MGD", title: "Micro-Grant Distribution", donor: "ERCS Core", allocated: 350000, spent: 210000, sector: "Livelihood" },
      { id: "BDC", title: "Blood Drive Campaign", donor: "ERCS Core", allocated: 180000, spent: 0, sector: "Health" },
      { id: "PSP", title: "Psychosocial Support Program", donor: "IFRC", allocated: 220000, spent: 0, sector: "PSS" },
      { id: "MYR", title: "Mid-Year Review & Reporting", donor: "ERCS Core", allocated: 45000, spent: 0, sector: "PMER" },
   ];

   const totalAllocated = rows.reduce((s, r) => s + r.allocated, 0);
   const totalSpent = rows.reduce((s, r) => s + r.spent, 0);
   const totalBalance = totalAllocated - totalSpent;
   const totalAbsorption = Math.round((totalSpent / totalAllocated) * 100);

   // Donor distribution
   const donorMap: Record<string, number> = {};
   rows.forEach(r => { donorMap[r.donor] = (donorMap[r.donor] || 0) + r.allocated; });
   const donors = Object.entries(donorMap).sort((a, b) => b[1] - a[1]);
   const donorColors: Record<string, { bg: string; bar: string; text: string }> = {
      ICRC: { bg: "bg-rose-50", bar: "bg-rose-500", text: "text-rose-600" },
      IFRC: { bg: "bg-blue-50", bar: "bg-blue-500", text: "text-blue-600" },
      WHO: { bg: "bg-emerald-50", bar: "bg-emerald-500", text: "text-emerald-600" },
      UNICEF: { bg: "bg-cyan-50", bar: "bg-cyan-500", text: "text-cyan-600" },
      "ERCS Core": { bg: "bg-amber-50", bar: "bg-amber-500", text: "text-amber-600" },
   };

   const sectorColors: Record<string, string> = {
      Health: "bg-rose-50 text-rose-500 border-rose-100",
      WASH: "bg-cyan-50 text-cyan-600 border-cyan-100",
      DRR: "bg-amber-50 text-amber-600 border-amber-100",
      Livelihood: "bg-violet-50 text-violet-600 border-violet-100",
      PSS: "bg-teal-50 text-teal-600 border-teal-100",
      PMER: "bg-slate-100 text-slate-600 border-slate-200",
   };

   return (
      <div className="space-y-8">
         {/* Donor Distribution Summary */}
         <div className="ercs-card-premium p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <TrendingUp className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Donor Allocation Distribution</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                     Funding breakdown by partner across all budget lines.
                  </p>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
               {donors.map(([donor, amount]) => {
                  const pct = Math.round((amount / totalAllocated) * 100);
                  const colors = donorColors[donor] || { bg: "bg-slate-50", bar: "bg-slate-400", text: "text-slate-600" };
                  return (
                     <div key={donor} className={cn("rounded-xl p-5 border border-slate-100", colors.bg)}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{donor}</p>
                        <p className={cn("text-xl font-black tracking-tight", colors.text)}>ETB {(amount / 1000).toFixed(0)}K</p>
                        <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                           <div className={cn("h-full rounded-full", colors.bar)} style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 mt-2">{pct}% of total</p>
                     </div>
                  );
               })}
            </div>

            {/* Stacked horizontal bar */}
            <div className="h-4 rounded-full overflow-hidden flex bg-slate-100">
               {donors.map(([donor, amount]) => {
                  const pct = (amount / totalAllocated) * 100;
                  const colors = donorColors[donor] || { bg: "bg-slate-50", bar: "bg-slate-400", text: "text-slate-600" };
                  return (
                     <div key={donor} className={cn("h-full transition-all", colors.bar)} style={{ width: `${pct}%` }} title={`${donor}: ${pct.toFixed(1)}%`} />
                  );
               })}
            </div>
         </div>

         {/* Budget Allocation Table */}
         <div className="ercs-card-premium p-0 overflow-hidden">
            <div className="p-10 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                     <DollarSign className="w-5 h-5" />
                  </div>
                  <div>
                     <h2 className="text-xl font-black text-slate-800 tracking-tight">Fiscal Expenditure Matrix</h2>
                     <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                        Detailed programmatic resource utilization by budget line and donor.
                     </p>
                  </div>
               </div>
               <div className="px-6 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] shadow-sm">
                  Global Allocation: ETB {(totalAllocated / 1000).toFixed(1)}K
               </div>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full">
                  <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[280px]">Activity</th>
                        <th className="px-4 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[90px]">Donor</th>
                        <th className="px-4 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[120px]">Allocated (ETB)</th>
                        <th className="px-4 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[120px]">Spent (ETB)</th>
                        <th className="px-4 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[120px]">Balance (ETB)</th>
                        <th className="px-8 py-8 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[160px]">Absorption %</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {rows.map((r, i) => {
                        const balance = r.allocated - r.spent;
                        const absorption = r.allocated > 0 ? Math.round((r.spent / r.allocated) * 100) : 0;
                        const dColor = donorColors[r.donor] || { bg: "bg-slate-50", bar: "bg-slate-400", text: "text-slate-600" };
                        return (
                           <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                              <td className="px-8 py-8">
                                 <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[10px] font-black italic text-slate-300 uppercase tracking-widest">{r.id}</span>
                                 </div>
                                 <h4 className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#E11D48] transition-colors">{r.title}</h4>
                                 <span className={cn(
                                    "inline-block mt-2 px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                    sectorColors[r.sector] || "bg-slate-50 text-slate-500 border-slate-200"
                                 )}>
                                    {r.sector}
                                 </span>
                              </td>
                              <td className="px-4 py-8 text-center">
                                 <span className={cn(
                                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                    r.donor === "ICRC" ? "bg-rose-50 text-rose-500 border-rose-100" :
                                    r.donor === "IFRC" ? "bg-blue-50 text-blue-500 border-blue-100" :
                                    r.donor === "WHO" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                                    r.donor === "UNICEF" ? "bg-cyan-50 text-cyan-500 border-cyan-100" :
                                    "bg-amber-50 text-amber-500 border-amber-100"
                                 )}>
                                    {r.donor}
                                 </span>
                              </td>
                              <td className="px-4 py-8 text-right font-black text-slate-800 text-[15px] tracking-tighter">
                                 {r.allocated.toLocaleString()}
                              </td>
                              <td className="px-4 py-8 text-right font-black text-emerald-600 text-[15px] tracking-tighter">
                                 {r.spent > 0 ? r.spent.toLocaleString() : <span className="text-slate-200">-</span>}
                              </td>
                              <td className="px-4 py-8 text-right font-black text-slate-400 text-[15px] tracking-tighter">
                                 {balance.toLocaleString()}
                              </td>
                              <td className="px-8 py-8 min-w-[160px]">
                                 <div className="flex items-center gap-4 justify-end">
                                    <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                       <div className={cn(
                                          "h-full transition-all duration-1000 rounded-full",
                                          absorption >= 80 ? "bg-emerald-500" :
                                          absorption >= 50 ? "bg-amber-500" :
                                          absorption > 0 ? "bg-rose-500" : "bg-slate-200"
                                       )} style={{ width: `${absorption}%` }} />
                                    </div>
                                    <span className={cn(
                                       "text-[11px] font-black min-w-[32px] text-right",
                                       absorption >= 80 ? "text-emerald-600" :
                                       absorption >= 50 ? "text-amber-600" :
                                       absorption > 0 ? "text-rose-600" : "text-slate-300"
                                    )}>{absorption}%</span>
                                 </div>
                              </td>
                           </tr>
                        );
                     })}
                  </tbody>

                  {/* Summary Row */}
                  <tfoot>
                     <tr className="bg-slate-50/80 border-t-2 border-slate-200">
                        <td className="px-8 py-8">
                           <span className="text-sm font-black text-slate-800 uppercase tracking-widest">Total</span>
                        </td>
                        <td className="px-4 py-8 text-center text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           {donors.length} Donors
                        </td>
                        <td className="px-4 py-8 text-right font-black text-slate-900 text-[15px] tracking-tighter">
                           {totalAllocated.toLocaleString()}
                        </td>
                        <td className="px-4 py-8 text-right font-black text-emerald-700 text-[15px] tracking-tighter">
                           {totalSpent.toLocaleString()}
                        </td>
                        <td className="px-4 py-8 text-right font-black text-slate-600 text-[15px] tracking-tighter">
                           {totalBalance.toLocaleString()}
                        </td>
                        <td className="px-8 py-8">
                           <div className="flex items-center gap-4 justify-end">
                              <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
                                 <div className={cn(
                                    "h-full rounded-full",
                                    totalAbsorption >= 50 ? "bg-emerald-500" : "bg-amber-500"
                                 )} style={{ width: `${totalAbsorption}%` }} />
                              </div>
                              <span className="text-sm font-black text-slate-900">{totalAbsorption}%</span>
                           </div>
                        </td>
                     </tr>
                  </tfoot>
               </table>
            </div>
         </div>
      </div>
   );
}

