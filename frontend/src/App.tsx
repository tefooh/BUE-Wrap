import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import EntryPage from "./pages/EntryPage";
import LoadingPage from "./pages/LoadingPage";
import WrapPage from "./pages/WrapPage";
import SharePage from "./pages/SharePage";
import SharedWrapPage from "./pages/SharedWrapPage";
import NotFound from "./pages/NotFound";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";

const queryClient = new QueryClient();

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<EntryPage />} />
        <Route 
          path="/loading" 
          element={
            <ProtectedRoute>
              <LoadingPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/wrap" 
          element={
            <ProtectedRoute>
              <WrapPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/share" 
          element={
            <ProtectedRoute>
              <SharePage />
            </ProtectedRoute>
          } 
        />
        <Route path="/wrap/shared/:shareToken" element={<SharedWrapPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => {
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const handleContextMenu = (event: MouseEvent) => {
      event.preventDefault();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrlOrMeta = event.ctrlKey || event.metaKey;
      if (!isCtrlOrMeta) return;

      const zoomKeys = ["+", "-", "=", "0"]; // common zoom shortcuts
      if (zoomKeys.includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel as EventListener);
      window.removeEventListener("contextmenu", handleContextMenu as EventListener);
      window.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
