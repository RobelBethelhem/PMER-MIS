import React, { useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { addAuditEntry } from "@/hooks/use-store";

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

interface BudgetEntry {
  id: string;
  activity: string;
  donor: string;
  amount: number;
  period: string;
  notes: string;
  createdAt: string;
}

const BUDGET_KEY = "pmer_budget_entries";

function loadEntries(): BudgetEntry[] {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY) || "[]"); } catch { return []; }
}

export default function Budget() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [entries, setEntries] = useState<BudgetEntry[]>(loadEntries);
  const [activityType, setActivityType] = useState<"existing" | "new">("existing");
  const [form, setForm] = useState({ activity: "", donor: "IFRC", amount: "", period: "Q1", notes: "" });

  const handleSubmit = () => {
    if (!form.activity || !form.amount) {
      toast({ title: "Missing fields", description: "Activity and Amount are required.", variant: "destructive" });
      return;
    }
    const entry: BudgetEntry = {
      id: crypto.randomUUID?.() || Date.now().toString(),
      activity: form.activity,
      donor: form.donor,
      amount: Number(form.amount),
      period: form.period,
      notes: form.notes,
      createdAt: new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    localStorage.setItem(BUDGET_KEY, JSON.stringify(updated));
    addAuditEntry({ user: "Admin", action: "Added expenditure entry", type: "budget", module: "Budget" });
    toast({ title: "Expenditure recorded", description: `ETB ${Number(form.amount).toLocaleString()} for ${form.activity}`, variant: "success" });
    setForm({ activity: "", donor: "IFRC", amount: "", period: "Q1", notes: "" });
    setActivityType("existing");
    setDialogOpen(false);
  };

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

            <button onClick={() => setDialogOpen(true)} className="btn-primary-ercs bg-[#E11D48] flex items-center gap-3 px-8">
              <Plus className="w-5 h-5" />
              <span>Sync Expenditure</span>
              {entries.length > 0 && (
                <span className="ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-black">{entries.length}</span>
              )}
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

      {/* ── Recent Entries ── */}
      {entries.length > 0 && (
        <div className="ercs-card-premium p-10">
          <div className="mb-10">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Recent Entries</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Last {Math.min(5, entries.length)} expenditure entries from localStorage.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Activity</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Donor</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (ETB)</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</th>
                  <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.slice(0, 5).map((e) => (
                  <tr key={e.id} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-5 text-sm font-bold text-slate-800">{e.activity}</td>
                    <td className="px-6 py-5">
                      <span className="px-2 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">{e.donor}</span>
                    </td>
                    <td className="px-6 py-5 text-right font-black text-slate-800 font-mono">{e.amount.toLocaleString()}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-600">{e.period}</td>
                    <td className="px-6 py-5 text-sm text-slate-500 max-w-[200px] truncate">{e.notes || "—"}</td>
                    <td className="px-6 py-5 text-[11px] font-bold text-slate-400">{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add Expenditure Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">Add Expenditure</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Record a new expenditure entry against a budget line.</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            {/* Activity */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Activity Source</label>
              <div className="flex gap-3 mb-3">
                <button type="button" onClick={() => { setActivityType("existing"); setForm(f => ({ ...f, activity: "" })); }} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", activityType === "existing" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-400 border-slate-200")}>Existing</button>
                <button type="button" onClick={() => { setActivityType("new"); setForm(f => ({ ...f, activity: "" })); }} className={cn("px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all", activityType === "new" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-slate-50 text-slate-400 border-slate-200")}>New Activity</button>
              </div>
              {activityType === "existing" ? (
                <select value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                  <option value="">Select activity...</option>
                  {matrix.map(m => <option key={m.id} value={m.unit}>{m.unit}</option>)}
                </select>
              ) : (
                <input type="text" placeholder="Enter new activity name..." value={form.activity} onChange={e => setForm(f => ({ ...f, activity: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none" />
              )}
            </div>
            {/* Donor/Partner */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Donor / Partner</label>
              <select value={form.donor} onChange={e => setForm(f => ({ ...f, donor: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                {["IFRC", "ICRC", "Norwegian RC", "WHO", "UNICEF"].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {/* Amount */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Amount Spent (ETB)</label>
              <input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none" />
            </div>
            {/* Period */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Period</label>
              <select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer">
                {["Q1", "Q2", "Q3", "Q4"].map(q => <option key={q} value={q}>{q}</option>)}
              </select>
            </div>
            {/* Notes */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Notes</label>
              <textarea placeholder="Optional notes..." value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none resize-none" />
            </div>
            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setDialogOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
              <button onClick={handleSubmit} className="btn-primary-ercs flex-1">Submit</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
