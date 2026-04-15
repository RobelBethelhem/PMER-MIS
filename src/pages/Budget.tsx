<<<<<<< HEAD
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { projects, budgetLines, donors, getProjectDonor } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, TrendingDown, TrendingUp, AlertCircle } from "lucide-react";

export default function Budget() {
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const burnRate = Math.round((totalSpent / totalBudget) * 100);

  const donorData = donors.map(d => {
    const donorProjects = projects.filter(p => p.donorId === d.id);
    const budget = donorProjects.reduce((s, p) => s + p.budget, 0);
    const spent = donorProjects.reduce((s, p) => s + p.spent, 0);
    return { name: d.name, budget, spent, pct: Math.round((spent / budget) * 100) };
  });

  const donorPieColors = ["hsl(0, 72%, 51%)", "hsl(220, 70%, 50%)", "hsl(36, 100%, 50%)"];

  const quarterlyData = [
    { quarter: "Q1", planned: 0, actual: 0 },
    { quarter: "Q2", planned: 0, actual: 0 },
    { quarter: "Q3", planned: 0, actual: 0 },
    { quarter: "Q4", planned: 0, actual: 0 },
  ];
  budgetLines.forEach(bl => {
    quarterlyData[0].planned += bl.q1Planned; quarterlyData[0].actual += bl.q1Actual;
    quarterlyData[1].planned += bl.q2Planned; quarterlyData[1].actual += bl.q2Actual;
    quarterlyData[2].planned += bl.q3Planned; quarterlyData[2].actual += bl.q3Actual;
    quarterlyData[3].planned += bl.q4Planned; quarterlyData[3].actual += bl.q4Actual;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Budget & Finance</h1>
        <p className="text-sm text-muted-foreground">Financial tracking and expenditure analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-5">
          <div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">Total Budget</p><p className="text-2xl font-bold">ETB {(totalBudget / 1e6).toFixed(1)}M</p></div><DollarSign className="h-5 w-5 text-primary" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">Total Spent</p><p className="text-2xl font-bold">ETB {(totalSpent / 1e6).toFixed(1)}M</p></div><TrendingDown className="h-5 w-5 text-traffic-yellow" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">Remaining</p><p className="text-2xl font-bold">ETB {((totalBudget - totalSpent) / 1e6).toFixed(1)}M</p></div><TrendingUp className="h-5 w-5 text-traffic-green" /></div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">Burn Rate</p><p className="text-2xl font-bold">{burnRate}%</p><div className="h-2 w-full bg-muted rounded-full mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${burnRate}%` }} /></div></div><AlertCircle className="h-5 w-5 text-primary" /></div>
        </CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Planned vs Actual by Quarter</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quarterlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis tickFormatter={v => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => `ETB ${v.toLocaleString()}`} />
                  <Bar dataKey="planned" fill="hsl(220, 14%, 86%)" name="Planned" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="hsl(0, 72%, 51%)" name="Actual" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Budget by Donor</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donorData} cx="50%" cy="50%" outerRadius={80} dataKey="budget" label={({ name }) => name}>
                    {donorData.map((_, i) => <Cell key={i} fill={donorPieColors[i]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `ETB ${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Budget vs Expenditure by Activity</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Activity</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead className="text-right">Budget</TableHead>
                <TableHead className="text-right">Spent</TableHead>
                <TableHead className="text-right">Variance</TableHead>
                <TableHead className="w-32">Utilization</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgetLines.map(bl => {
                const budget = bl.q1Planned + bl.q2Planned + bl.q3Planned + bl.q4Planned;
                const spent = bl.q1Actual + bl.q2Actual + bl.q3Actual + bl.q4Actual;
                const variance = budget - spent;
                const util = Math.round((spent / budget) * 100);
                return (
                  <TableRow key={bl.id}>
                    <TableCell className="font-medium text-sm">{bl.activity}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{getProjectDonor(bl.projectId)}</Badge></TableCell>
                    <TableCell className="text-right text-sm">ETB {budget.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">ETB {spent.toLocaleString()}</TableCell>
                    <TableCell className={`text-right text-sm ${variance > 0 ? "text-traffic-green" : "text-traffic-red"}`}>ETB {variance.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-muted rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, util)}%` }} /></div>
                        <span className="text-xs w-8">{util}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Cost Efficiency Metrics</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div><p className="text-xs text-muted-foreground">Avg. Cost per Beneficiary</p><p className="text-xl font-bold">ETB 385</p><p className="text-xs text-muted-foreground">Across all programs</p></div>
            <div><p className="text-xs text-muted-foreground">Cost per Output Unit</p><p className="text-xl font-bold">ETB 12,400</p><p className="text-xs text-muted-foreground">Per indicator output delivered</p></div>
            <div><p className="text-xs text-muted-foreground">Budget Absorption Rate</p><p className="text-xl font-bold">{burnRate}%</p><p className="text-xs text-muted-foreground">Target: 85% by Q3</p></div>
          </div>
        </CardContent>
      </Card>
=======
import React from "react";
import { 
  DollarSign, Search, Plus, Download, 
  RotateCw, ChevronRight, Activity, 
  TrendingUp, BarChart3, PieChart,
  ShieldCheck, ArrowUpRight, Wallet, Clock
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart as RePieChart,
  Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

const absorptionData = [
  { name: "Q1", actual: 0.35, target: 0.42 },
  { name: "Q2", actual: 0.28, target: 0.38 },
  { name: "Q3", actual: 0.22, target: 0.35 },
  { name: "Q4", actual: 0.05, target: 0.32 },
];

const donorData = [
  { name: "IFRC", value: 13, color: "#E11D48" },
  { name: "ICRC", value: 21, color: "#2563EB" },
  { name: "Norwegian Red Cross", value: 24, color: "#F59E0B" },
];

const matrix = [
  { unit: "Volunteer training", id: "BL1", partner: "IFRC", allocated: 120000, utilized: 115000, balance: 5000, absorption: 95 },
  { unit: "First aid post construction", id: "BL2", partner: "IFRC", allocated: 200000, utilized: 140000, balance: 60000, absorption: 70 },
  { unit: "Emergency supply pre-positioning", id: "BL3", partner: "ICRC", allocated: 350000, utilized: 253000, balance: 107000, absorption: 73 },
  { unit: "Simulation exercises", id: "BL4", partner: "ICRC", allocated: 60000, utilized: 30000, balance: 30000, absorption: 50 },
  { unit: "Micro-grants disbursement", id: "BL5", partner: "NORWEGIAN RED CROSS", allocated: 400000, utilized: 230000, balance: 170000, absorption: 57 },
];

export default function Budget() {
  return (
    <div className="page-container pb-20">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-amber-600 font-black text-[10px] uppercase tracking-[0.2em]">Fiscal Oversight</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="hero-title text-5xl">Strategic</h1>
              <h1 className="hero-title text-5xl text-[#F59E0B] italic">Finance</h1>
              <p className="hero-subtitle mt-6">
                National programmatic resource management and expenditure velocity tracking across thematic pillars.
              </p>
            </div>

            <button className="btn-primary-ercs bg-[#E11D48] flex items-center gap-3 px-8">
              <Plus className="w-5 h-5" />
              <span>Sync Expenditure</span>
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Budget", value: "ETB 5.4M", icon: Wallet, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Total Spent", value: "ETB 1.0M", icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Remaining", value: "ETB 4.4M", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Burn Rate", value: "18%", icon: Clock, color: "text-rose-500", bg: "bg-rose-50", progress: 18 },
        ].map((stat, i) => (
          <div key={i} className="ercs-card-premium p-8 group hover-lift relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="stat-label">{stat.label}</p>
                <h3 className="stat-value">{stat.value}</h3>
              </div>
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
            </div>
            {stat.progress && (
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden mt-6">
                 <div className="h-full bg-rose-500" style={{ width: `${stat.progress}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 ercs-card-premium p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Quarterly Absorption</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Programmatic spending trends across fiscal quarters.</p>
            </div>
            <BarChart3 className="w-6 h-6 text-slate-300" />
          </div>

          <div className="h-[350px] w-full mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={absorptionData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }} barGap={12}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 13, fontWeight: 700 }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "#64748B", fontSize: 13, fontWeight: 700 }}
                  dx={-15}
                  tickFormatter={(v) => `${v}M`}
                />
                <Bar dataKey="target" fill="#E2E8F0" radius={[12, 12, 0, 0]} barSize={40} />
                <Bar dataKey="actual" fill="#E11D48" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="ercs-card-premium p-10 flex flex-col">
          <h2 className="stat-label mb-10 text-slate-600">Donor Distribution</h2>
          <div className="h-[250px] w-full relative mb-10">
             <ResponsiveContainer width="100%" height="100%">
               <RePieChart>
                 <Pie
                   data={donorData}
                   cx="50%"
                   cy="50%"
                   innerRadius={60}
                   outerRadius={90}
                   paddingAngle={8}
                   dataKey="value"
                 >
                   {donorData.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.color} />
                   ))}
                 </Pie>
               </RePieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-slate-800">3</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Partners</span>
             </div>
          </div>
          
          <div className="space-y-4">
             {donorData.map((d, i) => (
               <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                     <span className="text-[11px] font-bold text-slate-600">{d.name}</span>
                  </div>
                  <span className="text-[11px] font-black text-slate-800">{d.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* ── Absorption Matrix ── */}
      <div className="ercs-card-premium p-10">
        <div className="mb-10">
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Absorption Matrix</h2>
          <p className="text-sm font-medium text-slate-500 mt-1">Detailed resource utilization performance by activity.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Allocation Unit</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Partner</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Allocated</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Utilized</th>
                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Absorption</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {matrix.map((row, i) => (
                <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-6">
                    <p className="text-sm font-black text-slate-800 mb-0.5">{row.unit}</p>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{row.id}</p>
                  </td>
                  <td className="px-6 py-6">
                    <span className="px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">
                      {row.partner}
                    </span>
                  </td>
                  <td className="px-6 py-6 text-right font-black text-slate-600 font-mono">{row.allocated.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right font-black text-slate-800 font-mono">{row.utilized.toLocaleString()}</td>
                  <td className="px-6 py-6 text-right font-black text-emerald-600 font-mono">{row.balance.toLocaleString()}</td>
                  <td className="px-6 py-6 min-w-[150px]">
                    <div className="flex items-center gap-4">
                      <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn("h-full transition-all duration-1000", row.absorption > 80 ? "bg-emerald-500" : row.absorption > 60 ? "bg-amber-500" : "bg-rose-500")}
                          style={{ width: `${row.absorption}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 w-10">{row.absorption}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Efficiency Analysis ── */}
      <div className="ercs-card-premium p-10 bg-slate-50/50 border-dashed">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { label: "Cost Per Beneficiary", value: "ETB 8.22", sub: "National Average" },
              { label: "Operational ROI", value: "114%", sub: "Yield per WASH project" },
              { label: "System Burn Rate", value: "18%", sub: "Threshold: 85%" },
            ].map((eff, i) => (
              <div key={i} className="flex flex-col border-l-2 border-slate-200 pl-8">
                 <p className="stat-label text-blue-500 mb-2">{eff.label}</p>
                 <h4 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">{eff.value}</h4>
                 <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{eff.sub}</p>
              </div>
            ))}
         </div>
      </div>
>>>>>>> e0b16a6 (commit)
    </div>
  );
}
