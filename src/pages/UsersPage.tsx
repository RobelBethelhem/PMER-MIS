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
    </div>
  );
}
