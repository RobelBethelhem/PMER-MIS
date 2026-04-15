import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Monitoring from "./pages/Monitoring";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import UsersPage from "./pages/UsersPage";
import RegionalUsers from "./pages/RegionalUsers";
import Documents from "./pages/Documents";
import DataEntry from "./pages/DataEntry";
import Consolidation from "./pages/Consolidation";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const auth = localStorage.getItem("pmer_auth");
  const location = useLocation();
  if (!auth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/planning" element={<Planning />} />
                    <Route path="/monitoring" element={<Monitoring />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/users" element={<UsersPage />} />
                    <Route path="/regional-users" element={<RegionalUsers />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/data-entry" element={<DataEntry />} />
                    <Route path="/consolidation" element={<Consolidation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
