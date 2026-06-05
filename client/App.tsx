import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Hospitals from "./pages/Hospitals";
import BloodBanks from "./pages/BloodBanks";
import Pharmacy from "./pages/Pharmacy";
import Emergency from "./pages/Emergency";
import AiTriage from "./pages/AiTriage";
import About from "./pages/About";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
    <LanguageProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/hospitals" element={<Hospitals />} />
                <Route path="/blood-banks" element={<BloodBanks />} />
                <Route path="/pharmacy" element={<Pharmacy />} />
                <Route path="/emergency" element={<Emergency />} />
                <Route path="/triage" element={<AiTriage />} />
                <Route path="/about" element={<About />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/admin" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </LanguageProvider>
  </ThemeProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
