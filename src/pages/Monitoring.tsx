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
    </div>
  );
}

export default function Monitoring() {
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
    </div>
  );
}
