
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Categories from "./pages/Categories";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";
import Pricing from "./pages/Pricing";
import Settings from "./pages/Settings";
import Notifications from "./pages/Notifications";
import NotificationSettings from "./pages/NotificationSettings";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerPortal from "./pages/CustomerPortal";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancelled from "./pages/PaymentCancelled";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <Layout>
            <Routes>
              {/* Admin Routes */}
              {user?.role === 'admin' && (
                <>
                  <Route path="/" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute requiredRole="admin">
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="/categories" element={
                    <ProtectedRoute requiredRole="admin">
                      <Categories />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute requiredRole="admin">
                      <Reports />
                    </ProtectedRoute>
                  } />
                </>
              )}
              
              {/* Customer Routes */}
              {user?.role === 'customer' && (
                <>
                  <Route path="/" element={
                    <ProtectedRoute requiredRole="customer">
                      <CustomerPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute requiredRole="customer">
                      <CustomerPortal />
                    </ProtectedRoute>
                  } />
                  <Route path="/inventory" element={
                    <ProtectedRoute requiredRole="customer">
                      <Inventory />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute requiredRole="customer">
                      <Reports />
                    </ProtectedRoute>
                  } />
                </>
              )}
              
              {/* Common Routes */}
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/notification-settings" element={<NotificationSettings />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
              <Route path="/payment-cancelled" element={<PaymentCancelled />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
