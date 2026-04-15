<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { indicators, projects, branches, getBranchName, getTrafficColor } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Building2, FolderKanban, TrendingUp, DollarSign, AlertTriangle, Clock } from "lucide-react";

function KpiCard({ title, value, subtitle, icon: Icon }: { title: string; value: string | number; subtitle: string; icon: React.ElementType }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const budgetUtil = Math.round((totalSpent / totalBudget) * 100);

  const indicatorAchievements = indicators.map(ind => {
    const totalTarget = ind.branchData.reduce((s, b) => s + b.target, 0);
    const totalActual = ind.branchData.reduce((s, b) => s + b.actual, 0);
    const pct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;
    return { ...ind, achievementPct: pct, trafficColor: getTrafficColor(pct) };
  });

  const avgAchievement = Math.round(indicatorAchievements.reduce((s, i) => s + i.achievementPct, 0) / indicatorAchievements.length);

  const trafficCounts = { green: 0, yellow: 0, red: 0 };
  indicatorAchievements.forEach(i => trafficCounts[i.trafficColor]++);

  const underperforming = [...indicatorAchievements].sort((a, b) => a.achievementPct - b.achievementPct).slice(0, 5);

  const branchPerformance = branches.map(br => {
    const branchInds = indicatorAchievements.filter(i => i.branchData.some(bd => bd.branchId === br.id));
    const avg = branchInds.length > 0
      ? Math.round(branchInds.reduce((s, i) => {
          const bd = i.branchData.find(b => b.branchId === br.id);
          return s + (bd && bd.target > 0 ? (bd.actual / bd.target) * 100 : 0);
        }, 0) / branchInds.length)
      : 0;
    return { name: br.name, achievement: avg };
  });

  const trafficPieData = [
    { name: "On Track (≥90%)", value: trafficCounts.green, color: "hsl(122, 39%, 49%)" },
    { name: "Warning (70-89%)", value: trafficCounts.yellow, color: "hsl(36, 100%, 50%)" },
    { name: "Critical (<70%)", value: trafficCounts.red, color: "hsl(4, 90%, 58%)" },
  ];

  const recentActivity = [
    { time: "10 min ago", action: "Monthly data submitted", user: "Yonas G.", branch: "Addis Ababa" },
    { time: "2 hours ago", action: "AOP approved", user: "Dawit A.", branch: "Addis Ababa" },
    { time: "5 hours ago", action: "Budget updated", user: "Solomon T.", branch: "HQ" },
    { time: "1 day ago", action: "Indicator targets revised", user: "Hana B.", branch: "Amhara" },
    { time: "2 days ago", action: "Quarterly report generated", user: "Tigist H.", branch: "HQ" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">ERCS Performance Overview — FY 2025</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Active Branches" value={branches.length} subtitle="Reporting this period" icon={Building2} />
        <KpiCard title="Active Projects" value={projects.length} subtitle="Across 3 donors" icon={FolderKanban} />
        <KpiCard title="Avg. Achievement" value={`${avgAchievement}%`} subtitle={`${trafficCounts.green} on track`} icon={TrendingUp} />
        <KpiCard title="Budget Utilization" value={`${budgetUtil}%`} subtitle={`ETB ${(totalSpent / 1_000_000).toFixed(1)}M of ${(totalBudget / 1_000_000).toFixed(1)}M`} icon={DollarSign} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Traffic Light Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Status</CardTitle>
            <CardDescription>Indicator traffic light summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={trafficPieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${value}`}>
                    {trafficPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs mt-2">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-traffic-green" /> Green ({trafficCounts.green})</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-traffic-yellow" /> Yellow ({trafficCounts.yellow})</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-traffic-red" /> Red ({trafficCounts.red})</span>
            </div>
          </CardContent>
        </Card>

        {/* Branch Performance */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Branch Performance</CardTitle>
            <CardDescription>Average indicator achievement by branch</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchPerformance} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => [`${v}%`, "Achievement"]} />
                  <Bar dataKey="achievement" radius={[0, 4, 4, 0]} fill="hsl(0, 72%, 51%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Underperforming Indicators */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-traffic-red" />
              Underperforming Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Indicator</TableHead>
                  <TableHead className="text-right w-24">Achievement</TableHead>
                  <TableHead className="w-16">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {underperforming.map(ind => (
                  <TableRow key={ind.id}>
                    <TableCell className="text-sm">{ind.name}</TableCell>
                    <TableCell className="text-right font-medium">{ind.achievementPct}%</TableCell>
                    <TableCell>
                      <span className={`inline-block h-3 w-3 rounded-full ${
                        ind.trafficColor === "green" ? "bg-traffic-green" :
                        ind.trafficColor === "yellow" ? "bg-traffic-yellow" : "bg-traffic-red"
                      }`} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((act, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px]">{act.time}</span>
                  <div>
                    <p className="font-medium">{act.action}</p>
                    <p className="text-xs text-muted-foreground">{act.user} • {act.branch}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
=======
import React from "react";
import { 
  TrendingUp, Users, Target, Activity, 
  AlertCircle, ChevronRight, Download, Plus,
  FileText, Search, Filter, Share2, 
  Settings, Clock, ArrowRight, BarChart3,
  PieChart as PieIcon, LineChart as LineIcon
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

const monthlyData = [
  { month: "Feb", value: 45 },
  { month: "Mar", value: 52 },
  { month: "Apr", value: 48 },
  { month: "May", value: 70 },
  { month: "Jun", value: 85 },
];

const branchData = [
  { name: "Branch A", value: 85 },
  { name: "Branch B", value: 72 },
  { name: "Branch C", value: 55 },
  { name: "Branch D", value: 68 },
  { name: "Branch E", value: 74 },
  { name: "Branch F", value: 70 },
];

const alerts = [
  { title: "Households receiving micro-grants", value: "42%", branch: "AMHARA BRANCH" },
  { title: "Reduction in waterborne disease in...", value: "43%", branch: "AMHARA BRANCH" },
  { title: "First aid posts established", value: "44%", branch: "AMHARA BRANCH" },
];

const portfolio = [
  { label: "Disaster Risk Mgmt", value: 85, color: "#E11D48" },
  { label: "Health & WASH", value: 72, color: "#2563EB" },
  { label: "Org. Readiness", value: 94, color: "#059669" },
  { label: "Youth & Volunteer", value: 68, color: "#D97706" },
];

export default function Dashboard() {
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

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
             <button className="px-6 py-3 text-xs font-black text-slate-600 border-r border-slate-100 hover:bg-slate-50 transition-colors flex items-center gap-2">
                Q2 <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
             </button>
             <button className="px-6 py-3 text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-2">
                National View <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
             </button>
          </div>
          <button className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-slate-600 shadow-sm transition-all">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Tabs & Actions ── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 border-b border-slate-200">
         <div className="flex gap-10">
            <button className="pb-4 text-[10px] font-black tracking-widest uppercase text-[#E11D48] border-b-2 border-[#E11D48]">
               Programmatic Performance
            </button>
         </div>
         <div className="flex items-center gap-4 pb-4">
         </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: "National Achievement", value: "78.4%", sub: "Programmatic target avg", trend: "+4.2%", icon: Target, iconColor: "text-rose-500", iconBg: "bg-rose-50" },
          { label: "Direct Reach", value: "145,280", sub: "Individuals impacted to date", trend: "12.5k", icon: Users, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
          { label: "Reporting Velocity", value: "92%", sub: "Submissions on frequency", trend: "+2%", icon: Clock, iconColor: "text-emerald-500", iconBg: "bg-emerald-50" },
          { label: "Indicator Health", value: "Critical (12)", sub: "Requires immediate attention", status: "Critical", icon: AlertCircle, iconColor: "text-rose-600", iconBg: "bg-rose-50", border: "border-b-4 border-rose-500" },
        ].map((k, i) => (
          <div key={i} className={cn("ercs-card-premium p-8 flex flex-col group hover-lift relative overflow-hidden", k.border)}>
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-loose">{k.label}</p>
              <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", k.iconBg)}>
                 <k.icon className={cn("w-5 h-5", k.iconColor)} />
              </div>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
               <h3 className={cn("text-3xl font-black tracking-tighter", k.status === 'Critical' ? "text-slate-900" : "text-slate-900")}>{k.value}</h3>
               {k.trend && (
                  <span className={cn("text-[10px] font-black", k.iconColor)}>
                    <TrendingUp className="w-3 h-3 inline mr-0.5" /> {k.trend}
                  </span>
               )}
            </div>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Statistics Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-10">
         {/* Status Distribution */}
         <div className="md:col-span-3 ercs-card-premium p-8">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Status Distribution</h2>
            <div className="grid grid-cols-3 gap-3 mb-12">
               {[
                  { label: "Good", value: 42, color: "bg-emerald-50 text-emerald-600" },
                  { label: "Wait", value: 18, color: "bg-amber-50 text-amber-600" },
                  { label: "Risk", value: 12, color: "bg-rose-50 text-rose-600" },
               ].map((box, i) => (
                  <div key={i} className={cn("p-4 rounded-2xl flex flex-col items-center justify-center gap-1", box.color)}>
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
               <span className="text-sm font-black text-slate-800">8.4 / 10</span>
            </div>
         </div>

         {/* Velocity Trend */}
         <div className="md:col-span-12 lg:col-span-5 ercs-card-premium p-8">
            <div className="mb-8">
               <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Velocity Trend</h2>
               <p className="text-[10px] font-bold text-slate-400 mt-1">Monthly achievement trajectory</p>
            </div>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                     <XAxis dataKey="month" hide />
                     <YAxis hide />
                     <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}
                        itemStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                     />
                     <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#E11D48" 
                        strokeWidth={4} 
                        dot={{ r: 0 }}
                        activeDot={{ r: 6, fill: "#E11D48", strokeWidth: 0 }}
                     />
                  </LineChart>
               </ResponsiveContainer>
               <div className="flex justify-between mt-4 px-2">
                  {monthlyData.map((d, i) => (
                     <span key={i} className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{d.month}</span>
                  ))}
               </div>
            </div>
         </div>

         {/* Regional Distribution */}
         <div className="md:col-span-12 lg:col-span-4 ercs-card-premium p-8">
            <div className="mb-8">
               <h2 className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Regional Distribution</h2>
               <p className="text-[10px] font-bold text-slate-400 mt-1">Achievement per branch</p>
            </div>
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={branchData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }} barGap={6}>
                     <Tooltip 
                        cursor={{ fill: '#F1F5F9' }}
                        contentStyle={{ 
                           borderRadius: '16px', 
                           border: 'none', 
                           boxShadow: '0 20px 40px rgba(0,0,0,0.1)', 
                           padding: '12px 16px',
                           fontSize: '10px',
                           fontWeight: '900',
                           textTransform: 'uppercase'
                        }}
                     />
                     <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={24}>
                        {branchData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? "#059669" : "#4482ee"} className="hover:opacity-80 transition-opacity cursor-pointer" />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
      </div>

      {/* ── Lower Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
         
         {/* Recent Alerts */}
         <div className="lg:col-span-4 ercs-card-premium p-8">
            <div className="flex items-center justify-between mb-8">
               <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recent Alerts</h2>
               <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[7px] font-black text-rose-500 uppercase tracking-widest">Urgent</span>
            </div>
            <div className="space-y-6">
               {alerts.map((a, i) => (
                  <div key={i} className="flex items-start justify-between group cursor-pointer">
                     <div>
                        <h4 className="text-[11px] font-black text-slate-800 mb-1 leading-tight group-hover:text-[#E11D48] transition-colors">{a.title}</h4>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{a.branch}</p>
                     </div>
                     <span className="text-sm font-black text-rose-500">{a.value}</span>
                  </div>
               ))}
            </div>
            <button className="w-full mt-10 pt-6 border-t border-slate-100 text-[9px] font-black text-[#E11D48] tracking-[0.2em] uppercase hover:underline underline-offset-8">
               View All Urgent Alerts
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
                  <div key={i} className="flex flex-col items-center gap-6">
                     <div className="relative w-28 h-28">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                           <path
                             className="text-slate-100"
                             strokeDasharray="100, 100"
                             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                             fill="none"
                             stroke="currentColor"
                             strokeWidth="3"
                           />
                           <path
                             className="transition-all duration-1000 ease-out"
                             strokeDasharray={`${p.value}, 100`}
                             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                             fill="none"
                             stroke={p.color}
                             strokeWidth="3"
                             strokeLinecap="round"
                           />
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
            <button className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-[#E11D48] text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/30 hover:bg-rose-600 transition-all">
               <Plus className="w-5 h-5" />
               Strategic Plan
            </button>
            <button className="flex items-center gap-3 px-8 py-5 rounded-[24px] bg-white border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
               <Target className="w-5 h-5 text-slate-400" />
               New Project
            </button>
            <button className="flex items-center gap-3 px-8 py-5 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-slate-600 transition-all">
               <Settings className="w-5 h-5" />
               System Audit
            </button>
         </div>

         <div className="flex items-center gap-4 bg-slate-50/80 px-8 py-4 rounded-full border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
               <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="min-w-[180px]">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <span className="text-slate-900">Addis Ababa Branch</span> just submitted Q2 data
               </p>
            </div>
            <ArrowRight className="w-4 h-4 text-rose-500" />
         </div>
>>>>>>> e0b16a6 (commit)
      </div>
    </div>
  );
}
