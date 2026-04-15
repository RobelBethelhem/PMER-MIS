<<<<<<< HEAD
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { indicators, branches, getBranchName, getTrafficColor, type Indicator } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const typeColors: Record<string, string> = {
  Output: "bg-primary/10 text-primary",
  Outcome: "bg-traffic-yellow/20 text-foreground",
  Impact: "bg-traffic-green/20 text-foreground",
};

function IndicatorDetail({ indicator, onBack }: { indicator: Indicator; onBack: () => void }) {
  const totalTarget = indicator.branchData.reduce((s, b) => s + b.target, 0);
  const totalActual = indicator.branchData.reduce((s, b) => s + b.actual, 0);
  const pct = totalTarget > 0 ? Math.round((totalActual / totalTarget) * 100) : 0;

  const branchChart = indicator.branchData.map(bd => ({
    branch: getBranchName(bd.branchId),
    target: bd.target,
    actual: bd.actual,
    pct: bd.target > 0 ? Math.round((bd.actual / bd.target) * 100) : 0,
  }));

  const trendData = indicator.quarterlyTrend.map((v, i) => ({ quarter: `Q${i + 1}`, value: v }));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h2 className="text-lg font-semibold">{indicator.name}</h2>
          <div className="flex gap-2 mt-1">
            <Badge className={typeColors[indicator.type]}>{indicator.type}</Badge>
            <Badge variant="outline">{indicator.sector}</Badge>
            <Badge variant="outline">{indicator.unit}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Baseline</p><p className="text-xl font-bold">{indicator.baseline.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Annual Target</p><p className="text-xl font-bold">{indicator.annualTarget.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Current Achievement</p><p className="text-xl font-bold">{totalActual.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Achievement %</p><p className={`text-xl font-bold ${pct >= 90 ? "text-traffic-green" : pct >= 70 ? "text-traffic-yellow" : "text-traffic-red"}`}>{pct}%</p></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Target vs Achievement by Branch</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={branchChart}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="branch" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="target" fill="hsl(220, 14%, 86%)" name="Target" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="actual" fill="hsl(0, 72%, 51%)" name="Actual" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Quarterly Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="quarter" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="hsl(0, 72%, 51%)" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {indicator.disaggregation && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Disaggregation</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-8">
              <div><p className="text-xs text-muted-foreground">Male</p><p className="text-lg font-semibold">{indicator.disaggregation.male.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Female</p><p className="text-lg font-semibold">{indicator.disaggregation.female.toLocaleString()}</p></div>
              <div><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-semibold">{(indicator.disaggregation.male + indicator.disaggregation.female).toLocaleString()}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
=======
import React, { useState } from "react";
import { 
  ArrowLeft, Download, Activity, ShieldCheck, 
  Zap, Users, UserPlus, TrendingUp, BarChart3,
  Calendar, MapPin, Search, ChevronRight, Target,
  Filter, ChevronDown
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

const regionalData = [
  { name: "Addis Ababa", actual: 195, target: 190 },
  { name: "Amhara", actual: 155, target: 115 },
  { name: "Oromia", actual: 98, target: 82 },
];

const growthData = [
  { month: "Jan", value: 400 },
  { month: "Feb", value: 450 },
  { month: "Mar", value: 520 },
  { month: "Apr", value: 650 },
  { month: "May", value: 780 },
  { month: "Jun", value: 910 },
];

function IndicatorRegistry({ onSelect }: { onSelect: (id: string) => void }) {
  const indicators = [
    { title: "Community health volunteers trained", sub: "HEALTH • PEOPLE", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "450", actual: "400", achieve: 89, color: "bg-orange-500" },
    { title: "First aid posts established", sub: "HEALTH • POSTS", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "15", actual: "12", achieve: 80, color: "bg-orange-500" },
    { title: "People reached with health messaging", sub: "HEALTH • PEOPLE", type: "OUTCOME", typeColor: "text-amber-500 bg-amber-50 border-amber-100", target: "120,000", actual: "95,000", achieve: 79, color: "bg-orange-500" },
    { title: "Reduction in waterborne disease incidence (%)", sub: "WASH • %", type: "IMPACT", typeColor: "text-emerald-500 bg-emerald-50 border-emerald-100", target: "60", actual: "30", achieve: 50, color: "bg-rose-500" },
    { title: "Households receiving micro-grants", sub: "LIVELIHOOD • HOUSEHOLDS", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "500", actual: "280", achieve: 56, color: "bg-rose-500" },
    { title: "Emergency simulation exercises conducted", sub: "DRR • EXERCISES", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "8", actual: "6", achieve: 75, color: "bg-orange-500" },
    { title: "Blood units collected", sub: "HEALTH • UNITS", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "35,000", actual: "31,500", achieve: 90, color: "bg-orange-500" },
    { title: "IDPs receiving psychosocial support", sub: "PSS • PEOPLE", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "1,000", actual: "530", achieve: 53, color: "bg-rose-500" },
    { title: "Beneficiaries receiving food assistance", sub: "RELIEF • PEOPLE", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "10,000", actual: "7,700", achieve: 77, color: "bg-orange-500" },
    { title: "Water points constructed", sub: "WASH • POINTS", type: "OUTPUT", typeColor: "text-blue-500 bg-blue-50 border-blue-100", target: "30", actual: "13", achieve: 43, color: "bg-rose-500" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Filters Bar ── */}
      <div className="flex items-center gap-4 mb-10 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative group flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-rose-500 transition-colors" />
          <input 
            className="w-full pl-14 pr-4 py-4 rounded-2xl bg-slate-50/50 border-none text-sm font-medium focus:ring-2 focus:ring-rose-500/20"
            placeholder="Filter HQ Indicators..."
          />
        </div>
        <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
           <button className="px-6 py-3 rounded-xl bg-white text-[10px] font-black text-rose-500 shadow-sm border border-slate-100 uppercase tracking-widest flex items-center gap-2">
             <Filter className="w-3.5 h-3.5" />
           </button>
           <button className="px-6 py-3 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-slate-600 transition-all">
             GLOBAL... <ChevronDown className="w-3.5 h-3.5" />
           </button>
           <button className="px-6 py-3 rounded-xl text-slate-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-white hover:text-slate-600 transition-all">
             ALL VERTICALS <ChevronDown className="w-3.5 h-3.5" />
           </button>
        </div>
      </div>

      {/* ── Indicators Table ── */}
      <div className="ercs-card-premium p-0 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-1/3">Indicator Specification</th>
                <th className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                <th className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual</th>
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Achievement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
               {indicators.map((ind, i) => (
                 <tr 
                   key={i} 
                   onClick={() => onSelect(ind.title)}
                   className="group hover:bg-slate-50/50 transition-all cursor-pointer"
                 >
                   <td className="px-10 py-10 w-1/3">
                      <h4 className="text-sm font-black text-slate-800 tracking-tight leading-tight group-hover:text-rose-600 transition-colors">{ind.title}</h4>
                      <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest leading-none">{ind.sub}</p>
                   </td>
                   <td className="px-6 py-10 text-center">
                      <span className={cn("px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border", ind.typeColor)}>
                        {ind.type}
                      </span>
                   </td>
                   <td className="px-6 py-10 text-center text-sm font-black text-slate-400 tracking-tighter">{ind.target}</td>
                   <td className="px-6 py-10 text-center text-sm font-black text-slate-800 tracking-tighter">{ind.actual}</td>
                   <td className="px-10 py-10">
                      <div className="flex items-center gap-6">
                         <div className="flex-1">
                            <div className="flex justify-between items-center mb-1.5">
                               <span className="text-[11px] font-black text-slate-800">{ind.achieve}%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                               <div className={cn("h-full transition-all duration-1000", ind.color)} style={{ width: `${ind.achieve}%` }} />
                            </div>
                         </div>
                         <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-rose-500 transition-all group-hover:translate-x-1" />
                      </div>
                   </td>
                 </tr>
               ))}
            </tbody>
          </table>
        </div>
      </div>
>>>>>>> e0b16a6 (commit)
    </div>
  );
}

export default function Monitoring() {
<<<<<<< HEAD
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Indicator | null>(null);

  if (selected) return <IndicatorDetail indicator={selected} onBack={() => setSelected(null)} />;

  const sectors = [...new Set(indicators.map(i => i.sector))];
  const filtered = indicators.filter(i => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (typeFilter !== "all" && i.type !== typeFilter) return false;
    if (sectorFilter !== "all" && i.sector !== sectorFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Indicator Monitoring</h1>
        <p className="text-sm text-muted-foreground">Centralized indicator registry and performance tracking</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search indicators..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Output">Output</SelectItem>
            <SelectItem value="Outcome">Outcome</SelectItem>
            <SelectItem value="Impact">Impact</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Sector" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sectors</SelectItem>
            {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicator</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sector</TableHead>
                <TableHead className="text-right">Target</TableHead>
                <TableHead className="text-right">Actual</TableHead>
                <TableHead className="text-right">Achievement</TableHead>
                <TableHead className="w-12">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(ind => {
                const t = ind.branchData.reduce((s, b) => s + b.target, 0);
                const a = ind.branchData.reduce((s, b) => s + b.actual, 0);
                const pct = t > 0 ? Math.round((a / t) * 100) : 0;
                const color = getTrafficColor(pct);
                return (
                  <TableRow key={ind.id} className="cursor-pointer" onClick={() => setSelected(ind)}>
                    <TableCell className="font-medium text-sm">{ind.name}</TableCell>
                    <TableCell><Badge className={`text-[10px] ${typeColors[ind.type]}`}>{ind.type}</Badge></TableCell>
                    <TableCell className="text-sm">{ind.sector}</TableCell>
                    <TableCell className="text-right">{t.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{a.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">{pct}%</TableCell>
                    <TableCell>
                      <span className={`inline-block h-3 w-3 rounded-full ${
                        color === "green" ? "bg-traffic-green" : color === "yellow" ? "bg-traffic-yellow" : "bg-traffic-red"
                      }`} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
=======
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(null);

  if (!selectedIndicator) {
     return <IndicatorRegistry onSelect={setSelectedIndicator} />;
  }

  return (
    <div className="page-container pb-20">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <span className="badge-live">Live Tracking</span>
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Indicator Performance Matrix</span>
          </div>

          <div className="flex items-center gap-8 mb-10">
            <button 
               onClick={() => setSelectedIndicator(null)}
               className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E11D48] hover:border-rose-200 shadow-sm transition-all active:scale-95 shrink-0"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="hero-title max-w-2xl">{selectedIndicator}</h1>
            
            <div className="ml-auto flex items-center gap-4">
               <button className="btn-secondary-ercs flex items-center gap-2">
                 <span>Export Analysis</span>
               </button>
               <button className="btn-primary-ercs flex items-center gap-2">
                 <Activity className="w-5 h-5" />
                 <span>Review Metric</span>
               </button>
            </div>
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-rose-500/10 transition-colors duration-1000" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Absolute Baseline", value: "500", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Annual Target", value: "700", icon: Target, color: "text-rose-500", bg: "bg-rose-50" },
          { label: "Year-to-Date", value: "400", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Performance Score", value: "89%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="ercs-card-premium p-8 flex items-center justify-between group">
            <div>
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Regional Distribution Chart */}
        <div className="lg:col-span-2 ercs-card-premium p-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-xl font-black text-slate-800 tracking-tight">Regional Distribution</h2>
              <p className="text-sm font-medium text-slate-500 mt-1">Performance actuals vs targets across operational regions.</p>
            </div>
            <BarChart3 className="w-6 h-6 text-slate-300" />
          </div>

          <div className="h-[400px] w-full mt-10">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }} barGap={12}>
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
                />
                <Tooltip 
                  cursor={{ fill: "#F8FAFC" }}
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 20px 40px rgba(0,0,0,0.1)", padding: "12px 16px" }}
                />
                <Bar dataKey="target" fill="#E2E8F0" radius={[12, 12, 0, 0]} barSize={40} />
                <Bar dataKey="actual" fill="#E11D48" radius={[12, 12, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Vector & Side Panels */}
        <div className="flex flex-col gap-8">
          <div className="ercs-card-premium p-8 overflow-hidden relative group">
            <h2 className="stat-label mb-6 text-rose-500">Growth Vector</h2>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E11D48" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#E11D48" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#E11D48" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-8 p-6 rounded-3xl bg-slate-50 border border-slate-100 italic">
               <p className="stat-label text-[#64748B] mb-2 leading-none">Logic Validation</p>
               <p className="text-slate-600 text-xs font-semibold leading-relaxed">
                 Count of individuals issued with a valid ERCS Health Volunteer Certificate after completing standard minimum 4-day training.
               </p>
            </div>
          </div>

          <div className="ercs-card-premium p-8">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                  <Users className="w-5 h-5" />
               </div>
               <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Inclusion Metrics</h2>
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Male Participation", value: 180, total: 400, color: "bg-blue-500" },
                { label: "Female Participation", value: 220, total: 400, color: "bg-rose-500" },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{metric.label}</span>
                    <span className="text-xs font-black text-slate-700">{metric.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", metric.color)} 
                      style={{ width: `${(metric.value / metric.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
>>>>>>> e0b16a6 (commit)
    </div>
  );
}
