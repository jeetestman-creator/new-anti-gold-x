import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IntersectObserver from '@/components/common/IntersectObserver';
import { Toaster } from '@/components/ui/sonner';
import { RouteGuard } from '@/components/common/RouteGuard';
import { Header } from '@/components/layouts/Header';
import { Footer } from '@/components/layouts/Footer';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { initializeSecurity } from '@/lib/security';

import routes from './routes';

import { TooltipProvider } from '@/components/ui/tooltip';

function AppContent() {
  const location = useLocation();
  // Capture referral code from URL and store in sessionStorage
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      sessionStorage.setItem('referral_code', ref);
      console.log('Referral code stored:', ref);
    }
  }, [location]);

  const isAuthPage = ['/login', '/signup', '/verify-email', '/forgot-password', '/reset-password'].includes(location.pathname);
  const isDashboardPage = location.pathname.startsWith('/dashboard') || 
                          location.pathname.startsWith('/deposit') || 
                          location.pathname.startsWith('/withdrawal') ||
                          location.pathname.startsWith('/referrals') ||
                          location.pathname.startsWith('/profile') ||
                          location.pathname.startsWith('/wallets') ||
                          location.pathname.startsWith('/support') ||
                          location.pathname.startsWith('/admin');

  return (
    <TooltipProvider>
      <IntersectObserver />
      <div className="flex flex-col min-h-screen">
        {!isAuthPage && <Header />}
        {isDashboardPage ? (
          <DashboardLayout>
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DashboardLayout>
        ) : (
          <main className="flex-grow">
            <Routes>
              {routes.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        )}
        {!isAuthPage && !isDashboardPage && <Footer />}
      </div>
      <Toaster />
    </TooltipProvider>
  );
}

const App: React.FC = () => {
  // Initialize security features on app load
  useEffect(() => {
    initializeSecurity();
  }, []);

  return (
    <Router>
      <RouteGuard>
        <AppContent />
      </RouteGuard>
    </Router>
  );
};

export default App;
