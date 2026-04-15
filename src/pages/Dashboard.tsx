import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp, Users, Target, Activity,
  AlertCircle, ChevronRight, ChevronDown, Plus,
  FileText, Search, Filter, Share2,
  Settings, Clock, ArrowRight, BarChart3,
  PieChart as PieIcon, LineChart as LineIcon, Check
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { addAuditEntry } from "@/hooks/use-store";

/* ── Data per quarter ── */
const quarterlyKPIs: Record<string, { achievement: string; reach: string; velocity: string; critical: number; trend1: string; trend2: string }> = {
  Q1: { achievement: "64.2%", reach: "62,400", velocity: "85%", critical: 18, trend1: "+1.8%", trend2: "8.2k" },
  Q2: { achievement: "78.4%", reach: "145,280", velocity: "92%", critical: 12, trend1: "+4.2%", trend2: "12.5k" },
  Q3: { achievement: "83.1%", reach: "198,750", velocity: "94%", critical: 8, trend1: "+5.1%", trend2: "15.3k" },
  Q4: { achievement: "91.6%", reach: "256,100", velocity: "97%", critical: 4, trend1: "+8.5%", trend2: "18.7k" },
};

const quarterlyTrend: Record<string, { month: string; value: number }[]> = {
  Q1: [{ month: "Oct", value: 30 }, { month: "Nov", value: 38 }, { month: "Dec", value: 45 }, { month: "Jan", value: 52 }, { month: "Feb", value: 58 }],
  Q2: [{ month: "Feb", value: 45 }, { month: "Mar", value: 52 }, { month: "Apr", value: 48 }, { month: "May", value: 70 }, { month: "Jun", value: 85 }],
  Q3: [{ month: "May", value: 60 }, { month: "Jun", value: 68 }, { month: "Jul", value: 72 }, { month: "Aug", value: 80 }, { month: "Sep", value: 88 }],
  Q4: [{ month: "Aug", value: 75 }, { month: "Sep", value: 82 }, { month: "Oct", value: 88 }, { month: "Nov", value: 92 }, { month: "Dec", value: 97 }],
};

const branchPerformance: Record<string, { name: string; value: number }[]> = {
  National: [
    { name: "Addis Ababa", value: 85 }, { name: "Amhara", value: 72 },
    { name: "Oromia", value: 55 }, { name: "SNNPR", value: 68 },
    { name: "Tigray", value: 74 }, { name: "Somali", value: 70 },
  ],
  Branch: [
    { name: "Health", value: 88 }, { name: "WASH", value: 65 },
    { name: "DRR", value: 78 }, { name: "Livelihood", value: 56 },
    { name: "PSS", value: 72 }, { name: "Youth", value: 82 },
  ],
  Donor: [
    { name: "IFRC", value: 82 }, { name: "ICRC", value: 76 },
    { name: "Norwegian RC", value: 88 }, { name: "WHO", value: 64 },
    { name: "UNICEF", value: 71 }, { name: "ERCS Core", value: 90 },
  ],
};

const viewAlerts: Record<string, { title: string; value: string; branch: string }[]> = {
  National: [
    { title: "Households receiving micro-grants", value: "42%", branch: "AMHARA BRANCH" },
    { title: "Reduction in waterborne disease", value: "43%", branch: "OROMIA BRANCH" },
    { title: "First aid posts established", value: "44%", branch: "SOMALI BRANCH" },
  ],
  Branch: [
    { title: "Emergency drills completion rate", value: "38%", branch: "DRR SECTOR" },
    { title: "Blood collection below target", value: "51%", branch: "HEALTH SECTOR" },
    { title: "Water point construction delayed", value: "43%", branch: "WASH SECTOR" },
  ],
  Donor: [
    { title: "ICRC cooperation report overdue", value: "Overdue", branch: "ICRC PROGRAM" },
    { title: "IFRC absorption rate below 60%", value: "58%", branch: "IFRC PROGRAM" },
    { title: "Norwegian RC target shortfall", value: "67%", branch: "NRC PROGRAM" },
  ],
};

const portfolio = [
  { label: "Disaster Risk Mgmt", value: 85, color: "#E11D48" },
  { label: "Health & WASH", value: 72, color: "#2563EB" },
  { label: "Org. Readiness", value: 94, color: "#059669" },
  { label: "Youth & Volunteer", value: 68, color: "#D97706" },
];

const statusByQuarter: Record<string, { green: number; yellow: number; red: number }> = {
  Q1: { green: 28, yellow: 24, red: 20 },
  Q2: { green: 42, yellow: 18, red: 12 },
  Q3: { green: 48, yellow: 16, red: 8 },
  Q4: { green: 56, yellow: 12, red: 4 },
};

const tabs = ["Programmatic Performance", "Financial Overview", "Data Quality"];

/* ── Helpers ── */
interface Project { id: string; name: string; donor: string; branch: string; budget: number; createdAt: string }
const PROJECTS_KEY = "pmer_projects";
function loadProjects(): Project[] { try { return JSON.parse(localStorage.getItem(PROJECTS_KEY) || "[]"); } catch { return []; } }

function getSubmissions(): any[] { try { return JSON.parse(localStorage.getItem("pmer_submissions") || "[]"); } catch { return []; } }

function getBarColor(val: number) {
  if (val >= 80) return "#059669";
  if (val >= 60) return "#d97706";
  return "#E11D48";
}

/* ════════════════════════════════════════════ */

export default function Dashboard() {
  const navigate = useNavigate();

  // ── Interactive state ──
  const [quarter, setQuarter] = useState("Q2");
  const [viewMode, setViewMode] = useState("National");
  const [activeTab, setActiveTab] = useState(0);
  const [quarterOpen, setQuarterOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>(loadProjects);
  const [form, setForm] = useState({ name: "", donor: "IFRC", branch: "Addis Ababa", budget: "" });

  // ── Derived data ──
  const kpi = quarterlyKPIs[quarter];
  const trend = quarterlyTrend[quarter];
  const bars = branchPerformance[viewMode];
  const alerts = viewAlerts[viewMode];
  const status = statusByQuarter[quarter];
  const submissions = useMemo(getSubmissions, []);
  const latestSubmission = submissions[0];

  const handleCreateProject = () => {
    if (!form.name || !form.budget) { toast({ title: "Missing fields", description: "Project name and budget are required.", variant: "destructive" }); return; }
    const project: Project = { id: Date.now().toString(), name: form.name, donor: form.donor, branch: form.branch, budget: Number(form.budget), createdAt: new Date().toISOString() };
    const updated = [project, ...projects];
    setProjects(updated);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
    addAuditEntry({ user: "Admin", action: `Created project "${form.name}"`, type: "project", module: "Dashboard" });
    toast({ title: "Project created", description: `${form.name} — ETB ${Number(form.budget).toLocaleString()}` });
    setForm({ name: "", donor: "IFRC", branch: "Addis Ababa", budget: "" });
    setProjectDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Enterprise Intelligence</span>
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight">
            Society <span className="text-[#E11D48] italic">Insight</span>
          </h1>
          <p className="text-slate-500 font-medium mt-2">National headquarters real-time monitoring dashboard.</p>
        </div>

        {/* ── Quarter & View Selectors (interactive) ── */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Quarter picker */}
            <div className="relative">
              <button onClick={() => { setQuarterOpen(!quarterOpen); setViewOpen(false); }} className="px-6 py-3 text-xs font-black text-slate-600 border-r border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-2">
                {quarter} <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", quarterOpen && "rotate-180")} />
              </button>
              {quarterOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden w-32 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["Q1", "Q2", "Q3", "Q4"].map(q => (
                    <button key={q} onClick={() => { setQuarter(q); setQuarterOpen(false); }}
                      className={cn("w-full px-5 py-3 text-left text-xs font-black flex items-center justify-between hover:bg-slate-50 transition-colors",
                        q === quarter ? "text-[#E11D48] bg-rose-50/50" : "text-slate-600"
                      )}>
                      {q} {q === quarter && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* View picker */}
            <div className="relative">
              <button onClick={() => { setViewOpen(!viewOpen); setQuarterOpen(false); }} className="px-6 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                {viewMode} View <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", viewOpen && "rotate-180")} />
              </button>
              {viewOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden w-44 animate-in fade-in slide-in-from-top-2 duration-200">
                  {["National", "Branch", "Donor"].map(v => (
                    <button key={v} onClick={() => { setViewMode(v); setViewOpen(false); }}
                      className={cn("w-full px-5 py-3 text-left text-xs font-black flex items-center justify-between hover:bg-slate-50 transition-colors",
                        v === viewMode ? "text-[#E11D48] bg-rose-50/50" : "text-slate-600"
                      )}>
                      {v} View {v === viewMode && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button onClick={() => navigate("/monitoring")} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-[#E11D48] shadow-sm transition-all" title="Open Indicator Monitoring">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 border-b border-slate-200">
        <div className="flex gap-10">
          {tabs.map((tab, i) => (
            <button key={tab} onClick={() => setActiveTab(i)}
              className={cn("pb-4 text-[10px] font-black tracking-widest uppercase transition-all",
                activeTab === i ? "text-[#E11D48] border-b-2 border-[#E11D48]" : "text-slate-400 hover:text-slate-600"
              )}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Cards (clickable) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "National Achievement", value: kpi.achievement, sub: "Programmatic target avg", trend: kpi.trend1, icon: Target, iconColor: "text-rose-500", iconBg: "bg-rose-50", link: "/monitoring" },
          { label: "Direct Reach", value: kpi.reach, sub: "Individuals impacted to date", trend: kpi.trend2, icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50", link: "/consolidation" },
          { label: "Reporting Velocity", value: kpi.velocity, sub: submissions.length > 0 ? `${submissions.length} submission${submissions.length !== 1 ? "s" : ""} recorded` : "Submissions on frequency", trend: "+2%", icon: Clock, iconColor: "text-emerald-500", iconBg: "bg-emerald-50", link: "/data-entry" },
          { label: "Indicator Health", value: `Critical (${kpi.critical})`, sub: "Requires immediate attention", status: "Critical" as const, icon: AlertCircle, iconColor: "text-rose-600", iconBg: "bg-rose-50", border: "border-b-4 border-rose-500", link: "/monitoring" },
        ].map((k, i) => (
          <div key={i} onClick={() => navigate(k.link)} className={cn("ercs-card-premium p-8 flex flex-col group hover-lift relative overflow-hidden cursor-pointer", k.border)}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">{k.label}</p>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", k.iconBg)}>
                <k.icon className={cn("w-5 h-5", k.iconColor)} />
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <h3 className="text-3xl font-black tracking-tighter text-slate-900">{k.value}</h3>
              {k.trend && <span className={cn("text-[10px] font-black", k.iconColor)}><TrendingUp className="w-3 h-3 inline mr-0.5" /> {k.trend}</span>}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{k.sub}</p>
            <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-slate-200 group-hover:text-[#E11D48] group-hover:translate-x-1 transition-all" />
          </div>
        ))}
      </div>

      {/* ── Traffic Light Banner ── */}
      <div className="ercs-card-premium p-6 mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-rose-500" />
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Traffic Light Performance System — {quarter}</span>
          </div>
          <div className="flex items-center gap-4">
            {[
              { label: "On Track (≥90%)", count: status.green, color: "emerald" },
              { label: "At Risk (70-89%)", count: status.yellow, color: "amber" },
              { label: "Critical (<70%)", count: status.red, color: "rose" },
            ].map((s, i) => (
              <React.Fragment key={i}>
                {i > 0 && <div className="w-px h-6 bg-slate-200" />}
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80" onClick={() => navigate("/monitoring")}>
                  <div className={`w-3 h-3 rounded-full bg-${s.color}-500`} />
                  <span className={`text-[10px] font-black text-${s.color}-600 uppercase tracking-widest`}>{s.label}</span>
                  <span className={`text-lg font-black text-${s.color}-600 ml-1`}>{s.count}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
        {/* Status Distribution */}
        <div className="md:col-span-3 ercs-card-premium p-8">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Status Distribution</h2>
          <div className="grid grid-cols-3 gap-3 mb-12">
            {[
              { label: "On Track", value: status.green, color: "bg-emerald-50 text-emerald-600" },
              { label: "At Risk", value: status.yellow, color: "bg-amber-50 text-amber-600" },
              { label: "Critical", value: status.red, color: "bg-rose-50 text-rose-600" },
            ].map((box, i) => (
              <div key={i} onClick={() => navigate("/monitoring")} className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:scale-105 transition-transform", box.color)}>
                <span className="text-lg font-black">{box.value}</span>
                <span className="text-[8px] font-black uppercase tracking-widest">{box.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-rose-500" />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Overall Health Index</span>
            </div>
            <span className="text-sm font-black text-slate-800">{quarter === "Q1" ? "6.8" : quarter === "Q2" ? "8.4" : quarter === "Q3" ? "9.1" : "9.6"} / 10</span>
          </div>
        </div>

        {/* Velocity Trend */}
        <div className="md:col-span-12 lg:col-span-5 ercs-card-premium p-8">
          <div className="mb-8">
            <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Velocity Trend — {quarter}</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Monthly achievement trajectory</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 40px rgba(0,0,0,0.1)" }} itemStyle={{ fontSize: "10px", fontWeight: "bold" }} />
                <Line type="monotone" dataKey="value" stroke="#E11D48" strokeWidth={4} dot={{ r: 0 }} activeDot={{ r: 6, fill: "#E11D48", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex justify-between mt-4 px-2">
              {trend.map((d, i) => (
                <span key={i} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d.month}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Regional/Sector/Donor Distribution */}
        <div className="md:col-span-12 lg:col-span-4 ercs-card-premium p-8">
          <div className="mb-8">
            <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">{viewMode} Distribution</h2>
            <p className="text-[10px] font-bold text-slate-400 mt-1">Achievement per {viewMode === "National" ? "branch" : viewMode === "Branch" ? "sector" : "donor"}</p>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bars} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barGap={6}>
                <Tooltip cursor={{ fill: "#F1F5F9" }} contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "12px 16px", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" as const }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                  {bars.map((entry, index) => (
                    <Cell key={index} fill={getBarColor(entry.value)} className="hover:opacity-80 transition-opacity cursor-pointer" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Lower Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Alerts (clickable) */}
        <div className="lg:col-span-4 ercs-card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Alerts — {viewMode}</h2>
            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[7px] font-black text-rose-500 uppercase tracking-widest">Urgent</span>
          </div>
          <div className="space-y-6">
            {alerts.map((a, i) => (
              <div key={i} onClick={() => navigate("/monitoring")} className="flex items-start justify-between group cursor-pointer">
                <div>
                  <h4 className="text-[11px] font-black text-slate-800 mb-1 leading-tight group-hover:text-[#E11D48] transition-colors">{a.title}</h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.branch}</p>
                </div>
                <span className="text-sm font-black text-rose-500">{a.value}</span>
              </div>
            ))}
          </div>
          <button onClick={() => navigate("/monitoring")} className="w-full mt-10 pt-6 border-t border-slate-100 text-[9px] font-black text-[#E11D48] tracking-[0.2em] uppercase hover:underline underline-offset-8 transition-all">
            View All Urgent Alerts →
          </button>
        </div>

        {/* Institutional Portfolio */}
        <div className="lg:col-span-8 ercs-card-premium p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
            <div>
              <h2 className="text-[11px] font-black text-slate-800 uppercase tracking-[0.25em]">Institutional Portfolio</h2>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Strategic prioritization & outcome mapping</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-3 mt-4 md:mt-0">
              {portfolio.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest">{p.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-4">
            {portfolio.map((p, i) => (
              <div key={i} onClick={() => navigate("/planning")} className="flex flex-col items-center gap-6 cursor-pointer group">
                <div className="relative w-28 h-28 group-hover:scale-105 transition-transform">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-slate-100" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                    <path className="transition-all duration-1000 ease-out" strokeDasharray={`${p.value}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-slate-800 tracking-tighter">{p.value}%</span>
                  </div>
                </div>
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">{p.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Action Bar ── */}
      <div className="mt-12 flex flex-col xl:flex-row xl:items-center justify-between gap-8 p-4 rounded-[40px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/50">
        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => navigate("/planning")} className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-[#E11D48] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all">
            <Plus className="w-5 h-5" /> Strategic Plan
          </button>
          <button onClick={() => setProjectDialogOpen(true)} className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
            <Target className="w-5 h-5 text-slate-400" /> New Project
          </button>
          <button onClick={() => navigate("/users?tab=audit")} className="flex items-center gap-3 px-8 py-5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-all">
            <Settings className="w-5 h-5" /> System Audit
          </button>
        </div>

        {/* Live feed from localStorage */}
        <div onClick={() => navigate(latestSubmission ? "/data-entry" : "/consolidation")} className="flex items-center gap-4 bg-slate-50/80 px-8 py-4 rounded-full border border-slate-100 cursor-pointer hover:bg-slate-100/80 transition-colors">
          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="min-w-[180px]">
            {latestSubmission ? (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="text-slate-900">{latestSubmission.branch}</span> submitted {latestSubmission.periodType || "data"} — {new Date(latestSubmission.submittedAt).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                <span className="text-slate-900">No submissions yet</span> — use Data Collection to submit
              </p>
            )}
          </div>
          <ArrowRight className="w-4 h-4 text-rose-500" />
        </div>
      </div>

      {/* ── New Project Dialog ── */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">New Project</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Register a new programmatic project in the system.</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Project Name</label>
              <input type="text" placeholder="Enter project name..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Donor</label>
                <select value={form.donor} onChange={e => setForm(f => ({ ...f, donor: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                  {["IFRC", "ICRC", "Norwegian RC", "WHO", "UNICEF"].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Branch</label>
                <select value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                  {["Addis Ababa", "Amhara", "Oromia", "Tigray", "SNNPR", "Somali"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Budget (ETB)</label>
              <input type="number" placeholder="0" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none" />
            </div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setProjectDialogOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
              <button onClick={handleCreateProject} className="btn-primary-ercs flex-1">Create Project</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
