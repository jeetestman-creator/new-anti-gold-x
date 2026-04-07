import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import DepositPage from './pages/DepositPage';
import WithdrawalPage from './pages/WithdrawalPage';
import ReferralsPage from './pages/ReferralsPage';
import ProfilePage from './pages/ProfilePage';
import WalletsPage from './pages/WalletsPage';
import SupportPage from './pages/SupportPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminUserDetailPage from './pages/AdminUserDetailPage';
import AdminDepositsPage from './pages/AdminDepositsPage';
import AdminWithdrawalsPage from './pages/AdminWithdrawalsPage';
import AdminKYCPage from './pages/AdminKYCPage';
import AdminTicketsPage from './pages/AdminTicketsPage';
import AdminContentPage from './pages/AdminContentPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminTutorialsPage from './pages/AdminTutorialsPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminSetupPage from './pages/AdminSetupPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminLandingPage from './pages/AdminLandingPage';
import KYCPolicyPage from './pages/KYCPolicyPage';
import RefundPolicyPage from './pages/RefundPolicyPage';

import TransactionsPage from './pages/TransactionsPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import ContactPage from './pages/ContactPage';
import EventsPage from './pages/EventsPage';
import DownlineAnalyticsPage from './pages/DownlineAnalyticsPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import CalculatorPage from './pages/CalculatorPage';
import AdminAuditLogPage from './pages/AdminAuditLogPage';

import AnalyticsPage from './pages/AnalyticsPage';
import StyleGuidePage from './pages/StyleGuidePage';

import NotFound from './pages/NotFound';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  { name: 'Home', path: '/', element: <LandingPage /> },
  { name: 'Login', path: '/login', element: <LoginPage />, visible: false },
  { name: 'Signup', path: '/signup', element: <SignupPage />, visible: false },
  { name: 'Admin Setup', path: '/admin-setup', element: <AdminSetupPage />, visible: false },
  { name: 'Forgot Password', path: '/forgot-password', element: <ForgotPasswordPage />, visible: false },
  { name: 'Analytics', path: '/analytics', element: <AnalyticsPage /> },
  { name: 'Style Guide', path: '/style-guide', element: <StyleGuidePage /> },

  { name: 'Dashboard', path: '/dashboard', element: <DashboardPage /> },
  { name: 'Wallets', path: '/wallets', element: <WalletsPage /> },
  { name: 'Deposit', path: '/deposit', element: <DepositPage /> },
  { name: 'Withdrawal', path: '/withdrawal', element: <WithdrawalPage /> },
  { name: 'Referrals', path: '/referrals', element: <ReferralsPage /> },
  // FIX #7: Changed duplicate /analytics route to /downline-analytics
  { name: 'Downline Analytics', path: '/downline-analytics', element: <DownlineAnalyticsPage /> },
  { name: 'Profile', path: '/profile', element: <ProfilePage /> },
  { name: 'Transactions', path: '/transactions', element: <TransactionsPage /> },
  { name: 'Support', path: '/support', element: <SupportPage /> },
  { name: 'Admin Dashboard', path: '/admin', element: <AdminDashboardPage />, visible: false },
  { name: 'Admin Users', path: '/admin/users', element: <AdminUsersPage />, visible: false },
  { name: 'Admin User Detail', path: '/admin/users/:userId', element: <AdminUserDetailPage />, visible: false },
  { name: 'Admin Deposits', path: '/admin/deposits', element: <AdminDepositsPage />, visible: false },
  { name: 'Admin Withdrawals', path: '/admin/withdrawals', element: <AdminWithdrawalsPage />, visible: false },
  { name: 'Admin Notifications', path: '/admin/notifications', element: <AdminNotificationsPage />, visible: false },
  { name: 'Admin Transactions', path: '/admin/transactions', element: <AdminTransactionsPage />, visible: false },
  { name: 'Admin KYC', path: '/admin/kyc', element: <AdminKYCPage />, visible: false },
  { name: 'Admin Tickets', path: '/admin/tickets', element: <AdminTicketsPage />, visible: false },
  { name: 'Admin Content', path: '/admin/content', element: <AdminContentPage />, visible: false },
  { name: 'Admin Tutorials', path: '/admin/tutorials', element: <AdminTutorialsPage />, visible: false },
  { name: 'Admin Settings', path: '/admin/settings', element: <AdminSettingsPage />, visible: false },
  { name: 'Admin Coupons', path: '/admin/coupons', element: <AdminCouponsPage />, visible: false },
  { name: 'Terms & Conditions', path: '/terms-and-conditions', element: <TermsPage /> },
  { name: 'KYC Policy', path: '/kyc-policy', element: <KYCPolicyPage /> },
  { name: 'Refund Policy', path: '/refund-policy', element: <RefundPolicyPage /> },
  { name: 'Admin Landing Page', path: '/admin/landing', element: <AdminLandingPage />, visible: false },

  { name: 'Privacy Policy', path: '/privacy-policy', element: <PrivacyPage /> },
  { name: 'Contact', path: '/contact', element: <ContactPage /> },
  { name: 'Audit Logs', path: '/admin/audit-logs', element: <AdminAuditLogPage /> },

  { name: 'Calculator', path: '/calculator', element: <CalculatorPage /> },
  { name: 'Events', path: '/events', element: <EventsPage /> },
  { name: 'Not Found', path: '*', element: <NotFound />, visible: false }
];

export default routes;
