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
  if (!qs && search) return true;
  return true;
}

/* ── Rich module descriptions ── */
const moduleDetails: Record<string, { summary: string; features: { name: string; desc: string }[] }> = {
  dashboard: {
    summary: "Executive overview with real-time KPIs, traffic light performance system, and national aggregation across all ERCS branches and programs.",
    features: [
      { name: "Live KPIs", desc: "National achievement, direct reach, reporting velocity, indicator health" },
      { name: "Traffic Light System", desc: "Green (≥90%), Yellow (70-89%), Red (<70%) performance classification" },
      { name: "Quarter & View Switching", desc: "Filter by Q1-Q4 and National/Branch/Donor perspectives" },
      { name: "Portfolio Monitoring", desc: "Circular progress for DRM, Health, Org Readiness, Youth sectors" },
    ],
  },
  planning: {
    summary: "Digitize ERCS planning from strategic plan to branch-level activity planning with logframe integration and Gantt chart visualization.",
    features: [
      { name: "Operational Plans", desc: "Create and manage Annual Operational Plans (AOPs) per branch with status tracking" },
      { name: "Workplan & Gantt", desc: "Visual 12-month timeline with activity bars, milestones, and delay alerts" },
      { name: "Periodic Targets", desc: "Quarterly target-setting with Q1-Q4 actual tracking and achievement %" },
      { name: "Financial Resources", desc: "Budget allocation by donor with absorption rates and variance" },
      { name: "Logframe / ToC", desc: "Visual hierarchy: Strategic Priority → Outcomes → Outputs → Activities" },
    ],
  },
  monitoring: {
    summary: "Real-time indicator tracking with data entry forms, auto-calculated achievement, and disaggregation by sex and age group.",
    features: [
      { name: "Indicator Registry", desc: "Centralized library with Output/Outcome/Impact types, search, and filters" },
      { name: "Data Collection", desc: "Branch-level monthly data entry with validation, traffic lights, and variance notes" },
    ],
  },
  budget: {
    summary: "Link financial planning with programmatic performance. Track expenditure, absorption rates, and cost efficiency metrics.",
    features: [
      { name: "Budget Overview", desc: "Total budget, spent, remaining, and burn rate with quarterly absorption chart" },
      { name: "Absorption & Variance", desc: "Activity-level absorption matrix with donor distribution pie chart" },
      { name: "Cost Efficiency", desc: "Cost per beneficiary, operational ROI, and system burn rate metrics" },
    ],
  },
  consolidation: {
    summary: "Automatically consolidate branch submissions into a centralized national database with data quality checks and duplicate detection.",
    features: [
      { name: "Branch Submissions", desc: "Track monthly/quarterly submission status per branch with completeness" },
      { name: "National Aggregation", desc: "Real-time rollup with filtering by Region, Program, Donor, and Period" },
    ],
  },
  reports: {
    summary: "Generate standardized donor-ready reports with a visual report builder. Customize columns, format, and export to PDF/Excel/Word.",
    features: [
      { name: "Report Templates", desc: "Monthly, Quarterly, Semi-Annual, Annual + donor-specific (IFRC, ICRC, NRC)" },
      { name: "Donor Reports", desc: "Pre-formatted templates matching IFRC, ICRC, and PNS reporting requirements" },
      { name: "Export Center", desc: "Drag-and-drop column builder with live preview and multi-format export" },
    ],
  },
  users: {
    summary: "Role-based access control with 6 permission levels, branch-level data restriction, and comprehensive audit trail.",
    features: [
      { name: "System Users", desc: "Manage users with roles: Super Admin, PMER Admin, Branch Admin, Data Entry, Finance, Read-only" },
      { name: "Regional Users", desc: "Branch-level user provisioning with decentralized management" },
      { name: "Permissions Matrix", desc: "Visual RBAC matrix showing access levels across all modules" },
      { name: "Audit Trail", desc: "Full record of data entry, modifications, approvals, and login activity" },
    ],
  },
  documents: {
    summary: "Centralized knowledge repository for all PMER documents including assessments, reports, logframes, and evaluation tools.",
    features: [
      { name: "Document Library", desc: "8 archive categories with drill-down to individual documents, search, and file management" },
    ],
  },
};

/* ── Hover detail panel (rendered via portal with fixed positioning) ── */
function ModuleDetailPanel({ mod, collapsed, rect }: { mod: NavModule; collapsed: boolean; rect: DOMRect }) {
  const details = moduleDetails[mod.id];
  if (!details) return null;

  // Position: to the right of the sidebar item, vertically aligned, clamped to viewport
  const left = rect.right + 12;
  const maxTop = window.innerHeight - 420;
  const top = Math.max(8, Math.min(rect.top, maxTop));

  return (
    <div
      className="fixed z-[200] animate-in fade-in slide-in-from-left-2 duration-200"
      style={{ left, top, width: collapsed ? 320 : 340 }}
    >
      <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 overflow-hidden">
        {/* Gradient header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#E11D48]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10 flex items-start gap-3">
            {mod.prefix ? (
              <span className="w-8 h-8 rounded-xl bg-[#E11D48]/20 text-[#E11D48] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{mod.prefix}</span>
            ) : (
              <span className="w-8 h-8 rounded-xl bg-white/10 text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                <mod.icon className="w-4 h-4" />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-white font-black text-[15px] tracking-tight">{mod.label}</p>
                {mod.badge && (
                  <span className="px-2 py-0.5 rounded-full bg-[#E11D48]/30 text-[#E11D48] text-[8px] font-black uppercase tracking-widest animate-pulse">{mod.badge}</span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] font-medium mt-1 leading-relaxed">{details.summary}</p>
            </div>
          </div>
        </div>

        {/* Feature list */}
        <div className="p-4 space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Capabilities</p>
          {details.features.map((f, i) => (
            <div key={i} className="flex gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors group/feat cursor-default">
              <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center shrink-0 mt-0.5 group-hover/feat:bg-rose-100 transition-colors">
                <span className="text-[#E11D48] text-[10px] font-black">{i + 1}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-slate-800 tracking-tight">{f.name}</p>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-snug">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with children links (collapsed mode only) */}
        {collapsed && mod.children && (
          <div className="border-t border-slate-100 p-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-2">Quick Navigation</p>
            <div className="flex flex-wrap gap-1.5 px-1">
              {mod.children.map((child) => (
                <Link key={child.label} to={child.to}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-600 hover:bg-[#E11D48] hover:text-white transition-all">
                  {child.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
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

  // Hover detail panel state
  const [hoveredMod, setHoveredMod] = useState<NavModule | null>(null);
  const [hoverRect, setHoverRect] = useState<DOMRect | null>(null);
  const hoverTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const onModuleEnter = (mod: NavModule, el: HTMLElement) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredMod(mod);
    setHoverRect(el.getBoundingClientRect());
  };
  const onModuleLeave = () => {
    hoverTimeout.current = setTimeout(() => { setHoveredMod(null); setHoverRect(null); }, 150);
  };
  const onPanelEnter = () => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  };
  const onPanelLeave = () => {
    setHoveredMod(null); setHoverRect(null);
  };

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
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white shrink-0 shadow-2xl overflow-hidden p-1">
            <img src="/ercs-logo.jpg" alt="ERCS" className="w-full h-full object-contain" />
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
                    onMouseEnter={(e) => onModuleEnter(mod, e.currentTarget)}
                    onMouseLeave={onModuleLeave}
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
                  onMouseEnter={(e) => onModuleEnter(mod, e.currentTarget)}
                  onMouseLeave={onModuleLeave}
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

      {/* ── Hover Detail Panel (fixed, rendered outside sidebar to avoid clipping) ── */}
      {hoveredMod && hoverRect && (
        <div
          onMouseEnter={onPanelEnter}
          onMouseLeave={onPanelLeave}
        >
          <ModuleDetailPanel mod={hoveredMod} collapsed={collapsed} rect={hoverRect} />
        </div>
      )}

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
