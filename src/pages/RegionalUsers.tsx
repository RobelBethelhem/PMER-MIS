import React, { useState } from "react";
import { 
  Users, Shield, MapPin, Search, 
  ArrowLeft, ChevronRight, Mail, Clock,
  UserPlus, MoreHorizontal, Filter, 
  Activity, Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const branches = [
  { name: "Addis Ababa", users: 12, admins: 2, status: "ACTIVE", lastActive: "10m ago" },
  { name: "Amhara", users: 8, admins: 1, status: "ACTIVE", lastActive: "2h ago" },
  { name: "Oromia", users: 15, admins: 3, status: "ACTIVE", lastActive: "5m ago" },
  { name: "SNNPR", users: 6, admins: 1, status: "INACTIVE", lastActive: "2d ago" },
  { name: "Tigray", users: 9, admins: 2, status: "ACTIVE", lastActive: "1h ago" },
  { name: "Somali", users: 7, admins: 1, status: "ACTIVE", lastActive: "4h ago" },
];

const mockUsers = [
  { name: "Yonas Girma", email: "yonas.g@ercs.org", role: "DATA ENTRY", branch: "Addis Ababa", lastActivity: "2025-06-15 10:05", status: "ACTIVE" },
  { name: "Meron Assefa", email: "meron.a@ercs.org", role: "DATA ENTRY", branch: "Addis Ababa", lastActivity: "2025-06-13 11:30", status: "ACTIVE" },
  { name: "Tadesse W.", email: "tadesse.w@ercs.org", role: "BRANCH ADMIN", branch: "Addis Ababa", lastActivity: "2025-06-15 08:20", status: "ACTIVE" },
  { name: "Abebe K.", email: "abebe.k@ercs.org", role: "DATA ENTRY", branch: "Addis Ababa", lastActivity: "2025-06-14 16:45", status: "INACTIVE" },
];

export default function RegionalUsers() {
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  if (selectedBranch) {
    return <BranchUsersView branchName={selectedBranch} onBack={() => setSelectedBranch(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden mb-12">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em]">Institutional Network</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-none">
                Regional <span className="text-[#E11D48] italic">Users</span>
              </h1>
              <p className="text-slate-500 font-medium mt-6 max-w-2xl">
                Decentralized identity management for branch-level operational teams and administrative protocols.
              </p>
            </div>

            <button className="flex items-center gap-3 px-8 py-5 rounded-2xl bg-[#E11D48] text-[11px] font-black text-white uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:bg-rose-600 transition-all self-start lg:self-center">
              <UserPlus className="w-5 h-5" />
              Provision Branch User
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Branch Directory Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {branches.map((b, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedBranch(b.name)}
            className="ercs-card-premium p-10 group hover-lift cursor-pointer flex flex-col"
          >
            <div className="flex items-start justify-between mb-10">
               <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", b.status === "ACTIVE" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-slate-300")} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Profile</span>
               </div>
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Clock className="w-3 h-3" /> {b.lastActive}
               </span>
            </div>

            <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-[#E11D48] transition-colors">{b.name}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-10">Regional Operations Hub</p>

            <div className="grid grid-cols-2 gap-4 mt-auto">
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-2xl font-black text-slate-800">{b.users}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Users</span>
               </div>
               <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col items-center">
                  <span className="text-2xl font-black text-blue-600">{b.admins}</span>
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Admins</span>
               </div>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
               <div className="flex -space-x-3">
                  {[1,2,3,4].map(u => (
                    <div key={u} className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400">ER</div>
                  ))}
               </div>
               <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-rose-500 transition-all group-hover:translate-x-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BranchUsersView({ branchName, onBack }: { branchName: string, onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-8 pt-8">
      <div className="ercs-card-premium p-10 mb-10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <button 
              onClick={onBack}
              className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#E11D48] shadow-sm transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg border border-emerald-100 uppercase tracking-widest">Active Branch</span>
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight leading-none">
                {branchName} <span className="text-[#E11D48] italic">Directory</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                className="pl-12 pr-4 py-4 w-64 rounded-2xl bg-slate-50 border-none text-sm font-medium focus:ring-2 focus:ring-rose-500/20"
                placeholder="Search branch users..."
              />
            </div>
            <button className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-600 shadow-sm transition-all">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="ercs-card-premium p-0 overflow-hidden shadow-xl shadow-slate-200/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-10 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Credential</th>
                <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Role</th>
                <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Intelligence</th>
                <th className="px-8 py-8 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Status</th>
                <th className="px-6 py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {mockUsers.map((user, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4 text-slate-800">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 border-2 border-white shadow-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm font-black tracking-tight">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className="text-[12px] font-bold text-slate-400 tracking-tight">{user.email}</span>
                  </td>
                  <td className="px-8 py-8">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black tracking-widest uppercase border",
                      user.role === "BRANCH ADMIN" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-100 text-slate-400 border-slate-200"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                       <Clock className="w-3.5 h-3.5" /> {user.lastActivity}
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <span className={cn(
                      "flex items-center gap-2 text-[10px] font-black tracking-widest uppercase",
                      user.status === "ACTIVE" ? "text-emerald-500" : "text-rose-400"
                    )}>
                      <div className={cn("w-1.5 h-1.5 rounded-full", user.status === "ACTIVE" ? "bg-emerald-500" : "bg-rose-400")} />
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-8 text-center">
                    <button className="w-10 h-10 rounded-xl hover:bg-white hover:text-rose-500 transition-all flex items-center justify-center text-slate-300">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
