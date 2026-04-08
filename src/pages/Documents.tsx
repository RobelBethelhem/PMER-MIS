import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, File, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const folders = [
  { name: "Needs Assessments", count: 12, updated: "Jun 2025" },
  { name: "Baseline Surveys", count: 8, updated: "May 2025" },
  { name: "Quarterly Monitoring Reports", count: 24, updated: "Jun 2025" },
  { name: "Evaluation Reports", count: 6, updated: "Apr 2025" },
  { name: "Logframes & AOPs", count: 18, updated: "Jun 2025" },
  { name: "Donor Reports", count: 15, updated: "Jun 2025" },
  { name: "PDM Tools", count: 9, updated: "Mar 2025" },
  { name: "ToRs & Guidelines", count: 11, updated: "Feb 2025" },
];

export default function Documents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Document Repository</h1>
        <p className="text-sm text-muted-foreground">Centralized knowledge and document management</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-9" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {folders.map(f => (
          <Card key={f.name} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-5">
              <FolderOpen className="h-8 w-8 text-primary/60 mb-3" />
              <p className="font-medium text-sm">{f.name}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px]">{f.count} files</Badge>
                <span className="text-[10px] text-muted-foreground">Updated {f.updated}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
