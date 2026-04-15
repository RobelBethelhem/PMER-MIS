<<<<<<< HEAD
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, getBranchName, rolePermissions, auditLog, type UserRole } from "@/data/mockData";
import { Check, X, Shield } from "lucide-react";

const roleBadgeColors: Record<UserRole, string> = {
  "Super Admin": "bg-primary text-primary-foreground",
  "PMER Admin": "bg-traffic-yellow/20 text-foreground",
  "Branch Admin": "bg-traffic-green/20 text-foreground",
  "Data Entry": "bg-muted text-muted-foreground",
  "Finance Officer": "bg-primary/10 text-primary",
  "Read-only": "bg-muted text-muted-foreground",
};

export default function UsersPage() {
  const roles = Object.keys(rolePermissions) as UserRole[];
  const permissions = Object.keys(rolePermissions["Super Admin"]);
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-sm text-muted-foreground">Role-based access control and audit trail</p>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="roles">Role Matrix</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(u => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell><Badge className={`text-[10px] ${roleBadgeColors[u.role]}`}>{u.role}</Badge></TableCell>
                      <TableCell className="text-sm">{u.branchId ? getBranchName(u.branchId) : "HQ"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.lastLogin}</TableCell>
                      <TableCell><Badge variant={u.active ? "default" : "outline"} className={u.active ? "bg-traffic-green/20 text-traffic-green" : ""}>{u.active ? "Active" : "Inactive"}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" /> Permission Matrix</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-card z-10">Permission</TableHead>
                    {roles.map(r => <TableHead key={r} className="text-center text-xs whitespace-nowrap">{r}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {permissions.map(perm => (
                    <TableRow key={perm}>
                      <TableCell className="font-medium text-sm sticky left-0 bg-card z-10">{perm}</TableCell>
                      {roles.map(r => (
                        <TableCell key={r} className="text-center">
                          {rolePermissions[r][perm]
                            ? <Check className="h-4 w-4 text-traffic-green mx-auto" />
                            : <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLog.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{entry.timestamp}</TableCell>
                      <TableCell className="font-medium text-sm">{userMap[entry.userId]?.name ?? entry.userId}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{entry.action}</Badge></TableCell>
                      <TableCell className="text-sm">{entry.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
=======
import React from "react";
import { 
  Users, Activity, ShieldCheck, Search, 
  Plus, MoreHorizontal, Mail, MapPin, 
  Clock, Shield, Lock, Trash2, Edit2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const stats = [
  { label: "Institutional Users", value: "10", icon: Users, color: "text-rose-500", bg: "bg-rose-50" },
  { label: "Active Presence", value: "9", icon: Activity, color: "text-emerald-500", bg: "bg-emerald-50" },
  { label: "Permission Sets", value: "9", icon: Lock, color: "text-blue-500", bg: "bg-blue-50" },
];

const users = [
  { name: "Yonas Girma", email: "yonas.g@ercs.org", role: "DATA ENTRY", branch: "Addis Ababa", lastActivity: "2025-06-15 10:05", status: "ACTIVE" },
  { name: "Meron Assefa", email: "meron.a@ercs.org", role: "DATA ENTRY", branch: "Oromia", lastActivity: "2025-06-13 11:30", status: "ACTIVE" },
  { name: "Solomon Tekle", email: "solomon.t@ercs.org", role: "FINANCE OFFICER", branch: "HQ National", branchColor: "text-rose-600", lastActivity: "2025-06-15 07:50", status: "ACTIVE" },
  { name: "Fatima Ahmed", email: "fatima.a@ercs.org", role: "DATA ENTRY", branch: "Somali", lastActivity: "2025-06-12 09:00", status: "ACTIVE" },
  { name: "Bereket Mesfin", email: "bereket.m@ercs.org", role: "READ-ONLY", branch: "HQ National", branchColor: "text-rose-600", lastActivity: "2025-06-10 15:45", status: "ACTIVE" },
  { name: "Sara Wondim", email: "sara.w@ercs.org", role: "BRANCH ADMIN", roleColor: "text-emerald-600", branch: "Tigray", lastActivity: "2025-06-11 13:20", status: "INACTIVE" },
];

export default function UsersPage() {
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

            <button className="btn-primary-ercs flex items-center gap-2 px-8 self-start lg:self-center">
              <Shield className="w-5 h-5" />
              <span>Control Access</span>
            </button>
          </div>
        </div>
        
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="ercs-card-premium p-8 flex items-center gap-6 group hover-lift">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon className={cn("w-6 h-6", stat.color)} />
            </div>
            <div>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label mb-0 uppercase tracking-widest">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabs & Table ── */}
      <div className="flex items-center gap-8 mb-6 ml-2">
         {["SYSTEM USERS", "PERMISSIONS", "AUDIT LOG"].map((tab, i) => (
           <button 
             key={tab} 
             className={cn(
               "text-[10px] font-black tracking-widest uppercase transition-all pb-2 border-b-2",
               i === 0 ? "text-slate-900 border-[#E11D48]" : "text-slate-400 border-transparent hover:text-slate-600"
             )}
           >
             {tab}
           </button>
         ))}
      </div>

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
>>>>>>> e0b16a6 (commit)
    </div>
  );
}
