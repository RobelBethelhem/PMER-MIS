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
    </div>
  );
}
