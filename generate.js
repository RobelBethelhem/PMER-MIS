const fs = require('fs');
const path = require('path');

const files = {
  'src/components/ui/sonner.tsx': 'export const Toaster = () => null;',
  'src/components/ui/toaster.tsx': 'export const Toaster = () => null;',
  'src/components/ui/tooltip.tsx': 'export const TooltipProvider = ({children}: any) => <>{children}</>;',
  'src/components/AppLayout.tsx': 'import React from "react";\nexport const AppLayout = ({children}: {children: React.ReactNode}) => <div className="app-layout">{children}</div>;',
  'src/pages/Dashboard.tsx': 'export default function Dashboard() { return <div className="page-container"><h1>Dashboard</h1></div>; }',
  'src/pages/Planning.tsx': 'export default function Planning() { return <div className="page-container"><h1>Planning</h1></div>; }',
  'src/pages/Monitoring.tsx': 'export default function Monitoring() { return <div className="page-container"><h1>Monitoring</h1></div>; }',
  'src/pages/Budget.tsx': 'export default function Budget() { return <div className="page-container"><h1>Budget</h1></div>; }',
  'src/pages/Reports.tsx': 'export default function Reports() { return <div className="page-container"><h1>Reports</h1></div>; }',
  'src/pages/UsersPage.tsx': 'export default function UsersPage() { return <div className="page-container"><h1>Users</h1></div>; }',
  'src/pages/Documents.tsx': 'export default function Documents() { return <div className="page-container"><h1>Documents</h1></div>; }',
  'src/pages/NotFound.tsx': 'export default function NotFound() { return <div className="page-container"><h1>404 Not Found</h1></div>; }',
};

for (const [file, content] of Object.entries(files)) {
  const fullPath = path.join(__dirname, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

console.log("Files created successfully!");
