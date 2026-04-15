import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users, Activity, ShieldCheck, Search,
  Plus, MoreHorizontal, Mail, MapPin,
  Clock, Shield, Lock, Trash2, Edit2,
  FileText, LogIn, AlertTriangle, CheckCircle2,
  Eye, Database, UserPlus, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { addAuditEntry, AUDIT_KEY } from "@/hooks/use-store";

const defaultStats = [
  { label: "Institutional Users", icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "Active Presence", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Permission Sets", icon: Lock, color: "text-blue-500", bg: "bg-blue-50" },
];

const defaultUsers = [
  { name: "Yonas Girma", email: "yonas.g@ercs.org", role: "DATA ENTRY", branch: "Addis Ababa", lastActivity: "2025-06-15 10:05", status: "ACTIVE" },
  { name: "Meron Assefa", email: "meron.a@ercs.org", role: "DATA ENTRY", branch: "Oromia", lastActivity: "2025-06-13 11:30", status: "ACTIVE" },
  { name: "Solomon Tekle", email: "solomon.t@ercs.org", role: "FINANCE OFFICER", branch: "HQ National", branchColor: "text-rose-600", lastActivity: "2025-06-15 07:50", status: "ACTIVE" },
  { name: "Fatima Ahmed", email: "fatima.a@ercs.org", role: "DATA ENTRY", branch: "Somali", lastActivity: "2025-06-12 09:00", status: "ACTIVE" },
  { name: "Bereket Mesfin", email: "bereket.m@ercs.org", role: "READ-ONLY", branch: "HQ National", branchColor: "text-rose-600", lastActivity: "2025-06-10 15:45", status: "ACTIVE" },
  { name: "Sara Wondim", email: "sara.w@ercs.org", role: "BRANCH ADMIN", roleColor: "text-emerald-600", branch: "Tigray", lastActivity: "2025-06-11 13:20", status: "INACTIVE" },
];

const USERS_KEY = "pmer_users";

const ROLE_OPTIONS = ["SUPER ADMIN", "PMER HQ ADMIN", "BRANCH ADMIN", "DATA ENTRY", "FINANCE OFFICER", "READ-ONLY"];
const BRANCH_OPTIONS = ["HQ National", "Addis Ababa", "Amhara", "Oromia", "SNNPR", "Tigray", "Somali", "Dire Dawa", "Harari"];
const STATUS_OPTIONS = ["ACTIVE", "INACTIVE"];

const defaultAuditLogs = [
  { user: "Abebe Tadesse", action: "Approved Q1 report", type: "approval", module: "Reports", timestamp: "2025-06-15 14:30", ip: "10.2.0.15" },
  { user: "Yonas Girma", action: "Submitted monthly indicator data for Addis Ababa", type: "data_entry", module: "Monitoring", timestamp: "2025-06-15 10:05", ip: "10.2.0.22" },
  { user: "Solomon Tekle", action: "Updated budget allocation for ICRC project", type: "modification", module: "Budget", timestamp: "2025-06-15 07:50", ip: "10.2.0.18" },
  { user: "Meron Assefa", action: "Entered Q2 indicator actuals for Oromia", type: "data_entry", module: "Monitoring", timestamp: "2025-06-13 11:30", ip: "10.2.0.45" },
  { user: "Abebe Tadesse", action: "Created new user account: Fatima Ahmed", type: "admin", module: "Users", timestamp: "2025-06-12 16:20", ip: "10.2.0.15" },
  { user: "Fatima Ahmed", action: "First login to system", type: "login", module: "Auth", timestamp: "2025-06-12 09:00", ip: "10.2.0.67" },
  { user: "Sara Wondim", action: "Uploaded quarterly monitoring report for Tigray", type: "data_entry", module: "Documents", timestamp: "2025-06-11 13:20", ip: "10.2.0.33" },
  { user: "Abebe Tadesse", action: "Modified role permissions for Branch Admin", type: "admin", module: "Users", timestamp: "2025-06-10 11:00", ip: "10.2.0.15" },
  { user: "Bereket Mesfin", action: "Viewed donor report - IFRC Q1", type: "view", module: "Reports", timestamp: "2025-06-10 15:45", ip: "10.2.0.15" },
  { user: "Yonas Girma", action: "Exported planning data to Excel", type: "export", module: "Planning", timestamp: "2025-06-09 09:15", ip: "10.2.0.22" },
];

const permissions = [
  { role: "SUPER ADMIN", planning: "full", monitoring: "full", budget: "full", reports: "full", users: "full", documents: "full" },
  { role: "PMER HQ ADMIN", planning: "full", monitoring: "full", budget: "view", reports: "full", users: "view", documents: "full" },
  { role: "BRANCH ADMIN", planning: "branch", monitoring: "branch", budget: "view", reports: "branch", users: "branch", documents: "branch" },
  { role: "DATA ENTRY", planning: "none", monitoring: "entry", budget: "none", reports: "view", users: "none", documents: "upload" },
  { role: "FINANCE OFFICER", planning: "view", monitoring: "view", budget: "full", reports: "view", users: "none", documents: "view" },
  { role: "READ-ONLY", planning: "view", monitoring: "view", budget: "view", reports: "view", users: "none", documents: "view" },
];

function getActionIcon(type: string) {
  switch (type) {
    case "approval": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    case "data_entry": return <Database className="w-4 h-4 text-blue-500" />;
    case "modification": return <Edit2 className="w-4 h-4 text-amber-500" />;
    case "admin": return <Settings className="w-4 h-4 text-violet-500" />;
    case "login": return <LogIn className="w-4 h-4 text-slate-500" />;
    case "view": return <Eye className="w-4 h-4 text-slate-400" />;
    case "export": return <FileText className="w-4 h-4 text-blue-400" />;
    default: return <Activity className="w-4 h-4 text-slate-400" />;
  }
}

function getPermBadge(level: string) {
  switch (level) {
    case "full": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200">Full</span>;
    case "branch": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-200">Branch</span>;
    case "entry": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">Entry</span>;
    case "upload": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-200">Upload</span>;
    case "view": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-50 text-slate-500 border border-slate-200">View</span>;
    case "none": return <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-400 border border-rose-200">None</span>;
    default: return null;
  }
}

function generateEmail(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return "";
  const first = parts[0].toLowerCase();
  const lastInitial = parts[parts.length - 1][0]?.toLowerCase() || "";
  return `${first}.${lastInitial}@ercs.org`;
}

export default function UsersPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "users");
  const { toast } = useToast();

  // ── localStorage-backed users ──
  const [users, setUsers] = useState(() => {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      return stored ? JSON.parse(stored) : defaultUsers;
    } catch { return defaultUsers; }
  });

  // Persist users whenever they change
  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  // Seed default users on very first load
  useEffect(() => {
    if (!localStorage.getItem(USERS_KEY)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }
  }, []);

  // ── Merged audit logs (hardcoded + localStorage) ──
  const mergedAuditLogs = React.useMemo(() => {
    const stored: any[] = JSON.parse(localStorage.getItem(AUDIT_KEY) || "[]");
    const hardcodedIds = new Set(defaultAuditLogs.map(l => l.timestamp + l.action));
    const deduped = stored.filter(s => !hardcodedIds.has(s.timestamp + s.action));
    return [...deduped, ...defaultAuditLogs].sort((a, b) =>
      b.timestamp.localeCompare(a.timestamp)
    );
  }, [users]); // re-derive when users changes (after adding)

  // ── Add User dialog state ──
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "", email: "", role: "DATA ENTRY", branch: "HQ National", status: "ACTIVE",
  });

  const handleNameChange = (name: string) => {
    const email = generateEmail(name);
    setNewUser(prev => ({ ...prev, name, email }));
  };

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast({ title: "Missing fields", description: "Full Name and Email are required.", variant: "destructive" });
      return;
    }
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const userEntry = {
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      role: newUser.role,
      branch: newUser.branch,
      branchColor: newUser.branch === "HQ National" ? "text-rose-600" : undefined,
      roleColor: newUser.role === "BRANCH ADMIN" ? "text-emerald-600" : undefined,
      lastActivity: now,
      status: newUser.status,
    };
    setUsers((prev: any[]) => [userEntry, ...prev]);
    addAuditEntry({ user: "System Admin", action: `Created new user: ${newUser.name.trim()}`, type: "admin", module: "Users" });
    toast({ title: "User created", description: `${newUser.name.trim()} has been added to the system.`, variant: "success" });
    setNewUser({ name: "", email: "", role: "DATA ENTRY", branch: "HQ National", status: "ACTIVE" });
    setAddUserOpen(false);
  };

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t) setActiveTab(t);
  }, [searchParams]);

  return (
    <div className="page-container pb-20">
      {/* ── Hero section ── */}
      <div className="ercs-hero-glass p-12 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-rose-600 font-black text-[10px] uppercase tracking-[0.2em]">Identity Gateway</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div>
              <h1 className="hero-title text-6xl leading-tight">System</h1>
              <h1 className="hero-title text-6xl text-[#E11D48] italic leading-tight">Governance</h1>
              <p className="hero-subtitle mt-6">
                Enterprise role-based permissions and institutional oversight for organizational integrity and accountability.
              </p>
            </div>

            <button onClick={() => setAddUserOpen(true)} className="btn-primary-ercs flex items-center gap-2 px-8 self-start lg:self-center">
              <Shield className="w-5 h-5" />
              <span>Control Access</span>
            </button>
          </div>
        </div>

        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(() => {
          const computedStats = [
            { ...defaultStats[0], value: String(users.length) },
            { ...defaultStats[1], value: String(users.filter((u: any) => u.status === "ACTIVE").length) },
            { ...defaultStats[2], value: String(new Set(users.map((u: any) => u.role)).size) },
          ];
          return computedStats.map((stat, i) => (
            <div key={i} className="ercs-card-premium p-8 flex items-center gap-6 group hover-lift">
              <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <h3 className="stat-value">{stat.value}</h3>
                <p className="stat-label mb-0 uppercase tracking-widest">{stat.label}</p>
              </div>
            </div>
          ));
        })()}
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center gap-8 mb-6 ml-2">
         {[
           { id: "users", label: "SYSTEM USERS" },
           { id: "permissions", label: "PERMISSIONS" },
           { id: "audit", label: "AUDIT LOG" },
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={cn(
               "text-[10px] font-black tracking-widest uppercase transition-all pb-2 border-b-2",
               activeTab === tab.id ? "text-slate-900 border-[#E11D48]" : "text-slate-400 border-transparent hover:text-slate-600"
             )}
           >
             {tab.label}
           </button>
         ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "users" && (
        <div className="ercs-card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Last Activity</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.map((user, i) => (
                  <tr key={i} className="group hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-800">{user.name}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[13px] font-medium text-slate-500">{user.email}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200",
                        user.role === "FINANCE OFFICER" && "bg-blue-50 text-blue-600 border-blue-100",
                        user.role === "BRANCH ADMIN" && "bg-emerald-50 text-emerald-600 border-emerald-100"
                      )}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn("text-[13px] font-black", user.branchColor || "text-slate-800")}>{user.branch}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[12px] font-medium text-slate-400">{user.lastActivity}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase",
                        user.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <button className="p-2 rounded-xl text-slate-300 hover:text-slate-600 hover:bg-white hover:shadow-sm transition-all">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "permissions" && (
        <div className="ercs-card-premium overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">Role-Based Access Control Matrix</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Permission levels across all PMER-MIS modules by user role</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Planning</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Monitoring</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Reports</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Users</th>
                  <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {permissions.map((perm, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-800">{perm.role}</span>
                    </td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.planning)}</td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.monitoring)}</td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.budget)}</td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.reports)}</td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.users)}</td>
                    <td className="px-8 py-5 text-center">{getPermBadge(perm.documents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-6 bg-slate-50/50 border-t border-slate-100">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">{getPermBadge("full")} <span className="text-[10px] font-bold text-slate-500">Full access (CRUD)</span></div>
              <div className="flex items-center gap-2">{getPermBadge("branch")} <span className="text-[10px] font-bold text-slate-500">Branch-level only</span></div>
              <div className="flex items-center gap-2">{getPermBadge("entry")} <span className="text-[10px] font-bold text-slate-500">Data entry only</span></div>
              <div className="flex items-center gap-2">{getPermBadge("view")} <span className="text-[10px] font-bold text-slate-500">View only</span></div>
              <div className="flex items-center gap-2">{getPermBadge("none")} <span className="text-[10px] font-bold text-slate-500">No access</span></div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="ercs-card-premium overflow-hidden">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">System Audit Trail</h3>
              <p className="text-sm font-medium text-slate-400 mt-1">Complete record of data entry, modifications, approvals, and login activity</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest border border-emerald-200">
              {mergedAuditLogs.length} Records
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">User</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Module</th>
                  <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mergedAuditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-8 py-5">
                      <span className="text-[12px] font-medium text-slate-400 font-mono">{log.timestamp}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-black text-slate-800">{log.user}</span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        {getActionIcon(log.type)}
                        <span className="text-[13px] font-medium text-slate-600">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-2.5 py-1 rounded text-[9px] font-black tracking-widest uppercase bg-slate-100 text-slate-500 border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-[12px] font-mono text-slate-400">{log.ip}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Add User Dialog ── */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-[620px] rounded-3xl p-0 border-none overflow-hidden">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6">
            <DialogHeader>
              <DialogTitle className="text-white text-xl font-black tracking-tight">Add New User</DialogTitle>
              <p className="text-slate-400 text-sm font-medium">Create a new institutional user account with role-based access</p>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Full Name</label>
              <input
                value={newUser.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. Abebe Tadesse"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email</label>
              <input
                value={newUser.email}
                onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                placeholder="firstname.l@ercs.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Role</label>
              <select
                value={newUser.role}
                onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Branch</label>
              <select
                value={newUser.branch}
                onChange={e => setNewUser(prev => ({ ...prev, branch: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                {BRANCH_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Status</label>
              <select
                value={newUser.status}
                onChange={e => setNewUser(prev => ({ ...prev, status: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-sm font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-300 outline-none appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <button type="button" onClick={() => setAddUserOpen(false)} className="btn-secondary-ercs flex-1">Cancel</button>
              <button type="button" onClick={handleAddUser} className="btn-primary-ercs flex-1">Create User</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
