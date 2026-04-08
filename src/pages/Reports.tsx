import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { reportTemplates } from "@/data/mockData";
import { FileText, Download, FileSpreadsheet, FileType } from "lucide-react";

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">Automated report templates and exports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTemplates.map(rt => (
          <Card key={rt.id} className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <FileText className="h-8 w-8 text-primary/60" />
                <div className="flex gap-1">
                  <Badge variant="outline" className="text-[10px]">{rt.frequency}</Badge>
                  {rt.donorSpecific && <Badge className="bg-traffic-yellow/20 text-foreground text-[10px]">{rt.donorCode}</Badge>}
                </div>
              </div>
              <CardTitle className="text-base mt-2">{rt.name}</CardTitle>
              <CardDescription className="text-xs">{rt.description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-0">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs flex-1"><Download className="h-3 w-3 mr-1" /> PDF</Button>
                <Button size="sm" variant="outline" className="text-xs flex-1"><FileSpreadsheet className="h-3 w-3 mr-1" /> Excel</Button>
                <Button size="sm" variant="outline" className="text-xs flex-1"><FileType className="h-3 w-3 mr-1" /> Word</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
