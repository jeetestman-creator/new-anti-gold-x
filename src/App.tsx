import React, { useEffect, ReactNode } from 'react';
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

// FIX #8: Added Error Boundary component
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-700 mb-4">
              An unexpected error has occurred. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto text-red-700">
                {this.state.error.toString()}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
      <ErrorBoundary>
        <RouteGuard>
          <AppContent />
        </RouteGuard>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
