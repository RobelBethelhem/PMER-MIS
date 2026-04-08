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
      </div>
    </div>
  );
}
