import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
<<<<<<< HEAD
import { Toaster as Sonner } from "@/components/ui/sonner";
=======
>>>>>>> e0b16a6 (commit)
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Planning from "./pages/Planning";
import Monitoring from "./pages/Monitoring";
import Budget from "./pages/Budget";
import Reports from "./pages/Reports";
import UsersPage from "./pages/UsersPage";
<<<<<<< HEAD
=======
import RegionalUsers from "./pages/RegionalUsers";
>>>>>>> e0b16a6 (commit)
import Documents from "./pages/Documents";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
<<<<<<< HEAD
      <Sonner />
=======
>>>>>>> e0b16a6 (commit)
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/monitoring" element={<Monitoring />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/users" element={<UsersPage />} />
<<<<<<< HEAD
=======
            <Route path="/regional-users" element={<RegionalUsers />} />
>>>>>>> e0b16a6 (commit)
            <Route path="/documents" element={<Documents />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
