<<<<<<< HEAD
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aops, getBranchName, logframe, type AOP, type AOPStatus, type LogframeNode } from "@/data/mockData";
import { ChevronDown, ChevronRight, ArrowLeft, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const statusColor: Record<AOPStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-traffic-yellow/20 text-traffic-yellow",
  Approved: "bg-traffic-green/20 text-traffic-green",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function GanttBar({ start, end }: { start: number; end: number }) {
  const left = ((start - 1) / 12) * 100;
  const width = ((end - start + 1) / 12) * 100;
  return (
    <div className="relative h-6 w-full">
      <div
        className="absolute top-1 h-4 rounded bg-primary/80"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

function LogframeTree({ node, depth = 0 }: { node: LogframeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const levelColors: Record<string, string> = {
    "Strategic Priority": "bg-primary text-primary-foreground",
    Outcome: "bg-traffic-yellow/20 text-foreground",
    Output: "bg-traffic-green/20 text-foreground",
    Activity: "bg-muted text-muted-foreground",
  };

  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}>
      <div
        className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-accent/50 rounded px-2 -ml-2"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />) : <span className="w-3.5" />}
        <Badge className={`text-[10px] px-1.5 py-0 ${levelColors[node.level]}`}>{node.level}</Badge>
        <span className="text-sm">{node.title}</span>
      </div>
      {open && hasChildren && node.children!.map(child => (
        <LogframeTree key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function AOPDetail({ aop, onBack }: { aop: AOP; onBack: () => void }) {
  const allActivities = aop.objectives.flatMap(o => o.activities);
  const totalBudget = allActivities.reduce((s, a) => s + a.budget, 0);
  const totalSpent = allActivities.reduce((s, a) => s + a.spent, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h2 className="text-lg font-semibold">AOP {aop.year} — {getBranchName(aop.branchId)}</h2>
          <Badge className={statusColor[aop.status]}>{aop.status}</Badge>
        </div>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="activities">Activities & Gantt</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="logframe">Logframe</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-3 mt-4">
          {aop.objectives.map((obj, i) => (
            <Card key={obj.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Objective {i + 1}: {obj.title}</CardTitle>
                <CardDescription>{obj.activities.length} activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {obj.activities.map(a => <li key={a.id}>{a.title}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Activity</TableHead>
                    <TableHead className="min-w-[80px]">Responsible</TableHead>
                    {months.map(m => <TableHead key={m} className="text-center w-10 text-xs px-1">{m}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActivities.map(act => (
                    <TableRow key={act.id}>
                      <TableCell className="text-sm font-medium">{act.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{act.responsible}</TableCell>
                      <TableCell colSpan={12} className="p-0">
                        <GanttBar start={act.startMonth} end={act.endMonth} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Summary</CardTitle>
              <CardDescription>Total: ETB {totalBudget.toLocaleString()} | Spent: ETB {totalSpent.toLocaleString()} ({Math.round((totalSpent / totalBudget) * 100)}%)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Budget (ETB)</TableHead>
                    <TableHead className="text-right">Spent (ETB)</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActivities.map(act => (
                    <TableRow key={act.id}>
                      <TableCell className="text-sm">{act.title}</TableCell>
                      <TableCell className="text-right">{act.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{act.spent.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, Math.round((act.spent / act.budget) * 100))}%` }} />
                          </div>
                          <span className="text-xs">{Math.round((act.spent / act.budget) * 100)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logframe" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logframe Hierarchy</CardTitle>
              <CardDescription>Strategic Priority → Outcome → Output → Activity</CardDescription>
            </CardHeader>
            <CardContent>
              {logframe.map(node => <LogframeTree key={node.id} node={node} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Planning() {
  const [selectedAOP, setSelectedAOP] = useState<AOP | null>(null);

  if (selectedAOP) {
    return <AOPDetail aop={selectedAOP} onBack={() => setSelectedAOP(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="text-sm text-muted-foreground">Annual Operational Plans (AOP) — FY 2025</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> New AOP</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Objectives</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aops.map(aop => {
                const actCount = aop.objectives.reduce((s, o) => s + o.activities.length, 0);
                const totalBudget = aop.objectives.flatMap(o => o.activities).reduce((s, a) => s + a.budget, 0);
                return (
                  <TableRow key={aop.id} className="cursor-pointer" onClick={() => setSelectedAOP(aop)}>
                    <TableCell className="font-medium">{getBranchName(aop.branchId)}</TableCell>
                    <TableCell>{aop.year}</TableCell>
                    <TableCell>{aop.objectives.length}</TableCell>
                    <TableCell>{actCount}</TableCell>
                    <TableCell><Badge className={statusColor[aop.status]}>{aop.status}</Badge></TableCell>
                    <TableCell className="text-right">ETB {totalBudget.toLocaleString()}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
=======
import React, { useState } from "react";
import { 
  Target, Plus, ChevronLeft, Calendar, 
  Users, DollarSign, CheckCircle, Clock, 
  FileEdit, Search, ListFilter, LayoutGrid,
  Download, ArrowRight, Activity, TrendingUp,
  MapPin, ShieldCheck, Zap, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const tabs = [
  { id: "objectives", label: "OBJECTIVES" },
  { id: "workplan", label: "WORKPLAN & TIMELINE" },
  { id: "targets", label: "PERIODIC TARGETS" },
  { id: "finance", label: "FINANCIAL RESOURCES" },
  { id: "theory", label: "THEORY OF CHANGE" },
];

export default function Planning() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("objectives");

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
              <button className="px-8 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
                 Download Full AOP
              </button>
              <button className="flex items-center gap-3 px-8 py-4 rounded-xl bg-[#E11D48] text-[10px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all">
                 <Plus className="w-5 h-5" />
                 Add Multi-Year Plan
              </button>
            </div>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

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
   const branches = [
      { name: "Addis Ababa", status: "active", color: "bg-emerald-500" },
      { name: "Amhara", status: "draft", color: "bg-amber-500" },
      { name: "Oromia", status: "draft", color: "bg-amber-500" },
      { name: "SNNPR", status: "active", color: "bg-emerald-500" },
      { name: "Tigray", status: "active", color: "bg-emerald-500" },
      { name: "Somali", status: "draft", color: "bg-amber-500" },
   ];

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

                  <button className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-[#E11D48] text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all self-start lg:self-center">
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
                           <span className="text-slate-800">2 / 6</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-rose-500 w-1/3" />
                        </div>
                     </div>
                     <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-3">
                           <span className="text-slate-400">Drafting Phase</span>
                           <span className="text-slate-800">4 / 6</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-amber-500 w-2/3" />
                        </div>
                     </div>
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
                     />
                  </div>
                  <div className="flex items-center gap-2 ml-8">
                     <button className="px-6 py-2 rounded-xl bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest">2024</button>
                     <button className="px-6 py-2 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">2025</button>
                     <button className="px-6 py-2 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600 transition-colors">2026</button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-slate-50">
                  {branches.map((b, i) => (
                     <div key={i} className="bg-white p-10 group hover:bg-slate-50/50 transition-all relative">
                        <div className="flex items-start justify-between mb-8">
                           <div className="flex items-center gap-3">
                              <div className={cn("w-2 h-2 rounded-full", b.color)} />
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">{b.name}</span>
                           </div>
                           <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-lg">2025</span>
                        </div>

                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-4">{b.name} Annual Plan</h3>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-10 max-w-[280px]">
                           Regional implementation roadmap aligned with national disaster risk reduction and community heal...
                        </p>

                        <div className="flex items-center justify-between">
                           <div className="flex -space-x-2">
                              {[1, 2, 3].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[9px] font-black text-slate-400 uppercase">ER</div>
                              ))}
                           </div>
                           <button 
                              onClick={() => onSelectPlan(b.name)}
                              className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all flex items-center gap-2"
                           >
                              Open Plan <ArrowRight className="w-3.5 h-3.5" />
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
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

// ── View 2: Theory of Change ──
function TheoryOfChangeView() {
   const data = [
      {
         id: "SP1",
         type: "STRATEGIC PRIORITY",
         title: "Save lives and protect livelihoods in emergencies",
         outcomes: [
            {
               title: "Improved community preparedness and response capacity",
               outputs: [
                  {
                     title: "Trained volunteers and pre-positioned supplies",
                     activities: [
                        "Train 200 community health volunteers",
                        "Pre-position emergency supplies in 6 warehouses",
                        "Conduct simulation exercises"
                     ]
                  },
                  {
                     title: "Functional first aid posts in target communities"
                  }
               ]
            }
         ]
      },
      {
         id: "SP2",
         type: "STRATEGIC PRIORITY",
         title: "Enable healthy and safe living",
         outcomes: [
            {
               title: "Reduced waterborne disease burden in target areas",
               outputs: [{ title: "Improved WASH infrastructure" }]
            },
            {
               title: "Strengthened blood bank services nationwide",
               outputs: [{ title: "Upgraded blood bank cold chain" }]
            }
         ]
      },
      {
         id: "SP3",
         type: "STRATEGIC PRIORITY",
         title: "Promote social inclusion and a culture of non-violence and peace",
         outcomes: [
            {
               title: "Improved psychosocial well-being of conflict-affected populations",
               outputs: [{ title: "PSS services delivered to IDPs" }]
            }
         ]
      }
   ];

   return (
      <div className="ercs-card-premium p-12">
         <div className="flex items-center gap-4 mb-10">
            <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white">
               <Target className="w-5 h-5" />
            </div>
            <div>
               <h2 className="text-xl font-black text-slate-800 tracking-tight">Integrated Result Framework</h2>
               <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                  Strategic Objective alignment through the PMER lifecycle (Priority • Outcome • Output • Activity).
               </p>
            </div>
         </div>

         <div className="space-y-8 pl-4 border-l-2 border-slate-100 ml-2">
            {data.map((priority, i) => (
               <div key={i} className="relative">
                  <div className="absolute -left-[14px] top-4 w-3 h-3 rounded-full bg-slate-200 border-2 border-white shadow-sm" />
                  <div className="flex items-center gap-4 mb-6 pt-2">
                     <span className="px-3 py-1 bg-rose-50 text-[9px] font-black text-rose-500 uppercase tracking-widest border border-rose-100 rounded-lg">STRATEGIC PRIORITY</span>
                     <h4 className="text-[13px] font-black text-slate-800">{priority.title}</h4>
                  </div>

                  <div className="space-y-6 ml-8">
                     {priority.outcomes.map((outcome, j) => (
                        <div key={j} className="relative">
                           <div className="absolute -left-[42px] top-3 w-4 h-4 rounded-full bg-amber-50 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                           </div>
                           <div className="flex items-center gap-4 mb-4">
                              <span className="px-3 py-1 bg-amber-50 text-[9px] font-black text-amber-500 uppercase tracking-widest border border-amber-100 rounded-lg">OUTCOME</span>
                              <h5 className="text-[12px] font-black text-slate-600">{outcome.title}</h5>
                           </div>

                           <div className="space-y-4 ml-10">
                              {outcome.outputs.map((output, k) => (
                                 <div key={k} className="relative group">
                                    <div className="flex items-center gap-4 mb-2">
                                       <span className="px-3 py-1 bg-emerald-50 text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-100 rounded-lg group-hover:bg-emerald-500 group-hover:text-white transition-all cursor-pointer">OUTPUT</span>
                                       <h6 className="text-[12px] font-black text-slate-800">{output.title}</h6>
                                    </div>

                                    {output.activities && (
                                       <div className="grid grid-cols-1 gap-2 mt-4 ml-14">
                                          {output.activities.map((act, l) => (
                                             <div key={l} className="flex items-center gap-3">
                                                <div className="w-1.5 h-10 border-l-2 border-slate-100 shrink-0" />
                                                <div className="flex items-center gap-4 bg-slate-50/50 p-2.5 rounded-xl border border-dotted border-slate-200 flex-1 hover:border-rose-300 hover:bg-white transition-all">
                                                   <span className="px-2 py-0.5 bg-blue-50 text-[8px] font-black text-blue-500 uppercase tracking-widest rounded">ACTIVITY</span>
                                                   <span className="text-[11px] font-black text-slate-500">{act}</span>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    )}
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
   );
}

// ── View 3: Periodic Targets ──
function PeriodicTargetsView() {
   const data = [
      { name: "Train 200 community health volunteers", q1: [50, 50], q2: [150, 145], q3: [0, 0], q4: [0, 0] },
      { name: "Establish 10 first aid posts", q1: [2, 0], q2: [4, 3], q3: [4, 4], q4: [0, 0] },
      { name: "Conduct community health awareness campaigns", q1: [0, 0], q2: [0, 0], q3: [0, 0], q4: [0, 0] },
      { name: "Pre-position emergency supplies in 6 warehouses", q1: [0, 0], q2: [0, 0], q3: [0, 0], q4: [0, 0] },
      { name: "Conduct simulation exercises", q1: [0, 0], q2: [0, 0], q3: [0, 0], q4: [0, 0] },
   ];

   return (
      <div className="ercs-card-premium p-0 overflow-hidden">
         <div className="p-10 border-b border-slate-100">
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
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-10 py-10 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] min-w-[350px]">Programmatic Activity</th>
                     {["Q1 Period", "Q2 Period", "Q3 Period", "Q4 Period"].map(q => (
                        <th key={q} className="px-6 py-10 border-l border-slate-100">
                           <p className="text-center text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{q}</p>
                           <div className="flex justify-around text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              <span className="w-14">Planned</span>
                              <span className="w-14">Actual</span>
                           </div>
                        </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {data.map((row, i) => (
                     <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-10 text-[13px] font-black text-slate-800 leading-tight pr-10">{row.name}</td>
                        {["q1", "q2", "q3", "q4"].map((qKey) => {
                           const [p, a] = (row as any)[qKey];
                           const isDiff = p !== a;
                           return (
                              <td key={qKey} className="px-6 py-10 border-l border-slate-100 font-mono text-center">
                                 <div className="flex justify-around items-center">
                                    <span className="w-14 text-slate-300 font-black text-lg">{p}</span>
                                    <span className={cn(
                                       "w-14 text-lg font-black",
                                       a === 0 ? "text-slate-100" :
                                       p === a ? "text-emerald-500" : "text-amber-500"
                                    )}>{a}</span>
                                 </div>
                              </td>
                           );
                        })}
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}

// ── View 4: Workplan & Timeline ──
function WorkplanView() {
   const activities = [
      { name: "Train 200 community health volunteers", dept: "HEALTH DEPT", id: "HE", resources: ["Health Officer", "Trainer"], q: "q1", color: "bg-emerald-500" },
      { name: "Establish 10 first aid posts", dept: "HEALTH DEPT", id: "HE", resources: ["Site Engineer"], q: "q2", color: "bg-rose-500" },
      { name: "Conduct community health awareness campaigns", dept: "COMMUNICATIONS", id: "CO", resources: ["Comms Officer", "V-Toyota-01"], q: "q3", color: "bg-rose-500" },
      { name: "Pre-position emergency supplies in 6 warehouses", dept: "LOGISTICS", id: "LO", resources: [], q: "q1", color: "bg-rose-500" },
      { name: "Conduct simulation exercises", dept: "DRR DEPT", id: "DR", resources: [], q: "q2", color: "bg-rose-500" },
   ];

   return (
      <div className="ercs-card-premium p-10">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <ListFilter className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Implementation Roadmap</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                     Interactive operational schedule with integrated milestones.
                  </p>
               </div>
            </div>
            <div className="flex p-1 bg-slate-100 rounded-xl">
               {["Q1", "Q2", "Q3", "Q4"].map(q => (
                  <button key={q} className="px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all hover:bg-white hover:shadow-sm text-slate-600 active:bg-white active:shadow-sm">{q}</button>
               ))}
            </div>
         </div>

         <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
               <div className="flex border-b border-slate-100 pb-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                  <div className="flex-1">Active Operations</div>
                  <div className="w-1/4 px-10">Resources</div>
                  <div className="w-2/5 flex justify-between gap-1 border-l border-slate-100 pl-4">
                     {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"].map(m => (
                        <span key={m} className="w-8 text-center">{m}</span>
                     ))}
                  </div>
               </div>

               <div className="divide-y divide-slate-100">
                  {activities.map((a, i) => (
                     <div key={i} className="flex py-10 items-center group">
                        <div className="flex-1 pr-10">
                           <h4 className="text-[13px] font-black text-slate-800 mb-4 group-hover:text-[#E11D48] transition-colors">{a.name}</h4>
                           <div className="flex items-center gap-2">
                              <span className="w-8 h-8 rounded-lg bg-rose-50 text-[9px] font-black text-rose-500 flex items-center justify-center border border-rose-100 uppercase tracking-tighter">{a.id}</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{a.dept}</span>
                           </div>
                        </div>

                        <div className="w-1/4 px-10 flex flex-wrap gap-2">
                           {a.resources.map((res, idx) => (
                              <span key={idx} className="px-3 py-1 bg-blue-50 text-[8px] font-black text-blue-600 uppercase tracking-widest rounded-lg border border-blue-100 leading-none h-fit">
                                 {res}
                              </span>
                           ))}
                        </div>

                        <div className="w-2/5 relative h-10 border-l border-slate-100 pl-4 flex items-center">
                            <div className="absolute inset-0 grid grid-cols-12 gap-0">
                               {Array.from({ length: 12 }).map((_, idx) => (
                                  <div key={idx} className="border-r border-slate-50 h-full" />
                               ))}
                            </div>
                            
                            {/* Gantt Bar Simulation */}
                            {i === 0 && (
                               <div className="ml-1 z-10 w-[24%] h-2.5 bg-emerald-500 rounded shadow-lg shadow-emerald-500/20 relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-600 border-2 border-white rounded-sm flex items-center justify-center">
                                     <ShieldCheck className="w-2 h-2 text-white" />
                                  </div>
                               </div>
                            )}
                            {i === 1 && (
                               <div className="ml-[25%] z-10 w-[30%] h-2.5 bg-rose-500 rounded shadow-lg shadow-rose-500/20 relative">
                                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 border-2 border-white rounded-sm flex items-center justify-center">
                                     <ArrowRight className="w-2 h-2 text-white" />
                                  </div>
                                  <div className="absolute left-[10%] top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-rose-500 rounded-sm flex items-center justify-center">
                                     <AlertCircle className="w-2 h-2 text-rose-500" />
                                  </div>
                               </div>
                            )}
                            {i === 2 && <div className="ml-[35%] z-10 w-[55%] h-2.5 bg-rose-500 rounded relative shadow-lg shadow-rose-400/20"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 border-2 border-white rounded-sm" /></div>}
                            {i === 3 && <div className="ml-1 z-10 w-[15%] h-2.5 bg-rose-500 rounded relative shadow-lg shadow-rose-400/20"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 border-2 border-white rounded-sm" /></div>}
                            {i === 4 && <div className="ml-[45%] z-10 w-[15%] h-2.5 bg-rose-500 rounded relative shadow-lg shadow-rose-400/20"><div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-rose-600 border-2 border-white rounded-sm" /></div>}
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
   );
}

// ── View 5: Financial Resources ──
function FinancialResourcesView() {
   const rows = [
      { id: "TRA", title: "Train 200 community health volunteers", allocated: 120000, utilized: 115000, balance: 5000, eff: 96, color: "bg-rose-500" },
      { id: "EST", title: "Establish 10 first aid posts", allocated: 200000, utilized: 140000, balance: 60000, eff: 70, color: "bg-emerald-500" },
      { id: "CON", title: "Conduct community health awareness campaigns", allocated: 80000, utilized: 55000, balance: 25000, eff: 69, color: "bg-emerald-500" },
      { id: "PRE", title: "Pre-position emergency supplies in 6 warehouses", allocated: 350000, utilized: 340000, balance: 10000, eff: 97, color: "bg-rose-500" },
      { id: "CON", title: "Conduct simulation exercises", allocated: 60000, utilized: 30000, balance: 30000, eff: 50, color: "bg-emerald-500" },
   ];

   return (
      <div className="ercs-card-premium p-0 overflow-hidden">
         <div className="p-10 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
                  <DollarSign className="w-5 h-5" />
               </div>
               <div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Fiscal Expenditure Matrix</h2>
                  <p className="text-[10px] font-extrabold text-slate-400 mt-1 uppercase tracking-widest">
                     Detailed programmatic resource utilization by granular budget line.
                  </p>
               </div>
            </div>
            <div className="px-6 py-3 rounded-xl bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] shadow-sm">
               Global Allocation: ETB 810.0K
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full">
               <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                     <th className="px-10 py-10 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Budget Head / Description</th>
                     <th className="px-6 py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocated (ETB)</th>
                     <th className="px-6 py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilized (ETB)</th>
                     <th className="px-6 py-10 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance (ETB)</th>
                     <th className="px-10 py-10 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilization Efficiency</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {rows.map((r, i) => (
                     <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                        <td className="px-10 py-12">
                           <p className="text-[10px] font-black italic text-slate-400 mb-2 uppercase tracking-widest">{r.id}</p>
                           <h4 className="text-[13px] font-black text-slate-800 tracking-tight leading-tight group-hover:text-[#E11D48] transition-colors">{r.title}</h4>
                           <span className="inline-block mt-4 px-3 py-1 bg-rose-50 border border-rose-100 text-[8px] font-black text-rose-500 uppercase tracking-[0.2em] rounded">Core Funds</span>
                        </td>
                        <td className="px-6 py-12 text-center font-black text-slate-800 text-[15px] tracking-tighter">
                           {r.allocated.toLocaleString()}
                        </td>
                        <td className="px-6 py-12 text-center font-black text-emerald-600 text-[15px] tracking-tighter">
                           {r.utilized.toLocaleString()}
                        </td>
                        <td className="px-6 py-12 text-center font-black text-slate-400 text-[15px] tracking-tighter">
                           {r.balance.toLocaleString()}
                        </td>
                        <td className="px-10 py-12 min-w-[200px]">
                           <div className="flex items-center gap-6 justify-end">
                              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                 <div className={cn("h-full transition-all duration-1000", r.color)} style={{ width: `${r.eff}%` }} />
                              </div>
                              <span className="text-[11px] font-black text-slate-800">{r.eff}%</span>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
   );
}
>>>>>>> e0b16a6 (commit)
