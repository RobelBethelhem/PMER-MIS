import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { aops, getBranchName, logframe, type AOP, type AOPStatus, type LogframeNode } from "@/data/mockData";
import { ChevronDown, ChevronRight, ArrowLeft, Plus } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const statusColor: Record<AOPStatus, string> = {
  Draft: "bg-muted text-muted-foreground",
  Submitted: "bg-traffic-yellow/20 text-traffic-yellow",
  Approved: "bg-traffic-green/20 text-traffic-green",
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function GanttBar({ start, end }: { start: number; end: number }) {
  const left = ((start - 1) / 12) * 100;
  const width = ((end - start + 1) / 12) * 100;
  return (
    <div className="relative h-6 w-full">
      <div
        className="absolute top-1 h-4 rounded bg-primary/80"
        style={{ left: `${left}%`, width: `${width}%` }}
      />
    </div>
  );
}

function LogframeTree({ node, depth = 0 }: { node: LogframeNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children && node.children.length > 0;
  const levelColors: Record<string, string> = {
    "Strategic Priority": "bg-primary text-primary-foreground",
    Outcome: "bg-traffic-yellow/20 text-foreground",
    Output: "bg-traffic-green/20 text-foreground",
    Activity: "bg-muted text-muted-foreground",
  };

  return (
    <div className={depth > 0 ? "ml-4 border-l border-border pl-3" : ""}>
      <div
        className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-accent/50 rounded px-2 -ml-2"
        onClick={() => hasChildren && setOpen(!open)}
      >
        {hasChildren ? (open ? <ChevronDown className="h-3.5 w-3.5 shrink-0" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0" />) : <span className="w-3.5" />}
        <Badge className={`text-[10px] px-1.5 py-0 ${levelColors[node.level]}`}>{node.level}</Badge>
        <span className="text-sm">{node.title}</span>
      </div>
      {open && hasChildren && node.children!.map(child => (
        <LogframeTree key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

function AOPDetail({ aop, onBack }: { aop: AOP; onBack: () => void }) {
  const allActivities = aop.objectives.flatMap(o => o.activities);
  const totalBudget = allActivities.reduce((s, a) => s + a.budget, 0);
  const totalSpent = allActivities.reduce((s, a) => s + a.spent, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-4 w-4" /></Button>
        <div>
          <h2 className="text-lg font-semibold">AOP {aop.year} — {getBranchName(aop.branchId)}</h2>
          <Badge className={statusColor[aop.status]}>{aop.status}</Badge>
        </div>
      </div>

      <Tabs defaultValue="activities">
        <TabsList>
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="activities">Activities & Gantt</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="logframe">Logframe</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives" className="space-y-3 mt-4">
          {aop.objectives.map((obj, i) => (
            <Card key={obj.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Objective {i + 1}: {obj.title}</CardTitle>
                <CardDescription>{obj.activities.length} activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {obj.activities.map(a => <li key={a.id}>{a.title}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="activities" className="mt-4">
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Activity</TableHead>
                    <TableHead className="min-w-[80px]">Responsible</TableHead>
                    {months.map(m => <TableHead key={m} className="text-center w-10 text-xs px-1">{m}</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActivities.map(act => (
                    <TableRow key={act.id}>
                      <TableCell className="text-sm font-medium">{act.title}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{act.responsible}</TableCell>
                      <TableCell colSpan={12} className="p-0">
                        <GanttBar start={act.startMonth} end={act.endMonth} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Budget Summary</CardTitle>
              <CardDescription>Total: ETB {totalBudget.toLocaleString()} | Spent: ETB {totalSpent.toLocaleString()} ({Math.round((totalSpent / totalBudget) * 100)}%)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead className="text-right">Budget (ETB)</TableHead>
                    <TableHead className="text-right">Spent (ETB)</TableHead>
                    <TableHead className="text-right">Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allActivities.map(act => (
                    <TableRow key={act.id}>
                      <TableCell className="text-sm">{act.title}</TableCell>
                      <TableCell className="text-right">{act.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{act.spent.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-2 w-16 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, Math.round((act.spent / act.budget) * 100))}%` }} />
                          </div>
                          <span className="text-xs">{Math.round((act.spent / act.budget) * 100)}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logframe" className="mt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Logframe Hierarchy</CardTitle>
              <CardDescription>Strategic Priority → Outcome → Output → Activity</CardDescription>
            </CardHeader>
            <CardContent>
              {logframe.map(node => <LogframeTree key={node.id} node={node} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function Planning() {
  const [selectedAOP, setSelectedAOP] = useState<AOP | null>(null);

  if (selectedAOP) {
    return <AOPDetail aop={selectedAOP} onBack={() => setSelectedAOP(null)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Planning</h1>
          <p className="text-sm text-muted-foreground">Annual Operational Plans (AOP) — FY 2025</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-1" /> New AOP</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Objectives</TableHead>
                <TableHead>Activities</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total Budget</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {aops.map(aop => {
                const actCount = aop.objectives.reduce((s, o) => s + o.activities.length, 0);
                const totalBudget = aop.objectives.flatMap(o => o.activities).reduce((s, a) => s + a.budget, 0);
                return (
                  <TableRow key={aop.id} className="cursor-pointer" onClick={() => setSelectedAOP(aop)}>
                    <TableCell className="font-medium">{getBranchName(aop.branchId)}</TableCell>
                    <TableCell>{aop.year}</TableCell>
                    <TableCell>{aop.objectives.length}</TableCell>
                    <TableCell>{actCount}</TableCell>
                    <TableCell><Badge className={statusColor[aop.status]}>{aop.status}</Badge></TableCell>
                    <TableCell className="text-right">ETB {totalBudget.toLocaleString()}</TableCell>
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
