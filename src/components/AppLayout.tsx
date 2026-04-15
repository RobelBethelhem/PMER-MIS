<<<<<<< HEAD
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Planning, Monitoring, Evaluation & Reporting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center">
                  3
                </span>
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
=======
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Target, Activity, DollarSign,
  FileText, Users, FolderOpen, ChevronLeft,
  Bell, Search, Settings, LogOut, User, Sparkles,
  ArrowRight, MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/",           label: "Dashboard",  icon: LayoutDashboard, desc: "Overview & KPIs" },
  { to: "/planning",   label: "Planning",   icon: Target,          desc: "Programs & activities" },
  { to: "/monitoring", label: "Monitoring", icon: Activity,        desc: "Indicator tracking", badge: "Live" },
  { to: "/budget",     label: "Budget & Finance", icon: DollarSign,      desc: "Financial utilization" },
  { to: "/reports",    label: "Reports",    icon: FileText,        desc: "Donor & internal reports" },
  { to: "/users",      label: "Users",      icon: Users,           desc: "Access management" },
  { to: "/regional-users", label: "Regional Users", icon: MapPin,     desc: "Branch operations" },
  { to: "/documents",  label: "Documents",  icon: FolderOpen,      desc: "Resources & SOPs" },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const currentPage = navItems.find((n) =>
    n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "sidebar-container flex flex-col transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shrink-0 relative z-30",
          collapsed ? "w-[84px]" : "w-[280px]"
        )}
      >
        {/* Logo Section */}
        <div className={cn(
          "flex items-center gap-4 border-b border-white/5 transition-all duration-300",
          collapsed ? "px-4 py-6 justify-center" : "px-6 py-8"
        )}>
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white shrink-0 shadow-2xl">
            <div className="text-[#E11D48] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7V3z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-[#0f172a] animate-pulse" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-in">
              <p className="text-white font-black text-lg tracking-tight leading-none mb-1">ERCS <span className="text-[#E11D48]">P...</span></p>
              <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em] leading-tight">Institutional Intelligence</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 pt-10 pb-4">
          {!collapsed && (
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-6">Main Command</p>
          )}
        </div>
        
        <nav className={cn("flex-1 space-y-2 overflow-y-auto px-4")}>
          {navItems.map(({ to, label, icon: Icon, badge }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  "group flex items-center gap-4 rounded-2xl text-sm transition-all duration-300 relative py-3.5",
                  collapsed ? "px-3 justify-center" : "px-4",
                  active
                    ? "sidebar-item-active"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center transition-all duration-300",
                  active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )}>
                  <Icon className="w-5 h-5 stroke-[2.5px]" />
                </div>
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-bold tracking-wide">{label}</span>
                    {badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#E11D48]/20 text-[#E11D48] text-[9px] font-black uppercase tracking-widest">
                        {badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Quick Info */}
        <div className="mt-auto p-4 border-t border-white/5 bg-black/20">
          {!collapsed ? (
            <div className="flex items-center gap-4 px-2 py-3">
              <Avatar className="w-10 h-10 border-2 border-emerald-500/30">
                <AvatarFallback className="bg-gradient-to-br from-rose-500 to-rose-700 text-white font-black text-xs">AT</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-xs truncate">Abebe Tadesse</p>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded bg-slate-700 text-[8px] font-black text-slate-300 uppercase">Admin</span>
                  <span className="text-[8px] text-slate-500 font-bold uppercase truncate">• HQ National</span>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
             <div className="flex flex-col items-center gap-4 py-4">
                <Avatar className="w-10 h-10 ring-2 ring-emerald-500/20">
                  <AvatarFallback className="bg-rose-500 text-white text-xs font-black">AT</AvatarFallback>
                </Avatar>
             </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-400 hover:text-[#E11D48] transition-all z-50 group"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform duration-500", collapsed && "rotate-180")} />
        </button>
      </aside>

      {/* ── Main Content Area ── */}
      <div className="flex flex-col flex-1 min-w-0 relative">
        {/* Top Header */}
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

          {/* Action Bar */}
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-2xl text-slate-400 hover:bg-white hover:text-[#E11D48] hover:shadow-xl hover:shadow-rose-500/5 transition-all">
              <Bell className="w-5 h-5 stroke-[2.5px]" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#E11D48] rounded-full border-4 border-[#F8FAFC]" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 py-1.5 pl-1.5 pr-4 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                  <Avatar className="w-8 h-8 rounded-xl ring-2 ring-slate-100">
                    <AvatarFallback className="bg-rose-500 text-white text-[10px] font-black">AT</AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-xs font-black text-slate-800 leading-none mb-0.5">Abebe T.</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">National Admin</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-slate-200 shadow-2xl">
                <DropdownMenuLabel className="font-black px-3 py-2">Account Dashboard</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"><User className="w-4 h-4 text-slate-400" /> Profile Settings</DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"><Settings className="w-4 h-4 text-slate-400" /> System Preferences</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl px-3 py-2.5 gap-3 text-rose-600 cursor-pointer font-bold"><LogOut className="w-4 h-4" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Container */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
>>>>>>> e0b16a6 (commit)
  );
}
