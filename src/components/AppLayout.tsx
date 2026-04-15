import React, { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate, Link } from "react-router-dom";
import {
  LayoutDashboard, Target, Activity, DollarSign,
  FileText, Users, FolderOpen, ChevronLeft, ChevronDown,
  Bell, Search, Settings, LogOut, User,
  ArrowRight, MapPin, FileEdit, Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

/* ────────────────────────────────────────────────────────
   ToR-aligned module structure (A through G)
   ──────────────────────────────────────────────────────── */

interface NavChild { label: string; to: string; badge?: string }
interface NavModule {
  id: string; label: string; prefix?: string; icon: any;
  desc: string; badge?: string; to?: string; children?: NavChild[];
}

const modules: NavModule[] = [
  {
    id: "dashboard", label: "Dashboard", icon: LayoutDashboard,
    desc: "Executive Overview", to: "/",
  },
  {
    id: "planning", label: "Planning Module", prefix: "A", icon: Target,
    desc: "Strategic & Operational",
    children: [
      { label: "Operational Plans", to: "/planning" },
      { label: "Workplan & Gantt", to: "/planning?tab=workplan" },
      { label: "Periodic Targets", to: "/planning?tab=targets" },
      { label: "Financial Resources", to: "/planning?tab=finance" },
      { label: "Logframe / ToC", to: "/planning?tab=theory" },
    ],
  },
  {
    id: "monitoring", label: "Monitoring Module", prefix: "B", icon: Activity,
    desc: "Indicator & Performance", badge: "Live",
    children: [
      { label: "Indicator Registry", to: "/monitoring" },
      { label: "Data Collection", to: "/data-entry", badge: "New" },
    ],
  },
  {
    id: "budget", label: "Budget & Finance", prefix: "C", icon: DollarSign,
    desc: "Financial Tracking",
    children: [
      { label: "Budget Overview", to: "/budget" },
      { label: "Absorption & Variance", to: "/budget" },
      { label: "Cost Efficiency", to: "/budget" },
    ],
  },
  {
    id: "consolidation", label: "Data Consolidation", prefix: "D", icon: Database,
    desc: "Aggregation & Quality",
    children: [
      { label: "Branch Submissions", to: "/consolidation" },
      { label: "National Aggregation", to: "/consolidation" },
    ],
  },
  {
    id: "reports", label: "Reports & Analytics", prefix: "E", icon: FileText,
    desc: "Visualization & Export",
    children: [
      { label: "Report Templates", to: "/reports" },
      { label: "Donor Reports", to: "/reports" },
      { label: "Export Center", to: "/reports" },
    ],
  },
  {
    id: "users", label: "User Management", prefix: "F", icon: Users,
    desc: "Access Control",
    children: [
      { label: "System Users", to: "/users" },
      { label: "Regional Users", to: "/regional-users" },
      { label: "Permissions Matrix", to: "/users?tab=permissions" },
      { label: "Audit Trail", to: "/users?tab=audit" },
    ],
  },
  {
    id: "documents", label: "Knowledge Base", prefix: "G", icon: FolderOpen,
    desc: "Document Repository",
    children: [
      { label: "Document Library", to: "/documents" },
    ],
  },
];

/* ── helpers ── */

function getChildPath(to: string) { return to.split("?")[0]; }

function isModuleActive(mod: NavModule, pathname: string) {
  if (mod.to) return mod.to === "/" ? pathname === "/" : pathname.startsWith(mod.to);
  return mod.children?.some((c) => pathname.startsWith(getChildPath(c.to))) ?? false;
}

function isChildActive(to: string, pathname: string, search: string) {
  const path = getChildPath(to);
  const qs = to.includes("?") ? to.slice(to.indexOf("?")) : "";
  if (path !== pathname) return false;
  if (qs && search !== qs) return false;
  if (!qs && !search) return true;
  if (!qs && search) return true; // first child matches base path
  return true;
}

/* ════════════════════════════════════════════════════════ */

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // auto-expand module containing current route
  const [expanded, setExpanded] = useState<string[]>(() => {
    const active = modules.find((m) => isModuleActive(m, location.pathname));
    return active ? [active.id] : [];
  });

  useEffect(() => {
    const active = modules.find((m) => isModuleActive(m, location.pathname));
    if (active && !expanded.includes(active.id)) {
      setExpanded((prev) => [...prev, active.id]);
    }
  }, [location.pathname]);

  const toggle = (id: string) =>
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const authUser = (() => {
    try { return JSON.parse(localStorage.getItem("pmer_auth") || "{}"); }
    catch { return {}; }
  })();

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "sidebar-container flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 relative z-30",
          collapsed ? "w-[84px]" : "w-[290px]"
        )}
      >
        {/* Logo */}
        <div className={cn(
          "flex items-center gap-4 border-b border-white/5 transition-all duration-300",
          collapsed ? "px-4 py-6 justify-center" : "px-6 py-7"
        )}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white shrink-0 shadow-2xl">
            <svg viewBox="0 0 24 24" fill="#E11D48" className="w-7 h-7"><path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" /></svg>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-[#0f172a] animate-pulse" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white font-black text-[15px] tracking-tight leading-none mb-1">ERCS <span className="text-[#E11D48]">PMER-MIS</span></p>
              <p className="text-slate-500 text-[8px] font-bold uppercase tracking-[0.2em]">Institutional Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-4 pb-2 scrollbar-thin">
          {modules.map((mod) => {
            const active = isModuleActive(mod, location.pathname);
            const isOpen = expanded.includes(mod.id);

            /* ── Dashboard (direct link, no children) ── */
            if (mod.to) {
              return (
                <div key={mod.id} className="px-3 mb-1">
                  {!collapsed && (
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] px-3 pt-3 pb-2">Overview</p>
                  )}
                  <NavLink
                    to={mod.to}
                    end
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl text-[13px] transition-all duration-300",
                      collapsed ? "px-3 py-3 justify-center" : "px-4 py-3",
                      active ? "sidebar-item-active" : "text-slate-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <mod.icon className={cn("w-[18px] h-[18px] shrink-0 stroke-[2.5px]", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                    {!collapsed && <span className="font-bold tracking-wide">{mod.label}</span>}
                  </NavLink>
                </div>
              );
            }

            /* ── Module with children ── */
            return (
              <div key={mod.id} className="px-3 mb-0.5">
                {/* Section label */}
                {!collapsed && (
                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em] px-3 pt-5 pb-1.5">
                    Module {mod.prefix}
                  </p>
                )}

                {/* Module header */}
                <button
                  onClick={() => {
                    if (collapsed) {
                      const first = mod.children?.[0];
                      if (first) navigate(first.to);
                    } else {
                      toggle(mod.id);
                    }
                  }}
                  className={cn(
                    "w-full group flex items-center gap-3 rounded-2xl text-[13px] transition-all duration-300",
                    collapsed ? "px-3 py-3 justify-center" : "px-4 py-2.5",
                    active ? "bg-white/[0.07] text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )}>
                    <mod.icon className="w-[18px] h-[18px] stroke-[2.5px]" />
                  </div>
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left font-bold tracking-wide truncate">{mod.label}</span>
                      {mod.badge && (
                        <span className="px-1.5 py-0.5 rounded-full bg-[#E11D48]/20 text-[#E11D48] text-[8px] font-black uppercase tracking-widest mr-1">
                          {mod.badge}
                        </span>
                      )}
                      <ChevronDown className={cn(
                        "w-3.5 h-3.5 text-slate-500 transition-transform duration-300 shrink-0",
                        isOpen && "rotate-180"
                      )} />
                    </>
                  )}
                </button>

                {/* Sub-items */}
                {!collapsed && (
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <div className="ml-[22px] mt-1 mb-2 space-y-0.5 border-l border-white/10 pl-4">
                      {mod.children!.map((child) => {
                        const childActive = isChildActive(child.to, location.pathname, location.search);
                        return (
                          <Link
                            key={child.label}
                            to={child.to}
                            className={cn(
                              "group/child flex items-center gap-3 py-2 px-3 rounded-xl text-[12px] transition-all duration-200",
                              childActive
                                ? "text-white bg-white/10 font-bold"
                                : "text-slate-500 hover:text-slate-200 hover:bg-white/5 font-medium"
                            )}
                          >
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0 transition-colors",
                              childActive ? "bg-[#E11D48]" : "bg-slate-600 group-hover/child:bg-slate-400"
                            )} />
                            <span className="truncate">{child.label}</span>
                            {child.badge && (
                              <span className="ml-auto px-1.5 py-0.5 rounded bg-[#E11D48]/20 text-[#E11D48] text-[7px] font-black uppercase tracking-widest">
                                {child.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User card */}
        <div className="mt-auto p-3 border-t border-white/5 bg-black/20">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-3 py-3">
              <Avatar className="w-9 h-9 border-2 border-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-700 text-white font-black text-[10px]">
                  {(authUser.name || "AT").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-xs truncate">{authUser.name || "Admin"}</p>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[7px] font-black text-slate-300 uppercase">{authUser.role || "Admin"}</span>
                </div>
              </div>
              <button
                onClick={() => { localStorage.removeItem("pmer_auth"); navigate("/login"); }}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-3">
              <Avatar className="w-9 h-9 ring-2 ring-emerald-500/20">
                <AvatarFallback className="bg-rose-500 text-white text-[10px] font-black">
                  {(authUser.name || "AT").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-400 hover:text-[#E11D48] transition-all z-50"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        <header className="h-20 flex items-center px-10 shrink-0 z-20">
          <div className="relative group flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#E11D48] transition-colors" />
            <input
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-4 focus:ring-rose-500/5 focus:border-rose-200 placeholder:text-slate-400 transition-all font-medium"
              placeholder="Search platform..."
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-lg">
              <span className="text-xs">⌘</span>K
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-2xl text-slate-400 hover:bg-white hover:text-[#E11D48] hover:shadow-xl hover:shadow-rose-500/5 transition-all">
              <Bell className="w-5 h-5 stroke-[2.5px]" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E11D48] rounded-full border-4 border-[#F8FAFC]" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 py-1.5 pl-1.5 pr-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <Avatar className="w-8 h-8 rounded-xl ring-2 ring-slate-100">
                    <AvatarFallback className="bg-rose-500 text-white text-[10px] font-black">
                      {(authUser.name || "AT").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 leading-none mb-0.5">{(authUser.name || "Admin").split(" ")[0]}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{authUser.role || "Admin"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200 shadow-2xl">
                <DropdownMenuLabel className="font-black px-3 py-2">Account Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"><User className="w-4 h-4 text-slate-400" /> Profile Settings</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"><Settings className="w-4 h-4 text-slate-400" /> System Preferences</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 text-rose-600 cursor-pointer font-bold" onClick={() => { localStorage.removeItem("pmer_auth"); navigate("/login"); }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
