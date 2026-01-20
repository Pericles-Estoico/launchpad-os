import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import StoresPage from "./pages/StoresPage";
import GatesPage from "./pages/GatesPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import AIStudioPage from "./pages/AIStudioPage";
import ListingsPage from "./pages/ListingsPage";
import ListingEditorPage from "./pages/ListingEditorPage";
import MerchantPage from "./pages/MerchantPage";
import WarRoomPage from "./pages/WarRoomPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import OnboardingPage from "./pages/OnboardingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Onboarding (requires auth but not workspace) */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute requireWorkspace={false}>
                  <OnboardingPage />
                </ProtectedRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/stores" element={<StoresPage />} />
              <Route path="/gates" element={<GatesPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/ai-studio" element={<AIStudioPage />} />
              <Route path="/listings" element={<ListingsPage />} />
              <Route path="/listings/:id" element={<ListingEditorPage />} />
              <Route path="/merchant" element={<MerchantPage />} />
              <Route path="/war-room" element={<WarRoomPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
