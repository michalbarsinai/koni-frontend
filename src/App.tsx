import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "./contexts/ThemeContext";
import AppLayout from "./layouts/AppLayout";
import Dashboard from "./pages/Dashboard";
import BalancesDetail from "./pages/BalancesDetail";
import Clients from "./pages/Clients";
import History from "./pages/History";
import Earnings from "./pages/Earnings";
import LessonTypes from "./pages/LessonTypes";
import Settings from "./pages/Settings";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/balances" element={<BalancesDetail />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/history" element={<History />} />
              <Route path="/lesson-types" element={<LessonTypes />} />
              <Route path="/earnings" element={<Earnings />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
